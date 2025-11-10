import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { n8nService } from '../../services/n8n.service';
import { createSnippetEmbed, createErrorEmbed } from '../../utils/embed-builder';
import { handleCommandError } from '../../utils/error-handler';
import { logger } from '../../utils/logger';
import type { Command } from '../../types/commands';

export const snippet: Command = {
  data: new SlashCommandBuilder()
    .setName('snippet')
    .setDescription('코드 스니펫 검색')
    .addStringOption((option) =>
      option
        .setName('query')
        .setDescription('검색할 키워드 (예: promise, async)')
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName('language')
        .setDescription('프로그래밍 언어 필터')
        .setRequired(false)
        .addChoices(
          { name: 'JavaScript', value: 'javascript' },
          { name: 'TypeScript', value: 'typescript' },
          { name: 'Python', value: 'python' },
          { name: 'Go', value: 'go' },
          { name: 'Rust', value: 'rust' },
          { name: 'Java', value: 'java' },
          { name: 'C++', value: 'cpp' }
        )
    ),

  async execute(interaction: ChatInputCommandInteraction) {
    try {
      await interaction.deferReply();

      const query = interaction.options.getString('query', true);
      const language = interaction.options.getString('language') || undefined;

      logger.info('Snippet search requested', { query, language });

      logger.debug('Searching snippets with query:', { query, language });
      
      let results = [];
      try {
        const response = await n8nService.searchSnippets({ query, language });
        
        // 응답이 배열인지 확인
        if (Array.isArray(response)) {
          results = response;
        } else if (response && typeof response === 'object' && 'results' in response) {
          // results 속성이 있는 경우
          results = Array.isArray(response.results) ? response.results : [];
        } else {
          // 그 외의 경우 빈 배열로 초기화
          logger.warn('Unexpected response format from n8nService.searchSnippets:', { response });
          results = [];
        }
        
        logger.debug('Received search results:', { resultCount: results.length });
      } catch (error) {
        logger.error('Error searching snippets:', error);
        throw error;
      }

      if (results.length === 0) {
        await interaction.editReply({
          embeds: [createErrorEmbed('검색 결과가 없습니다.')],
        });
        return;
      }

      // 최대 3개까지만 표시
      const embeds = results.slice(0, 3).map(createSnippetEmbed);

      await interaction.editReply({
        content:
          results.length > 3
            ? `검색 결과 ${results.length}개 중 상위 3개를 표시합니다.`
            : undefined,
        embeds,
      });

      logger.info('Snippet search completed', { resultCount: results.length });
    } catch (error) {
      await handleCommandError(interaction, error);
    }
  },
};
