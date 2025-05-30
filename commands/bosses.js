
const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName("bosses")
        .setDescription("description of bosses")
        .addBooleanOption(option =>
            option.setName('ephemeral')
                .setDescription('By default the response is only shown to you. Set to False to share the response with others.')
        ),

    async execute(interaction) {
        const { channel, options } = interaction;
        var shared = options.getBoolean("ephemeral") == null ? true : options.getBoolean("ephemeral") ? true : false;

        await interaction.reply({ content: "Bosses are always ||100km|| apart ( with an exception of ||1000km|| ), starting at ||400km|| with the first boss.\nThe bosses on the ||moon|| are just shifted a little bit and are starting at ||1132km|| and then the next one continuing after ||100km||.\nWhen you arrive at a km with a boss, your drill will stop digging any more km, until you defeat the boss.\nIf you lose the fight, nothing will happen and the boss will just be there, until you finally beat him.\nIf you cannot defeat the boss, try getting/upgrading some weapons or get some combat relics.", ephemeral: shared })
    }
}
