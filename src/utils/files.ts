import * as fs from 'node:fs';
import * as Sentry from '@sentry/node';

/**
 * Reads and parses a JSON file, returning a default value if the file doesn't exist or fails.
 */
export function safeReadJsonFile<T>(filePath: string, defaultValue: T): T {
	try {
		if (fs.existsSync(filePath)) {
			const data = fs.readFileSync(filePath, 'utf8');
			return JSON.parse(data) as T;
		}
		console.log(`File not found, using defaults: ${filePath}`);
		return defaultValue;
	} catch (error) {
		console.error(`Error reading ${filePath}:`, error);
		Sentry.captureException(error);
		return defaultValue;
	}
}

/**
 * Serializes and writes data to a JSON file.
 */
export function safeWriteJsonFile(filePath: string, data: unknown): void {
	try {
		fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
	} catch (error) {
		console.error(`Error writing ${filePath}:`, error);
		Sentry.captureException(error);
	}
}
