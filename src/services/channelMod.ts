import { PermissionsBitField, type Message } from 'discord.js';
import { config } from '../config.ts';

const BUG_REPORTS_CHANNEL = '761441663397789696';
const MOBILE_BUG_REPORTS_CHANNEL = '1427421373248180324';
const IDEAS_CHANNEL = '761441702753206273';

function hasModPerms(message: Message<true>): boolean {
	return message.member?.permissions.has(PermissionsBitField.Flags.ManageMessages) ?? false;
}

export async function handleChannelModeration(message: Message<true>): Promise<void> {
	if (message.guild.id !== config.guildId) return;

	await handleSpamLink(message);
	await handleBugReportsChannel(message);
	await handleMobileBugReportsChannel(message);
	await handleIdeasChannel(message);
}

async function handleSpamLink(message: Message<true>): Promise<void> {
	if (message.content.includes('Checkout this game I am playing https://play.google.com')) {
		await message.delete();
	}
}

async function handleBugReportsChannel(message: Message<true>): Promise<void> {
	if (message.channel.id !== BUG_REPORTS_CHANNEL) return;
	if (message.content.toLowerCase().startsWith('report:')) return;
	if (hasModPerms(message)) return;

	await message.delete();

	message.member
		?.send({
			content:
				'Hey, it appears you posted in the bug reports channel with out the proper format. If your message was a bug report, please edit it to include "report:" , preferably including the game version and patch letter, and resend it to the bug reports channel, thanks! \n\n Message Copy: ' +
				message.content,
		})
		.then(console.log)
		.catch(console.error);

	message.channel
		.send({
			content:
				"Please only use this channel for bug reports. All messages should start with \"Report:\". Discussions should be had in <#760967463684276278>. If you have more information you want to add, like the game version and patch letter, please edit your report with more details. If your message was a report, a copy of it has been sent to your DM's.",
		})
		.then(console.log)
		.catch(console.error);
}

async function handleMobileBugReportsChannel(message: Message<true>): Promise<void> {
	if (message.channel.id !== MOBILE_BUG_REPORTS_CHANNEL) return;

	const lc = message.content.toLowerCase();
	if (lc.startsWith('report android:') || lc.startsWith('report ios:')) return;
	if (hasModPerms(message)) return;

	await message.delete();

	message.member
		?.send({
			content:
				'Hey, it appears you posted in the mobile bug reports channel without the proper format. If your message was a bug report, please edit it to include "Report Android:" or "Report IOS:" and resend it to the mobile bug reports channel, thanks! \n\n Message Copy: ' +
				message.content,
		})
		.then(console.log)
		.catch(console.error);

	message.channel
		.send({
			content:
				"Please only use this channel for bug reports for the Mobile v46 Update. All messages should start with \"Report Android:\" or \"Report IOS:\" . Discussions should be had in <#760967463684276278>. If you have more information you want to add please edit your report with more details. If your message was a report, a copy of it has been sent to your DM's.",
		})
		.then(console.log)
		.catch(console.error);
}

async function handleIdeasChannel(message: Message<true>): Promise<void> {
	if (message.channel.id !== IDEAS_CHANNEL) return;

	const lc = message.content.toLowerCase();
	if (lc.startsWith('idea:') || lc.startsWith('suggestion:')) {
		await message.react('👍');
		await message.react('👎');
		return;
	}

	if (hasModPerms(message)) return;

	await message.delete();

	message.member
		?.send({
			content:
				'Hey, it appears you posted in the ideas and suggestions channel with out the proper format. If your message was an idea, please edit it to include "idea:" and resend it to the ideas channel, thanks! \n\n Message Copy:' +
				message.content,
		})
		.then(console.log)
		.catch(console.error);

	message.channel
		.send({
			content:
				'Please only use this channel for ideas and suggestions. All messages should start with "Idea:". Discussions should be had in <#760967463684276278>. If you have more information you want to add, please edit your idea with more details.',
		})
		.then(console.log)
		.catch(console.error);
}
