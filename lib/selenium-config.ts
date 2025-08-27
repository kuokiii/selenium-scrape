import { Builder, type WebDriver, By } from "selenium-webdriver"
import { Options as ChromeOptions } from "selenium-webdriver/chrome"
import UserAgent from "user-agents"
import { ContentExtractor, type ExtractedContent } from "./content-extractor" // Assuming ContentExtractor is defined in another file

export interface ScrapingConfig {
  extractText: boolean
  extractImages: boolean
  extractLinks: boolean
  bypassAntiBot: boolean
  useProxy?: boolean
  waitTime: number
  scrollToBottom: boolean
  proxyUrl?: string
  humanBehavior?: boolean
  stealthMode?: boolean
}

export class AntiDetectionUtils {
  static getRandomDelay(min = 1000, max = 3000): number {
    return Math.floor(Math.random() * (max - min + 1)) + min
  }

  static getRandomUserAgent(): string {
    const userAgent = new UserAgent({ deviceCategory: "desktop" })
    return userAgent.toString()
  }

  static getRandomViewport(): { width: number; height: number } {
    const viewports = [
      { width: 1920, height: 1080 },
      { width: 1366, height: 768 },
      { width: 1440, height: 900 },
      { width: 1536, height: 864 },
      { width: 1280, height: 720 },
      { width: 1600, height: 900 },
      { width: 1024, height: 768 },
    ]
    return viewports[Math.floor(Math.random() * viewports.length)]
  }

  static getStealthHeaders(): Record<string, string> {
    return {
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.9",
      "Accept-Encoding": "gzip, deflate, br",
      DNT: "1",
      Connection: "keep-alive",
      "Upgrade-Insecure-Requests": "1",
      "Sec-Fetch-Dest": "document",
      "Sec-Fetch-Mode": "navigate",
      "Sec-Fetch-Site": "none",
      "Sec-Fetch-User": "?1",
      "Cache-Control": "max-age=0",
    }
  }
}

export class SeleniumScraper {
  private driver: WebDriver | null = null
  private config: ScrapingConfig

  constructor(config: ScrapingConfig) {
    this.config = config
  }

  async initDriver(): Promise<void> {
    const options = new ChromeOptions()
    const viewport = AntiDetectionUtils.getRandomViewport()

    if (this.config.bypassAntiBot) {
      options.addArguments("--no-sandbox")
      options.addArguments("--disable-dev-shm-usage")
      options.addArguments("--disable-blink-features=AutomationControlled")
      options.addArguments("--disable-extensions")
      options.addArguments("--disable-plugins")
      options.addArguments("--disable-gpu")
      options.addArguments("--no-first-run")
      options.addArguments("--no-default-browser-check")
      options.addArguments("--disable-default-apps")
      options.addArguments("--disable-popup-blocking")
      options.addArguments("--disable-translate")
      options.addArguments("--disable-background-timer-throttling")
      options.addArguments("--disable-renderer-backgrounding")
      options.addArguments("--disable-backgrounding-occluded-windows")
      options.addArguments("--disable-client-side-phishing-detection")
      options.addArguments("--disable-sync")
      options.addArguments("--disable-features=TranslateUI,BlinkGenPropertyTrees")
      options.addArguments("--disable-ipc-flooding-protection")
      options.addArguments("--disable-hang-monitor")
      options.addArguments("--disable-prompt-on-repost")
      options.addArguments("--disable-domain-reliability")
      options.addArguments("--disable-component-extensions-with-background-pages")
      options.addArguments("--disable-background-networking")
      options.addArguments("--disable-breakpad")
      options.addArguments("--disable-component-update")
      options.addArguments("--disable-features=VizDisplayCompositor")
      options.addArguments("--disable-features=AudioServiceOutOfProcess")
      options.addArguments("--disable-features=VizServiceDisplayCompositor")
      options.addArguments("--disable-logging")
      options.addArguments("--disable-login-animations")
      options.addArguments("--disable-notifications")
      options.addArguments("--disable-permissions-api")
      options.addArguments("--disable-web-security")
      options.addArguments("--allow-running-insecure-content")
      options.addArguments("--ignore-certificate-errors")
      options.addArguments("--ignore-ssl-errors")
      options.addArguments("--ignore-certificate-errors-spki-list")

      // Random user agent
      const userAgent = AntiDetectionUtils.getRandomUserAgent()
      options.addArguments(`--user-agent=${userAgent}`)

      // Random window size
      options.addArguments(`--window-size=${viewport.width},${viewport.height}`)

      // Additional stealth options
      options.setExperimentalOption("excludeSwitches", ["enable-automation", "enable-logging"])
      options.setExperimentalOption("useAutomationExtension", false)

      options.setUserPreferences({
        "profile.default_content_setting_values.notifications": 2,
        "profile.default_content_settings.popups": 0,
        "profile.managed_default_content_settings.images": 1,
        "profile.content_settings.exceptions.automatic_downloads.*.setting": 1,
        "profile.default_content_setting_values.geolocation": 2,
        "profile.default_content_setting_values.media_stream_mic": 2,
        "profile.default_content_setting_values.media_stream_camera": 2,
        credentials_enable_service: false,
        "profile.password_manager_enabled": false,
        "profile.default_content_setting_values.plugins": 1,
        "profile.content_settings.plugin_whitelist.adobe-flash-player": 1,
        "profile.content_settings.exceptions.plugins.*,*.per_resource.adobe-flash-player": 1,
        "profile.managed_plugins_allowed_for_urls": ["https://*", "http://*"],
        "profile.managed_plugins_blocked_for_urls": [],
      })
    }

    // Proxy configuration
    if (this.config.useProxy && this.config.proxyUrl) {
      options.addArguments(`--proxy-server=${this.config.proxyUrl}`)
    }

    // Headless mode for production
    if (process.env.NODE_ENV === "production") {
      options.addArguments("--headless=new")
    }

    this.driver = await new Builder().forBrowser("chrome").setChromeOptions(options).build()

    if (this.config.bypassAntiBot && this.driver) {
      await this.driver.executeScript(`
        // Remove webdriver property
        Object.defineProperty(navigator, 'webdriver', {
          get: () => undefined,
        });
        
        // Override the plugins property
        Object.defineProperty(navigator, 'plugins', {
          get: () => [
            {
              0: {type: "application/x-google-chrome-pdf", suffixes: "pdf", description: "Portable Document Format", enabledPlugin: Plugin},
              description: "Portable Document Format",
              filename: "internal-pdf-viewer",
              length: 1,
              name: "Chrome PDF Plugin"
            },
            {
              0: {type: "application/pdf", suffixes: "pdf", description: "", enabledPlugin: Plugin},
              description: "",
              filename: "mhjfbmdgcfjbbpaeojofohoefgiehjai",
              length: 1,
              name: "Chrome PDF Viewer"
            }
          ],
        });
        
        // Override the languages property
        Object.defineProperty(navigator, 'languages', {
          get: () => ['en-US', 'en'],
        });
        
        // Override the chrome property
        window.chrome = {
          runtime: {},
          loadTimes: function() {},
          csi: function() {},
          app: {}
        };
        
        // Override the permissions property
        const originalQuery = window.navigator.permissions.query;
        window.navigator.permissions.query = (parameters) => (
          parameters.name === 'notifications' ?
            Promise.resolve({ state: Notification.permission }) :
            originalQuery(parameters)
        );
        
        // Override screen properties
        Object.defineProperty(screen, 'availHeight', {
          get: () => ${viewport.height}
        });
        Object.defineProperty(screen, 'availWidth', {
          get: () => ${viewport.width}
        });
        Object.defineProperty(screen, 'height', {
          get: () => ${viewport.height}
        });
        Object.defineProperty(screen, 'width', {
          get: () => ${viewport.width}
        });
        
        // Override Date.getTimezoneOffset
        Date.prototype.getTimezoneOffset = function() {
          return -new Date().getTimezoneOffset();
        };
        
        // Mock battery API
        Object.defineProperty(navigator, 'getBattery', {
          get: () => () => Promise.resolve({
            charging: true,
            chargingTime: 0,
            dischargingTime: Infinity,
            level: 1
          })
        });
        
        // Mock connection API
        Object.defineProperty(navigator, 'connection', {
          get: () => ({
            downlink: 10,
            effectiveType: '4g',
            rtt: 50,
            saveData: false
          })
        });
        
        // Override toString methods
        window.chrome.runtime.onConnect.addListener.toString = () => 'function onConnect() { [native code] }';
        window.chrome.runtime.onMessage.addListener.toString = () => 'function onMessage() { [native code] }';
        
        // Mock hardware concurrency
        Object.defineProperty(navigator, 'hardwareConcurrency', {
          get: () => 4
        });
        
        // Mock device memory
        Object.defineProperty(navigator, 'deviceMemory', {
          get: () => 8
        });
      `)

      if (this.config.humanBehavior) {
        await this.simulateHumanBehavior()
      }
    }
  }

  private async simulateHumanBehavior(): Promise<void> {
    if (!this.driver) return

    try {
      // Random mouse movements
      await this.driver.executeScript(`
        function randomMouseMove() {
          const event = new MouseEvent('mousemove', {
            clientX: Math.random() * window.innerWidth,
            clientY: Math.random() * window.innerHeight,
            bubbles: true
          });
          document.dispatchEvent(event);
        }
        
        // Simulate random mouse movements
        for(let i = 0; i < 3; i++) {
          setTimeout(randomMouseMove, Math.random() * 1000);
        }
      `)

      // Random scroll behavior
      await this.driver.executeScript(`
        function humanScroll() {
          const scrollAmount = Math.random() * 200 + 50;
          window.scrollBy(0, scrollAmount);
          setTimeout(() => {
            window.scrollBy(0, -scrollAmount/2);
          }, Math.random() * 500 + 200);
        }
        humanScroll();
      `)

      await this.driver.sleep(AntiDetectionUtils.getRandomDelay(500, 1500))
    } catch (error) {
      console.error("Human behavior simulation error:", error)
    }
  }

  private async detectCaptcha(): Promise<boolean> {
    if (!this.driver) return false

    try {
      const captchaSelectors = [
        '[class*="captcha"]',
        '[id*="captcha"]',
        '[class*="recaptcha"]',
        '[id*="recaptcha"]',
        'iframe[src*="recaptcha"]',
        ".g-recaptcha",
        "#cf-challenge-stage",
        ".cf-browser-verification",
        '[class*="cloudflare"]',
      ]

      for (const selector of captchaSelectors) {
        try {
          const elements = await this.driver.findElements(By.css(selector))
          if (elements.length > 0) {
            console.log(`CAPTCHA detected with selector: ${selector}`)
            return true
          }
        } catch (error) {
          // Continue checking other selectors
        }
      }

      return false
    } catch (error) {
      console.error("CAPTCHA detection error:", error)
      return false
    }
  }

  async scrapeUrl(url: string): Promise<ExtractedContent> {
    if (!this.driver) {
      await this.initDriver()
    }

    if (!this.driver) {
      throw new Error("Failed to initialize WebDriver")
    }

    try {
      // Navigate to URL with random delay
      await this.driver.get(url)
      await this.driver.sleep(AntiDetectionUtils.getRandomDelay(2000, 4000))

      // Check for CAPTCHA
      const hasCaptcha = await this.detectCaptcha()
      if (hasCaptcha) {
        console.warn("CAPTCHA detected - manual intervention may be required")
        await this.driver.sleep(5000) // Give time for manual solving
      }

      // Human-like behavior
      if (this.config.humanBehavior) {
        await this.simulateHumanBehavior()
      }

      // Wait for page load with random delay
      await this.driver.sleep(AntiDetectionUtils.getRandomDelay(this.config.waitTime, this.config.waitTime + 2000))

      // Scroll to bottom if enabled
      if (this.config.scrollToBottom) {
        await this.scrollToBottom()
      }

      const extractor = new ContentExtractor(this.driver, url)
      const extractedContent = await extractor.extractAll()

      if (this.config.extractImages && extractedContent.images.length > 0) {
        const downloadedImages = await extractor.downloadImages(extractedContent.images)
        extractedContent.images = downloadedImages
        extractedContent.downloadedImages = downloadedImages
          .filter((img) => img.downloaded)
          .map((img) => img.localPath!)
      }

      return {
        ...extractedContent,
        captchaDetected: hasCaptcha,
        timestamp: new Date().toISOString(),
      }
    } catch (error) {
      console.error("Scraping error:", error)
      throw error
    }
  }

  private async scrollToBottom(): Promise<void> {
    if (!this.driver) return

    await this.driver.executeScript(`
      return new Promise((resolve) => {
        let totalHeight = 0;
        const distance = Math.random() * 150 + 50; // Random scroll distance
        const timer = setInterval(() => {
          const scrollHeight = document.body.scrollHeight;
          window.scrollBy(0, distance);
          totalHeight += distance;

          // Random pause during scrolling
          if (Math.random() < 0.1) {
            setTimeout(() => {}, Math.random() * 1000 + 500);
          }

          if(totalHeight >= scrollHeight){
            clearInterval(timer);
            // Random final scroll adjustments
            setTimeout(() => {
              window.scrollBy(0, -Math.random() * 100);
              resolve();
            }, Math.random() * 1000 + 500);
          }
        }, Math.random() * 200 + 100); // Random scroll timing
      });
    `)
  }

  private async extractText(): Promise<string> {
    if (!this.driver) return ""

    try {
      const bodyElement = await this.driver.findElement(By.tagName("body"))
      return await bodyElement.getText()
    } catch (error) {
      console.error("Text extraction error:", error)
      return ""
    }
  }

  private async extractImages(): Promise<any[]> {
    if (!this.driver) return []

    try {
      const images = await this.driver.findElements(By.tagName("img"))
      const imageData = []

      for (const img of images) {
        try {
          const src = await img.getAttribute("src")
          const alt = await img.getAttribute("alt")
          const width = await img.getAttribute("width")
          const height = await img.getAttribute("height")

          if (src) {
            imageData.push({
              src,
              alt: alt || "",
              width: width || null,
              height: height || null,
            })
          }
        } catch (error) {
          console.error("Image extraction error:", error)
        }
      }

      return imageData
    } catch (error) {
      console.error("Images extraction error:", error)
      return []
    }
  }

  private async extractLinks(): Promise<any[]> {
    if (!this.driver) return []

    try {
      const links = await this.driver.findElements(By.tagName("a"))
      const linkData = []

      for (const link of links) {
        try {
          const href = await link.getAttribute("href")
          const text = await link.getText()
          const title = await link.getAttribute("title")

          if (href) {
            linkData.push({
              href,
              text: text || "",
              title: title || "",
              type: href.startsWith("mailto:") ? "email" : href.startsWith("tel:") ? "phone" : "link",
            })
          }
        } catch (error) {
          console.error("Link extraction error:", error)
        }
      }

      return linkData
    } catch (error) {
      console.error("Links extraction error:", error)
      return []
    }
  }

  async close(): Promise<void> {
    if (this.driver) {
      await this.driver.quit()
      this.driver = null
    }
  }
}
