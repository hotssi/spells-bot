import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { n8nService } from '../../services/n8n.service';
import { createBackgroundEmbed, createErrorEmbed } from '../../utils/embed-builder';
import { handleCommandError } from '../../utils/error-handler';
import { logger } from '../../utils/logger';
import type { Command } from '../../types/commands';

export const background: Command = {
  data: new SlashCommandBuilder()
    .setName('background')
    .setDescription('디자인/개발 배경지식 검색')
    .addStringOption((option) =>
      option.setName('topic').setDescription('검색할 주제 (예: REST API, 타이포그래피)').setRequired(true)
    ),

  async execute(interaction: ChatInputCommandInteraction) {
    try {
      await interaction.deferReply();

      const topic = interaction.options.getString('topic', true);

      logger.info('Background search requested', { topic });

      const results = await n8nService.searchBackground({ topic });

      if (results.length === 0) {
        await interaction.editReply({
          embeds: [createErrorEmbed('검색 결과가 없습니다.')],
        });
        return;
      }

      // 최대 3개까지 표시
      const embeds = results.slice(0, 3).map(createBackgroundEmbed);

      await interaction.editReply({
        content:
          results.length > 3
            ? `검색 결과 ${results.length}개 중 상위 3개를 표시합니다.`
            : undefined,
        embeds,
      });

      logger.info('Background search completed', { resultCount: results.length });
    } catch (error) {
      await handleCommandError(interaction, error);
    }
  },
};
