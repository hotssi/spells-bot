import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { handleCommandError } from '../../utils/error-handler';
import { logger } from '../../utils/logger';
import type { Command } from '../../types/commands';
import { handleBlur } from '../design/handlers/blur';

// /blur is an alias to /design blur for quick access
export const blur: Command = {
  data: new SlashCommandBuilder()
    .setName('blur')
    .setDescription('이미지에 블러 효과 적용 (빠른 접근)')
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
    ),

  async execute(interaction: ChatInputCommandInteraction) {
    try {
      await interaction.deferReply();

      logger.info('Blur alias command executed');

      // Reuse the same handler as /design blur
      await handleBlur(interaction);
    } catch (error) {
      await handleCommandError(interaction, error);
    }
  },
};
