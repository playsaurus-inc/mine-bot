import { appendFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';

/** Scalar values allowed in audit event context. */
export type AuditValue = string | number | boolean | null;

/** Identifying and outcome metadata attached to an audit event. */
export type AuditContext = Record<string, AuditValue | AuditValue[]>;

/** Directory containing the daily audit files. */
const AUDIT_DIRECTORY = path.join(process.cwd(), 'logs');

/**
 * Appends one structured event to the daily audit file.
 *
 * @param event - Stable event name used for counting and filtering.
 * @param context - Relevant IDs and outcome metadata.
 */
export function audit(event: string, context: AuditContext = {}): void {
	try {
		const timestamp = new Date().toISOString();
		const fileName = `audit-${timestamp.slice(0, 10)}.jsonl`;
		const entry = JSON.stringify({ timestamp, event, context });

		mkdirSync(AUDIT_DIRECTORY, { recursive: true });
		appendFileSync(path.join(AUDIT_DIRECTORY, fileName), `${entry}\n`, 'utf8');
	} catch (error) {
		console.error(`Failed to write audit event ${event}:`, error);
	}
}
