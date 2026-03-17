import { SlashCommandBuilder } from 'discord.js';
import type { ChatInputCommandInteraction } from 'discord.js';

export const data = new SlashCommandBuilder()
	.setName('role')
	.setDescription('how to get a role')
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
		content:
			"Just go into the in game settings click export and DM <@!764713414206423061> with that code and you should automatically get a role. It's okay if the message is over 2000 characters and gets turned in to a txt file, it can still read it. For further explanations go and read <#808451078201802812>. The roles don't update by themselves, so you will have to do it again, every time you reach the next role requirements.",
		ephemeral,
	});
}
