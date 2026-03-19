import type { ChatInputCommandInteraction } from 'discord.js';
import { MessageFlags, SlashCommandBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
	.setName('codes')
	.setDescription('info about codes')
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
			'The devs create the codes.\nThe codes are given out randomly.\nPlease do not ask for any codes.\nNEVER ask the devs for any codes.\nLook in <#764279333262852138> for codes.\nThe codes expire after a certain amount of time.',
		flags: ephemeral ? MessageFlags.Ephemeral : undefined,
	});
}
