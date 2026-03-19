import type { ChatInputCommandInteraction } from 'discord.js';
import { MessageFlags, SlashCommandBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
	.setName('scientists')
	.setDescription('info on scientists')
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
			"Scientists are sent to go on excavations with varying difficulties. Each excavation has a death chance. There are factors that can change this. The rarity of scientists can effect the death chance as well how often a rare item shows up. Level can also play a factor of how often a rare item shows up. There are currently 4 rarities of scientists. Here's how each of the rarities effects the death chance for a excavation:\n\nCommon: No Death Chance reduction.\nUncommon: Lowers Death Chance by 10%.\nRare: Lowers Death Chance by 25%.\nLegendary: Lowers Death Chance by 50%.",
		flags: ephemeral ? MessageFlags.Ephemeral : undefined,
	});
}
