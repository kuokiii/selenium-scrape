import { type WebDriver, By } from "selenium-webdriver"
import * as fs from "fs/promises"
import * as path from "path"
import fetch from "node-fetch"

export interface ExtractedContent {
  url: string
  title: string
  description?: string
  keywords?: string[]
  author?: string
  publishDate?: string
  language?: string
  textContent: string
  cleanedText: string
  headings: Heading[]
  paragraphs: string[]
  lists: List[]
  tables: Table[]
  forms: Form[]
  images: ImageData[]
  links: LinkData[]
  metadata: Metadata
  structuredData: any[]
  socialMedia: SocialMediaData
  contactInfo: ContactInfo
  downloadedImages?: string[]
}

export interface Heading {
  level: number
  text: string
  id?: string
}

export interface List {
  type: "ordered" | "unordered"
  items: string[]
}

export interface Table {
  headers: string[]
  rows: string[][]
  caption?: string
}

export interface Form {
  action?: string
  method?: string
  fields: FormField[]
}

export interface FormField {
  name?: string
  type: string
  label?: string
  placeholder?: string
  required: boolean
  options?: string[]
}

export interface ImageData {
  src: string
  alt: string
  title?: string
  width?: string
  height?: string
  format?: string
  size?: number
  downloaded?: boolean
  localPath?: string
}

export interface LinkData {
  href: string
  text: string
  title?: string
  type: "internal" | "external" | "email" | "phone" | "file"
  domain?: string
}

export interface Metadata {
  charset?: string
  viewport?: string
  robots?: string
  canonical?: string
  openGraph: Record<string, string>
  twitterCard: Record<string, string>
  jsonLd: any[]
}

export interface SocialMediaData {
  facebook?: string
  twitter?: string
  instagram?: string
  linkedin?: string
  youtube?: string
  tiktok?: string
}

export interface ContactInfo {
  emails: string[]
  phones: string[]
  addresses: string[]
}

export class ContentExtractor {
  private driver: WebDriver
  private baseUrl: string

  constructor(driver: WebDriver, baseUrl: string) {
    this.driver = driver
    this.baseUrl = baseUrl
  }

  async extractAll(): Promise<ExtractedContent> {
    const url = await this.driver.getCurrentUrl()
    const title = await this.driver.getTitle()

    // Extract basic metadata
    const metadata = await this.extractMetadata()
    const description = metadata.openGraph["og:description"] || (await this.getMetaContent("description")) || ""

    const keywords = await this.extractKeywords()
    const author = metadata.openGraph["og:author"] || (await this.getMetaContent("author")) || ""

    const publishDate =
      metadata.openGraph["og:published_time"] || (await this.getMetaContent("article:published_time")) || ""

    const language = ((await this.driver.executeScript("return document.documentElement.lang")) as string) || "en"

    // Extract content
    const textContent = await this.extractTextContent()
    const cleanedText = this.cleanText(textContent)
    const headings = await this.extractHeadings()
    const paragraphs = await this.extractParagraphs()
    const lists = await this.extractLists()
    const tables = await this.extractTables()
    const forms = await this.extractForms()
    const images = await this.extractImages()
    const links = await this.extractLinks()
    const structuredData = await this.extractStructuredData()
    const socialMedia = await this.extractSocialMedia()
    const contactInfo = await this.extractContactInfo()

    return {
      url,
      title,
      description,
      keywords,
      author,
      publishDate,
      language,
      textContent,
      cleanedText,
      headings,
      paragraphs,
      lists,
      tables,
      forms,
      images,
      links,
      metadata,
      structuredData,
      socialMedia,
      contactInfo,
    }
  }

  private async extractMetadata(): Promise<Metadata> {
    const metadata: Metadata = {
      openGraph: {},
      twitterCard: {},
      jsonLd: [],
    }

    try {
      // Basic meta tags
      metadata.charset = await this.getMetaContent("charset")
      metadata.viewport = await this.getMetaContent("viewport")
      metadata.robots = await this.getMetaContent("robots")
      metadata.canonical = await this.getLinkHref("canonical")

      // Open Graph
      const ogTags = await this.driver.findElements(By.css('meta[property^="og:"]'))
      for (const tag of ogTags) {
        const property = await tag.getAttribute("property")
        const content = await tag.getAttribute("content")
        if (property && content) {
          metadata.openGraph[property] = content
        }
      }

      // Twitter Card
      const twitterTags = await this.driver.findElements(By.css('meta[name^="twitter:"]'))
      for (const tag of twitterTags) {
        const name = await tag.getAttribute("name")
        const content = await tag.getAttribute("content")
        if (name && content) {
          metadata.twitterCard[name] = content
        }
      }

      // JSON-LD structured data
      const jsonLdScripts = await this.driver.findElements(By.css('script[type="application/ld+json"]'))
      for (const script of jsonLdScripts) {
        try {
          const content = await script.getAttribute("innerHTML")
          if (content) {
            metadata.jsonLd.push(JSON.parse(content))
          }
        } catch (error) {
          console.error("JSON-LD parsing error:", error)
        }
      }
    } catch (error) {
      console.error("Metadata extraction error:", error)
    }

    return metadata
  }

  private async getMetaContent(name: string): Promise<string | undefined> {
    try {
      const element = await this.driver.findElement(By.css(`meta[name="${name}"], meta[property="${name}"]`))
      return await element.getAttribute("content")
    } catch {
      return undefined
    }
  }

  private async getLinkHref(rel: string): Promise<string | undefined> {
    try {
      const element = await this.driver.findElement(By.css(`link[rel="${rel}"]`))
      return await element.getAttribute("href")
    } catch {
      return undefined
    }
  }

  private async extractKeywords(): Promise<string[]> {
    try {
      const keywordsContent = await this.getMetaContent("keywords")
      if (keywordsContent) {
        return keywordsContent
          .split(",")
          .map((k) => k.trim())
          .filter((k) => k.length > 0)
      }
    } catch (error) {
      console.error("Keywords extraction error:", error)
    }
    return []
  }

  private async extractTextContent(): Promise<string> {
    try {
      const body = await this.driver.findElement(By.tagName("body"))
      return await body.getText()
    } catch (error) {
      console.error("Text content extraction error:", error)
      return ""
    }
  }

  private cleanText(text: string): string {
    return text
      .replace(/\s+/g, " ") // Multiple spaces to single space
      .replace(/\n\s*\n/g, "\n") // Multiple newlines to single newline
      .trim()
  }

  private async extractHeadings(): Promise<Heading[]> {
    const headings: Heading[] = []

    try {
      for (let level = 1; level <= 6; level++) {
        const elements = await this.driver.findElements(By.tagName(`h${level}`))
        for (const element of elements) {
          const text = await element.getText()
          const id = await element.getAttribute("id")
          if (text.trim()) {
            headings.push({ level, text: text.trim(), id: id || undefined })
          }
        }
      }
    } catch (error) {
      console.error("Headings extraction error:", error)
    }

    return headings.sort((a, b) => {
      // Sort by document order (approximate)
      return a.level - b.level
    })
  }

  private async extractParagraphs(): Promise<string[]> {
    const paragraphs: string[] = []

    try {
      const elements = await this.driver.findElements(By.tagName("p"))
      for (const element of elements) {
        const text = await element.getText()
        if (text.trim() && text.length > 10) {
          // Filter out very short paragraphs
          paragraphs.push(text.trim())
        }
      }
    } catch (error) {
      console.error("Paragraphs extraction error:", error)
    }

    return paragraphs
  }

  private async extractLists(): Promise<List[]> {
    const lists: List[] = []

    try {
      // Ordered lists
      const olElements = await this.driver.findElements(By.tagName("ol"))
      for (const ol of olElements) {
        const items = await ol.findElements(By.tagName("li"))
        const listItems: string[] = []
        for (const item of items) {
          const text = await item.getText()
          if (text.trim()) {
            listItems.push(text.trim())
          }
        }
        if (listItems.length > 0) {
          lists.push({ type: "ordered", items: listItems })
        }
      }

      // Unordered lists
      const ulElements = await this.driver.findElements(By.tagName("ul"))
      for (const ul of ulElements) {
        const items = await ul.findElements(By.tagName("li"))
        const listItems: string[] = []
        for (const item of items) {
          const text = await item.getText()
          if (text.trim()) {
            listItems.push(text.trim())
          }
        }
        if (listItems.length > 0) {
          lists.push({ type: "unordered", items: listItems })
        }
      }
    } catch (error) {
      console.error("Lists extraction error:", error)
    }

    return lists
  }

  private async extractTables(): Promise<Table[]> {
    const tables: Table[] = []

    try {
      const tableElements = await this.driver.findElements(By.tagName("table"))
      for (const table of tableElements) {
        const headers: string[] = []
        const rows: string[][] = []
        let caption: string | undefined

        // Extract caption
        try {
          const captionElement = await table.findElement(By.tagName("caption"))
          caption = await captionElement.getText()
        } catch {
          // No caption
        }

        // Extract headers
        try {
          const headerElements = await table.findElements(By.css("thead th, tr:first-child th"))
          for (const header of headerElements) {
            const text = await header.getText()
            headers.push(text.trim())
          }
        } catch {
          // No headers
        }

        // Extract rows
        try {
          const rowElements = await table.findElements(By.css("tbody tr, tr"))
          for (const row of rowElements) {
            const cellElements = await row.findElements(By.css("td, th"))
            const rowData: string[] = []
            for (const cell of cellElements) {
              const text = await cell.getText()
              rowData.push(text.trim())
            }
            if (rowData.length > 0) {
              rows.push(rowData)
            }
          }
        } catch {
          // No rows
        }

        if (rows.length > 0) {
          tables.push({ headers, rows, caption })
        }
      }
    } catch (error) {
      console.error("Tables extraction error:", error)
    }

    return tables
  }

  private async extractForms(): Promise<Form[]> {
    const forms: Form[] = []

    try {
      const formElements = await this.driver.findElements(By.tagName("form"))
      for (const form of formElements) {
        const action = await form.getAttribute("action")
        const method = await form.getAttribute("method")
        const fields: FormField[] = []

        // Extract form fields
        const inputElements = await form.findElements(By.css("input, textarea, select"))
        for (const input of inputElements) {
          const type = (await input.getAttribute("type")) || "text"
          const name = await input.getAttribute("name")
          const placeholder = await input.getAttribute("placeholder")
          const required = (await input.getAttribute("required")) !== null

          let label: string | undefined
          try {
            const id = await input.getAttribute("id")
            if (id) {
              const labelElement = await this.driver.findElement(By.css(`label[for="${id}"]`))
              label = await labelElement.getText()
            }
          } catch {
            // No label
          }

          let options: string[] | undefined
          if (type === "select") {
            try {
              const optionElements = await input.findElements(By.tagName("option"))
              options = []
              for (const option of optionElements) {
                const text = await option.getText()
                if (text.trim()) {
                  options.push(text.trim())
                }
              }
            } catch {
              // No options
            }
          }

          fields.push({
            name: name || undefined,
            type,
            label: label || undefined,
            placeholder: placeholder || undefined,
            required,
            options,
          })
        }

        forms.push({
          action: action || undefined,
          method: method || undefined,
          fields,
        })
      }
    } catch (error) {
      console.error("Forms extraction error:", error)
    }

    return forms
  }

  private async extractImages(): Promise<ImageData[]> {
    const images: ImageData[] = []

    try {
      const imgElements = await this.driver.findElements(By.tagName("img"))
      for (const img of imgElements) {
        const src = await img.getAttribute("src")
        const alt = (await img.getAttribute("alt")) || ""
        const title = await img.getAttribute("title")
        const width = await img.getAttribute("width")
        const height = await img.getAttribute("height")

        if (src) {
          // Resolve relative URLs
          const absoluteSrc = new URL(src, this.baseUrl).href

          // Determine format from URL
          const format = this.getImageFormat(absoluteSrc)

          images.push({
            src: absoluteSrc,
            alt,
            title: title || undefined,
            width: width || undefined,
            height: height || undefined,
            format,
          })
        }
      }
    } catch (error) {
      console.error("Images extraction error:", error)
    }

    return images
  }

  private getImageFormat(url: string): string | undefined {
    const extension = url.split(".").pop()?.toLowerCase()
    const formats = ["jpg", "jpeg", "png", "gif", "webp", "svg", "bmp", "ico"]
    return formats.includes(extension || "") ? extension : undefined
  }

  private async extractLinks(): Promise<LinkData[]> {
    const links: LinkData[] = []

    try {
      const linkElements = await this.driver.findElements(By.tagName("a"))
      for (const link of linkElements) {
        const href = await link.getAttribute("href")
        const text = await link.getText()
        const title = await link.getAttribute("title")

        if (href) {
          const type = this.getLinkType(href, this.baseUrl)
          const domain = type === "external" ? new URL(href).hostname : undefined

          links.push({
            href,
            text: text.trim(),
            title: title || undefined,
            type,
            domain,
          })
        }
      }
    } catch (error) {
      console.error("Links extraction error:", error)
    }

    return links
  }

  private getLinkType(href: string, baseUrl: string): LinkData["type"] {
    if (href.startsWith("mailto:")) return "email"
    if (href.startsWith("tel:")) return "phone"
    if (href.startsWith("#") || href.startsWith("/")) return "internal"

    try {
      const url = new URL(href)
      const baseUrlObj = new URL(baseUrl)

      // Check if it's a file download
      const fileExtensions = [".pdf", ".doc", ".docx", ".xls", ".xlsx", ".zip", ".rar", ".mp3", ".mp4", ".avi"]
      if (fileExtensions.some((ext) => url.pathname.toLowerCase().endsWith(ext))) {
        return "file"
      }

      return url.hostname === baseUrlObj.hostname ? "internal" : "external"
    } catch {
      return "internal"
    }
  }

  private async extractStructuredData(): Promise<any[]> {
    const structuredData: any[] = []

    try {
      // JSON-LD
      const jsonLdElements = await this.driver.findElements(By.css('script[type="application/ld+json"]'))
      for (const element of jsonLdElements) {
        try {
          const content = await element.getAttribute("innerHTML")
          if (content) {
            structuredData.push(JSON.parse(content))
          }
        } catch (error) {
          console.error("JSON-LD parsing error:", error)
        }
      }

      // Microdata
      const microdataElements = await this.driver.findElements(By.css("[itemscope]"))
      for (const element of microdataElements) {
        try {
          const itemType = await element.getAttribute("itemtype")
          const properties: Record<string, string> = {}

          const propElements = await element.findElements(By.css("[itemprop]"))
          for (const prop of propElements) {
            const name = await prop.getAttribute("itemprop")
            const content = (await prop.getAttribute("content")) || (await prop.getText())
            if (name && content) {
              properties[name] = content
            }
          }

          if (Object.keys(properties).length > 0) {
            structuredData.push({
              "@type": itemType,
              ...properties,
            })
          }
        } catch (error) {
          console.error("Microdata parsing error:", error)
        }
      }
    } catch (error) {
      console.error("Structured data extraction error:", error)
    }

    return structuredData
  }

  private async extractSocialMedia(): Promise<SocialMediaData> {
    const socialMedia: SocialMediaData = {}

    try {
      const socialSelectors = {
        facebook: 'a[href*="facebook.com"], a[href*="fb.com"]',
        twitter: 'a[href*="twitter.com"], a[href*="x.com"]',
        instagram: 'a[href*="instagram.com"]',
        linkedin: 'a[href*="linkedin.com"]',
        youtube: 'a[href*="youtube.com"], a[href*="youtu.be"]',
        tiktok: 'a[href*="tiktok.com"]',
      }

      for (const [platform, selector] of Object.entries(socialSelectors)) {
        try {
          const element = await this.driver.findElement(By.css(selector))
          const href = await element.getAttribute("href")
          if (href) {
            socialMedia[platform as keyof SocialMediaData] = href
          }
        } catch {
          // Platform not found
        }
      }
    } catch (error) {
      console.error("Social media extraction error:", error)
    }

    return socialMedia
  }

  private async extractContactInfo(): Promise<ContactInfo> {
    const contactInfo: ContactInfo = {
      emails: [],
      phones: [],
      addresses: [],
    }

    try {
      const bodyText = await this.extractTextContent()

      // Extract emails
      const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g
      const emails = bodyText.match(emailRegex) || []
      contactInfo.emails = [...new Set(emails)]

      // Fixed invalid regex pattern by replacing $$ with $$ and $$
      const phoneRegex = /(\+?1?[-.\s]?)?$$?([0-9]{3})$$?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})/g
      const phones = bodyText.match(phoneRegex) || []
      contactInfo.phones = [...new Set(phones)]

      // Extract addresses (basic pattern)
      const addressRegex =
        /\d+\s+[A-Za-z0-9\s,.-]+(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Lane|Ln|Drive|Dr|Court|Ct|Place|Pl)\s*,?\s*[A-Za-z\s]+,?\s*[A-Z]{2}\s*\d{5}/g
      const addresses = bodyText.match(addressRegex) || []
      contactInfo.addresses = [...new Set(addresses)]
    } catch (error) {
      console.error("Contact info extraction error:", error)
    }

    return contactInfo
  }

  async downloadImages(images: ImageData[], downloadDir = "./downloads"): Promise<ImageData[]> {
    const downloadedImages: ImageData[] = []

    try {
      // Ensure download directory exists
      await fs.mkdir(downloadDir, { recursive: true })

      for (const image of images) {
        try {
          const response = await fetch(image.src)
          if (response.ok) {
            const buffer = await response.buffer()
            const filename = this.generateImageFilename(image.src, image.format)
            const localPath = path.join(downloadDir, filename)

            await fs.writeFile(localPath, buffer)

            downloadedImages.push({
              ...image,
              size: buffer.length,
              downloaded: true,
              localPath,
            })
          }
        } catch (error) {
          console.error(`Failed to download image ${image.src}:`, error)
          downloadedImages.push({
            ...image,
            downloaded: false,
          })
        }
      }
    } catch (error) {
      console.error("Image download error:", error)
    }

    return downloadedImages
  }

  private generateImageFilename(url: string, format?: string): string {
    const urlObj = new URL(url)
    const pathname = urlObj.pathname
    const filename = pathname.split("/").pop() || "image"

    // If filename has no extension, add one based on format
    if (!filename.includes(".") && format) {
      return `${filename}.${format}`
    }

    return filename || `image_${Date.now()}.jpg`
  }
}
