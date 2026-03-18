import 'dotenv/config';

function requireEnv(name: string): string {
	const value = process.env[name];
	if (!value) throw new Error(`Missing required environment variable: ${name}`);
	return value;
}

export const config = {
	discordToken: requireEnv('DISCORD_TOKEN'),
	clientId: requireEnv('DISCORD_CLIENT_ID'),
	guildId: requireEnv('DISCORD_GUILD_ID'),
	sentryDsn: process.env.SENTRY_DSN,
	appEnv: process.env.APP_ENV ?? 'production',
} as const;
