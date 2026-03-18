module.exports = {
	apps: [
		{
			name: 'mine-bot',
			script: 'node_modules/.bin/tsx',
			args: 'src/index.ts',
			// Restart on crash
			autorestart: true,
			// Watch for file changes (disable in production)
			watch: false,
			// Memory limit - restart if exceeded (prevents OOM kills)
			max_memory_restart: '500M',
			// Restart delay to prevent rapid restart loops
			restart_delay: 5000,
			// Maximum restarts within a time window
			max_restarts: 10,
			min_uptime: '10s',
			// Environment variables
			env: {
				NODE_ENV: 'development',
			},
			env_production: {
				NODE_ENV: 'production',
			},
			// Logging configuration
			error_file: 'logs/error.log',
			out_file: 'logs/out.log',
			log_file: 'logs/combined.log',
			time: true,
			// Merge logs from all instances
			merge_logs: true,
			// Log rotation
			log_date_format: 'YYYY-MM-DD HH:mm:ss',
		},
	],
};
