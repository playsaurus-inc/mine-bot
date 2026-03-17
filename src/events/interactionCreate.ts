import * as Sentry from '@sentry/node';
import type { Client } from 'discord.js';
import { Events } from 'discord.js';

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

			const errorMessage = {
				content: 'There was an error while executing this command!',
				ephemeral: true,
			};

			if (interaction.replied || interaction.deferred) {
				await interaction.followUp(errorMessage);
			} else {
				await interaction.reply(errorMessage);
			}
		}
	});
}
