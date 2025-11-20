# MineBot: Mr. Mine Discord Bot

A Discord bot for the Mr. Mine Discord server, providing game information, moderation tools, and automated responses. The core functionality is located in `index.js`.

## 👾 Features

-   Slash commands for game-specific information (e.g., `/faq`, `/bosses`, `/chests`). Find all commands in the `/commands` folder.
-   Moderation tools (e.g., `/ban`, `/kick`).
-   Automatic role assignment based on user's in-game progress (via DMed save files).
-   Automated responses to frequently asked questions.
-   Basic auto-moderation capabilities for chat.

## ⚙️ Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure the Bot

Copy the example environment file and fill in your bot's details:

```bash
cp .env.example .env
```

Then, edit `.env` and provide:
*   `DISCORD_TOKEN`: Your Discord bot token.
*   `DISCORD_CLIENT_ID`: Your bot's client ID.
*   `DISCORD_GUILD_ID`: The ID of the Discord server (guild) where the bot will operate.

> If you are developing locally, you may want to use a dedicated test server and its ID for `DISCORD_GUILD_ID`.

### 3. Start the Bot

```bash
node index.js
```

If the configuration is correct, the bot should appear online in Discord, and its slash commands will be registered/updated for the specified guild.

## 🧹 Code Quality

This project uses [Biome](https://biomejs.dev/) for consistent code style and quality:

```bash
npm run biome
```

## 🚢 Deployment

Simply create a new release in GitHub and the website will be automatically deployed to the server.

> [!NOTE] 
> **How it works:** When you create a new Github release, a GitHub Action will merge the `main` branch into the `production` branch and Forge will deploy the changes. The deployment is handled by Laravel Forge using the `production` branch.

> [!NOTE]
> Always create releases from the `main` branch to ensure all tested changes are included in the deployment.

## 📜 License

This project is licensed under the MIT License (as specified in `package.json`).

