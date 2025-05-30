
const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName("hotkeys")
        .setDescription("list of hotkeys")
        .addBooleanOption(option =>
            option.setName('ephemeral')
                .setDescription('By default the response is only shown to you. Set to False to share the response with others.')
        ),

    async execute(interaction) {
        const { channel, options } = interaction;
        var shared = options.getBoolean("ephemeral") == null ? true : options.getBoolean("ephemeral") ? true : false;

        await interaction.reply({ content: "the game tells you very few of the hotkeys available so here are the rest of them\n<https://mrmine.fandom.com/wiki/Shortcuts> this wiki page has the all the available ones listed", ephemeral: shared })
    }
}
