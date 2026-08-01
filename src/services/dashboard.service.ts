/* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument */
import { Client, EmbedBuilder, TextChannel } from 'discord.js';
import { logger } from '../utils/logger';
import { healthService } from './health.service';
import { NotionService } from './notion';
import { PaperclipService } from './paperclip';
import { n8nClient } from '../clients/n8n.client';
import { Colors } from '../utils/embed-builder';

export class DashboardService {
  private static updatingChannels = new Set<string>();

  static async updateDashboard(client: Client, targetChannelId?: string): Promise<void> {
    const channelId = targetChannelId || process.env.DASHBOARD_CHANNEL_ID;
    if (!channelId) return;

    if (this.updatingChannels.has(channelId)) return;
    this.updatingChannels.add(channelId);

    try {
      const channel = (await client.channels.fetch(channelId)) as TextChannel;
      if (!channel || !channel.isTextBased()) {
        logger.warn('DASHBOARD_CHANNEL_ID is invalid or not a text channel.');
        return;
      }

      // 1. Gather Data
      const [health, schedules] = await Promise.all([
        healthService.getSystemStatus().catch((err) => {
          logger.error('Failed to get system status for dashboard', err);
          return { minio: false, n8n: false, k3s: false, timestamp: new Date() };
        }),
        NotionService.getTodaySchedules().catch(() => []),
      ]);

      // Paperclip (Mindulle Studio)
      let pendingApprovals = 0;
      try {
        const companyId = process.env.PAPERCLIP_COMPANY_ID_MINDULLE;
        if (companyId && process.env.PAPERCLIP_API_TOKEN) {
          const approvals = await PaperclipService.listApprovals(companyId, 'pending');
          pendingApprovals = approvals.length;
        }
      } catch (e) {
        logger.warn('Failed to fetch Paperclip stats for dashboard', e);
      }

      // n8n Automation Stats
      let activeWfCount = 0;
      let totalWfCount = 0;
      let recentErrors = 0;
      try {
        const [workflows, executions] = await Promise.all([
          n8nClient.getWorkflows().catch(() => []),
          n8nClient.getRecentExecutions(20).catch(() => []),
        ]);
        totalWfCount = workflows.length;
        activeWfCount = workflows.filter((w: any) => w.active).length;
        recentErrors = executions.filter((e: any) => e.status === 'error').length;
      } catch (e) {
        logger.warn('Failed to fetch n8n stats for dashboard', e);
      }

      // 2. Build Embed
      const isAllHealthy = health.k3s && health.minio && health.n8n;

      const embed = new EmbedBuilder()
        .setColor(isAllHealthy ? Colors.SUCCESS : Colors.ERROR)
        .setTitle('🖥️ Sonagi Live Dashboard')
        .setDescription(
          '이 메시지는 시스템 상태를 5분 주기로 모니터링하여 자동으로 갱신됩니다. (업데이트에 의한 팝업/푸시 알림은 발생하지 않습니다.)'
        )
        .addFields(
          {
            name: '⚙️ 핵심 인프라 (DevOps)',
            value: `**K3s Cluster**: ${health.k3s ? '🟢 Online' : '🔴 Offline'}\n**MinIO Storage**: ${health.minio ? '🟢 Online' : '🔴 Offline'}`,
            inline: true,
          },
          {
            name: '⚡ 초자동화 (n8n Engine)',
            value: `**서버 상태**: ${health.n8n ? '🟢 Online' : '🔴 Offline'}\n**가동 봇**: ${activeWfCount}/${totalWfCount}개 Active\n**최근 에러**: ${recentErrors > 0 ? `🚨 ${recentErrors}건 (system-alerts 확인 요망)` : '✅ 0건 (안정적)'}`,
            inline: true,
          },
          {
            name: '\u200B', // Blank field for spacing
            value: '\u200B',
            inline: false,
          },
          {
            name: '🤖 에이전트 결재 (Paperclip)',
            value:
              pendingApprovals > 0
                ? `🔥 **승인 대기 중**: ${pendingApprovals}건`
                : '✅ 대기 중인 결재 없음',
            inline: true,
          },
          {
            name: '📅 오늘의 일정 (Notion)',
            value:
              schedules.length > 0
                ? schedules
                    .map((s) => `• ${s.isDone ? '✅' : '⏳'} ${s.title}`)
                    .slice(0, 5)
                    .join('\n') + (schedules.length > 5 ? `\n...외 ${schedules.length - 5}건` : '')
                : '오늘은 예정된 일정이 없습니다.',
            inline: true,
          }
        )
        .setFooter({ text: '마지막 갱신' })
        .setTimestamp();

      // 3. Find existing dashboard message or send a new one
      const messages = await channel.messages.fetch({ limit: 50 });
      const existingMessage = messages.find(
        (m) => m.author.id === client.user?.id && m.embeds[0]?.title === '🖥️ Sonagi Live Dashboard'
      );

      if (existingMessage) {
        await existingMessage.edit({ embeds: [embed] });
      } else {
        await channel.send({ embeds: [embed] });
      }
    } catch (error) {
      logger.error('Error updating live dashboard:', error);
    } finally {
      this.updatingChannels.delete(channelId);
    }
  }
}
