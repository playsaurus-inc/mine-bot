const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('oilrig')
		.setDescription('info on the oil rig')
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
				'The oil rig is located at 303km in the Underground City.\nThe oil rig is used for:\n\nBlueprints\nGems for Upgrading Weapons\nCrafting for Reactor on the Moon\n\nOil Rig levels, capacity and costs:\n\nLvl 0 to Lvl 1: Cap 2, upgrade costs 5 Building Materials and $100 Billion\nLvl 1 to Lvl 2: Cap 4, upgrade costs 7 Building Materials and $250 Billion\nLvl 2 to Lvl 3: Cap 16, upgrade costs 10 Building Materials and $500 Billion\nLvl 3 to Lvl 4: Cap 32, upgrade costs 15 Building Materials and $1 Trillion\nLvl 4 to Lvl 5: Cap 100, upgrade costs 20 Building Materials and $2 Trillion\nLvl 5 to Lvl 6: Cap 200, upgrade costs 30 Building Materials and $3 Trillion\nLvl 6 to Lvl 7: Cap 400, upgrade costs 40 Building Materials and $5 Trillion\nLvl 7 to Lvl 8: Cap 1000, upgrade costs 50 Building Materials and $8 Trillion\nLvl 8 to Lvl 9: Cap 2000, upgrade costs 75 Building Materials and $40 Trillion\nLvl 9 to Lvl 10: Cap 4000, upgrade costs 90 Building Materials and $80 Trillion\nLvl 10 to Lvl 11: Cap 8000, upgrade costs 100 Building Materials and $400 Trillion\nLvl 11 to Lvl 12: Cap 12000, upgrade costs 150 Building Materials and $2 Quadrillion\nLvl 12 to Lvl 13: Cap 16000, upgrade costs 250 Building Materials and $50 Quadrillion\nLvl 13 to Lvl 14: Cap 20000, upgrade costs 500 Building Materials and $500 Quadrillion\nLvl 14 to Lvl 15: Cap 25000, upgrade costs 1500 Building Materials and $20 Quintillion\nLvl 15 to Lvl 16: Cap 30000, upgrade costs 5000 Building Materials and $600 Quintillion',
			ephemeral: shared,
		});
	},
};
