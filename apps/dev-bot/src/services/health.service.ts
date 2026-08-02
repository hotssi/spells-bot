export class HealthService {
  static async checkAll(): Promise<any> {
    return { status: 'ok' };
  }
}
