import { execSync } from 'node:child_process';
import 'dotenv/config';
import * as Sentry from '@sentry/node';
import { client, startBot } from './bot.ts';

function getGitTag(): string | undefined {
	try {
		return execSync('git describe --tags --abbrev=0').toString().trim();
	} catch {
		return undefined;
	}
}

function initSentry(): void {
	const dsn = process.env.SENTRY_DSN;
	if (!dsn) {
		console.log('Sentry DSN not provided, Sentry not initialized');
		return;
	}

	Sentry.init({
		dsn,
		environment: process.env.APP_ENV ?? 'production',
		release: getGitTag(),
		integrations: (defaults) => [
			...defaults,
			Sentry.captureConsoleIntegration({ levels: ['error'] }),
		],
	});
	console.log('Sentry initialized');
}

function registerProcessHandlers(): void {
	process.on('unhandledRejection', (reason) => {
		console.error('Unhandled Rejection:', reason);
		Sentry.captureException(reason);
	});

	process.on('uncaughtException', (error) => {
		console.error('Uncaught Exception:', error);
		Sentry.captureException(error);
		Sentry.close(2000).then(() => process.exit(1));
	});

	process.on('SIGTERM', () => {
		console.log('Received SIGTERM, shutting down gracefully...');
		client.destroy();
		Sentry.close(2000).then(() => process.exit(0));
	});

	process.on('SIGINT', () => {
		console.log('Received SIGINT, shutting down gracefully...');
		client.destroy();
		Sentry.close(2000).then(() => process.exit(0));
	});
}

initSentry();
registerProcessHandlers();

startBot().catch((error: unknown) => {
	console.error('Fatal error starting bot:', error);
	Sentry.captureException(error);
	Sentry.close(2000).then(() => process.exit(1));
});
