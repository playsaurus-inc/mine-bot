import * as Sentry from '@sentry/node';
import {
	ChannelType,
	DiscordAPIError,
	type Message,
	PermissionsBitField,
	type TextChannel,
} from 'discord.js';
import { RESTJSONErrorCodes } from 'discord-api-types/v10';
import { config } from '../config.ts';
import { log } from '../utils/logger.ts';

/** Discord API error codes that are expected and safe to ignore. */
const IGNORED_DISCORD_ERRORS = new Set([
	RESTJSONErrorCodes.UnknownMessage,
	RESTJSONErrorCodes.UnknownInteraction,
	RESTJSONErrorCodes.CannotSendMessagesToThisUser,
]);

const AUTO_BAN_WORDS = ['nigger', 'nigga', 'jew', 'n1gger', 'n!gger'];

/**
 * Silently ignores expected Discord API errors (e.g. message already deleted, DMs disabled)
 * and reports anything unexpected to Sentry.
 */
export function handleDiscordError(error: unknown): void {
	if (
		error instanceof DiscordAPIError &&
		IGNORED_DISCORD_ERRORS.has(Number(error.code))
	) {
		return;
	}
	Sentry.captureException(error);
}

/**
 * Handles automatic moderation by tracking per-user message history and
 * detecting various spam and abuse patterns.
 */
export class ModerationService {
	/** Tracks recent message timestamps per user for rapid-message spam detection */
	private _userMessageHistory: Record<string, number[]> = {};

	/** Tracks the last post time per channel per user for cross-channel spam detection */
	private _channelsPostedIn: Record<string, Record<string, number>> = {};

	/**
	 * Returns the audit-log channel for the given message's guild.
	 */
	private static getAuditChannel(
		message: Message<true>,
	): TextChannel | undefined {
		return message.guild.channels.cache.find(
			(ch): ch is TextChannel =>
				ch.name === 'audit-log' && ch.type === ChannelType.GuildText,
		);
	}

	/**
	 * Checks whether the message author has moderator permissions.
	 */
	private static hasModPerms(message: Message<true>): boolean {
		return (
			message.member?.permissions.has(
				PermissionsBitField.Flags.ManageMessages,
			) ?? false
		);
	}

	/**
	 * Runs all auto-moderation checks against a guild message.
	 */
	async runAutomod(message: Message<true>): Promise<void> {
		if (message.guild.id !== config.guildId) return;

		const currentTime = Date.now();
		const memberJoinTime = message.member?.joinedTimestamp ?? currentTime;
		const isNewMember = memberJoinTime > currentTime - 43200000; // 12 hours

		if (!ModerationService.hasModPerms(message)) {
			await this.checkNitroScam(message);
		}

		await this.checkDiscordLinks(message, isNewMember);

		if (isNewMember) {
			await this.checkRacistWords(message);
			await this.checkMessageSpam(message, currentTime);
		}

		await this.checkChannelSpam(message, currentTime);
	}

	/**
	 * Detects and bans users posting nitro scam messages.
	 */
	private async checkNitroScam(message: Message<true>): Promise<void> {
		const lc = message.content.toLowerCase();

		const isNitroScam =
			(lc.includes('@everyone') ||
				lc.includes('free') ||
				lc.includes('steam') ||
				lc.includes('airdrop')) &&
			(lc.includes('nitro') || lc.includes('nltro')) &&
			(message.embeds.length > 0 || lc.includes('https:/'));

		if (!isNitroScam) return;

		console.log(message.content);
		await message.delete().catch(handleDiscordError);
		message.member
			?.ban({
				deleteMessageSeconds: 7 * 24 * 60 * 60,
				reason: 'posting nitro scam',
			})
			.catch(console.error);
		ModerationService.getAuditChannel(message)?.send({
			content: `Banned <@${message.member?.id}> for posting nitro scam. Message content: \`\`\`${message.content}\`\`\``,
		});
	}

	/**
	 * Detects and removes Discord invite links posted by new members.
	 */
	private async checkDiscordLinks(
		message: Message<true>,
		isNewMember: boolean,
	): Promise<void> {
		if (!isNewMember) return;
		if (!message.content.toLowerCase().includes('discord.gg')) return;

		await message.delete().catch(handleDiscordError);
		log(`Link posted by ${message.author.username}`);
		message.member
			?.send('Do not post links to other Discord Servers')
			.catch(handleDiscordError);
		ModerationService.getAuditChannel(message)?.send({
			content: `Warned <@${message.member?.id}> for posting links to a different Discord server.`,
		});
	}

	/**
	 * Detects and bans new members posting racist words.
	 */
	private async checkRacistWords(message: Message<true>): Promise<void> {
		const lc = message.content.toLowerCase();

		for (const word of AUTO_BAN_WORDS) {
			if (!lc.includes(word)) continue;

			await message.delete().catch(handleDiscordError);
			message.member
				?.send(
					'You have been banned from the Mr. Mine Discord for posting racist comments.',
				)
				.catch(handleDiscordError);
			message.member
				?.ban({
					deleteMessageSeconds: 7 * 24 * 60 * 60,
					reason: 'Posted racist comments',
				})
				.catch(console.error);
			ModerationService.getAuditChannel(message)?.send({
				content: `Banned <@${message.member?.id}> for posting racist comments.`,
			});
			break;
		}
	}

	/**
	 * Detects and bans new members sending messages too rapidly.
	 */
	private async checkMessageSpam(
		message: Message<true>,
		currentTime: number,
	): Promise<void> {
		const userId = message.author.id;

		if (!this._userMessageHistory[userId]) {
			this._userMessageHistory[userId] = [currentTime];
			return;
		}

		this._userMessageHistory[userId].push(currentTime);

		if (this._userMessageHistory[userId].length > 6) {
			this._userMessageHistory[userId] =
				this._userMessageHistory[userId].slice(-6);
		}

		const history = this._userMessageHistory[userId];
		if (history.length < 6) return;

		const oldest = history[0];
		const newest = history[5];
		if (oldest === undefined || newest === undefined) return;
		if (oldest - newest <= -8000) return;

		if (ModerationService.hasModPerms(message)) return;

		await message.delete().catch(handleDiscordError);
		message.member
			?.send('You have been banned for spamming')
			.catch(handleDiscordError);
		message.member
			?.ban({ deleteMessageSeconds: 7 * 24 * 60 * 60, reason: 'spamming' })
			.catch(console.error);
		ModerationService.getAuditChannel(message)?.send({
			content: `Banned <@${message.member?.id}> for spamming (posting 6 messages within 8 seconds)`,
		});
	}

	/**
	 * Detects and bans users posting to 4+ different channels within 10 seconds.
	 */
	private async checkChannelSpam(
		message: Message<true>,
		currentTime: number,
	): Promise<void> {
		const userId = message.author.id;
		const channelId = message.channel.id;

		if (!this._channelsPostedIn[userId]) {
			this._channelsPostedIn[userId] = { [channelId]: currentTime };
			return;
		}

		const user = this._channelsPostedIn[userId];

		// Capture keys before adding current channel (matches original behavior)
		let keys = Object.keys(user);
		user[channelId] = currentTime;

		if (keys.length > 3) {
			const oldestKey = keys[0];
			if (oldestKey) delete user[oldestKey];
			keys = Object.keys(user);
		}

		const timestamps = keys
			.map((k) => user[k])
			.sort((a, b) => (a ?? 0) - (b ?? 0));
		console.log(timestamps);

		const oldest = timestamps[0];
		const newest = timestamps[3];
		if (timestamps.length < 4 || oldest === undefined || newest === undefined)
			return;
		if (oldest - newest <= -10000) return;

		if (ModerationService.hasModPerms(message)) return;

		await message.delete().catch(handleDiscordError);
		message.member
			?.send('You have been banned for spamming')
			.catch(handleDiscordError);
		message.member
			?.ban({ deleteMessageSeconds: 7 * 24 * 60 * 60, reason: 'spamming' })
			.catch(console.error);
		ModerationService.getAuditChannel(message)?.send({
			content: `Banned <@${message.member?.id}> for spamming (posting to 4 different channels within 10 seconds). Message content: \`\`\`${message.content}\`\`\``,
		});
	}

	/**
	 * Cleans up stale entries from in-memory spam tracking maps.
	 * Should be called periodically (e.g. every hour).
	 */
	cleanupAutomodState(): void {
		const oneHourAgo = Date.now() - 60 * 60 * 1000;

		for (const userId in this._userMessageHistory) {
			const timestamps = this._userMessageHistory[userId];
			if (!timestamps || timestamps.length === 0) continue;
			const mostRecent = Math.max(...timestamps);
			if (mostRecent < oneHourAgo) {
				delete this._userMessageHistory[userId];
			}
		}

		for (const userId in this._channelsPostedIn) {
			const channels = this._channelsPostedIn[userId];
			if (!channels) continue;
			const timestamps = Object.values(channels) as number[];
			if (timestamps.length === 0) continue;
			const mostRecent = Math.max(...timestamps);
			if (mostRecent < oneHourAgo) {
				delete this._channelsPostedIn[userId];
			}
		}

		log(
			`Memory cleanup complete. Tracked users: ${Object.keys(this._userMessageHistory).length}, Channel history: ${Object.keys(this._channelsPostedIn).length}`,
		);
	}
}
