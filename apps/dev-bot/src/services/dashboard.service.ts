/* eslint-disable */
import { Client } from 'discord.js';
import { logger } from '@sonagi-bots/shared';

export class DashboardService {
  static async updateDashboard(_client: Client, channelId?: string | null): Promise<void> {
    logger.info(`Updating dashboard (stub) for channel: ${channelId || 'default'}`);
  }
}
