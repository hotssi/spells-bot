import axios from 'axios';
import { logger } from '../utils/logger';
import { assertEnvVariable } from '../utils/error-handler';
import type {
  SnippetSearchRequest,
  SnippetSearchResult,
  ComponentSearchRequest,
  ComponentSearchResult,
  BackgroundSearchRequest,
  BackgroundSearchResult,
} from '../types/services';

interface N8nResponse<T> {
  success?: boolean;
  data?: T;
  error?: string;
}

class N8nService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = assertEnvVariable('N8N_WEBHOOK_BASE_URL');
  }

  private async callWebhook<T>(webhookPath: string, data: unknown): Promise<T> {
    const url = `${this.baseUrl}/${webhookPath}`;
    
    logger.debug('Calling n8n webhook', { url, data });

    try {
      const response = await axios<N8nResponse<T> | T>({
        method: 'post',
        url,
        data,
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json',
        },
        validateStatus: () => true, // 모든 상태 코드를 정상으로 처리
      });

      logger.debug('n8n webhook response', {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
        data: response.data,
      });

      if (response.status !== 200) {
        throw new Error(`n8n 워크플로우 오류 (HTTP ${response.status}): ${response.statusText}`);
      }

      const responseData = response.data;

      if (!responseData) {
        throw new Error('n8n 워크플로우에서 응답이 없습니다.');
      }

      // 성공 응답이 배열로 오는 경우 처리
      if (Array.isArray(responseData)) {
        return responseData as unknown as T;
      }

      // 객체인 경우
      if (typeof responseData === 'object' && responseData !== null) {
        const responseObj = responseData as Record<string, any>;
        
        // 1. results 속성이 있는 경우
        if ('results' in responseObj) {
          // results가 배열인 경우
          if (Array.isArray(responseObj.results)) {
            return responseObj.results as T;
          }
          // results가 객체인 경우 (현재 발생한 케이스)
          else if (responseObj.results && typeof responseObj.results === 'object') {
            // results 객체를 배열로 감싸서 반환
            return [responseObj.results] as unknown as T;
          }
          // 그 외의 경우 빈 배열 반환
          logger.warn('Unexpected results format:', { type: typeof responseObj.results, results: responseObj.results });
          return [] as unknown as T;
        }
        
        // 2. N8nResponse 타입인 경우
        if ('data' in responseObj) {
          if (responseObj.data === undefined) {
            throw new Error('n8n 응답에 data 필드가 없습니다.');
          }
          // data가 배열이면 그대로 반환, 아니면 배열로 감싸서 반환
          return Array.isArray(responseObj.data) 
            ? responseObj.data as T 
            : [responseObj.data] as unknown as T;
        }
        
        // 3. 직접 반환 가능한 객체인 경우
        return [responseObj] as unknown as T;
      }

      // 그 외의 경우 전체 응답 반환
      logger.warn('Unexpected response format from n8n webhook:', { responseData });
      return responseData as T;
    } catch (error) {
      logger.error('n8n webhook call failed', error);
      throw error;
    }
  }

  async searchSnippets(request: SnippetSearchRequest): Promise<SnippetSearchResult[]> {
    const webhookPath = assertEnvVariable('N8N_SNIPPET_WEBHOOK');
    return this.callWebhook<SnippetSearchResult[]>(webhookPath, request);
  }

  async searchComponents(request: ComponentSearchRequest): Promise<ComponentSearchResult[]> {
    const webhookPath = assertEnvVariable('N8N_COMPONENT_WEBHOOK');
    return this.callWebhook<ComponentSearchResult[]>(webhookPath, request);
  }

  async searchBackground(request: BackgroundSearchRequest): Promise<BackgroundSearchResult[]> {
    const webhookPath = assertEnvVariable('N8N_BACKGROUND_WEBHOOK');
    return this.callWebhook<BackgroundSearchResult[]>(webhookPath, request);
  }
}

export const n8nService = new N8nService();
