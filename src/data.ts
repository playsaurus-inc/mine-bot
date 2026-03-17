import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { BannedSaveEntry, DataStore, SaveEntry } from './types/index.ts';
import { safeReadJsonFile, safeWriteJsonFile } from './utils/files.ts';

// Data files live at the project root, one level above src/
const DATA_DIR = join(dirname(fileURLToPath(import.meta.url)), '..');

export const store: DataStore = {
	saves: [],
	bannedSaves: [],
	bannedFromRoles: [],
};

export function loadData(): void {
	console.log('Loading data files...');

	const savesData = safeReadJsonFile<{ saves: SaveEntry[] }>(
		join(DATA_DIR, 'saves.json'),
		{
			saves: [],
		},
	);
	const bannedSavesData = safeReadJsonFile<{ saves: BannedSaveEntry[] }>(
		join(DATA_DIR, 'bannedSaves.json'),
		{ saves: [] },
	);
	const bannedFromRolesData = safeReadJsonFile<{ bannedFromRoles: string[] }>(
		join(DATA_DIR, 'bannedFromRoles.json'),
		{ bannedFromRoles: [] },
	);

	store.saves = savesData.saves;
	store.bannedSaves = bannedSavesData.saves;
	store.bannedFromRoles = bannedFromRolesData.bannedFromRoles;

	console.log('Data files loaded successfully');
}

/** Persists saves and banned saves to disk. Called periodically. */
export function persistData(): void {
	safeWriteJsonFile(join(DATA_DIR, 'saves.json'), { saves: store.saves });
	safeWriteJsonFile(join(DATA_DIR, 'bannedSaves.json'), {
		saves: store.bannedSaves,
	});
}

/** Persists the banned-from-roles list immediately. Called when a user is banned. */
export function persistBannedFromRoles(): void {
	safeWriteJsonFile(join(DATA_DIR, 'bannedFromRoles.json'), {
		bannedFromRoles: store.bannedFromRoles,
	});
}
