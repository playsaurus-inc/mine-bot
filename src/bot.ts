import { readdirSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import * as Sentry from '@sentry/node';
import {
	Client,
	Collection,
	Events,
	GatewayIntentBits,
	type Interaction,
	type Message,
	MessageFlags,
	Partials,
	REST,
	Routes,
} from 'discord.js';
import { config } from './config.ts';
import { loadData, persistData } from './data.ts';
import { ModerationService } from './services/automod.ts';
import { ChannelModService } from './services/channelMod.ts';
import { RoleService } from './services/roles.ts';
import { SaveService } from './services/saves.ts';
import type { Command } from './types/index.ts';
import { log } from './utils/logger.ts';

const COMMANDS_DIR = join(dirname(fileURLToPath(import.meta.url)), 'commands');

const QUESTION_STARTERS = ['what', 'any idea', 'why', 'whats'];

/**
 * Main bot class that orchestrates Discord event handling, command loading,
 * and delegates to specialized services for saves, roles, moderation, and
 * channel enforcement.
 */
export class Bot {
	private _client: Client;
	private _saveService: SaveService;
	private _roleService!: RoleService;
	private _moderationService: ModerationService;
	private _channelModService: ChannelModService;

	constructor() {
		this._client = new Client({
			intents: [
				GatewayIntentBits.Guilds,
				GatewayIntentBits.GuildMessages,
				GatewayIntentBits.MessageContent,
				GatewayIntentBits.GuildMembers,
				GatewayIntentBits.DirectMessages,
			],
			partials: [Partials.Channel],
			allowedMentions: {
				parse: ['users', 'roles'],
				repliedUser: true,
			},
		});

		this._saveService = new SaveService();
		this._moderationService = new ModerationService();
		this._channelModService = new ChannelModService();
	}

	/** Returns the underlying Discord.js Client instance. */
	get client(): Client {
		return this._client;
	}

	/**
	 * Initializes services, loads and deploys commands, binds event handlers,
	 * and logs the bot into Discord.
	 */
	async start(): Promise<void> {
		this._client.commands = new Collection<string, Command>();

		this._roleService = new RoleService(
			this._client,
			config.guildId,
			this._saveService,
		);
		this._saveService.setRoleService(this._roleService);

		this._client.on('error', (error) => {
			console.error('Discord.js error:', error);
			Sentry.captureException(error);
		});

		this._client.on('warn', (warning) => {
			console.warn('Discord.js warning:', warning);
		});

		this._client.on('shardError', (error, shardId) => {
			console.error(`Shard ${shardId} error:`, error);
			Sentry.captureException(error);
		});

		this._client.on('shardDisconnect', (_event, shardId) => {
			console.log(`Shard ${shardId} disconnected`);
		});

		this._client.on('shardReconnecting', (shardId) => {
			console.log(`Shard ${shardId} reconnecting...`);
		});

		loadData();

		const commands = await this.loadCommands();
		await this.deployCommands(commands);

		this._client.once(Events.ClientReady, (c) => this.onReady(c));
		this._client.on(Events.InteractionCreate, (interaction) =>
			this.onInteractionCreate(interaction),
		);
		this._client.on(Events.MessageCreate, (msg) => this.onMessageCreate(msg));

		// Persist saves every 5 minutes
		setInterval(
			() => {
				log('writing to files');
				persistData();
			},
			1000 * 60 * 5,
		);

		// Clean up in-memory spam tracking every hour
		setInterval(
			() => {
				this._moderationService.cleanupAutomodState();
			},
			60 * 60 * 1000,
		);

		await this._client.login(config.discordToken);
	}

	/**
	 * Dynamically loads all command modules from the commands directory.
	 */
	private async loadCommands(): Promise<Command[]> {
		const loadedCommands: Command[] = [];
		const categories = readdirSync(COMMANDS_DIR).filter((entry) =>
			statSync(join(COMMANDS_DIR, entry)).isDirectory(),
		);

		for (const category of categories) {
			const categoryPath = join(COMMANDS_DIR, category);
			const files = readdirSync(categoryPath).filter((f) => f.endsWith('.ts'));

			for (const file of files) {
				const filePath = join(categoryPath, file);
				const module = (await import(
					pathToFileURL(filePath).href
				)) as Partial<Command>;

				if ('data' in module && 'execute' in module) {
					const command = module as Command;
					this._client.commands.set(command.data.name, command);
					loadedCommands.push(command);
				} else {
					console.warn(
						`[WARNING] Command at ${filePath} is missing a required "data" or "execute" property.`,
					);
				}
			}
		}

		return loadedCommands;
	}

	/**
	 * Deploys slash commands to the Discord API.
	 */
	private async deployCommands(commands: Command[]): Promise<void> {
		const rest = new REST({ version: '10' }).setToken(config.discordToken);
		const body = commands.map((cmd) => cmd.data.toJSON());

		console.log(`Started refreshing ${body.length} application (/) commands.`);

		try {
			const data = (await rest.put(
				Routes.applicationGuildCommands(config.clientId, config.guildId),
				{
					body,
				},
			)) as unknown[];
			console.log(
				`Successfully reloaded ${data.length} application (/) commands.`,
			);
		} catch (error) {
			console.error('Failed to deploy commands:', error);
			Sentry.captureException(error);
		}
	}

	/**
	 * Handles the ClientReady event, logging that the bot is online.
	 */
	private onReady(c: Client<true>): void {
		log(`${c.user.username} is online!`);
	}

	/**
	 * Handles incoming slash command interactions.
	 */
	private async onInteractionCreate(interaction: Interaction): Promise<void> {
		if (!interaction.isChatInputCommand()) return;
		if (!interaction.inCachedGuild()) return;

		const command = interaction.client.commands.get(interaction.commandName);

		if (!command) {
			console.error(
				`No command matching ${interaction.commandName} was found.`,
			);
			return;
		}

		try {
			await command.execute(interaction);
		} catch (error) {
			console.error(error);

			Sentry.captureException(error, {
				tags: { command: interaction.commandName },
				user: {
					id: interaction.user.id,
					username: interaction.user.username,
				},
			});

			if (interaction.replied || interaction.deferred) {
				await interaction.followUp({
					content: 'There was an error while executing this command!',
					flags: MessageFlags.Ephemeral,
				});
			} else {
				await interaction.reply({
					content: 'There was an error while executing this command!',
					flags: MessageFlags.Ephemeral,
				});
			}
		}
	}

	/**
	 * Top-level message handler that delegates to auto-responses, DM processing,
	 * channel moderation, and auto-mod logic.
	 */
	private async onMessageCreate(message: Message): Promise<void> {
		if (message.author.bot) return;

		const lc = message.content.toLowerCase();

		// Auto-responses for common game questions
		const hasQuestionStarter = QUESTION_STARTERS.some((s) => lc.includes(s));

		if (
			hasQuestionStarter &&
			(lc.includes('red star') || lc.includes('red name'))
		) {
			await message.reply({
				content:
					'The red names are the names of players who chose to support the game by buying 650 tickets or 1400 tickets at one time.',
			});
		} else if (
			hasQuestionStarter &&
			(lc.includes('mime') || lc.includes('112'))
		) {
			await message.reply({
				content: "That's Mr. Mime, he's just vibin. He doesn't do anything.",
			});
		} else if (
			(lc.includes('any') ||
				lc.includes('give me') ||
				lc.includes('are there')) &&
			lc.includes('code')
		) {
			await message.reply({
				content:
					"The devs randomly create the codes and they typically expire after a few days or uses.\nIf the latest ones in <#764279333262852138> don't work it's unlikely there is any available.\nPlease do not ask for any codes and NEVER ask the devs for codes.",
			});
			return;
		}

		// DM handling: process game save files
		if (message.channel.isDMBased()) {
			await this._saveService.processDmMessage(message);
			return;
		}

		// Guild-only: channel moderation and automod
		if (!message.inGuild()) return;
		await this._channelModService.handleChannelModeration(message);
		await this._moderationService.runAutomod(message);
	}
}
