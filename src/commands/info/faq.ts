import type { ChatInputCommandInteraction } from 'discord.js';
import { SlashCommandBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
	.setName('faq')
	.setDescription('frequently asked questions')
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
		content: '<https://mrmine.fandom.com/wiki/Frequently_Asked_Questions>',
		ephemeral,
	});
}
