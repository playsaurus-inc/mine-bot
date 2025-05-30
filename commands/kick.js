
const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const util = require("util");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("kick")
        .setDescription("kicks the user from the server")
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
        .addUserOption(option =>
            option.setName('user')
                .setDescription('the user to kick')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('the reason the user was kicked')
                .setRequired(true)
        ),

    async execute(interaction) {
        const { channel, options } = interaction;
        const user = options.getUser("user");
        const reason = options.getString("reason");

        await interaction.reply({ content: "Kicking user", ephemeral: true }).then(() => {
            var auditChannel = interaction.guild.channels.cache.find(channel => channel.name === "audit-log");
            user.kick(reason);
            auditChannel.send(`${interaction.member.displayName} kicked ${user} for ${reason}`);
        })
    }
}
