import { SlashCommandBuilder } from 'discord.js';
import type { ChatInputCommandInteraction } from 'discord.js';

export const data = new SlashCommandBuilder()
	.setName('lint')
	.setDescription('piece of lint info')
	.addBooleanOption((option) =>
		option
			.setName('ephemeral')
			.setDescription(
				'By default the response is only shown to you. Set to False to share the response with others.',
			),
	);

export async function execute(interaction: ChatInputCommandInteraction<'cached'>): Promise<void> {
	const ephemeral = interaction.options.getBoolean('ephemeral') ?? true;

	await interaction.reply({
		content: 'Pieces of Lint are likely nothing. Probably best to throw them down a hole...',
		ephemeral,
	});
}
