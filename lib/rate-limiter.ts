export class RateLimiter {
  private requests: Map<string, number[]> = new Map()
  private readonly maxRequests: number
  private readonly timeWindow: number // in milliseconds

  constructor(maxRequests = 10, timeWindowMinutes = 1) {
    this.maxRequests = maxRequests
    this.timeWindow = timeWindowMinutes * 60 * 1000
  }

  async checkRateLimit(identifier: string): Promise<boolean> {
    const now = Date.now()
    const requests = this.requests.get(identifier) || []

    // Remove old requests outside the time window
    const validRequests = requests.filter((timestamp) => now - timestamp < this.timeWindow)

    if (validRequests.length >= this.maxRequests) {
      return false // Rate limit exceeded
    }

    // Add current request
    validRequests.push(now)
    this.requests.set(identifier, validRequests)

    return true
  }

  async waitForRateLimit(identifier: string): Promise<void> {
    while (!(await this.checkRateLimit(identifier))) {
      const requests = this.requests.get(identifier) || []
      if (requests.length > 0) {
        const oldestRequest = Math.min(...requests)
        const waitTime = this.timeWindow - (Date.now() - oldestRequest) + 1000 // Add 1 second buffer

        if (waitTime > 0) {
          console.log(`Rate limit reached for ${identifier}. Waiting ${waitTime}ms...`)
          await new Promise((resolve) => setTimeout(resolve, waitTime))
        }
      }
    }
  }

  getRandomDelay(min = 1000, max = 5000): number {
    return Math.floor(Math.random() * (max - min + 1)) + min
  }

  async randomDelay(min?: number, max?: number): Promise<void> {
    const delay = this.getRandomDelay(min, max)
    await new Promise((resolve) => setTimeout(resolve, delay))
  }
}
