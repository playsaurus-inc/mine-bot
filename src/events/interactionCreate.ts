import * as Sentry from '@sentry/node';
import type { Client } from 'discord.js';
import { Events, MessageFlags } from 'discord.js';

export function registerInteractionCreate(client: Client): void {
	client.on(Events.InteractionCreate, async (interaction) => {
		if (!interaction.isChatInputCommand()) return;
		if (!interaction.inCachedGuild()) return;

		const command = interaction.client.commands.get(interaction.commandName);

		if (!command) {
			console.error(
				`No command matching ${interaction.commandName} was found.`,
			);
			return;
		}

		try {
			await command.execute(interaction);
		} catch (error) {
			console.error(error);

			Sentry.captureException(error, {
				tags: { command: interaction.commandName },
				user: { id: interaction.user.id, username: interaction.user.username },
			});

			if (interaction.replied || interaction.deferred) {
				await interaction.followUp({
					content: 'There was an error while executing this command!',
					flags: MessageFlags.Ephemeral,
				});
			} else {
				await interaction.reply({
					content: 'There was an error while executing this command!',
					flags: MessageFlags.Ephemeral,
				});
			}
		}
	});
}
