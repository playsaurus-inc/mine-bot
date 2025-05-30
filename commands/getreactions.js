const { SlashCommandBuilder, MessageAttachment, PermissionFlagsBits } = require('discord.js');
const fs = require('fs');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('getreactions')
        .setDescription('Fetch all reactions from a message and save them to a categorized text file.')
        .addStringOption(option =>
            option.setName('messageid')
                .setDescription('The ID of the message to fetch reactions from')
                .setRequired(true)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator), // Restrict to admins only

    async execute(interaction) {
        const messageID = interaction.options.getString('messageid');
        const guild = interaction.guild;

        // Acknowledge the interaction immediately
        await interaction.reply({ content: 'Fetching reactions... This might take a few seconds.', ephemeral: true });

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

            // Get all reactions from the message
            const reactions = fetchedMessage.reactions.cache;

            if (reactions.size === 0) {
                return interaction.editReply('No reactions found for this message.');
            }

            // Categorize users by emoji
            const reactionData = [];
            for (const [emoji, reaction] of reactions) {
                const users = await reaction.users.fetch();
                const userList = users.map(user => `${user.tag} (${user.id})`).join('\n');
                reactionData.push(`Emoji: ${emoji}
Users:
${userList}\n`);
            }

            // Save to a text file
            const fileName = `reactions_${messageID}.txt`;
            fs.writeFileSync(fileName, reactionData.join('\n'), 'utf8');

            // Send the text file
            const attachment = new MessageAttachment(fileName);
            await interaction.user.send({ content: 'Here is the categorized list of reactions:', files: [attachment] });

            // Notify in interaction
            await interaction.editReply('Reaction data has been sent to your DMs.');

            // Clean up the file
            fs.unlinkSync(fileName);
        } catch (error) {
            console.error(error);
            interaction.editReply('An error occurred while fetching reactions. Make sure the message ID is correct.');
        }
    },
};
