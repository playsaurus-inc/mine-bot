const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('ufo')
		.setDescription('info about the UFO')
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
				'The UFO is a clickable that comes to visit every 10 hours, real-time. It appears on the space between the Earth and the Moon and stays only for 15 minutes. Successfully clicking it grants you an achievement.\nMore details can be found here  <https://mrmine.fandom.com/wiki/UFO>',
			ephemeral: shared,
		});
	},
};
