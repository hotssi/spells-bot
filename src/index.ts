import { Client, GatewayIntentBits } from 'discord.js';
import dotenv from 'dotenv';
import { logger } from './utils/logger';
import { assertEnvVariable } from './utils/error-handler';
import { registerReadyEvent } from './events/ready';
import { registerInteractionCreateEvent } from './events/interactionCreate';
import type { CommandMap } from './types/commands';

// Import commands
import { snippet } from './commands/core/snippet';
import { component } from './commands/core/component';
import { background } from './commands/core/background';
import { design } from './commands/design/index';
import { blur } from './commands/aliases/blur';

// Load environment variables
dotenv.config();

async function main() {
  try {
    logger.info('Starting Spells Bot...');

    // Validate required environment variables
    const token = assertEnvVariable('DISCORD_TOKEN');
    assertEnvVariable('DISCORD_CLIENT_ID');
    assertEnvVariable('N8N_WEBHOOK_BASE_URL');

    // Create Discord client
    const client = new Client({
      intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
    });

    // Register commands
    const commands: CommandMap = new Map([
      [snippet.data.name, snippet],
      [component.data.name, component],
      [background.data.name, background],
      [design.data.name, design],
      [blur.data.name, blur],
    ]);

    logger.info(`Registered ${commands.size} commands`);

    // Register event handlers
    registerReadyEvent(client);
    registerInteractionCreateEvent(client, commands);

    // Login to Discord
    await client.login(token);

    // Graceful shutdown
    process.on('SIGINT', async () => {
      logger.info('Received SIGINT, shutting down gracefully...');
      client.destroy();
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      logger.info('Received SIGTERM, shutting down gracefully...');
      client.destroy();
      process.exit(0);
    });
  } catch (error) {
    logger.error('Failed to start bot', error);
    process.exit(1);
  }
}

// Start the bot
main().catch((error) => {
  logger.error('Unhandled error in main', error);
  process.exit(1);
});
