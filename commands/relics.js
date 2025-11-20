const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('relics')
		.setDescription('info on relics')
		.addBooleanOption((option) =>
			option
				.setName('ephemeral')
				.setDescription(
					'By default the response is only shown to you. Set to False to share the response with others.',
				),
		),

	async execute(interaction) {
		const { options } = interaction;
		var shared = options.getBoolean('ephemeral') ?? true;

		await interaction.reply({
			content:
				'Relics are gained through scientist missions.\nRelics are always activated.\nRelics effects stack except for the ones that grant consumables, resources, timelapses and relic bags.\nAll missions have a DC (Death Chance) percentage, the higher the more chance of losing your scientist.',
			ephemeral: shared,
		});
	},
};
