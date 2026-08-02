import { Client } from 'discord.js';
import { logger } from '@sonagi-bots/shared';

export class DashboardService {
  static async updateDashboard(client: Client): Promise<void> {
    logger.info('Updating dashboard (stub)');
  }
}
