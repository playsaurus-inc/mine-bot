const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName("areyouhappy")
        .setDescription("annoying pings the users asking if they're happy")
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
        .addUserOption(option =>
            option.setName('user')
                .setDescription('the user to ping')
                .setRequired(true)
        ),

    async execute(interaction) {
        const { channel, options } = interaction;
        const user = options.getUser("user");

        await interaction.reply({ content: "sending pings", ephemeral: true }).then(() => {

            setTimeout(() => { channel.send(`${user} are`); }, 1000);
            setTimeout(() => { channel.send(`${user} you`); }, 2000);
            setTimeout(() => { channel.send(`${user} happy`); }, 3000);
            setTimeout(() => { channel.send(`${user} now`); }, 4000);
            setTimeout(() => { channel.send(`${user} ?`); }, 5000);
        })
    }
}
