
const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const util = require("util");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("ban")
        .setDescription("bans the user from the server")
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
        .addUserOption(option =>
            option.setName('user')
                .setDescription('the user to ban')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('the reason the user was banned')
                .setRequired(true)
        ),

    async execute(interaction) {
        const { channel, options } = interaction;
        const user = options.getUser("user");
        const reason = options.getString("reason");

        await interaction.reply({ content: "banning user", ephemeral: true }).then(() => {
            var auditChannel = interaction.guild.channels.cache.find(channel => channel.name === "audit-log");
            user.ban({ days: 7, reason: reason })
                .then(console.log)
                .catch(console.error);

            auditChannel.send(`${interaction.member.displayName} banned ${user} for ${reason}`);
        })
    }
}
