export class RateLimiter {
  private requestCount: number = 0;
  private windowStart: number = Date.now();

  async checkLimit(): Promise<void> {
    const now = Date.now();
    const windowElapsed = now - this.windowStart;

    // If 60 seconds have passed, reset the window
    if (windowElapsed >= 60000) {
      this.requestCount = 0;
      this.windowStart = now;
      return;
    }

    // If we've hit the limit, wait until the window resets
    if (this.requestCount >= 10) {
      const waitTime = 60000 - windowElapsed;
      console.log(`Rate limit reached. Waiting ${waitTime}ms before continuing...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
      this.requestCount = 0;
      this.windowStart = Date.now();
    }
  }

  incrementCount(): void {
    this.requestCount++;
    console.log(`Request count: ${this.requestCount}`);
  }
}