import type { ChatInputCommandInteraction } from 'discord.js';
import { SlashCommandBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
	.setName('hotkeys')
	.setDescription('list of hotkeys')
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
			'the game tells you very few of the hotkeys available so here are the rest of them\n<https://mrmine.fandom.com/wiki/Shortcuts> this wiki page has the all the available ones listed',
		ephemeral,
	});
}
