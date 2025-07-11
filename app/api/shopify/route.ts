import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { shopifyUrl, adminToken } = await request.json()

    // Validate inputs
    if (!shopifyUrl || !adminToken) {
      return NextResponse.json({ error: "Shopify URL and admin token are required" }, { status: 400 })
    }

    // Extract shop name from URL
    const shopName = shopifyUrl.replace("https://", "").replace(".myshopify.com", "")
    const baseUrl = `https://${shopName}.myshopify.com/admin/api/2023-10`

    const headers = {
      "X-Shopify-Access-Token": adminToken,
      "Content-Type": "application/json",
    }

    // Test connection first
    const testResponse = await fetch(`${baseUrl}/shop.json`, { headers })

    if (!testResponse.ok) {
      const errorText = await testResponse.text()
      console.error("Shopify connection error:", errorText)
      return NextResponse.json(
        { error: "Failed to connect to Shopify. Please check your store URL and admin token." },
        { status: 401 },
      )
    }

    // Fetch shop information
    const shopData = await testResponse.json()
    console.log("Shop data fetched:", shopData.shop.name)

    // --- NEW: Generate Storefront Access Token ---
    let storefrontAccessToken = null
    try {
      const storefrontTokenResponse = await fetch(`${baseUrl}/storefront_access_tokens.json`, {
        method: "POST",
        headers: headers, // Use admin token headers
        body: JSON.stringify({
          storefront_access_token: {
            title: "Ribbon Import Tool Storefront Access Token",
            access_scope:
              "unauthenticated_read_product_listings,unauthenticated_read_product_inventory,unauthenticated_read_content",
          },
        }),
      })

      if (storefrontTokenResponse.ok) {
        const tokenData = await storefrontTokenResponse.json()
        storefrontAccessToken = tokenData.storefront_access_token.access_token
        console.log("Storefront Access Token generated successfully.")
      } else {
        const errorText = await storefrontTokenResponse.text()
        console.warn("Failed to generate Storefront Access Token:", errorText)
      }
    } catch (tokenError) {
      console.warn("Error generating Storefront Access Token:", tokenError)
    }

    // --- NEW: Fetch Brand Info using Storefront API ---
    let brandInfo = null
    if (storefrontAccessToken) {
      const graphqlQuery = JSON.stringify({
        query: `query getBrandInfo {
            shop {
                brand {
                    coverImage {
                        image {
                            url
                        }
                    }
                    logo {
                        image {
                            url
                        }
                    }
                    shortDescription
                    squareLogo {
                        image {
                            url
                        }
                    }
                }
            }
        }`,
        variables: {}, // No variables needed for this query
      })

      try {
        const storefrontResponse = await fetch(`https://${shopName}.myshopify.com/api/2024-04/graphql.json`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Shopify-Storefront-Access-Token": storefrontAccessToken,
          },
          body: graphqlQuery,
        })

        if (storefrontResponse.ok) {
          const storefrontData = await storefrontResponse.json()
          brandInfo = storefrontData.data?.shop?.brand
          console.log("Brand info fetched from Storefront API:", brandInfo)
        } else {
          const errorText = await storefrontResponse.text()
          console.warn("Failed to fetch brand info from Storefront API:", errorText)
        }
      } catch (graphqlError) {
        console.warn("Error fetching brand info from Storefront API:", graphqlError)
      }
    }

    // Fetch products with pagination
    let allProducts: any[] = []
    let nextPageInfo = null
    let hasNextPage = true

    while (hasNextPage && allProducts.length < 250) {
      // Limit to 250 products for demo
      let productsUrl = `${baseUrl}/products.json?limit=50`
      if (nextPageInfo) {
        productsUrl += `&page_info=${nextPageInfo}`
      }

      const productsResponse = await fetch(productsUrl, { headers })

      if (!productsResponse.ok) {
        console.error("Failed to fetch products")
        break
      }

      const productsData = await productsResponse.json()
      allProducts = [...allProducts, ...productsData.products]

      // Check for pagination
      const linkHeader = productsResponse.headers.get("Link")
      if (linkHeader && linkHeader.includes('rel="next"')) {
        const nextMatch = linkHeader.match(/<[^>]+page_info=([^&>]+)[^>]*>;\s*rel="next"/)
        nextPageInfo = nextMatch ? nextMatch[1] : null
        hasNextPage = !!nextPageInfo
      } else {
        hasNextPage = false
      }
    }

    console.log(`Fetched ${allProducts.length} products`)

    // Fetch locations for inventory data
    const locationsResponse = await fetch(`${baseUrl}/locations.json`, { headers })
    const locationsData = locationsResponse.ok ? await locationsResponse.json() : { locations: [] }

    // Transform shop data to Ribbon vendor schema
    const vendor = {
      brandName: shopData.shop.name || "Unknown Store",
      email: shopData.shop.email || "",
      description:
        brandInfo?.shortDescription ||
        shopData.shop.description ||
        `${shopData.shop.name} - Premium products and exceptional service`,
      webSite: shopData.shop.domain || shopifyUrl,
      currencyCode: shopData.shop.currency || "USD",
      address: shopData.shop.address || shopData.shop.address1 || "",
      address2: shopData.shop.address2 || "",
      city: shopData.shop.city || "",
      state: shopData.shop.province || "",
      zipCode: shopData.shop?.zipCode || shopData.shop?.zipcode || shopData.shop.zip || "",
      country: shopData.shop.country_name || shopData.shop.country || "",
      tel: shopData.shop.phone || "",
      username: (shopData.shop.name || "store").toLowerCase().replace(/[^a-z0-9]/g, "-"),
      firstName: shopData.shop.shop_owner?.split(" ")[0] || "",
      lastName: shopData.shop.shop_owner?.split(" ").slice(1).join(" ") || "",
      store: {
        about: brandInfo?.shortDescription || shopData.shop.description || "",
        openingOrderAmt: 0,
        reorderAmt: 0,
        priceRange: "", // Default empty, user can edit
        paymentTerms: "Credit Card, Net 30", // Default, user can edit
        shippingPolicy: "", // Default empty, user can edit
        estimatedShipTimes: "", // Default empty, user can edit
        returnsAndExchanges: "", // Default empty, user can edit
        vendorNotes: `Imported from Shopify store: ${shopData.shop.name}`,
        vendorHighlightMessage: "", // Default empty, user can edit
        profileSteps: [],
        heading: shopData.shop.name || "Our Store",
        links: [
          {
            linkName: "Link",
            linkValue: `${shopData.shop.domain || shopifyUrl}`,
          },
          // Instagram and Lookbook will be added/managed in the UI and then mapped to this array on save
        ],
        profileURL: brandInfo?.coverImage?.image?.url || "", // Mapped to cover image
        lookbookURL: [], // Placeholder, user can edit in modal
        curatedImages: [], // Will be populated after products are processed
      },
      avatarURL: brandInfo?.logo?.image?.url || brandInfo?.squareLogo?.image?.url || "", // Mapped to logo image
      // These are now handled within vendor.store.links or vendor.store.profileURL/avatarURL
      // instagramHandle: "",
      // lookbookURL: "",
      // highlightedImages: [],
    }

    // Transform products to Ribbon schema
    const products = await Promise.all(
      allProducts.map(async (product: any) => {
        // Get inventory levels for variants
        const variantInventory: { [key: string]: number } = {}

        if (product.variants && product.variants.length > 0) {
          try {
            const inventoryResponse = await fetch(
              `${baseUrl}/inventory_levels.json?inventory_item_ids=${product.variants.map((v: any) => v.inventory_item_id).join(",")}`,
              { headers },
            )

            if (inventoryResponse.ok) {
              const inventoryData = await inventoryResponse.json()
              inventoryData.inventory_levels?.forEach((level: any) => {
                const variant = product.variants.find((v: any) => v.inventory_item_id === level.inventory_item_id)
                if (variant) {
                  variantInventory[variant.id] = level.available || 0
                }
              })
            }
          } catch (error) {
            console.warn("Failed to fetch inventory for product:", product.id)
          }
        }

        const mainVariant = product.variants?.[0] || {}
        const totalStock =
          Object.values(variantInventory).reduce((sum: number, qty: number) => sum + qty, 0) ||
          product.variants?.reduce((sum: number, variant: any) => sum + (variant.inventory_quantity || 0), 0) ||
          0

        const ribbonProduct = {
          name: product.title || "Untitled Product",
          description: product.body_html
            ? product.body_html.replace(/<[^>]*>/g, "").trim() || product.title
            : product.title || "No description available",
          imagesURL: product.images?.map((img: any) => img.src) || [],
          price: Number.parseFloat(mainVariant.price || "0"),
          wholesale: Number.parseFloat(mainVariant.compare_at_price || mainVariant.price || "0"),
          sku: mainVariant.sku || `${product.handle}-${product.id}`,
          availability: product.status === "active" && totalStock > 0 ? "In Stock" : "Out of Stock",
          category: product.product_type ? [product.product_type] : ["General"],
          stock: totalStock,
          qty: 1, // minimum order quantity
          maxQty: 0, // unlimited
          productETA: "",
          type: product.status === "active" ? 0 : 1, // 0 = published, 1 = draft
          currencyCode: shopData.shop.currency || "USD",
          productType: product.tags ? product.tags.split(",").map((tag: string) => tag.trim()) : [],
          taxStatus: mainVariant.taxable ? "taxable" : "none",
          isShopifySyncedProduct: true,
          shopifyProductInfo: {
            product_id: product.id.toString(),
            variant_id: mainVariant.id?.toString() || "",
          },
          tags: product.tags || "",
          shortDescription: product.title || "",
          catalogVisibility: product.status === "active" ? "visible" : "hidden",
          inStock: totalStock > 0 ? "yes" : "no",
          outOfStock: totalStock <= 0 ? 1 : 0,
          published: product.status === "active" ? 1 : 0,
        }

        // Add variant information if multiple variants exist
        if (product.variants && product.variants.length > 1) {
          ribbonProduct.variantInfo = {
            options:
              product.options?.map((option: any) => ({
                key: option.name,
                value: option.values.join(","),
              })) || [],
            variants: product.variants.map((variant: any) => {
              const variantStock = variantInventory[variant.id] || variant.inventory_quantity || 0
              return {
                sku: variant.sku || `${product.handle}-${variant.id}`,
                variantImage: variant.image_id
                  ? product.images?.find((img: any) => img.id === variant.image_id)?.src || ""
                  : "",
                facets: [],
                options: [variant.option1, variant.option2, variant.option3].filter(Boolean),
                availability: variantStock > 0 ? "In Stock" : "Out of Stock",
                qty: 1,
                maxQty: 0,
                price: Number.parseFloat(variant.price || "0"),
                wholesale: Number.parseFloat(variant.compare_at_price || variant.price || "0"),
                stock: variantStock,
                inActive: variantStock <= 0 ? 1 : 0,
                color: [],
                room: [],
                origin: [],
                values: [],
                materials: [],
                collectionFacet: [],
                type: 0,
                upc: variant.barcode || "",
                categoryFacet: [],
                priceFacet: [],
                size: [],
                gallery: [],
                artist: [],
                galleryCity: [],
                galleryCountry: [],
                yearFacet: [],
                paymentFacet: [],
                shopifyProductInfo: {
                  variant_id: variant.id.toString(),
                },
              }
            }),
          }
        }

        return ribbonProduct
      }),
    )

    const validProducts = products.filter((p) => p.name && p.name !== "Untitled Product")

    // NEW: Populate curatedImages with the first 6 valid product images
    vendor.store.curatedImages = validProducts
      .flatMap((p) => p.imagesURL)
      .filter(Boolean)
      .slice(0, 6)
      .map((imageSrc) => ({
        imageSrc: imageSrc,
        callToAction: "#", // Default CTA, can be made editable if needed
      }))

    console.log(`Transformed ${validProducts.length} valid products`)

    return NextResponse.json({
      vendor,
      products: validProducts,
      summary: {
        totalProducts: validProducts.length,
        totalValue: validProducts.reduce((sum: number, p: any) => sum + (p.price || 0), 0),
        currency: shopData.shop.currency || "USD",
        shopName: shopData.shop.name,
        shopDomain: shopData.shop.domain,
      },
    })
  } catch (error) {
    console.error("Shopify API Error:", error)
    return NextResponse.json(
      {
        error: "Failed to process Shopify data. Please check your credentials and try again.",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
