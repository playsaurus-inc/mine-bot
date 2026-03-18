import type { ChatInputCommandInteraction } from 'discord.js';
import { SlashCommandBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
	.setName('ufo')
	.setDescription('info about the UFO')
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
			'The UFO is a clickable that comes to visit every 10 hours, real-time. It appears on the space between the Earth and the Moon and stays only for 15 minutes. Successfully clicking it grants you an achievement.\nMore details can be found here  <https://mrmine.fandom.com/wiki/UFO>',
		ephemeral,
	});
}
