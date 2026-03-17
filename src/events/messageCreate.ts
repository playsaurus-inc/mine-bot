import type { Client } from 'discord.js';
import { Events } from 'discord.js';
import { runAutomod } from '../services/automod.ts';
import { handleChannelModeration } from '../services/channelMod.ts';
import { processDmMessage } from '../services/saves.ts';

const QUESTION_STARTERS = ['what', 'any idea', 'why', 'whats'];

export function registerMessageCreate(client: Client): void {
	client.on(Events.MessageCreate, async (message) => {
		if (message.author.bot) return;

		const lc = message.content.toLowerCase();

		// Auto-responses for common game questions
		const hasQuestionStarter = QUESTION_STARTERS.some((s) => lc.includes(s));

		if (hasQuestionStarter && (lc.includes('red star') || lc.includes('red name'))) {
			await message.reply({
				content:
					'The red names are the names of players who chose to support the game by buying 650 tickets or 1400 tickets at one time.',
			});
		} else if (hasQuestionStarter && (lc.includes('mime') || lc.includes('112'))) {
			await message.reply({
				content: "That's Mr. Mime, he's just vibin. He doesn't do anything.",
			});
		} else if (
			(lc.includes('any') || lc.includes('give me') || lc.includes('are there')) &&
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
			await processDmMessage(message);
			return;
		}

		// Guild-only: channel moderation and automod
		if (!message.inGuild()) return;
		await handleChannelModeration(message);
		await runAutomod(message);
	});
}
