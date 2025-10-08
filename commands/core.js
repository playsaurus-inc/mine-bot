
const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName("core")
        .setDescription("info about sacrificing to the core")
        .addBooleanOption(option =>
            option.setName('ephemeral')
                .setDescription('By default the response is only shown to you. Set to False to share the response with others.')
        ),

    async execute(interaction) {
        const { channel, options } = interaction;
        var shared = options.getBoolean("ephemeral") == null ? true : options.getBoolean("ephemeral") ? true : false;

        await interaction.reply({ content: "There are two types of sacrificing, material and relic sacrificing:\n\nMaterial Sacrificing:\nThrowing in any earth materials will either give you “nothing happens” or around the same value of another earth material, value can be slightly higher or lower to add some variance.\n\nRelic Sacrificing:\nThrowing in any relic will either give you “nothing happens” or sometimes it can give you another relic back. The relics returned are based on what is thrown in for example endless miner speed potions can give you back endless drill speed potions, endless scientist speed potions, endless gem speed potions and a few others.", ephemeral: shared })
    }
}
