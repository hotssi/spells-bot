import { Client, GatewayIntentBits, Partials } from 'discord.js';
import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: '/home/ubuntu/sonagi-bots/.env' });

import { logger, assertEnvVariable, CommandMap } from '@sonagi-bots/shared';
import { registerReadyEvent } from './events/ready';
import { registerInteractionCreateEvent } from './events/interactionCreate';
import { registerMessageCreateEvent } from './events/messageCreate';

// Import commands
import { cdnCommand } from './commands/cdn/index';
import { galleryCommand } from './commands/gallery/index';
import { radioCommand } from './commands/radio/index';

import { Player } from 'discord-player';
export let player: Player;

async function main() {
  try {
    logger.info('Starting Media Bot...');

    const token = assertEnvVariable('MEDIA_BOT_TOKEN');
    assertEnvVariable('DISCORD_CLIENT_ID');

    const client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
      ],
      partials: [Partials.Message, Partials.User],
    });

    const { DefaultExtractors } = await import('@discord-player/extractor');
    player = new Player(client);
    await player.extractors.loadMulti(DefaultExtractors);

    player.events.on('playerStart', (queue, track) => {
      const metadata = track.metadata as Record<string, unknown> | null;
      const resumeFrom = metadata?.resumeFrom;
      if (typeof resumeFrom === 'number') {
        logger.info(`Resuming track ${track.title} from ${resumeFrom}ms`);
        setTimeout(() => {
          queue.node.seek(resumeFrom).catch((err) => logger.error('Failed to seek', err));
        }, 500);
      }
    });

    const commands: CommandMap = new Map([
      [cdnCommand.data.name, cdnCommand],
      [galleryCommand.data.name, galleryCommand],
      [radioCommand.data.name, radioCommand],
    ]);

    logger.info(`Registered ${commands.size} commands`);

    registerReadyEvent(client);
    registerInteractionCreateEvent(client, commands);
    registerMessageCreateEvent(client);

    await client.login(token);

    process.on('SIGINT', () => {
      logger.info('Received SIGINT, shutting down gracefully...');
      void client.destroy();
      process.exit(0);
    });
    process.on('SIGTERM', () => {
      logger.info('Received SIGTERM, shutting down gracefully...');
      void client.destroy();
      process.exit(0);
    });
  } catch (error) {
    logger.error('Failed to start bot', error);
    process.exit(1);
  }
}

main().catch((error) => {
  logger.error('Unhandled error in main', error);
  process.exit(1);
});
