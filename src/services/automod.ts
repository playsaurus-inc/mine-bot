import * as Sentry from '@sentry/node';
import {
	ChannelType,
	DiscordAPIError,
	type Message,
	PermissionsBitField,
	type TextChannel,
} from 'discord.js';
import { config } from '../config.ts';
import { log } from '../utils/logger.ts';

/** Discord API error codes that are expected and safe to ignore in automod. */
const IGNORED_DISCORD_ERRORS = new Set([
	10008, // Unknown Message - already deleted
	50278, // Cannot send messages to this user - DMs disabled
]);

/**
 * Silently ignores expected Discord API errors (e.g. message already deleted, DMs disabled)
 * and reports anything unexpected to Sentry.
 */
function handleDiscordError(error: unknown): void {
	if (
		error instanceof DiscordAPIError &&
		IGNORED_DISCORD_ERRORS.has(Number(error.code))
	) {
		return;
	}
	Sentry.captureException(error);
}

// Module-level state for spam tracking - intentionally process-scoped
const userMessageHistory: Record<string, number[]> = {};
const channelsPostedIn: Record<string, Record<string, number>> = {};

const AUTO_BAN_WORDS = ['nigger', 'nigga', 'jew', 'n1gger', 'n!gger'];

function getAuditChannel(message: Message<true>): TextChannel | undefined {
	return message.guild.channels.cache.find(
		(ch): ch is TextChannel =>
			ch.name === 'audit-log' && ch.type === ChannelType.GuildText,
	);
}

function hasModPerms(message: Message<true>): boolean {
	return (
		message.member?.permissions.has(PermissionsBitField.Flags.ManageMessages) ??
		false
	);
}

export async function runAutomod(message: Message<true>): Promise<void> {
	if (message.guild.id !== config.guildId) return;

	const currentTime = Date.now();
	const memberJoinTime = message.member?.joinedTimestamp ?? currentTime;
	const isNewMember = memberJoinTime > currentTime - 43200000; // 12 hours

	if (!hasModPerms(message)) {
		await checkNitroScam(message);
	}

	await checkDiscordLinks(message, isNewMember);

	if (isNewMember) {
		await checkRacistWords(message);
		await checkMessageSpam(message, currentTime);
	}

	await checkChannelSpam(message, currentTime);
}

async function checkNitroScam(message: Message<true>): Promise<void> {
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
	getAuditChannel(message)?.send({
		content: `Banned <@${message.member?.id}> for posting nitro scam. Message content: \`\`\`${message.content}\`\`\``,
	});
}

async function checkDiscordLinks(
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
	getAuditChannel(message)?.send({
		content: `Warned <@${message.member?.id}> for posting links to a different Discord server.`,
	});
}

async function checkRacistWords(message: Message<true>): Promise<void> {
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
		getAuditChannel(message)?.send({
			content: `Banned <@${message.member?.id}> for posting racist comments.`,
		});
		break;
	}
}

async function checkMessageSpam(
	message: Message<true>,
	currentTime: number,
): Promise<void> {
	const userId = message.author.id;

	if (!userMessageHistory[userId]) {
		userMessageHistory[userId] = [currentTime];
		return;
	}

	userMessageHistory[userId].push(currentTime);

	if (userMessageHistory[userId].length > 6) {
		userMessageHistory[userId] = userMessageHistory[userId].slice(-6);
	}

	const history = userMessageHistory[userId];
	if (history.length < 6) return;

	const oldest = history[0];
	const newest = history[5];
	if (oldest === undefined || newest === undefined) return;
	if (oldest - newest <= -8000) return;

	if (hasModPerms(message)) return;

	await message.delete().catch(handleDiscordError);
	message.member
		?.send('You have been banned for spamming')
		.catch(handleDiscordError);
	message.member
		?.ban({ deleteMessageSeconds: 7 * 24 * 60 * 60, reason: 'spamming' })
		.catch(console.error);
	getAuditChannel(message)?.send({
		content: `Banned <@${message.member?.id}> for spamming (posting 6 messages within 8 seconds)`,
	});
}

async function checkChannelSpam(
	message: Message<true>,
	currentTime: number,
): Promise<void> {
	const userId = message.author.id;
	const channelId = message.channel.id;

	if (!channelsPostedIn[userId]) {
		channelsPostedIn[userId] = { [channelId]: currentTime };
		return;
	}

	const user = channelsPostedIn[userId];

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

	if (hasModPerms(message)) return;

	await message.delete().catch(handleDiscordError);
	message.member
		?.send('You have been banned for spamming')
		.catch(handleDiscordError);
	message.member
		?.ban({ deleteMessageSeconds: 7 * 24 * 60 * 60, reason: 'spamming' })
		.catch(console.error);
	getAuditChannel(message)?.send({
		content: `Banned <@${message.member?.id}> for spamming (posting to 4 different channels within 10 seconds). Message content: \`\`\`${message.content}\`\`\``,
	});
}

export function cleanupAutomodState(): void {
	const oneHourAgo = Date.now() - 60 * 60 * 1000;

	for (const userId in userMessageHistory) {
		const timestamps = userMessageHistory[userId];
		if (!timestamps || timestamps.length === 0) continue;
		const mostRecent = Math.max(...timestamps);
		if (mostRecent < oneHourAgo) {
			delete userMessageHistory[userId];
		}
	}

	for (const userId in channelsPostedIn) {
		const channels = channelsPostedIn[userId];
		if (!channels) continue;
		const timestamps = Object.values(channels) as number[];
		if (timestamps.length === 0) continue;
		const mostRecent = Math.max(...timestamps);
		if (mostRecent < oneHourAgo) {
			delete channelsPostedIn[userId];
		}
	}

	log(
		`Memory cleanup complete. Tracked users: ${Object.keys(userMessageHistory).length}, Channel history: ${Object.keys(channelsPostedIn).length}`,
	);
}
