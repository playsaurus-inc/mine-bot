import type { Message } from 'discord.js';
import { config } from '../config.ts';
import { persistBannedFromRoles, store } from '../data.ts';
import type { DataStore } from '../types/index.ts';
import { log } from '../utils/logger.ts';
import { setRole } from './roles.ts';

/**
 * Decodes a game save string (double base64 encoded).
 * Replaces the deprecated `atob` npm package with Node.js built-in Buffer.
 */
function decodeSave(data: string): string[] {
	const inner = Buffer.from(data.split('|')[1] ?? '', 'base64').toString(
		'utf-8',
	);
	const decoded = Buffer.from(inner, 'base64').toString('utf-8');
	return decoded.split('|');
}

export async function processDmMessage(message: Message): Promise<void> {
	if (store.bannedFromRoles.includes(message.author.id)) {
		await message.reply(
			'Your save was determined to be illegitimate either because you cheated or used a different users save. You will no longer be eligible for ranks on the server.',
		);
		return;
	}

	log('received DM');

	const attachment = message.attachments.first();
	if (attachment?.name === 'message.txt') {
		try {
			// Replaces the deprecated `request` package + temp file approach with native fetch
			const response = await fetch(attachment.url);
			const data = await response.text();
			await processSaveData(data, message);
		} catch (error) {
			console.error('Error downloading save attachment:', error);
		}
		return;
	}

	if (
		message.content.length > 200 &&
		message.content.includes('|') &&
		!message.content.includes(' ')
	) {
		await processSaveData(message.content, message);
		return;
	}

	log(message.content);
}

async function processSaveData(data: string, message: Message): Promise<void> {
	if (!data.includes('|')) {
		await message.reply(
			"Your save is missing data, please make sure to paste all of the text. It's okay if Discord asks you to convert it to a file.\nIf you sent me your save by clicking on my name on the right pannel and pasting the text in the little box, Discord automatically cuts the text to 500 characters. So please send it from the actual DM page.",
		);
		return;
	}

	const save = decodeSave(data);

	if (save.length < 450) {
		await message.reply(
			"Your save is missing data, please make sure to paste all of the text. It's okay if Discord asks you to convert it to a file.\nIf you sent me your save by clicking on my name on the right pannel and pasting the text in the little box, Discord automatically cuts the text to 500 characters. So please send it from this DM actual DM page.",
		);
		return;
	}

	await checkSave(save, data, message);
}

async function checkSave(
	save: string[],
	data: string,
	message: Message,
): Promise<void> {
	log('checking save');

	const depth = save[1] ?? '0';
	const timeplayed = Number(save[81] ?? '0') / 60;
	const gameUID = save[3] ?? '';
	const tickets = Number(save[115] ?? '0');
	let userBanned = false;

	for (const entry of store.saves) {
		if (entry.gameUID && gameUID && !Number.isNaN(Number(gameUID))) {
			const isSharedUID =
				String(entry.gameUID) === String(gameUID) &&
				String(entry.userID) !== String(message.author.id);

			if (!userBanned && (isSharedUID || tickets > 20000)) {
				userBanned = true;

				await message.reply(
					'Your save was determined to be illegitimate either because you cheated or used a different users save. You will no longer be eligible for ranks on the server.',
				);

				const guild = message.client.guilds.cache.get(config.guildId);
				const targetMember = guild?.members.cache.get(message.author.id);
				await targetMember?.roles.set([]);
				break;
			}
		}
	}

	if (!userBanned && !store.bannedFromRoles.includes(message.author.id)) {
		store.saves.push({
			userID: message.author.id,
			depth,
			timeplayed: Math.round(timeplayed),
			gameUID,
			save: data,
		});
		await setRole(Number(depth), message);
	} else if (!store.bannedFromRoles.includes(message.author.id)) {
		store.bannedFromRoles.push(message.author.id);
		persistBannedFromRoles();

		store.bannedSaves.push({
			userID: message.author.id,
			depth,
			timeplayed: Math.round(timeplayed),
			gameUID,
			userBanned,
			save: data,
		});
	}
}

export type { DataStore };
// Re-export store for use in message handler
export { store as savesStore };
