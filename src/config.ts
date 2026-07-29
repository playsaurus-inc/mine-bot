import 'dotenv/config';

function requireEnv(name: string): string {
	const value = process.env[name];
	if (!value) throw new Error(`Missing required environment variable: ${name}`);
	return value;
}

/**
 * Reads a boolean from the environment, falling back to `defaultValue` when unset.
 *
 * @throws If the variable is set to anything other than `true` or `false`.
 */
function boolEnv(name: string, defaultValue: boolean): boolean {
	const value = process.env[name];
	if (value === undefined || value.trim() === '') return defaultValue;

	const normalized = value.trim().toLowerCase();
	if (normalized === 'true') return true;
	if (normalized === 'false') return false;

	throw new Error(
		`Environment variable ${name} must be "true" or "false", got "${value}"`,
	);
}

const features = {
	/** Canned replies to common questions asked in chat */
	autoResponder: boolEnv('AUTO_RESPONDER_ENABLED', true),
	/** Deletion of bug report posts missing the "Report:" prefix */
	bugReportFormat: boolEnv('BUG_REPORT_FORMAT_ENABLED', true),
	/** Deletion of mobile bug report posts missing the platform prefix */
	mobileBugReportFormat: boolEnv('MOBILE_BUG_REPORT_FORMAT_ENABLED', true),
	/** Deletion of ideas posts missing the "Idea:" prefix, and vote reactions */
	ideaFormat: boolEnv('IDEA_FORMAT_ENABLED', true),
	/** Removal of the Google Play spam message */
	googlePlaySpamMod: boolEnv('GOOGLE_PLAY_SPAM_MOD_ENABLED', true),
	/** Ban on nitro scam messages */
	nitroScamMod: boolEnv('NITRO_SCAM_MOD_ENABLED', true),
	/** Removal of discord.gg links posted by new members */
	inviteLinkMod: boolEnv('INVITE_LINK_MOD_ENABLED', true),
	/** Ban on new members posting slurs */
	slurBanMod: boolEnv('SLUR_BAN_MOD_ENABLED', true),
	/** Ban on new members posting messages too rapidly */
	rapidMessageSpamMod: boolEnv('RAPID_MESSAGE_SPAM_MOD_ENABLED', true),
	/** Ban on users posting across several channels at once */
	crossChannelSpamMod: boolEnv('CROSS_CHANNEL_SPAM_MOD_ENABLED', true),
} as const;

export const config = {
	discordToken: requireEnv('DISCORD_TOKEN'),
	clientId: requireEnv('DISCORD_CLIENT_ID'),
	guildId: requireEnv('DISCORD_GUILD_ID'),
	sentryDsn: process.env.SENTRY_DSN,
	appEnv: process.env.APP_ENV ?? 'production',

	features,

	// The spam detectors are missing here on purpose: they decide on timing
	// alone and only quote message text when writing to the audit log.
	/** Whether an enabled feature needs the Message Content privileged intent */
	requiresMessageContent:
		features.autoResponder ||
		features.bugReportFormat ||
		features.mobileBugReportFormat ||
		features.ideaFormat ||
		features.googlePlaySpamMod ||
		features.nitroScamMod ||
		features.inviteLinkMod ||
		features.slurBanMod,
} as const;
