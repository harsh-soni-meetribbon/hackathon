import { type NextRequest, NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

async function extractTextFromPDF(file: File): Promise<string> {
  // For this implementation, we'll use a simple approach
  // In production, you might want to use pdf-parse or similar library
  try {
    const arrayBuffer = await file.arrayBuffer()
    const uint8Array = new Uint8Array(arrayBuffer)

    // Convert to base64 for Gemini Vision API
    const base64 = Buffer.from(uint8Array).toString("base64")

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

    const result = await model.generateContent([
      "Extract all text content from this PDF document. Return only the text content without any formatting or explanations.",
      {
        inlineData: {
          data: base64,
          mimeType: file.type,
        },
      },
    ])

    const response = await result.response
    return response.text()
  } catch (error) {
    console.error("PDF text extraction error:", error)
    throw new Error("Failed to extract text from PDF")
  }
}

async function extractDetailsFromPDF(pdfText: string) {
  const prompt = `Analyze the following PDF content and extract vendor/exhibitor information and products according to Ribbon schema.

PDF Content: ${pdfText}

INSTRUCTIONS:
1. Extract vendor/exhibitor profile information
2. Identify and extract all products/services
3. Group similar products as variants
4. Infer missing details where possible
5. Structure according to Ribbon format

EXPECTED JSON STRUCTURE:
{
  "vendor": {
    "firstName": "",
    "lastName": "",
    "email": "",
    "brandName": "",
    "description": "",
    "phone": "",
    "webSite": "",
    "address": "",
    "city": "",
    "state": "",
    "zipCode": "",
    "country": "",
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

Return only valid JSON without markdown formatting.

The following is a PDF document that may contain product catalog, vendor information, or business data. Extract structured JSON for exhibitor and their products.

---
### ✅ TASKS:
1. Extract a **clean exhibitor profile** from any contact information, headers, or business details found in the PDF
2. Extract all **products** mentioned in the document
3. If multiple entries share the **same product title**, group them under **one product** with variants
4. Include product attributes like: \`sku\`, \`price\`, \`description\`, \`materials\`, \`color\`, etc.
5. Ensure every product has \`variantInfo\` even if it has only 1 variant

Make sure:
- Extract vendor/company information from headers, footers, or contact sections
- Group similar products as variants under a single product entry
- Extract pricing, descriptions, and specifications where available
- Infer missing address details from available information

---
### ✅ EXPECTED JSON STRUCTURE:
{
  vendor: {
    firstName,
    lastName,
    email,
    brandName,
    description,
    phoneNo,
    webSite,
    address,
    address2,
    city,
    state,
    country,
    zipCode,
    store: {
      about: String,
      openingOrderAmt: Number,
      reorderAmt: Number,
      priceRange: String,
      paymentTerms: String,
      shippingPolicy: String,
      estimatedShipTimes: String,
      returnsAndExchanges: String,
      vendorNotes: String,
      vendorHighlightMessage: String,
      profileSteps: Array,
      heading: String
    }
  },
  products: [
    {
      name,
      description,
      sku,
      price,
      wholesale,
      qty,
      maxQty,
      category,
      tags,
      currencyCode,
      productType,
      availability,
      imagesURL,
      stock,
      variantInfo: {
        options: [{ key, value }],
        variants: [
          {
            sku,
            options: [],
            price,
            wholesale,
            stock,
            color,
            materials,
            size
          }
        ]
      }
    }
  ]
}

Please analyze this PDF and extract the information:`

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

    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    if (!file.type.includes("pdf")) {
      return NextResponse.json({ error: "Please upload a PDF file" }, { status: 400 })
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "File size must be less than 10MB" }, { status: 400 })
    }

    console.log("Processing PDF:", file.name)

    // Extract text from PDF
    const pdfText = await extractTextFromPDF(file)

    if (!pdfText.trim()) {
      return NextResponse.json({ error: "No text content found in PDF" }, { status: 400 })
    }

    // Extract details using AI
    const result = await extractDetailsFromPDF(pdfText)

    if (!result.vendor || !result.products) {
      throw new Error("Invalid data structure returned from AI")
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error("PDF processing error:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to process PDF file",
        details: "Please check your PDF file and try again",
      },
      { status: 500 },
    )
  }
}
