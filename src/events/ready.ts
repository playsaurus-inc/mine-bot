import type { Client } from 'discord.js';
import { Events } from 'discord.js';
import { log } from '../utils/logger.ts';

export function registerReady(client: Client): void {
	client.once(Events.ClientReady, (c) => {
		log(`${c.user.username} is online!`);
	});
}
