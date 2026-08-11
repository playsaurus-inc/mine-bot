import type { ChatInputCommandInteraction, Collection } from 'discord.js';

export interface SaveEntry {
	userID: string;
	depth: string;
	timeplayed: number;
	gameUID: string;
}

export interface BannedSaveEntry {
	userID: string;
	depth: string;
	timeplayed: number;
	gameUID: string;
	userBanned: boolean;
}

export interface DataStore {
	saves: SaveEntry[];
	bannedSaves: BannedSaveEntry[];
	bannedFromRoles: string[];
}

export interface Command {
	data: { name: string; toJSON(): object };
	execute(interaction: ChatInputCommandInteraction<'cached'>): Promise<void>;
}

declare module 'discord.js' {
	interface Client {
		commands: Collection<string, Command>;
	}
}
