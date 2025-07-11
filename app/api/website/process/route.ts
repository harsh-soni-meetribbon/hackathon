import { type NextRequest, NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

async function scrapeWebsiteContent(url: string) {
  try {
    // Use a simple fetch to get the HTML content
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch website: ${response.status}`)
    }

    const html = await response.text()

    // Extract text content from HTML (simple approach)
    const textContent = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
      .replace(/<[^>]*>/g, " ")
      .replace(/\s+/g, " ")
      .trim()

    return textContent.substring(0, 10000) // Limit content length
  } catch (error) {
    console.error("Website scraping error:", error)
    throw new Error("Failed to scrape website content")
  }
}

async function extractDetailsFromWebsite(url: string, content: string) {
  const prompt = `Analyze the following website content and extract vendor/brand information and products according to Ribbon schema.

Website URL: ${url}
Website Content: ${content}

INSTRUCTIONS:
1. Extract vendor/brand information from the website
2. Identify and extract product information
3. Infer missing details where possible
4. Structure according to Ribbon format

EXPECTED JSON STRUCTURE:
{
  "vendor": {
    "firstName": "",
    "lastName": "",
    "email": "",
    "brandName": "",
    "description": "",
    "phone": "",
    "webSite": "${url}",
    "address": "",
    "address2": "",
    "city": "",
    "state": "",
    "country": "",
    "zipCode": ""
    "currencyCode": "USD"
  },
  "products": [
    {
      "name": "",
      "description": "",
      "price": 0,
      "sku": "",
      "imagesURL": [],
      "category": [],
      "stock": 0,
      "variantInfo": {
        "options": [],
        "variants": [
          {
            "sku": "",
            "options": [],
            "price": 0,
            "stock": 0,
            "variantImage": ""
          }
        ]
      }
    }
  ]
}

Return only valid JSON without markdown formatting.`

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })
    const result = await model.generateContent([prompt])
    const response = await result.response
    const content = response.text()

    const cleaned = content
      .replace(/```json\n?/, "")
      .replace(/```/, "")
      .trim()

    return JSON.parse(cleaned)
  } catch (error) {
    console.error("Gemini API Error:", error)
    throw new Error("AI processing failed")
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: "AI service not configured. Please add GEMINI_API_KEY." }, { status: 500 })
    }

    const { url } = await request.json()

    if (!url) {
      return NextResponse.json({ error: "Website URL is required" }, { status: 400 })
    }

    // Validate URL format
    try {
      new URL(url)
    } catch {
      return NextResponse.json({ error: "Invalid URL format" }, { status: 400 })
    }

    console.log("Processing website:", url)

    // Scrape website content
    const content = await scrapeWebsiteContent(url)

    // Extract details using AI
    const result = await extractDetailsFromWebsite(url, content)

    if (!result.vendor || !result.products) {
      throw new Error("Invalid data structure returned from AI")
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error("Website processing error:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to process website",
        details: "Please check the URL and try again",
      },
      { status: 500 },
    )
  }
}
