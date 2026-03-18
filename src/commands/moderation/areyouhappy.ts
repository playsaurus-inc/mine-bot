import type { ChatInputCommandInteraction } from 'discord.js';
import { PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
	.setName('areyouhappy')
	.setDescription("annoying pings the users asking if they're happy")
	.setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
	.addUserOption((option) =>
		option.setName('user').setDescription('the user to ping').setRequired(true),
	);

export async function execute(
	interaction: ChatInputCommandInteraction<'cached'>,
): Promise<void> {
	const user = interaction.options.getUser('user', true);
	const channel = interaction.channel;

	await interaction.reply({ content: 'sending pings', ephemeral: true });

	if (!channel) return;

	setTimeout(() => void channel.send(`${user} are`), 1000);
	setTimeout(() => void channel.send(`${user} you`), 2000);
	setTimeout(() => void channel.send(`${user} happy`), 3000);
	setTimeout(() => void channel.send(`${user} now`), 4000);
	setTimeout(() => void channel.send(`${user} ?`), 5000);
}
