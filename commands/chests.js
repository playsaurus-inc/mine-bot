const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('chests')
		.setDescription('info on chests')
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
				"Chests are found by miners.\nThe deeper you go the more miners you have & the more chances of a chest being found.\nChests even spawn while at full capacity.\nGold chests are the rarest and have a 1/158 drop chance.\nThey contain the best rewards but it could take a long time to get what you want from them.\nChests have timers so it's best to check every 5-10 minutes for them before they expire as you wouldn't want to miss a gold one.",
			ephemeral: shared,
		});
	},
};
