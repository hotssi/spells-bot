import { EmbedBuilder } from 'discord.js';
import type {
  SnippetSearchResult,
  ComponentSearchResult,
  BackgroundSearchResult,
} from '../types/services';

export const Colors = {
  PRIMARY: 0x5865f2,
  SUCCESS: 0x57f287,
  WARNING: 0xfee75c,
  ERROR: 0xed4245,
  INFO: 0x3498db,
} as const;

export function createSnippetEmbed(snippet: SnippetSearchResult): EmbedBuilder {
  const embed = new EmbedBuilder()
    .setColor(Colors.PRIMARY)
    .setTitle(`📝 ${snippet.title}`)
    .setDescription(snippet.description || 'No description available')
    .addFields({
      name: 'Code',
      value: `\`\`\`${snippet.language}\n${snippet.code.substring(0, 1000)}\n\`\`\``,
    });

  if (snippet.tags && snippet.tags.length > 0) {
    embed.addFields({
      name: 'Tags',
      value: snippet.tags.map((tag) => `\`${tag}\``).join(' '),
      inline: true,
    });
  }

  if (snippet.category) {
    embed.addFields({
      name: 'Category',
      value: snippet.category,
      inline: true,
    });
  }

  return embed;
}

export function createComponentEmbed(component: ComponentSearchResult): EmbedBuilder {
  const embed = new EmbedBuilder()
    .setColor(Colors.SUCCESS)
    .setTitle(`🧩 ${component.name}`)
    .setDescription(component.description || 'No description available')
    .addFields(
      {
        name: 'Framework',
        value: component.framework,
        inline: true,
      },
      {
        name: 'Category',
        value: component.category,
        inline: true,
      },
      {
        name: 'StackBlitz',
        value: `[Open in StackBlitz](${component.stackblitzUrl})`,
      }
    );

  return embed;
}

export function createBackgroundEmbed(background: BackgroundSearchResult): EmbedBuilder {
  const embed = new EmbedBuilder()
    .setColor(Colors.INFO)
    .setTitle(`📚 ${background.title}`)
    .setDescription(background.content.substring(0, 2000))
    .addFields({
      name: 'Category',
      value: background.category,
      inline: true,
    });

  if (background.tags && background.tags.length > 0) {
    embed.addFields({
      name: 'Tags',
      value: background.tags.map((tag) => `\`${tag}\``).join(' '),
      inline: true,
    });
  }

  if (background.url) {
    embed.setURL(background.url);
  }

  return embed;
}

export function createErrorEmbed(message: string): EmbedBuilder {
  return new EmbedBuilder()
    .setColor(Colors.ERROR)
    .setTitle('❌ Error')
    .setDescription(message)
    .setTimestamp();
}

export function createSuccessEmbed(message: string): EmbedBuilder {
  return new EmbedBuilder()
    .setColor(Colors.SUCCESS)
    .setTitle('✅ Success')
    .setDescription(message)
    .setTimestamp();
}

export function createInfoEmbed(title: string, message: string): EmbedBuilder {
  return new EmbedBuilder()
    .setColor(Colors.INFO)
    .setTitle(title)
    .setDescription(message)
    .setTimestamp();
}
