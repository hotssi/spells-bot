import { Client, Events } from 'discord.js';
import { logger } from '@sonagi-bots/shared';

export function registerReadyEvent(client: Client): void {
  client.once(Events.ClientReady, (readyClient) => {
    logger.info(`Logged in as ${readyClient.user.tag}`);
    logger.info(`Serving ${readyClient.guilds.cache.size} guilds`);

    readyClient.user.setPresence({
      activities: [{ name: 'Sonagi Bot System' }],
      status: 'online',
    });
  });
}
