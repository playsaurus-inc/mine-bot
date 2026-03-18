export function log(message: string): void {
	const time = new Date();
	const hours = time.getHours() % 12;
	const minutes = time.getMinutes();
	const seconds = time.getSeconds();
	console.log(`[${hours}:${minutes}:${seconds}] ${message}`);
}
