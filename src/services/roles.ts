import type { Client, Message } from 'discord.js';
import { log } from '../utils/logger.ts';
import type { SaveService } from './saves.ts';

const ROLE_IDS = {
	beginner: '776582359423778818', // depth < 304
	intermediate: '776583199711035483', // 304-499
	advanced: '776630529461190707', // 500-999
	expert: '795776541900275772', // 1000-1131
	master: '822975154128814081', // 1132-1813
	grandmaster: '922178836383285259', // 1814+
} as const;

/**
 * Returns the appropriate role ID for a given mine depth.
 */
function getRoleIdForDepth(depth: number): string | null {
	if (depth < 304) return ROLE_IDS.beginner;
	if (depth < 500) return ROLE_IDS.intermediate;
	if (depth < 1000) return ROLE_IDS.advanced;
	if (depth < 1132) return ROLE_IDS.expert;
	if (depth < 1814) return ROLE_IDS.master;
	return ROLE_IDS.grandmaster;
}

/**
 * Handles depth-based role assignment for users who submit valid game saves.
 */
export class RoleService {
	constructor(
		private _client: Client,
		private _guildId: string,
		private _saveService: SaveService,
	) {}

	/**
	 * Assigns the appropriate depth role to a user based on their save's depth.
	 * No-ops if the user is banned from roles.
	 *
	 * @param depth - The mine depth from the user's save.
	 * @param message - The Discord message that triggered the role assignment.
	 */
	async setRole(depth: number, message: Message): Promise<void> {
		if (this._saveService.isBannedFromRole(message.author.id)) return;

		const guild = this._client.guilds.cache.get(this._guildId);
		if (!guild) {
			console.error(`Guild ${this._guildId} not found in cache`);
			return;
		}

		try {
			const member = await guild.members.fetch(message.author.id);
			const roleId = getRoleIdForDepth(depth);

			if (roleId) {
				await member.roles.add(roleId);
				await message.reply(
					'You have been assigned a role on the Mr. Mine Discord. Post a message in chat to see it.',
				);
				log('added role');
			}
		} catch (error) {
			console.error('Error setting role:', error);
		}
	}
}
