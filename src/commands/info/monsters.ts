import type { ChatInputCommandInteraction } from 'discord.js';
import { SlashCommandBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
	.setName('monsters')
	.setDescription('info on monsters')
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
			'Monsters start attacking your miners from ||304Km||, you use weapons to fight them.\nThe background flashes red when a monster attack is happening.',
		ephemeral,
	});
}
