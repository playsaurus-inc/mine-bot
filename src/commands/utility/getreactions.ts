import * as fs from 'node:fs';
import type {
	ChatInputCommandInteraction,
	MessageReaction,
	User,
} from 'discord.js';
import {
	AttachmentBuilder,
	Collection,
	MessageFlags,
	PermissionFlagsBits,
	SlashCommandBuilder,
} from 'discord.js';

export const data = new SlashCommandBuilder()
	.setName('getreactions')
	.setDescription(
		'Fetch all reactions from a message and save them to a categorized text file.',
	)
	.addStringOption((option) =>
		option
			.setName('messageid')
			.setDescription('The ID of the message to fetch reactions from')
			.setRequired(true),
	)
	.addStringOption((option) =>
		option
			.setName('emoji')
			.setDescription(
				'Specific emoji to filter reactions (e.g., :cookie: or 🍪)',
			)
			.setRequired(false),
	)
	.setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

async function fetchAllUsers(reaction: MessageReaction): Promise<User[]> {
	const allUsers: User[] = [];
	let lastUserId: string | null = null;

	while (true) {
		const options: { limit: number; after?: string } = { limit: 100 };
		if (lastUserId) options.after = lastUserId;

		const users = await reaction.users.fetch(options);
		if (users.size === 0) break;

		allUsers.push(...users.values());
		if (users.size < 100) break;

		lastUserId = users.last()?.id ?? null;
	}

	return allUsers;
}

export async function execute(
	interaction: ChatInputCommandInteraction<'cached'>,
): Promise<void> {
	const messageID = interaction.options.getString('messageid', true);
	const emojiFilter = interaction.options.getString('emoji');

	await interaction.reply({
		content: 'Fetching reactions... This might take a few seconds.',
		flags: MessageFlags.Ephemeral,
	});

	try {
		const channels = await interaction.guild.channels.fetch();
		let fetchedMessage = null;

		for (const channel of channels.values()) {
			if (!channel?.isTextBased()) continue;
			try {
				fetchedMessage = await channel.messages.fetch(messageID);
				if (fetchedMessage) break;
			} catch {
				// Channel doesn't have this message, continue searching
			}
		}

		if (!fetchedMessage) {
			await interaction.editReply('Message not found in any channel.');
			return;
		}

		const reactions = fetchedMessage.reactions.cache;

		if (reactions.size === 0) {
			await interaction.editReply('No reactions found for this message.');
			return;
		}

		let targetReactions = reactions;

		if (emojiFilter) {
			const cleanEmoji = emojiFilter.replace(/:/g, '');
			const matchingReaction = reactions.find((reaction) => {
				const emoji = reaction.emoji;
				if (emoji.name) {
					return emoji.name === cleanEmoji || emoji.toString() === emojiFilter;
				} else {
					return (
						emoji.toString() === emojiFilter || emoji.toString() === cleanEmoji
					);
				}
			});

			if (!matchingReaction) {
				await interaction.editReply(
					`No reactions found for emoji: ${emojiFilter}`,
				);
				return;
			}

			targetReactions = new Collection([
				[matchingReaction.emoji.toString(), matchingReaction],
			]);
		}

		const reactionData: string[] = [];
		let totalUsers = 0;

		for (const [emoji, reaction] of targetReactions) {
			const users = await fetchAllUsers(reaction);
			const userList = users
				.map((user) => `${user.tag} (${user.id})`)
				.join('\n');
			totalUsers += users.length;
			reactionData.push(
				`Emoji: ${emoji} (${users.length} users)\nUsers:\n${userList}\n`,
			);
		}

		if (reactionData.length === 0) {
			await interaction.editReply(
				'No reactions found for the specified criteria.',
			);
			return;
		}

		const fileName = `reactions_${messageID}${emojiFilter ? `_${emojiFilter.replace(/[^a-zA-Z0-9]/g, '')}` : ''}.txt`;
		const fileContent = `Total reactions: ${totalUsers}\n\n${reactionData.join('\n')}`;
		fs.writeFileSync(fileName, fileContent, 'utf8');

		const attachment = new AttachmentBuilder(fileName);
		await interaction.user.send({
			content: `Here is the categorized list of reactions (${totalUsers} total users):`,
			files: [attachment],
		});

		await interaction.editReply(
			`Reaction data has been sent to your DMs. Found ${totalUsers} total users.`,
		);

		fs.unlinkSync(fileName);
	} catch (error) {
		console.error(error);
		await interaction.editReply(
			'An error occurred while fetching reactions. Make sure the message ID is correct.',
		);
	}
}
