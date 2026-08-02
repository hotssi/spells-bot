import { Client, Events, Message } from 'discord.js';
import { logger } from '../utils/logger';
import { EagleService } from '../services/eagle.service';

const WEB_CLIP_CHANNEL_ID = process.env.WEB_CLIP_CHANNEL_ID || '1519250071764336650';
const DESIGN_CLIP_CHANNEL_ID = process.env.DESIGN_CLIP_CHANNEL_ID || '1528620974948225095';

export function registerMessageCreateEvent(client: Client): void {
  client.on(Events.MessageCreate, (message: Message) => {
    void (async () => {
      // Ignore messages from this bot itself
      if (message.author.id === client.user?.id) return;

      // ----------------------------------------------------
      // Web Clip 로직
      // ----------------------------------------------------
      if (message.channelId === WEB_CLIP_CHANNEL_ID) {
        try {
          await message.react('✅');
          await message.react('❌');
          logger.info(`Added reactions to web-clip message: ${message.id}`);
        } catch (error) {
          logger.error(`Failed to add reactions to message ${message.id}`, error);
        }
      }

      // ----------------------------------------------------
      // Design Clip 로직 (Eagle 자동 수집기)
      // ----------------------------------------------------
      if (message.channelId === DESIGN_CLIP_CHANNEL_ID) {
        try {
          const imageUrls: string[] = [];

          // 1. 첨부파일에서 이미지 추출
          message.attachments.forEach((attachment) => {
            if (attachment.contentType?.startsWith('image/')) {
              imageUrls.push(attachment.url);
            }
          });

          // 2. 만약 첨부파일이 없다면 URL 임베드를 기대하고 3초 대기
          let msgToProcess = message;
          if (imageUrls.length === 0) {
            // Discord가 URL을 언펄링(Unfurling)해서 Embed를 붙일 시간을 줌
            await new Promise((resolve) => setTimeout(resolve, 3000));
            try {
              msgToProcess = await message.fetch();
            } catch (err) {
              logger.error(`Failed to fetch message ${message.id} after delay`, err);
            }
          }

          // 3. 임베드(Embed)에서 이미지(OG Image 등) 추출
          msgToProcess.embeds.forEach((embed) => {
            if (embed.image?.url) {
              imageUrls.push(embed.image.url);
            } else if (embed.thumbnail?.url) {
              imageUrls.push(embed.thumbnail.url);
            }
          });

          // 4. 수집된 URL이 없으면 종료
          if (imageUrls.length === 0) {
            return;
          }

          // 5. Eagle Service에 저장 요청 (첫 번째 이미지만 혹은 전부)
          let allSuccess = true;
          for (const url of imageUrls) {
            const success = await EagleService.saveImageToEagle(url, message.content);
            if (!success) allSuccess = false;
          }

          // 6. 결과 리액션
          if (allSuccess) {
            await message.react('✅');
          } else {
            await message.react('❌');
          }
        } catch (error) {
          logger.error(`Error processing design clip for message ${message.id}`, error);
          await message.react('❌');
        }
      }
    })();
  });
}
