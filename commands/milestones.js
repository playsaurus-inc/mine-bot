
const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName("milestones")
        .setDescription("common milestones in Mr. Mine")
        .addBooleanOption(option =>
            option.setName('ephemeral')
                .setDescription('By default the response is only shown to you. Set to False to share the response with others.')
        ),

    async execute(interaction) {
        const { channel, options } = interaction;
        var shared = options.getBoolean("ephemeral") == null ? true : options.getBoolean("ephemeral") ? true : false;

        await interaction.reply({ content: "Here's a list of all the features unlocked by reaching certain levels.\n\n10km - ||Super Miners - Allows Super Miners to be upgraded or scrapped, and for more slots to be purchased||\n15km - ||Trading Post - Trade money or minerals for various rewards||\n45km - ||Cave Building - Access caves, where drones can be used to find various rewards||\n50km - ||Golem - Unlock level 6-9 drill parts||\n100km - ||Chest Collector - Automatically stores chests at the top of the mine||\n225km - ||Broken Robot - Unlock level 10-13 drill parts||\n300-303km - ||Underground City - Unlocks the Oil Pump, Gem Forge, Weapons, and monsters||\n501km - ||The Core - Sacrifice minerals, relics, and scientists for a chance to get a similar reward back||\n700km - ||Chest Compressor - Convert Basic Chests into Gold Chests and Gold Chests into Ethereal Chests||\n1000-1032km - ||The Moon (W2) - Unlock level 18-20 drill parts and new resources to collect. Also has its own Hire Center to buy and upgrade workers||\n1047km ||(W2-15km) - Moon Trading Post - Trade money or minerals for various rewards||\n1133-1134km ||(W2-101-102km) - Reactor - Generate Nuclear Energy and create special isotopes||\n1135km ||(W2-103km) - Buff Lab - Exchange Nuclear Energy for various buffs||\n1257km ||(W2-225km) - Robot MK2 - Unlock level 24-26 drill parts||\n1782-1814km ||(W2-750km) - Titan (W3) - Unlock level 33-36 drill parts, as well as new resources to collect. Also has its own Hire Center to buy and upgrade workers||", ephemeral: shared })
    }
}
