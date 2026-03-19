import type { ChatInputCommandInteraction, TextChannel } from 'discord.js';
import {
	ChannelType,
	MessageFlags,
	PermissionFlagsBits,
	SlashCommandBuilder,
} from 'discord.js';

export const data = new SlashCommandBuilder()
	.setName('ban')
	.setDescription('bans the user from the server')
	.setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
	.addUserOption((option) =>
		option.setName('user').setDescription('the user to ban').setRequired(true),
	)
	.addStringOption((option) =>
		option
			.setName('reason')
			.setDescription('the reason the user was banned')
			.setRequired(true),
	);

export async function execute(
	interaction: ChatInputCommandInteraction<'cached'>,
): Promise<void> {
	const user = interaction.options.getUser('user', true);
	const reason = interaction.options.getString('reason', true);

	await interaction.reply({
		content: 'banning user',
		flags: MessageFlags.Ephemeral,
	});

	// guild.bans.create accepts a User directly as a resolvable
	await interaction.guild.bans.create(user, {
		deleteMessageSeconds: 7 * 24 * 60 * 60,
		reason,
	});

	const auditChannel = interaction.guild.channels.cache.find(
		(ch) => ch.name === 'audit-log' && ch.type === ChannelType.GuildText,
	) as TextChannel | undefined;

	await auditChannel?.send(
		`${interaction.member.displayName} banned ${user} for ${reason}`,
	);
}
