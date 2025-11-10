import { ChatInputCommandInteraction } from 'discord.js';
import { createSuccessEmbed } from '../../../utils/embed-builder';
import { CommandError } from '../../../utils/error-handler';
import { logger } from '../../../utils/logger';

const TEXT_STYLES = {
  bold: (text: string) => `**${text}**`,
  italic: (text: string) => `*${text}*`,
  underline: (text: string) => `__${text}__`,
  strikethrough: (text: string) => `~~${text}~~`,
  code: (text: string) => `\`${text}\``,
  'code-block': (text: string) => `\`\`\`\n${text}\n\`\`\``,
  quote: (text: string) => `> ${text}`,
  spoiler: (text: string) => `||${text}||`,
} as const;

export async function handleStyledText(interaction: ChatInputCommandInteraction): Promise<void> {
  const text = interaction.options.getString('text', true);
  const style = interaction.options.getString('style', true) as keyof typeof TEXT_STYLES;

  logger.info('Styled text requested', { text, style });

  const styleFunction = TEXT_STYLES[style];
  if (!styleFunction) {
    throw new CommandError('지원하지 않는 스타일입니다.', true);
  }

  const styledText = styleFunction(text);

  const embed = createSuccessEmbed('텍스트 스타일이 적용되었습니다!')
    .addFields(
      { name: '원본', value: text, inline: false },
      { name: '스타일', value: style, inline: true },
      { name: '결과', value: styledText, inline: false }
    )
    .setFooter({ text: '아래 메시지를 복사하여 사용하세요' });

  await interaction.editReply({
    content: styledText,
    embeds: [embed],
  });

  logger.info('Styled text completed', { style });
}
