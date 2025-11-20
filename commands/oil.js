const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('oil')
		.setDescription('why you get 0 oil sometimes')
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
				"the reason you can get 0 oil from chests is this\nwhen you get an oil chest the game does a calc which is time-per-oil/2 hours\nwhen it does this calc with a level 0 oil rig (has 2 hours per) it gets 0.5 oil\nthen the game parses the number as an interger which cuts off everything after the decimal point\nafter it does that parce what your left with is 0 oil which is what's left of it",
			ephemeral: shared,
		});
	},
};
