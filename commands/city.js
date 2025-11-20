const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('city')
		.setDescription('info about the city')
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
				'||The Underground City|| is located at ||303Km|| and is where you upgrade weapons, drill for oil and complete the 2nd lot of quests.',
			ephemeral: shared,
		});
	},
};
