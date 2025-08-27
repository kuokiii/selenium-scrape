"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  AlertCircle,
  Download,
  Globe,
  ImageIcon,
  FileText,
  Settings,
  Clock,
  User,
  Calendar,
  Hash,
  Table,
  List,
  Mail,
  Phone,
  MapPin,
  Share2,
  Code,
  ExternalLink,
  CheckCircle,
  XCircle,
  Loader2,
} from "lucide-react"

interface ExtractedContent {
  url: string
  title: string
  description?: string
  keywords?: string[]
  author?: string
  publishDate?: string
  language?: string
  textContent: string
  cleanedText: string
  headings: Array<{ level: number; text: string; id?: string }>
  paragraphs: string[]
  lists: Array<{ type: "ordered" | "unordered"; items: string[] }>
  tables: Array<{ headers: string[]; rows: string[][]; caption?: string }>
  forms: Array<{ action?: string; method?: string; fields: any[] }>
  images: Array<{ src: string; alt: string; downloaded?: boolean; localPath?: string }>
  links: Array<{ href: string; text: string; type: string; domain?: string }>
  metadata: {
    openGraph: Record<string, string>
    twitterCard: Record<string, string>
    jsonLd: any[]
  }
  structuredData: any[]
  socialMedia: Record<string, string>
  contactInfo: {
    emails: string[]
    phones: string[]
    addresses: string[]
  }
  downloadedImages?: string[]
  captchaDetected?: boolean
  timestamp: string
}

export default function ScraperDashboard() {
  const [url, setUrl] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [results, setResults] = useState<ExtractedContent | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [config, setConfig] = useState({
    extractText: true,
    extractImages: true,
    extractLinks: true,
    bypassAntiBot: true,
    useProxy: false,
    waitTime: 3000,
    scrollToBottom: true,
    humanBehavior: true,
    stealthMode: true,
  })

  const handleScrape = async () => {
    if (!url) return

    setIsLoading(true)
    setProgress(0)
    setResults(null)
    setError(null)

    // Simulate progress updates
    const progressInterval = setInterval(() => {
      setProgress((prev) => Math.min(prev + Math.random() * 15, 90))
    }, 1000)

    try {
      const response = await fetch("/api/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, config }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Scraping failed")
      }

      const data = await response.json()
      setResults(data)
      setProgress(100)
    } catch (error) {
      console.error("Scraping error:", error)
      setError(error instanceof Error ? error.message : "Unknown error occurred")
    } finally {
      clearInterval(progressInterval)
      setIsLoading(false)
    }
  }

  const downloadResults = (format: "json" | "csv" | "txt" = "json") => {
    if (!results) return

    let content: string
    let mimeType: string
    let extension: string

    switch (format) {
      case "csv":
        content = convertToCSV(results)
        mimeType = "text/csv"
        extension = "csv"
        break
      case "txt":
        content = results.cleanedText
        mimeType = "text/plain"
        extension = "txt"
        break
      default:
        content = JSON.stringify(results, null, 2)
        mimeType = "application/json"
        extension = "json"
    }

    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `scraped-data-${Date.now()}.${extension}`
    a.click()
    URL.revokeObjectURL(url)
  }

  const convertToCSV = (data: ExtractedContent): string => {
    const rows = [
      ["Field", "Value"],
      ["URL", data.url],
      ["Title", data.title],
      ["Description", data.description || ""],
      ["Author", data.author || ""],
      ["Language", data.language || ""],
      ["Text Length", data.textContent.length.toString()],
      ["Images Count", data.images.length.toString()],
      ["Links Count", data.links.length.toString()],
      ["Headings Count", data.headings.length.toString()],
      ["Tables Count", data.tables.length.toString()],
      ["Forms Count", data.forms.length.toString()],
    ]

    return rows.map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(",")).join("\n")
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-balance">Advanced Web Scraper</h1>
          <p className="text-muted-foreground text-lg">
            Extract comprehensive data from any website with advanced anti-detection measures
          </p>
        </div>

        {/* Main Scraping Interface */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Scrape Website
            </CardTitle>
            <CardDescription>
              Enter a URL to extract comprehensive content with advanced anti-detection measures
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="https://example.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="flex-1"
              />
              <Button onClick={handleScrape} disabled={isLoading || !url}>
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Scraping...
                  </>
                ) : (
                  "Scrape"
                )}
              </Button>
            </div>

            {isLoading && (
              <div className="space-y-2">
                <Progress value={progress} className="w-full" />
                <p className="text-sm text-muted-foreground">Processing website... {Math.round(progress)}%</p>
              </div>
            )}

            {error && (
              <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                <XCircle className="h-4 w-4 text-destructive" />
                <span className="text-sm text-destructive">{error}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Configuration */}
        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="basic">Basic Settings</TabsTrigger>
            <TabsTrigger value="advanced">Advanced Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Extraction Options
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="extract-text">Extract Text</Label>
                    <Switch
                      id="extract-text"
                      checked={config.extractText}
                      onCheckedChange={(checked) => setConfig({ ...config, extractText: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="extract-images">Extract Images</Label>
                    <Switch
                      id="extract-images"
                      checked={config.extractImages}
                      onCheckedChange={(checked) => setConfig({ ...config, extractImages: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="extract-links">Extract Links</Label>
                    <Switch
                      id="extract-links"
                      checked={config.extractLinks}
                      onCheckedChange={(checked) => setConfig({ ...config, extractLinks: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="bypass-antibot">Bypass Anti-Bot</Label>
                    <Switch
                      id="bypass-antibot"
                      checked={config.bypassAntiBot}
                      onCheckedChange={(checked) => setConfig({ ...config, bypassAntiBot: checked })}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="advanced" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Advanced Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="wait-time">Wait Time (ms)</Label>
                    <Input
                      id="wait-time"
                      type="number"
                      value={config.waitTime}
                      onChange={(e) => setConfig({ ...config, waitTime: Number.parseInt(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="scroll-bottom">Scroll to Bottom</Label>
                      <Switch
                        id="scroll-bottom"
                        checked={config.scrollToBottom}
                        onCheckedChange={(checked) => setConfig({ ...config, scrollToBottom: checked })}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="human-behavior">Human Behavior</Label>
                      <Switch
                        id="human-behavior"
                        checked={config.humanBehavior}
                        onCheckedChange={(checked) => setConfig({ ...config, humanBehavior: checked })}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="stealth-mode">Stealth Mode</Label>
                      <Switch
                        id="stealth-mode"
                        checked={config.stealthMode}
                        onCheckedChange={(checked) => setConfig({ ...config, stealthMode: checked })}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Results */}
        {results && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  Scraping Results
                </span>
                <div className="flex gap-2">
                  <Button onClick={() => downloadResults("json")} variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    JSON
                  </Button>
                  <Button onClick={() => downloadResults("csv")} variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    CSV
                  </Button>
                  <Button onClick={() => downloadResults("txt")} variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Text
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Summary Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-bold">{results.textContent?.length || 0}</div>
                  <div className="text-sm text-muted-foreground">Characters</div>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-bold">{results.images?.length || 0}</div>
                  <div className="text-sm text-muted-foreground">Images</div>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-bold">{results.links?.length || 0}</div>
                  <div className="text-sm text-muted-foreground">Links</div>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-bold">{results.headings?.length || 0}</div>
                  <div className="text-sm text-muted-foreground">Headings</div>
                </div>
              </div>

              {/* Metadata */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Page Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Title</Label>
                      <p className="text-sm text-muted-foreground">{results.title}</p>
                    </div>
                    {results.description && (
                      <div>
                        <Label className="text-sm font-medium">Description</Label>
                        <p className="text-sm text-muted-foreground">{results.description}</p>
                      </div>
                    )}
                    {results.author && (
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <span className="text-sm">{results.author}</span>
                      </div>
                    )}
                    {results.publishDate && (
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span className="text-sm">{results.publishDate}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      <span className="text-sm">{results.language || "Unknown"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span className="text-sm">{new Date(results.timestamp).toLocaleString()}</span>
                    </div>
                  </div>

                  {results.keywords && results.keywords.length > 0 && (
                    <div>
                      <Label className="text-sm font-medium mb-2 block">Keywords</Label>
                      <div className="flex flex-wrap gap-1">
                        {results.keywords.map((keyword, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {keyword}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {results.captchaDetected && (
                    <div className="flex items-center gap-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
                      <AlertCircle className="h-4 w-4 text-yellow-600" />
                      <span className="text-sm text-yellow-800">CAPTCHA was detected during scraping</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Main Content Tabs */}
              <Tabs defaultValue="content" className="w-full">
                <TabsList className="grid w-full grid-cols-6">
                  <TabsTrigger value="content">Content</TabsTrigger>
                  <TabsTrigger value="images">Images</TabsTrigger>
                  <TabsTrigger value="links">Links</TabsTrigger>
                  <TabsTrigger value="structure">Structure</TabsTrigger>
                  <TabsTrigger value="contact">Contact</TabsTrigger>
                  <TabsTrigger value="technical">Technical</TabsTrigger>
                </TabsList>

                <TabsContent value="content" className="space-y-4">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Clean Text</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ScrollArea className="h-[300px]">
                          <Textarea
                            value={results.cleanedText || "No text content extracted"}
                            readOnly
                            className="min-h-[280px] border-none resize-none"
                          />
                        </ScrollArea>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Hash className="h-4 w-4" />
                          Headings ({results.headings.length})
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ScrollArea className="h-[300px]">
                          <div className="space-y-2">
                            {results.headings.map((heading, index) => (
                              <div key={index} className="flex items-start gap-2">
                                <Badge variant="outline" className="text-xs">
                                  H{heading.level}
                                </Badge>
                                <span className="text-sm">{heading.text}</span>
                              </div>
                            ))}
                          </div>
                        </ScrollArea>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="images">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <ImageIcon className="h-4 w-4" />
                        Images ({results.images.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="h-[500px]">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {results.images.map((img, index) => (
                            <Card key={index} className="overflow-hidden">
                              <div className="aspect-video bg-muted flex items-center justify-center">
                                <img
                                  src={img.src || "/placeholder.svg"}
                                  alt={img.alt}
                                  className="max-w-full max-h-full object-contain"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement
                                    target.src = "/placeholder.svg?height=200&width=300&text=Image+Not+Found"
                                  }}
                                />
                              </div>
                              <CardContent className="p-3">
                                <p className="text-xs text-muted-foreground truncate">{img.alt || "No alt text"}</p>
                                <div className="flex items-center justify-between mt-2">
                                  <Badge variant={img.downloaded ? "default" : "secondary"} className="text-xs">
                                    {img.downloaded ? "Downloaded" : "Online"}
                                  </Badge>
                                  <Button variant="ghost" size="sm" onClick={() => window.open(img.src, "_blank")}>
                                    <ExternalLink className="h-3 w-3" />
                                  </Button>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </ScrollArea>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="links">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <ExternalLink className="h-4 w-4" />
                        Links ({results.links.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="h-[500px]">
                        <div className="space-y-2">
                          {results.links.map((link, index) => (
                            <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                              <div className="flex-1 min-w-0">
                                <p className="font-medium truncate">{link.text || "No text"}</p>
                                <p className="text-sm text-muted-foreground truncate">{link.href}</p>
                                {link.domain && <p className="text-xs text-muted-foreground">{link.domain}</p>}
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-xs">
                                  {link.type}
                                </Badge>
                                <Button variant="ghost" size="sm" onClick={() => window.open(link.href, "_blank")}>
                                  <ExternalLink className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="structure" className="space-y-4">
                  {/* Tables */}
                  {results.tables.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Table className="h-4 w-4" />
                          Tables ({results.tables.length})
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ScrollArea className="h-[300px]">
                          <div className="space-y-4">
                            {results.tables.map((table, index) => (
                              <div key={index} className="border rounded-lg p-3">
                                {table.caption && <h4 className="font-medium mb-2">{table.caption}</h4>}
                                <div className="overflow-x-auto">
                                  <table className="w-full text-sm">
                                    {table.headers.length > 0 && (
                                      <thead>
                                        <tr className="border-b">
                                          {table.headers.map((header, i) => (
                                            <th key={i} className="text-left p-2 font-medium">
                                              {header}
                                            </th>
                                          ))}
                                        </tr>
                                      </thead>
                                    )}
                                    <tbody>
                                      {table.rows.slice(0, 5).map((row, i) => (
                                        <tr key={i} className="border-b">
                                          {row.map((cell, j) => (
                                            <td key={j} className="p-2">
                                              {cell}
                                            </td>
                                          ))}
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                  {table.rows.length > 5 && (
                                    <p className="text-xs text-muted-foreground mt-2">
                                      ... and {table.rows.length - 5} more rows
                                    </p>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </ScrollArea>
                      </CardContent>
                    </Card>
                  )}

                  {/* Lists */}
                  {results.lists.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <List className="h-4 w-4" />
                          Lists ({results.lists.length})
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ScrollArea className="h-[300px]">
                          <div className="space-y-4">
                            {results.lists.map((list, index) => (
                              <div key={index} className="border rounded-lg p-3">
                                <Badge variant="outline" className="mb-2">
                                  {list.type === "ordered" ? "Ordered" : "Unordered"}
                                </Badge>
                                <ul className={list.type === "ordered" ? "list-decimal" : "list-disc"}>
                                  {list.items.slice(0, 10).map((item, i) => (
                                    <li key={i} className="ml-4 text-sm">
                                      {item}
                                    </li>
                                  ))}
                                </ul>
                                {list.items.length > 10 && (
                                  <p className="text-xs text-muted-foreground mt-2">
                                    ... and {list.items.length - 10} more items
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                        </ScrollArea>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                <TabsContent value="contact">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Email Addresses */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                          <Mail className="h-4 w-4" />
                          Emails ({results.contactInfo.emails.length})
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ScrollArea className="h-[200px]">
                          <div className="space-y-2">
                            {results.contactInfo.emails.map((email, index) => (
                              <div key={index} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                                <span className="text-sm">{email}</span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => window.open(`mailto:${email}`, "_blank")}
                                >
                                  <Mail className="h-3 w-3" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </ScrollArea>
                      </CardContent>
                    </Card>

                    {/* Phone Numbers */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                          <Phone className="h-4 w-4" />
                          Phones ({results.contactInfo.phones.length})
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ScrollArea className="h-[200px]">
                          <div className="space-y-2">
                            {results.contactInfo.phones.map((phone, index) => (
                              <div key={index} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                                <span className="text-sm">{phone}</span>
                                <Button variant="ghost" size="sm" onClick={() => window.open(`tel:${phone}`, "_blank")}>
                                  <Phone className="h-3 w-3" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </ScrollArea>
                      </CardContent>
                    </Card>

                    {/* Addresses */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                          <MapPin className="h-4 w-4" />
                          Addresses ({results.contactInfo.addresses.length})
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ScrollArea className="h-[200px]">
                          <div className="space-y-2">
                            {results.contactInfo.addresses.map((address, index) => (
                              <div key={index} className="p-2 bg-muted/50 rounded">
                                <span className="text-sm">{address}</span>
                              </div>
                            ))}
                          </div>
                        </ScrollArea>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Social Media */}
                  {Object.keys(results.socialMedia).length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Share2 className="h-4 w-4" />
                          Social Media
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          {Object.entries(results.socialMedia).map(([platform, url]) => (
                            <div key={platform} className="flex items-center justify-between p-3 border rounded-lg">
                              <div>
                                <Badge variant="outline" className="capitalize">
                                  {platform}
                                </Badge>
                              </div>
                              <Button variant="ghost" size="sm" onClick={() => window.open(url, "_blank")}>
                                <ExternalLink className="h-3 w-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                <TabsContent value="technical">
                  <div className="space-y-4">
                    {/* Structured Data */}
                    {results.structuredData.length > 0 && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Code className="h-4 w-4" />
                            Structured Data ({results.structuredData.length})
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ScrollArea className="h-[300px]">
                            <pre className="text-xs bg-muted p-3 rounded overflow-x-auto">
                              {JSON.stringify(results.structuredData, null, 2)}
                            </pre>
                          </ScrollArea>
                        </CardContent>
                      </Card>
                    )}

                    {/* Metadata */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Metadata</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {/* Open Graph */}
                        {Object.keys(results.metadata.openGraph).length > 0 && (
                          <div>
                            <h4 className="font-medium mb-2">Open Graph</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              {Object.entries(results.metadata.openGraph).map(([key, value]) => (
                                <div key={key} className="flex justify-between p-2 bg-muted/50 rounded text-sm">
                                  <span className="font-medium">{key}:</span>
                                  <span className="truncate ml-2">{value}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Twitter Card */}
                        {Object.keys(results.metadata.twitterCard).length > 0 && (
                          <div>
                            <h4 className="font-medium mb-2">Twitter Card</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              {Object.entries(results.metadata.twitterCard).map(([key, value]) => (
                                <div key={key} className="flex justify-between p-2 bg-muted/50 rounded text-sm">
                                  <span className="font-medium">{key}:</span>
                                  <span className="truncate ml-2">{value}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        )}

        {/* Status */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <AlertCircle className="h-4 w-4" />
              {isLoading
                ? "Scraping in progress with advanced anti-detection measures..."
                : "Ready to scrape websites with comprehensive data extraction"}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
