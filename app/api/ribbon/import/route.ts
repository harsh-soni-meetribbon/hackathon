import { type NextRequest, NextResponse } from "next/server"

interface VendorData {
  firstName: string
  lastName: string
  email: string
  brandName: string
  description: string
  phone?: string
  webSite: string
  address: string
  address2?: string
  city: string
  state: string
  zipCode: string
  country: string
  currencyCode: string
  tel?: string
  // NEW fields from Shopify API / Ribbon Store schema
  avatarURL?: string // Mapped from brand.logo / squareLogo
  store: {
    about: string
    openingOrderAmt: number
    reorderAmt: number
    priceRange: string
    paymentTerms: string
    shippingPolicy: string
    estimatedShipTimes: string
    returnsAndExchanges: string
    vendorNotes: string
    vendorHighlightMessage: string
    profileSteps: any[]
    heading: string
    links: Array<{ linkName: string; linkValue: string }>
    profileURL?: string // Mapped from brand.coverImage
    lookbookURL?: string // User editable
    curatedImages?: Array<{ imageSrc: string; callToAction: string }> // From first 6 products
  }
}

interface ProductData {
  name: string
  description: string
  price: number
  wholesale?: number
  sku: string
  imagesURL: string[]
  category: string[]
  stock: number
  qty?: number
  maxQty?: number
  productType?: string[]
  taxStatus?: string
  variantInfo?: {
    options: Array<{ key: string; value: string }>
    variants: Array<{
      sku: string
      options: string[]
      price: number
      wholesale?: number
      stock: number
      qty?: number
      variantImage?: string
      upc?: string
      inActive?: number
    }>
  }
}

interface ImportData {
  vendor: VendorData
  products: ProductData[]
}

const RIBBON_BASE_URL = process.env.RIBBON_BASE_URL || "http://localhost:9088";
const VENDOR_API_ENDPOINT = `${RIBBON_BASE_URL}/api/user/addvendorhgjkhghjgjghfgj`
const PRODUCT_API_ENDPOINT = `${RIBBON_BASE_URL}/api/product/insertProductsqwertyujik`

// Helper function to extract colors from variant options
function extractColors(options: string[]): string[] {
  const colorKeywords = [
    "red",
    "blue",
    "green",
    "yellow",
    "black",
    "white",
    "pink",
    "purple",
    "orange",
    "brown",
    "gray",
    "grey",
  ]
  const colors: string[] = []

  options?.forEach((option) => {
    const lowerOption = option.toLowerCase()
    colorKeywords.forEach((color) => {
      if (lowerOption.includes(color) && !colors.includes(color)) {
        colors.push(color)
      }
    })
  })

  return colors.length > 0 ? colors : ["black"] // Default color
}

// Helper function to extract materials from variant options
function extractMaterials(options: string[]): string[] {
  const materialKeywords = ["cotton", "silk", "wool", "polyester", "leather", "denim", "linen", "cashmere", "nylon"]
  const materials: string[] = []

  options?.forEach((option) => {
    const lowerOption = option.toLowerCase()
    materialKeywords.forEach((material) => {
      if (lowerOption.includes(material) && !materials.includes(material)) {
        materials.push(material)
      }
    })
  })

  return materials.length > 0 ? materials : ["Cotton"] // Default material
}

export async function POST(request: NextRequest) {
  try {
    const { vendor, products } = (await request.json()) as ImportData

    console.log(`Starting import for vendor: ${vendor.brandName}`)
    console.log(`Importing ${products.length} products`)

    // Step 1: Create vendor using real Ribbon API
    const vendorPayload = {
      firstName: vendor.firstName || vendor.brandName.split(" ")[0] || "Unknown",
      lastName: vendor.lastName || vendor.brandName.split(" ").slice(1).join(" ") || "User",
      email: vendor.email || "noemail@example.com",
      brandName: vendor.brandName || "Unknown Brand",
      webSite: vendor.webSite || "",
      address: vendor.address || "",
      address2: vendor.address2 || "",
      city: vendor.city || "",
      state: vendor.state || "",
      zipCode: vendor.zipCode || "",
      tel: vendor.tel || "",
      resellerId: "",
      interests: ["HOUSE"], // Default interest
      paymentMethod: "",
      password: "", // Will be handled by Ribbon
      roleType: 1, // Vendor role
      access: 0,
      agencyCommissionPercentage: 15,
      showroomImageURL:
        vendor?.store?.profileURL ||
        "https://ribbon-dev-react.s3.amazonaws.com/images/undefined/showroom-pic1752160554925.png", // Use cover image
      store: {
        links: vendor?.store?.links || [], // Use the links array directly from the frontend
        about: vendor?.store?.about || "",
        openingOrderAmt: vendor?.store?.openingOrderAmt || 0,
        reorderAmt: vendor?.store?.reorderAmt || 0,
        priceRange: vendor?.store?.priceRange || "Contact for pricing",
        paymentTerms: vendor?.store?.paymentTerms || "Net 30",
        shippingPolicy: vendor?.store?.shippingPolicy || "Standard shipping rates apply",
        estimatedShipTimes: vendor?.store?.estimatedShipTimes || "3-5 business days",
        returnsAndExchanges: vendor?.store?.returnsAndExchanges || "30-day return policy",
        vendorNotes: vendor?.store?.vendorNotes || `Imported from source: ${vendor?.brandName || "Unknown"}`,
        vendorHighlightMessage: vendor?.store?.vendorHighlightMessage || "Quality products with fast shipping",
        profileSteps: vendor?.store?.profileSteps || [],
        heading: vendor?.store?.heading || vendor.brandName || "Our Store",
        curatedImages: vendor?.store?.curatedImages || [], // Pass curated images directly
        profileURL: vendor?.store?.profileURL || "", // Pass profileURL directly
        lookbookURL: vendor?.store?.lookbookURL || "", // Pass lookbookURL directly
      },
      country: vendor.country || "United States",
      contractType: "Online Only",
      vendorSalesLocation: [], // Default location
      paymentTerms: ["Credit Card", "Request Terms", "See Notes"],
      currentAgencyId: "5f077a2f7d6be71f487bdd33",
      avatarURL: vendor.avatarURL || "", // Pass avatarURL directly
    }

    console.log("Creating vendor with payload:", vendorPayload)

    const vendorResponse = await fetch(VENDOR_API_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ user: vendorPayload }),
    })

    if (!vendorResponse.ok) {
      const errorText = await vendorResponse.text()
      console.error("Vendor creation failed:", errorText)
      throw new Error(`Failed to create vendor: ${vendorResponse.status} ${errorText}`)
    }

    const vendorResult = await vendorResponse.json()
    console.log("Vendor created successfully:", vendorResult)

    const vendorId = vendorResult.content?._id || vendorResult.content?.id
    const agencyId = vendorResult.content?.agencyID

    if (!vendorId) {
      throw new Error("Vendor ID not found in response")
    }

    // Step 2: Create products using real Ribbon API
    const productPayloads = products.map((product: any) => {
      // Transform product to Ribbon format
      const ribbonProduct: any = {
        vendorId: vendorId,
        agencyID: agencyId,
        brandName: vendor.brandName,
        type: "0", // Published
        name: product.name || "Untitled Product",
        description: product.description || "",
        imagesURL: product.imagesURL || [],
        price: product.price || 0,
        wholesale: product.wholesale || product.price || 0,
        sku: product.sku || `SKU-${Date.now()}`,
        availability: product.stock?.toString() || "0",
        category: product.category || [],
        stock: product.stock || 0,
        qty: product.qty || 1,
        maxQty: product.maxQty || 0,
        favoriteProduct: false,
        isDemo: false,
        productType: product.productType || [],
        currencyCode: vendor.currencyCode || "USD",
        taxStatus: product.taxStatus || "taxable",
        isShopifySyncedProduct: product.isShopifySyncedProduct || false,
        shopifyProductInfo: product.shopifyProductInfo || {},
      }

      // Handle variants if they exist
      if (product.variantInfo && product.variantInfo.variants && product.variantInfo.variants.length > 0) {
        ribbonProduct.variantInfo = {
          options: product.variantInfo.options || [],
          variants: product.variantInfo.variants.map((variant: any) => ({
            options: variant.options || [],
            price: variant.price || product.price || 0,
            sku: variant.sku || `${product.sku}-${Date.now()}`,
            wholesale: variant.wholesale || variant.price || product.price || 0,
            color: extractColors(variant.options),
            room: [],
            values: [],
            origin: [],
            materials: extractMaterials(variant.options),
            qty: variant.qty || 1,
            variantImage: variant.variantImage || product.imagesURL?.[0] || "",
            availability: variant.stock?.toString() || "0",
            stock: variant.stock || 0,
            inActive: variant.inActive || 0,
            type: 0,
            upc: variant.upc || "",
            shopifyProductInfo: variant.shopifyProductInfo || {},
          })),
        }
      }

      return ribbonProduct
    })

    console.log(`Sending ${productPayloads.length} products to Ribbon API`)

    const productResponse = await fetch(PRODUCT_API_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ products: productPayloads }),
    })

    if (!productResponse.ok) {
      const errorText = await productResponse.text()
      console.error("Product creation failed:", errorText)
      throw new Error(`Failed to create products: ${productResponse.status} ${errorText}`)
    }

    const productResult = await productResponse.json()
    console.log("Products created successfully:", productResult)

    // Calculate success/failure counts
    const successCount = Array.isArray(productResult.data) ? productResult.data.length : productPayloads.length
    const failureCount = productPayloads.length - successCount

    // Simulate processing time
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Mock successful response
    const result = {
      success: true,
      vendorId: vendorId,
      productsImported: successCount,
      message: "Successfully imported to Ribbon",
      importStats: {
        vendor: 1,
        products: successCount,
        variants: products.reduce((acc: number, product: any) => acc + (product.variantInfo?.variants?.length || 0), 0),
      },
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error("Ribbon import error:", error)
    return NextResponse.json(
      {
        error: "Failed to import to Ribbon",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
