/* eslint-disable no-console */

export default class DebugLogger {
  private enabled = false;

  constructor(
    private prefix: string,
  ) {
  }

  enable(): void {
    this.enabled = true;
  }

  disable(): void {
    this.enabled = false;
  }

  get isEnabled(): boolean {
    return this.enabled;
  }

  prefixMessage(msg: string): string {
    return `${DebugLogger.getTimeString(new Date())} [${this.prefix}]: ${msg}`;
  }

  info(msg: string, ...params: any[]): void {
    if (this.enabled) {
      console.info(this.prefixMessage(msg), ...params);
    }
  }

  warn(msg: string, ...params: any[]): void {
    if (this.enabled) {
      console.warn(this.prefixMessage(msg), ...params);
    }
  }

  error(msg: string, ...params: any[]): void {
    console.error(this.prefixMessage(msg), ...params);
  }

  static getTimeString(time: Date): string {
    const hours = time.getHours().toString().padStart(2, '0');
    const minutes = time.getMinutes().toString().padStart(2, '0');
    const seconds = time.getSeconds().toString().padStart(2, '0');
    const milliseconds = time.getMilliseconds().toString().padStart(3, '0');

    return `${hours}:${minutes}:${seconds}.${milliseconds}`;
  }
}
