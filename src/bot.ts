import { readdirSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import * as Sentry from '@sentry/node';
import {
	Client,
	Collection,
	GatewayIntentBits,
	Partials,
	REST,
	Routes,
} from 'discord.js';
import { config } from './config.ts';
import { loadData, persistData } from './data.ts';
import { registerInteractionCreate } from './events/interactionCreate.ts';
import { registerMessageCreate } from './events/messageCreate.ts';
import { registerReady } from './events/ready.ts';
import { cleanupAutomodState } from './services/automod.ts';
import type { Command } from './types/index.ts';
import { log } from './utils/logger.ts';

const COMMANDS_DIR = join(dirname(fileURLToPath(import.meta.url)), 'commands');

export const client = new Client({
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

client.commands = new Collection<string, Command>();

async function loadCommands(): Promise<Command[]> {
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
				client.commands.set(command.data.name, command);
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

async function deployCommands(commands: Command[]): Promise<void> {
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

export async function startBot(): Promise<void> {
	client.on('error', (error) => {
		console.error('Discord.js error:', error);
		Sentry.captureException(error);
	});

	client.on('warn', (warning) => {
		console.warn('Discord.js warning:', warning);
	});

	client.on('shardError', (error, shardId) => {
		console.error(`Shard ${shardId} error:`, error);
		Sentry.captureException(error);
	});

	client.on('shardDisconnect', (_event, shardId) => {
		console.log(`Shard ${shardId} disconnected`);
	});

	client.on('shardReconnecting', (shardId) => {
		console.log(`Shard ${shardId} reconnecting...`);
	});

	loadData();

	const commands = await loadCommands();
	await deployCommands(commands);

	registerReady(client);
	registerInteractionCreate(client);
	registerMessageCreate(client);

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
			cleanupAutomodState();
		},
		60 * 60 * 1000,
	);

	await client.login(config.discordToken);
}
