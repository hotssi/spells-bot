import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { n8nService } from '../../services/n8n.service';
import { createComponentEmbed, createErrorEmbed } from '../../utils/embed-builder';
import { handleCommandError } from '../../utils/error-handler';
import { logger } from '../../utils/logger';
import type { Command } from '../../types/commands';

export const component: Command = {
  data: new SlashCommandBuilder()
    .setName('component')
    .setDescription('UI 컴포넌트 검색 및 StackBlitz로 열기')
    .addStringOption((option) =>
      option
        .setName('framework')
        .setDescription('프레임워크 선택')
        .setRequired(true)
        .addChoices(
          { name: 'React', value: 'react' },
          { name: 'Vue', value: 'vue' },
          { name: 'Svelte', value: 'svelte' },
          { name: 'Vanilla', value: 'vanilla' }
        )
    )
    .addStringOption((option) =>
      option
        .setName('name')
        .setDescription('컴포넌트 이름 (예: button, modal)')
        .setRequired(false)
    )
    .addStringOption((option) =>
      option
        .setName('category')
        .setDescription('카테고리 필터 (예: form, layout)')
        .setRequired(false)
    ),

  async execute(interaction: ChatInputCommandInteraction) {
    try {
      await interaction.deferReply();

      const framework = interaction.options.getString('framework', true);
      const name = interaction.options.getString('name') || undefined;
      const category = interaction.options.getString('category') || undefined;

      logger.info('Component search requested', { framework, name, category });

      const results = await n8nService.searchComponents({ framework, name, category });

      if (results.length === 0) {
        await interaction.editReply({
          embeds: [createErrorEmbed('검색 결과가 없습니다.')],
        });
        return;
      }

      // 최대 5개까지 표시
      const embeds = results.slice(0, 5).map(createComponentEmbed);

      await interaction.editReply({
        content:
          results.length > 5
            ? `검색 결과 ${results.length}개 중 상위 5개를 표시합니다.`
            : undefined,
        embeds,
      });

      logger.info('Component search completed', { resultCount: results.length });
    } catch (error) {
      await handleCommandError(interaction, error);
    }
  },
};
  