import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { handleCommandError } from '../../utils/error-handler';
import { logger } from '../../utils/logger';
import type { Command } from '../../types/commands';
import { handleBlur } from './handlers/blur';
import { handleStyledText } from './handlers/styled-text';

export const design: Command = {
  data: new SlashCommandBuilder()
    .setName('design')
    .setDescription('디자인 관련 도구')
    .addSubcommand((subcommand) =>
      subcommand
        .setName('blur')
        .setDescription('이미지에 블러 효과 적용')
        .addStringOption((option) =>
          option.setName('image').setDescription('이미지 URL').setRequired(true)
        )
        .addIntegerOption((option) =>
          option
            .setName('intensity')
            .setDescription('블러 강도 (100-2000, 기본값: 800)')
            .setRequired(false)
            .setMinValue(100)
            .setMaxValue(2000)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('styled-text')
        .setDescription('텍스트 스타일링')
        .addStringOption((option) =>
          option.setName('text').setDescription('스타일을 적용할 텍스트').setRequired(true)
        )
        .addStringOption((option) =>
          option
            .setName('style')
            .setDescription('스타일 선택')
            .setRequired(true)
            .addChoices(
              { name: 'Bold (굵게)', value: 'bold' },
              { name: 'Italic (기울임)', value: 'italic' },
              { name: 'Underline (밑줄)', value: 'underline' },
              { name: 'Strikethrough (취소선)', value: 'strikethrough' },
              { name: 'Code (코드)', value: 'code' },
              { name: 'Code Block (코드 블록)', value: 'code-block' },
              { name: 'Quote (인용)', value: 'quote' },
              { name: 'Spoiler (스포일러)', value: 'spoiler' }
            )
        )
    ),

  async execute(interaction: ChatInputCommandInteraction) {
    try {
      await interaction.deferReply();

      const subcommand = interaction.options.getSubcommand();

      logger.info('Design command executed', { subcommand });

      switch (subcommand) {
        case 'blur':
          await handleBlur(interaction);
          break;
        case 'styled-text':
          await handleStyledText(interaction);
          break;
        default:
          throw new Error(`Unknown subcommand: ${subcommand}`);
      }
    } catch (error) {
      await handleCommandError(interaction, error);
    }
  },
};
