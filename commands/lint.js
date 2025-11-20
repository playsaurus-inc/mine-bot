const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('lint')
		.setDescription('piece of lint info')
		.addBooleanOption((option) =>
			option
				.setName('ephemeral')
				.setDescription(
					'By default the response is only shown to you. Set to False to share the response with others.',
				),
		),

	async execute(interaction) {
		const { channel, options } = interaction;
		var shared =
			options.getBoolean('ephemeral') == null
				? true
				: options.getBoolean('ephemeral')
					? true
					: false;

		await interaction.reply({
			content:
				'Pieces of Lint are likely nothing. Probably best to throw them down a hole...',
			ephemeral: shared,
		});
	},
};
