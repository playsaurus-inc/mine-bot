const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('secrets')
		.setDescription('book of secret info')
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
				"Books of Secrets are used to upgrade relics and scientists at the Core (501km).\n||One Book of Secrets will turn the Core blue (corrupted). If another Book of Secrets is sacrificed while the Core is blue, you'll get a Book of Secrets+ that can be used to turn the core white (blessed).\nThe blue Core changes a relic or scientist's rarity to Warped.\nThe white Core changes a relic's rarity to Divine and scientists to Warped. **There is no divine rarity for scientists.**\nSuccess chance for relics is 100%. Success chance for scientists is 50%.\nIf an attempt fails, the relic or scientist is lost.\nThe Core only returns to normal after a successful sacrifice.||",
			ephemeral: shared,
		});
	},
};
