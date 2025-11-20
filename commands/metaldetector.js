const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('metaldetector')
		.setDescription('info about the metal detector')
		.addBooleanOption((option) =>
			option
				.setName('ephemeral')
				.setDescription(
					'By default the response is only shown to you. Set to False to share the response with others.',
				),
		),

	async execute(interaction) {
		const { options } = interaction;
		var shared =
			options.getBoolean('ephemeral') == null
				? true
				: options.getBoolean('ephemeral')
					? true
					: false;

		await interaction.reply({
			content:
				"The Metal Detector is a structure that can be crafted in the Craft Center. Currently, there are 6 levels. The effects of each are as follows:\n\nLevel 1: An object near the left of the Sell Center will appear. It will blink a red light whenever a chest is present in the mine.\n\nLevel 2: Chests and Gold Chests are now marked on the scroll bar as brown dots. Gold Chests will also display a message at the top of the screen when they appear.\n\nLevel 3: Gold Chests are now marked on the scroll bar as yellow dots. Additional messages will also appear telling the depth of the chest and how long it will remain spawned for.\n\nLevel 4: The spacebar may now be used to jump to spawned chests, Orange Fish, mineral deposits, and monsters, in that order.\n\nLevel 5: Chests and mineral deposits that are close to expiring will now blink on the scroll bar. Orange Fish are now marked on the scroll bar with an orange line. Chests may now be opened by clicking anywhere on the level they're spawned.\n\nLevel 6: Spawned chests may now be manually placed into the Chest Collector by clicking a button in the Chest Collector window.",
			ephemeral: shared,
		});
	},
};
