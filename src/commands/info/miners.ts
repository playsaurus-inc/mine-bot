import type { ChatInputCommandInteraction } from 'discord.js';
import { SlashCommandBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
	.setName('miners')
	.setDescription('info about miners')
	.addBooleanOption((option) =>
		option
			.setName('ephemeral')
			.setDescription(
				'By default the response is only shown to you. Set to False to share the response with others.',
			),
	);

export async function execute(
	interaction: ChatInputCommandInteraction<'cached'>,
): Promise<void> {
	const ephemeral = interaction.options.getBoolean('ephemeral') ?? true;

	await interaction.reply({
		content:
			'Miners increase mining speed by 10% each.\nUpgrades increase mining speed by 10% each.\nMiners find chests for you, the deeper you go the more chances of chests.',
		ephemeral,
	});
}
