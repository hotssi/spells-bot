import { ChatInputCommandInteraction } from 'discord.js';
import { logger } from './logger';

export class CommandError extends Error {
  constructor(
    message: string,
    public readonly isUserError: boolean = false
  ) {
    super(message);
    this.name = 'CommandError';
  }
}

export async function handleCommandError(
  interaction: ChatInputCommandInteraction,
  error: unknown
): Promise<void> {
  logger.error('Command execution failed', error);

  const errorMessage =
    error instanceof CommandError && error.isUserError
      ? error.message
      : '명령어 실행 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';

  try {
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({
        content: `❌ ${errorMessage}`,
        ephemeral: true,
      });
    } else {
      await interaction.reply({
        content: `❌ ${errorMessage}`,
        ephemeral: true,
      });
    }
  } catch (replyError) {
    logger.error('Failed to send error message to user', replyError);
  }
}

export function assertEnvVariable(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Environment variable ${name} is not set`);
  }
  return value;
}
