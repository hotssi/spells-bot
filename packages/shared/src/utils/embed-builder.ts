import { SonagiEmbed } from '@sonagi/discord-ui';

export const Colors = {
  PRIMARY: 0x5865f2,
  SUCCESS: 0x57f287,
  WARNING: 0xfee75c,
  ERROR: 0xed4245,
  INFO: 0x3498db,
} as const;

export function createErrorEmbed(message: string): SonagiEmbed {
  return new SonagiEmbed()
    .setType('error')
    .setTitle('❌ Error')
    .setDescription(message)
    .setTimestamp();
}

export function createSuccessEmbed(message: string): SonagiEmbed {
  return new SonagiEmbed()
    .setType('success')
    .setTitle('✅ Success')
    .setDescription(message)
    .setTimestamp();
}

export function createInfoEmbed(title: string, message: string): SonagiEmbed {
  return new SonagiEmbed().setType('info').setTitle(title).setDescription(message).setTimestamp();
}
