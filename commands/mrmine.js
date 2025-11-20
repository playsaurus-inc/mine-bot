const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('mrmine')
		.setDescription('info on the mime')
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
			content: 'Mr.Mime, he does nothing',
			ephemeral: shared,
		});
	},
};
