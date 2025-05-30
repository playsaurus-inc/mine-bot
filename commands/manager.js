
const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName("manager")
        .setDescription("info about the manager")
        .addBooleanOption(option =>
            option.setName('ephemeral')
                .setDescription('By default the response is only shown to you. Set to False to share the response with others.')
        ),

    async execute(interaction) {
        const { channel, options } = interaction;
        var shared = options.getBoolean("ephemeral") == null ? true : options.getBoolean("ephemeral") ? true : false;

        await interaction.reply({ content: "Currently there are 3 levels of managers. All 3 levels of manager can be crafted in the Top Level section of the crafting tab. The effects for each level are as follows:\n\nManager Lv 1: Unlocks the Lock function where you can set ores to be sold until amount. Also allows for Offline Progression, where you'll receive 25% or your normal progress for 12 hours.\nManager Lv2: Grants a small increase of finding rarer materials (excluding the isotopes). Increases the effect Offline Progression, where you'll receive 50% of your normal progress for 24 hours.\nManager Lv3: Grants a small increase to find normal chests. Increases the effect of Offline Progression, where you'll receive 100% of your normal progress for 48 hours.\n\nNote: During Offline Progression it will only count towards your depth and the ores/isotopes that are mined. Only chests that go to Chest Collector are counted and also no fights from monsters will be included in offline progression.", ephemeral: shared })
    }
}
