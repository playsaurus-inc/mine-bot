const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('miners')
		.setDescription('info about miners')
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
				'Miners increase mining speed by 10% each.\nUpgrades increase mining speed by 10% each.\nMiners find chests for you, the deeper you go the more chances of chests.',
			ephemeral: shared,
		});
	},
};
