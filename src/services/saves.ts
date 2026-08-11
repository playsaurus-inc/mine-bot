import type { Message } from 'discord.js';
import { config } from '../config.ts';
import { persistBannedFromRoles, store } from '../data.ts';
import type { DataStore } from '../types/index.ts';
import { audit } from '../utils/audit.ts';
import { log } from '../utils/logger.ts';
import type { RoleService } from './roles.ts';

/**
 * Manages save file processing, validation, and storage for game save submissions
 * received via DM.
 */
export class SaveService {
	private _roleService!: RoleService;

	/**
	 * Sets the RoleService dependency. Must be called before processing saves.
	 * Separated from the constructor to break the circular dependency between
	 * SaveService and RoleService.
	 */
	setRoleService(roleService: RoleService): void {
		this._roleService = roleService;
	}

	/**
	 * Checks whether a user is permanently banned from role assignment.
	 *
	 * @param userId - Discord user ID to check.
	 */
	isBannedFromRole(userId: string): boolean {
		return store.bannedFromRoles.includes(userId);
	}

	/**
	 * Decodes a game save string (double base64 encoded).
	 */
	static decodeSave(data: string): string[] {
		const inner = Buffer.from(data.split('|')[1] ?? '', 'base64').toString(
			'utf-8',
		);
		const decoded = Buffer.from(inner, 'base64').toString('utf-8');
		return decoded.split('|');
	}

	/**
	 * Processes a DM message, checking for save data in attachments or message content.
	 */
	async processDmMessage(message: Message): Promise<void> {
		if (store.bannedFromRoles.includes(message.author.id)) {
			audit('save.rejected', {
				reason: 'user_already_banned',
				userId: message.author.id,
			});
			await message.reply(
				'Your save was determined to be illegitimate either because you cheated or used a different users save. You will no longer be eligible for ranks on the server.',
			);
			return;
		}

		log('received DM');

		const attachment = message.attachments.first();
		if (attachment?.name === 'message.txt') {
			audit('save.received', {
				input: 'attachment',
				userId: message.author.id,
			});
			try {
				const response = await fetch(attachment.url);
				const data = await response.text();
				await this.processSaveData(data, message);
			} catch (error) {
				audit('save.failed', {
					reason: 'attachment_download_failed',
					userId: message.author.id,
				});
				console.error('Error downloading save attachment:', error);
			}
			return;
		}

		if (
			message.content.length > 200 &&
			message.content.includes('|') &&
			!message.content.includes(' ')
		) {
			audit('save.received', {
				input: 'message',
				userId: message.author.id,
			});
			await this.processSaveData(message.content, message);
			return;
		}

		log('received unsupported DM');
	}

	/**
	 * Validates and processes raw save data, checking for proper formatting
	 * and minimum data length before delegating to checkSave.
	 */
	private async processSaveData(data: string, message: Message): Promise<void> {
		if (!data.includes('|')) {
			audit('save.rejected', {
				reason: 'unsupported_format',
				userId: message.author.id,
			});
			await message.reply(
				"Your save is missing data, please make sure to paste all of the text. It's okay if Discord asks you to convert it to a file.\nIf you sent me your save by clicking on my name on the right pannel and pasting the text in the little box, Discord automatically cuts the text to 500 characters. So please send it from the actual DM page.",
			);
			return;
		}

		const save = SaveService.decodeSave(data);

		if (save.length < 450) {
			audit('save.rejected', {
				reason: 'incomplete_save',
				userId: message.author.id,
			});
			await message.reply(
				"Your save is missing data, please make sure to paste all of the text. It's okay if Discord asks you to convert it to a file.\nIf you sent me your save by clicking on my name on the right pannel and pasting the text in the little box, Discord automatically cuts the text to 500 characters. So please send it from this DM actual DM page.",
			);
			return;
		}

		await this.checkSave(save, message);
	}

	/**
	 * Validates a decoded save against existing saves to detect cheating or
	 * duplicate submissions, then either assigns a role or bans the user.
	 */
	private async checkSave(save: string[], message: Message): Promise<void> {
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
					const targetMember = await guild?.members
						.fetch(message.author.id)
						.catch(() => null);
					await targetMember?.roles.set([]);
					break;
				}
			}
		}

		if (!userBanned && !store.bannedFromRoles.includes(message.author.id)) {
			audit('save.accepted', {
				depth: Number(depth),
				userId: message.author.id,
			});
			store.saves.push({
				userID: message.author.id,
				depth,
				timeplayed: Math.round(timeplayed),
				gameUID,
			});
			await this._roleService.setRole(Number(depth), message);
		} else if (!store.bannedFromRoles.includes(message.author.id)) {
			audit('save.banned', {
				reason: 'validation_failed',
				userId: message.author.id,
			});
			store.bannedFromRoles.push(message.author.id);
			persistBannedFromRoles();

			store.bannedSaves.push({
				userID: message.author.id,
				depth,
				timeplayed: Math.round(timeplayed),
				gameUID,
				userBanned,
			});
		}
	}
}

export type { DataStore };
export { store as savesStore };
