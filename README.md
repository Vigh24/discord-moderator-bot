# Discord Moderator Bot

A Discord bot designed to help moderate server content and manage users effectively.

## Features

- **Spam Detection**: Automatically detects and deletes spam messages.
- **Abusive Language Filtering**: Filters out messages containing abusive words.
- **Warning System**: Issues warnings to users for inappropriate behavior.
- **Timeout Functionality**: Temporarily mutes users after a certain number of warnings.

## Setup

### Prerequisites

- Node.js installed on your machine
- A Discord bot token (create a bot in the [Discord Developer Portal](https://discord.com/developers/applications))

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Vigh24/discord-moderator-bot.git
   cd discord-moderator-bot
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory and add your bot token:
   ```plaintext
   DISCORD_BOT_TOKEN=your_bot_token_here
   ```

4. Run the bot:
   ```bash
   node bot.js
   ```

## Usage

- Invite the bot to your Discord server with the necessary permissions.
- Use commands like `!warn @username` to issue warnings and `!timeout @username` to timeout users.

## Contributing

Feel free to submit issues or pull requests if you have suggestions or improvements!

## License

This project is licensed under the MIT License.