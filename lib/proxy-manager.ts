export interface ProxyConfig {
  host: string
  port: number
  username?: string
  password?: string
  type: "http" | "https" | "socks4" | "socks5"
}

export class ProxyManager {
  private proxies: ProxyConfig[] = []
  private currentIndex = 0

  constructor(proxies: ProxyConfig[] = []) {
    this.proxies = proxies
  }

  addProxy(proxy: ProxyConfig): void {
    this.proxies.push(proxy)
  }

  getRandomProxy(): ProxyConfig | null {
    if (this.proxies.length === 0) return null

    const randomIndex = Math.floor(Math.random() * this.proxies.length)
    return this.proxies[randomIndex]
  }

  getNextProxy(): ProxyConfig | null {
    if (this.proxies.length === 0) return null

    const proxy = this.proxies[this.currentIndex]
    this.currentIndex = (this.currentIndex + 1) % this.proxies.length
    return proxy
  }

  formatProxyUrl(proxy: ProxyConfig): string {
    const auth = proxy.username && proxy.password ? `${proxy.username}:${proxy.password}@` : ""
    return `${proxy.type}://${auth}${proxy.host}:${proxy.port}`
  }

  // Test proxy connectivity
  async testProxy(proxy: ProxyConfig): Promise<boolean> {
    try {
      const proxyUrl = this.formatProxyUrl(proxy)
      // This would need actual implementation with a test request
      console.log(`Testing proxy: ${proxyUrl}`)
      return true
    } catch (error) {
      console.error(`Proxy test failed for ${proxy.host}:${proxy.port}`, error)
      return false
    }
  }

  // Get working proxies
  async getWorkingProxies(): Promise<ProxyConfig[]> {
    const workingProxies: ProxyConfig[] = []

    for (const proxy of this.proxies) {
      if (await this.testProxy(proxy)) {
        workingProxies.push(proxy)
      }
    }

    return workingProxies
  }
}
