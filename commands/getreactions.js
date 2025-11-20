const {
	SlashCommandBuilder,
	AttachmentBuilder,
	PermissionFlagsBits,
} = require('discord.js');
const fs = require('fs');

module.exports = {
	data: new SlashCommandBuilder()
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
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

	async execute(interaction) {
		const messageID = interaction.options.getString('messageid');
		const emojiFilter = interaction.options.getString('emoji');
		const guild = interaction.guild;

		// Acknowledge the interaction immediately
		await interaction.reply({
			content: 'Fetching reactions... This might take a few seconds.',
			ephemeral: true,
		});

		try {
			// Fetch all channels in the guild
			const channels = await guild.channels.fetch();

			// Look through all text channels for the message
			let fetchedMessage = null;
			for (const channel of channels.values()) {
				if (channel.isTextBased()) {
					try {
						fetchedMessage = await channel.messages.fetch(messageID);
						if (fetchedMessage) break; // Stop searching once the message is found
					} catch {
						// Ignore if the message is not found in this channel
					}
				}
			}

			if (!fetchedMessage) {
				return interaction.editReply('Message not found in any channel.');
			}

			// Fetch reactions explicitly to ensure they're loaded
			const reactions = fetchedMessage.reactions.cache;

			if (reactions.size === 0) {
				return interaction.editReply('No reactions found for this message.');
			}

			// Helper function to fetch ALL users for a reaction with pagination
			async function fetchAllUsers(reaction) {
				const allUsers = [];
				let lastUserId = null;

				while (true) {
					const options = { limit: 100 };
					if (lastUserId) {
						options.after = lastUserId;
					}

					const users = await reaction.users.fetch(options);

					if (users.size === 0) break;

					allUsers.push(...users.values());

					if (users.size < 100) break; // No more users to fetch

					lastUserId = users.last().id;
				}

				return allUsers;
			}

			// Filter reactions if emoji is specified
			let targetReactions = reactions;
			if (emojiFilter) {
				// Clean the emoji filter (remove colons if present)
				const cleanEmoji = emojiFilter.replace(/:/g, '');

				// Find matching reaction
				const matchingReaction = reactions.find((reaction) => {
					const emoji = reaction.emoji;
					// Check if it's a custom emoji (has name) or unicode emoji
					if (emoji.name) {
						return (
							emoji.name === cleanEmoji || emoji.toString() === emojiFilter
						);
					} else {
						return (
							emoji.toString() === emojiFilter ||
							emoji.toString() === cleanEmoji
						);
					}
				});

				if (!matchingReaction) {
					return interaction.editReply(
						`No reactions found for emoji: ${emojiFilter}`,
					);
				}

				targetReactions = new Map([
					[matchingReaction.emoji.toString(), matchingReaction],
				]);
			}

			// Categorize users by emoji
			const reactionData = [];
			let totalUsers = 0;

			for (const [emoji, reaction] of targetReactions) {
				// Fetch ALL users for each reaction with pagination
				const users = await fetchAllUsers(reaction);
				const userList = users
					.map((user) => `${user.tag} (${user.id})`)
					.join('\n');

				totalUsers += users.length;

				reactionData.push(`Emoji: ${emoji} (${users.length} users)
Users:
${userList}\n`);
			}

			if (reactionData.length === 0) {
				return interaction.editReply(
					'No reactions found for the specified criteria.',
				);
			}

			// Save to a text file
			const fileName = `reactions_${messageID}${emojiFilter ? '_' + emojiFilter.replace(/[^a-zA-Z0-9]/g, '') : ''}.txt`;
			const fileContent = `Total reactions: ${totalUsers}\n\n${reactionData.join('\n')}`;
			fs.writeFileSync(fileName, fileContent, 'utf8');

			// Use AttachmentBuilder
			const attachment = new AttachmentBuilder(fileName);
			await interaction.user.send({
				content: `Here is the categorized list of reactions (${totalUsers} total users):`,
				files: [attachment],
			});

			// Notify in interaction
			await interaction.editReply(
				`Reaction data has been sent to your DMs. Found ${totalUsers} total users.`,
			);

			// Clean up the file
			fs.unlinkSync(fileName);
		} catch (error) {
			console.error(error);
			interaction.editReply(
				'An error occurred while fetching reactions. Make sure the message ID is correct.',
			);
		}
	},
};
