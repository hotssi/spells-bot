import { ChatInputCommandInteraction } from 'discord.js';
import { cloudinaryService } from '../../../services/cloudinary.service';
import { createSuccessEmbed } from '../../../utils/embed-builder';
import { CommandError } from '../../../utils/error-handler';
import { logger } from '../../../utils/logger';

export async function handleBlur(interaction: ChatInputCommandInteraction): Promise<void> {
  const imageUrl = interaction.options.getString('image', true);
  const intensity = interaction.options.getInteger('intensity') || 800;

  logger.info('Blur image requested', { imageUrl, intensity });

  // URL 유효성 검증
  if (!imageUrl.startsWith('http://') && !imageUrl.startsWith('https://')) {
    throw new CommandError('올바른 이미지 URL을 입력해주세요.', true);
  }

  // 강도 범위 검증
  if (intensity < 100 || intensity > 2000) {
    throw new CommandError('블러 강도는 100~2000 사이여야 합니다.', true);
  }

  const result = await cloudinaryService.processImage(imageUrl, {
    blur: intensity,
    quality: 90,
    format: 'jpg',
  });

  const embed = createSuccessEmbed('이미지 블러 처리가 완료되었습니다!')
    .addFields(
      { name: '원본 이미지', value: `[링크](${result.original})`, inline: true },
      { name: '처리된 이미지', value: `[링크](${result.processed})`, inline: true },
      { name: '블러 강도', value: String(intensity), inline: true }
    )
    .setImage(result.processed);

  await interaction.editReply({ embeds: [embed] });

  logger.info('Blur processing completed', { processedUrl: result.processed });
}
