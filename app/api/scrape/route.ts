import { type NextRequest, NextResponse } from "next/server"
import { SeleniumScraper, type ScrapingConfig } from "@/lib/selenium-config"

export async function POST(request: NextRequest) {
  try {
    const { url, config }: { url: string; config: ScrapingConfig } = await request.json()

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 })
    }

    // Validate URL
    try {
      new URL(url)
    } catch {
      return NextResponse.json({ error: "Invalid URL format" }, { status: 400 })
    }

    const scraper = new SeleniumScraper(config)

    try {
      const results = await scraper.scrapeUrl(url)
      return NextResponse.json(results)
    } finally {
      await scraper.close()
    }
  } catch (error) {
    console.error("API scraping error:", error)
    return NextResponse.json(
      { error: "Scraping failed", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message: "Selenium Web Scraper API",
    version: "1.0.0",
    endpoints: {
      "POST /api/scrape": "Scrape a website with given configuration",
    },
  })
}
