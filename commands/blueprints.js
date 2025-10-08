
const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const util = require("util");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("blueprints")
        .setDescription("what blueprints are")
        .addBooleanOption(option =>
            option.setName('ephemeral')
                .setDescription('By default the response is only shown to you. Set to False to share the response with others.')
        ),

    async execute(interaction) {
        const { channel, options } = interaction;
        var shared = options.getBoolean("ephemeral") == null ? true : options.getBoolean("ephemeral") ? true : false;

        await interaction.reply({ content: "Blueprints are what you use to craft parts for your drill. There are 4 parts in total: Drill, Engine, Cargo and Cooler. Currently there are 36 levels of blueprints, with the exception of Cargo which ends at 28.\n\nBlueprint Lvl's 1-5 can be found at the Drill Center on Earth.\n\nBlueprint Lvl's 6-9 can be found after you've acquired the Golem at 50km.\n\nBlueprint Lvl's 10-13 can be found after you've acquired the Broken Robot at 225km.\n\nBlueprint Lvl's 14-17 can be found either through Golden Chests or trading through the Trader.\n\nBlueprint Lvl's 18-20 can be crafted or found through the Trader after you've reached the Moon at 1032km.\n\nBlueprint Lvl's 21-23  can be acquired through the Trader or found in Golden Chests.\n\nBlueprint Lvl's 24-26 can be found after you've reached the Robot MK2 located at 1257km (W2-225km). They can also be found through trading at the Trader.\n\nBlueprint Lvl's 27-32 can be found through Golden Chests or trading through the Trader.\n\nBlueprint Lvl's 33-36 can be found once you reach titan unlocked at Km 1814.", ephemeral: shared })
    }
}
