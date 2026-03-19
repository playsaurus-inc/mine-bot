import type { ChatInputCommandInteraction, TextChannel } from 'discord.js';
import {
	ChannelType,
	MessageFlags,
	PermissionFlagsBits,
	SlashCommandBuilder,
} from 'discord.js';

export const data = new SlashCommandBuilder()
	.setName('kick')
	.setDescription('kicks the user from the server')
	.setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
	.addUserOption((option) =>
		option.setName('user').setDescription('the user to kick').setRequired(true),
	)
	.addStringOption((option) =>
		option
			.setName('reason')
			.setDescription('the reason the user was kicked')
			.setRequired(true),
	);

export async function execute(
	interaction: ChatInputCommandInteraction<'cached'>,
): Promise<void> {
	const user = interaction.options.getUser('user', true);
	const reason = interaction.options.getString('reason', true);

	await interaction.reply({
		content: 'Kicking user',
		flags: MessageFlags.Ephemeral,
	});

	// guild.members.kick accepts a User directly as a resolvable
	await interaction.guild.members.kick(user, reason);

	const auditChannel = interaction.guild.channels.cache.find(
		(ch) => ch.name === 'audit-log' && ch.type === ChannelType.GuildText,
	) as TextChannel | undefined;

	await auditChannel?.send(
		`${interaction.member.displayName} kicked ${user} for ${reason}`,
	);
}
