import { type NextRequest, NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

function parseCSVToText(csvContent: string) {
  const lines = csvContent.split("\n")
  const headers = lines[0].split(",").map((h) => h.trim().replace(/"/g, ""))

  let text = `CSV DATA:\n`
  text += `Headers: ${headers.join(", ")}\n\n`

  for (let i = 1; i < lines.length; i++) {
    if (lines[i].trim()) {
      const values = lines[i].split(",").map((v) => v.trim().replace(/"/g, ""))
      text += `Row ${i}:\n`
      headers.forEach((header, index) => {
        text += `${header}: ${values[index] || ""}\n`
      })
      text += "\n"
    }
  }

  return text
}

async function extractDetailsFromCSV(csvContent: string) {
  const text = parseCSVToText(csvContent)

  const prompt = `The following is messy CSV or PDF data from an exhibitor. Try to extract structured JSON for exhibitor and their products.

If any address part is missing (like country), infer it from the given city, state, or ZIP code.

---

### ✅ TASKS:

1. Extract a **clean exhibitor profile**. Extract brandName and other details from website url if given.
2. *store.links* should take only two value *Link* and *Instagram*, do not add other links in it. Keep other links on root level like website url and catalogUrl.
3. Extract all **products**
4. If multiple rows share the **same product title** (or if title is missing), group them under **one product** with the rest added to \`variantInfo.variants\`.
5. DO NOT create separate product entries for variants.
6. Include product attributes like: \`sku\`, \`variantImage\`, \`materials\`, \`color\`, etc.
7. Ensure every product has \`variantInfo\` even if it has only 1 variant.  

Make sure:

- If the product title is the same (or missing), treat them as **variants** of a single product.
- Do NOT create separate products for variants. Group them under the *variantInfo* of a single product.
- Set *variantInfo.options* as an array of key-value pairs. Each *key* should be the variation type (like *Color*, *Size*), and the *value* must be a **comma-separated string of all distinct values** from the variants. Example:

{
"options": [
  {
    "key": "size",
    "value": "M,XL"
  }
]}

variant example: {
            "sku": "8r98wefssh-2",
            "variantImage": null,
            "facets": null,
            "options": ["Red"],
            "availability": null,
            "qty": null,
            "maxQty": null,
            "price": null,
            "wholesale": 120,
            "stock": null,
            "inActive": null,
            "color": null,
            "room": null,
            "origin": null,
            "values": null,
            "materials": null,
            "collectionFacet": null,
            "type": null,
            "upc": null,
            "categoryFacet": null,
            "priceFacet": null,
            "size": null,
            "gallery": null,
            "artist": null,
            "galleryCity": null,
            "galleryCountry": null,
            "yearFacet": null,
            "paymentFacet": null
          }
---

### ⚠️ VARIANT GROUPING LOGIC:

- Group by same or similar product **title/name**
- If title is missing or duplicate, assume it's a variant
- Use **fields like \`color\`, \`size\`, \`material\`** as \`variantInfo.options\`
- Put all grouped rows in \`variantInfo.variants\` of a single product
- DO NOT treat variants as separate products

---

### ✅ EXPECTED JSON STRUCTURE:

{
  vendor: {
    firstName,
    lastName,
    email,
    brandName,
    description,
    phone no,
    businessWords,
    title,
    catalogURL,
    showroomImageURL,
    webSite,
    address,
    address2,
    city,
    state,
    country,
    zipCode,
    store: {
      profileURL: String,
      about: String,
      openingOrderAmt: { type: Number, default: 0 },
      reorderAmt: { type: Number, default: 0 },
      priceRange : String,
      paymentTerms: String,
      shippingPolicy: String,
      estimatedShipTimes: String,
      returnsAndExchanges: String,   
      vendorNotes: String,
      vendorHighlightMessage: String,
      videoLink : String,
      links: [
        {
          linkName: String,
          linkValue: String
        }
      ], 
      curatedImages : [
        {
          imageSrc : String,
          callToAction : String
        }
      ],
      lookBookURL: [
        {
          imageSrc : String,
          callToAction : String
        }
      ],
      profileSteps: Array,
      heading: String
  },  
  },
  products: [
    {
      name,
      brandName,
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
      shippingClass,
      productETA,
      shortDescription,
      vendorStatus,
      stock,
      salePrice,
      variantInfo: {
        options: [
          { key, value }
        ],
        variants: [
          {
            sku,
            variantImage,
            facets,
            options: [],
            availability,
            qty,
            maxQty,
            price,
            wholesale,
            stock,
            inActive,
            color,
            room,
            origin,
            values,
            materials,
            collectionFacet,
            type,
            upc,
            categoryFacet,
            priceFacet,
            size,
            gallery,
            artist,
            galleryCity,
            galleryCountry,
            yearFacet,
            paymentFacet
          }
        ]
      }
    }
  ]
}

---

### 📎 Notes:
- Group by name/title or SKU prefix if title is missing
- Add **variant images**, **wholesale**, **SKU**, **color**, and **material** info per variant
- Extract brandName, logo URL, description, Instagram handle, and highlighted images if available

---

### 📦 Raw Input:
${text}

Return only valid JSON without any markdown formatting.`

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })
    const result = await model.generateContent([prompt])
    const response = await result.response
    const content = response.text()

    // Clean the response
    const cleaned = content
      .replace(/```json\n?/, "")
      .replace(/```/, "")
      .trim()

    try {
      return JSON.parse(cleaned)
    } catch (parseError) {
      console.error("JSON Parse Error:", parseError)
      console.error("Raw content:", content)
      throw new Error("Failed to parse AI response as JSON")
    }
  } catch (error) {
    console.error("Gemini API Error:", error)
    throw new Error("AI processing failed")
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    if (!file.name.endsWith(".csv")) {
      return NextResponse.json({ error: "Please upload a CSV file" }, { status: 400 })
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "File size must be less than 10MB" }, { status: 400 })
    }

    const csvContent = await file.text()

    if (!csvContent.trim()) {
      return NextResponse.json({ error: "CSV file is empty" }, { status: 400 })
    }

    const result = await extractDetailsFromCSV(csvContent);

    if (!result.vendor || !result.products) {
      throw new Error("Invalid data structure returned from AI")
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error("CSV processing error:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to process CSV file",
        details: "Please check your CSV format and try again",
      },
      { status: 500 },
    )
  }
}
