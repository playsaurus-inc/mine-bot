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

Copy the example configuration file and fill in your bot's details:

```bash
cp botconfig.example.json botconfig.json
```

Then, edit `botconfig.json` and provide:
*   `token`: Your Discord bot token.
*   `clientId`: Your bot's client ID.
*   `guildId`: The ID of the Discord server (guild) where the bot will operate.

> If you are developing locally, you may want to use a dedicated test server and its ID for `guildId`.

### 3. Start the Bot

```bash
node index.js
```

If the configuration is correct, the bot should appear online in Discord, and its slash commands will be registered/updated for the specified guild.

## 🚢 Deployment

We use the "Release to deploy" methodology:

1.  Create a new GitHub release.
2.  A GitHub Action will automatically merge the `main` branch into the `production` branch, and then later it will SSH into the server and run the deployment script (`deploy.sh`).

> [!NOTE]
> Always create releases from the `main` branch to ensure all tested changes are included in the deployment.

## 📜 License

This project is licensed under the MIT License (as specified in `package.json`).

