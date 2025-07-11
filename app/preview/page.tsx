"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Package,
  ArrowLeft,
  ShoppingBag,
  FileSpreadsheet,
  Globe,
  FileText,
  Loader2,
  CheckCircle,
  AlertCircle,
  Edit,
  Eye,
  Upload,
  User,
  Building,
  Mail,
  Phone,
  MapPin,
  ExternalLink,
  DollarSign,
  Package2,
  Tag,
  ImageIcon,
  Instagram,
  Link,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { EditVendorModal } from "@/components/edit-vendor-modal"
import { EditProductModal } from "@/components/edit-product-modal"

interface Vendor {
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

interface Product {
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

interface ProcessedData {
  vendor: Vendor
  products: Product[]
}

export default function PreviewPage() {
  const [data, setData] = useState<ProcessedData | null>(null)
  const [importType, setImportType] = useState<string>("")
  const [isImporting, setIsImporting] = useState(false)
  const [importProgress, setImportProgress] = useState(0)
  const [importError, setImportError] = useState("")
  const [importSuccess, setImportSuccess] = useState(false)
  const [editVendorModalOpen, setEditVendorModalOpen] = useState(false)
  const [editProductModalOpen, setEditProductModalOpen] = useState(false)
  const [selectedProductIndex, setSelectedProductIndex] = useState<number | null>(null)
  const [emailModalOpen, setEmailModalOpen] = useState(false)
  const [tempEmail, setTempEmail] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [productsPerPage] = useState(6)
  const router = useRouter()

  useEffect(() => {
    const storedData = sessionStorage.getItem("processedData")
    const storedImportType = sessionStorage.getItem("importType")

    if (!storedData) {
      router.push("/")
      return
    }

    try {
      const parsedData = JSON.parse(storedData)
      setData(parsedData)
      setImportType(storedImportType || "unknown")
    } catch (err) {
      console.error("Error parsing stored data:", err)
      router.push("/")
    }
  }, [router])

  const handleImport = async () => {
    if (!data) return

    // Check if email is missing
    if (!data.vendor.email || data.vendor.email.trim() === "") {
      setEmailModalOpen(true)
      return
    }

    await performImport()
  }

  const handleEmailSubmit = async () => {
    if (!tempEmail.trim()) {
      return
    }

    // Update vendor email
    const updatedData = {
      ...data!,
      vendor: {
        ...data!.vendor,
        email: tempEmail.trim(),
      },
    }
    setData(updatedData)
    sessionStorage.setItem("processedData", JSON.stringify(updatedData))
    setEmailModalOpen(false)
    setTempEmail("")

    await performImport()
  }

  const performImport = async () => {
    if (!data) return

    setIsImporting(true)
    setImportProgress(0)
    setImportError("")
    setImportSuccess(false)

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setImportProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 200)

      const response = await fetch("/api/ribbon/import", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      clearInterval(progressInterval)
      setImportProgress(100)

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Failed to import to Ribbon")
      }

      // Store import results
      sessionStorage.setItem("importResults", JSON.stringify(result))
      setImportSuccess(true)

      // Navigate to success page
      setTimeout(() => {
        router.push("/success")
      }, 2000)
    } catch (err) {
      console.error("Import error:", err)
      setImportError(err instanceof Error ? err.message : "An error occurred during import")
      setImportProgress(0)
    } finally {
      setIsImporting(false)
    }
  }

  const handleVendorSave = (updatedVendor: Vendor) => {
    if (!data) return
    const updatedData = { ...data, vendor: updatedVendor }
    setData(updatedData)
    sessionStorage.setItem("processedData", JSON.stringify(updatedData))
  }

  const handleProductSave = (updatedProduct: Product) => {
    if (selectedProductIndex === null || !data) return
    const updatedProducts = [...data.products]
    updatedProducts[selectedProductIndex] = updatedProduct
    const updatedData = { ...data, products: updatedProducts }
    setData(updatedData)
    sessionStorage.setItem("processedData", JSON.stringify(updatedData))
  }

  const openProductEdit = (index: number) => {
    setSelectedProductIndex(index)
    setEditProductModalOpen(true)
  }

  const getImportIcon = () => {
    switch (importType) {
      case "shopify":
        return <ShoppingBag className="h-5 w-5" />
      case "csv":
        return <FileSpreadsheet className="h-5 w-5" />
      case "website":
        return <Globe className="h-5 w-5" />
      case "pdf":
        return <FileText className="h-5 w-5" />
      default:
        return <Package className="h-5 w-5" />
    }
  }

  const getImportLabel = () => {
    switch (importType) {
      case "shopify":
        return "Shopify Import"
      case "csv":
        return "CSV Import"
      case "website":
        return "Website Import"
      case "pdf":
        return "PDF Import"
      default:
        return "Data Import"
    }
  }

  const getImportColor = () => {
    switch (importType) {
      case "shopify":
        return "from-green-500 to-emerald-500"
      case "csv":
        return "from-blue-500 to-cyan-500"
      case "website":
        return "from-green-500 to-teal-500"
      case "pdf":
        return "from-red-500 to-pink-500"
      default:
        return "from-purple-500 to-pink-500"
    }
  }

  // Pagination logic
  const indexOfLastProduct = currentPage * productsPerPage
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage
  const currentProducts = data?.products.slice(indexOfFirstProduct, indexOfLastProduct) || []
  const totalPages = Math.ceil((data?.products.length || 0) / productsPerPage)

  // Extract Instagram and Lookbook URLs for display
  const instagramLink = data?.vendor?.store?.links?.find((link) => link.linkName === "Instagram") || "";
  const lookbookLink = data?.vendor?.store?.links?.find((link) => link.linkName === "Lookbook") || "";

  if (!data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center text-white">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading preview...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="max-w-7xl mx-auto space-y-8 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center space-y-4"
        >
          <div className="flex items-center justify-center space-x-4 mb-6">
            <Button
              variant="outline"
              size="icon"
              onClick={() => router.push("/")}
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex items-center justify-center space-x-2"
            >
              <div className="relative">
                <Package className="h-10 w-10 text-white drop-shadow-lg" />
                <div
                  className={`absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r ${getImportColor()} rounded-full animate-pulse`}
                ></div>
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
                Import Preview
              </h1>
            </motion.div>
          </div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex items-center justify-center space-x-2"
          >
            <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
              {getImportIcon()}
              <span className="ml-2">{getImportLabel()}</span>
            </Badge>
          </motion.div>
        </motion.div>

        {/* Vendor Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <Card className="shadow-2xl bg-white/95 backdrop-blur-sm border-0">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                  Vendor Information
                </CardTitle>
                <Button variant="outline" size="sm" onClick={() => setEditVendorModalOpen(true)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Cover and Logo Images */}
              {(data?.vendor?.store?.profileURL || data?.vendor?.avatarURL) && (
                <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
                  {data.vendor.avatarURL && (
                    <div className="flex flex-col items-center">
                      <img
                        src={data?.vendor?.avatarURL || "/placeholder.svg"}
                        alt="Brand Logo"
                        className="h-20 w-20 object-contain rounded-full border border-gray-200 p-1"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.src = "/placeholder.svg?height=80&width=80"
                        }}
                      />
                      <span className="text-xs text-gray-500 mt-1">Logo</span>
                    </div>
                  )}
                  {data?.vendor?.store?.profileURL && (
                    <div className="flex flex-col items-center">
                      <img
                        src={data?.vendor?.store?.profileURL || "/placeholder.svg"}
                        alt="Brand Cover"
                        className="h-20 w-40 object-cover rounded-md border border-gray-200"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.src = "/placeholder.svg?height=80&width=160"
                        }}
                      />
                      <span className="text-xs text-gray-500 mt-1">Cover Image</span>
                    </div>
                  )}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Building className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">Brand Name</p>
                      <p className="font-semibold text-gray-900">{data.vendor.brandName || "Not specified"}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <User className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">Contact Person</p>
                      <p className="font-semibold text-gray-900">
                        {`${data.vendor.firstName || ""} ${data.vendor.lastName || ""}`.trim() || "Not specified"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Mail className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">
                        Email {!data.vendor.email && <span className="text-red-500">*Required</span>}
                      </p>
                      <p className={`font-semibold ${!data.vendor.email ? "text-red-600" : "text-gray-900"}`}>
                        {data.vendor.email || "Not specified - Required for import"}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Phone className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">Phone</p>
                      <p className="font-semibold text-gray-900">
                        {data?.vendor?.phone || data?.vendor?.tel || "Not specified"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <MapPin className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">Address</p>
                      <p className="font-semibold text-gray-900">
                        {[
                          data?.vendor?.address,
                          data?.vendor?.city,
                          data?.vendor?.state,
                          data?.vendor?.zipCode,
                          data?.vendor?.country,
                        ]
                          .filter(Boolean)
                          .join(", ") || "Not specified"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <ExternalLink className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">Website</p>
                      <p className="font-semibold text-gray-900">{data.vendor.webSite || "Not specified"}</p>
                    </div>
                  </div>
                </div>
              </div>
              {data.vendor.description && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm text-gray-500 mb-2">Description</p>
                    <p className="text-gray-700">{data.vendor.description}</p>
                  </div>
                </>
              )}
              {/* Instagram and Lookbook */}
              {(instagramLink || lookbookLink) && (
                <>
                  <Separator />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {instagramLink && (
                      <div className="flex items-center space-x-3">
                        <Instagram className="h-5 w-5 text-gray-500" />
                        <div>
                          <p className="text-sm text-gray-500">Instagram</p>
                          <a
                            href={instagramLink.linkValue}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-semibold text-blue-600 hover:underline"
                          >
                            {instagramLink.linkValue.replace("https://instagram.com/", "@")}
                          </a>
                        </div>
                      </div>
                    )}
                    {lookbookLink && (
                      <div className="flex items-center space-x-3">
                        <Link className="h-5 w-5 text-gray-500" />
                        <div>
                          <p className="text-sm text-gray-500">Lookbook</p>
                          <a
                            href={lookbookLink.linkValue}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-semibold text-blue-600 hover:underline"
                          >
                            View Lookbook
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
              {/* Highlighted Images (Curated Images) */}
              {data?.vendor?.store?.curatedImages && data?.vendor?.store?.curatedImages?.length > 0 && (
                <>
                  <Separator />
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Highlighted Images</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                      {data.vendor.store.curatedImages.map((img, index) => (
                        <div
                          key={index}
                          className="aspect-square relative overflow-hidden rounded-md border border-gray-200"
                        >
                          <img
                            src={img.imageSrc || "/placeholder.svg"}
                            alt={`Highlighted ${index + 1}`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement
                              target.src = "/placeholder.svg?height=100&width=100"
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Products Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          <Card className="shadow-2xl bg-white/95 backdrop-blur-sm border-0">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                    Products ({data.products.length})
                  </CardTitle>
                  <CardDescription className="text-gray-600">
                    Review and edit product information before importing
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Products Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                {currentProducts.map((product, index) => {
                  const actualIndex = indexOfFirstProduct + index
                  return (
                    <motion.div
                      key={actualIndex}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      className="group relative bg-white rounded-xl border border-gray-200 hover:border-purple-300 hover:shadow-lg transition-all duration-300 overflow-hidden"
                    >
                      {/* Product Image */}
                      <div className="aspect-square bg-gradient-to-br from-gray-50 to-gray-100 relative overflow-hidden">
                        {product.imagesURL && product.imagesURL.length > 0 ? (
                          <img
                            src={product.imagesURL[0] || "/placeholder.svg"}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement
                              target.style.display = "none"
                              target.nextElementSibling?.classList.remove("hidden")
                            }}
                          />
                        ) : null}
                        <div
                          className={`${product.imagesURL && product.imagesURL.length > 0 ? "hidden" : ""} absolute inset-0 flex items-center justify-center`}
                        >
                          <ImageIcon className="h-12 w-12 text-gray-400" />
                        </div>

                        {/* Action Buttons */}
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 space-y-2">
                          <Button
                            size="sm"
                            variant="secondary"
                            className="h-8 w-8 p-0 bg-white/90 hover:bg-white"
                            onClick={() => openProductEdit(actualIndex)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="secondary" className="h-8 w-8 p-0 bg-white/90 hover:bg-white">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>

                        {/* Stock Badge */}
                        {product.stock && <div className="absolute top-2 left-2">
                          <Badge variant={product.stock > 0 ? "default" : "destructive"} className="text-xs">
                            {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
                          </Badge>
                        </div>}
                      </div>

                      {/* Product Info */}
                      <div className="p-4 space-y-3">
                        <div>
                          <h3 className="font-semibold text-gray-900 line-clamp-2 mb-1">{product.name}</h3>
                          <p className="text-sm text-gray-600 line-clamp-2">{product.description}</p>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2">
                              <DollarSign className="h-4 w-4 text-green-600" />
                              <span className="font-bold text-green-600">${product?.price?.toFixed(2)}</span>
                              {product.wholesale && product.wholesale !== product.price && (
                                <span className="text-sm text-gray-500 line-through">
                                  ${product.wholesale.toFixed(2)}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center space-x-2 text-sm text-gray-500">
                              <Package2 className="h-3 w-3" />
                              <span>SKU: {product.sku}</span>
                            </div>
                          </div>
                        </div>

                        {/* Categories */}
                        {product.category && product.category.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {product.category.slice(0, 2).map((cat, catIndex) => (
                              <Badge key={catIndex} variant="outline" className="text-xs">
                                <Tag className="h-3 w-3 mr-1" />
                                {cat}
                              </Badge>
                            ))}
                            {product.category.length > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{product.category.length - 2} more
                              </Badge>
                            )}
                          </div>
                        )}

                        {/* Variants Info */}
                        {product.variantInfo && product.variantInfo.variants.length > 1 && (
                          <div className="pt-2 border-t border-gray-100">
                            <Badge variant="secondary" className="text-xs">
                              {product.variantInfo.variants.length} variants available
                            </Badge>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )
                })}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <div className="flex space-x-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(page)}
                        className="w-8 h-8 p-0"
                      >
                        {page}
                      </Button>
                    ))}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Import Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7 }}
        >
          <Card className="shadow-2xl bg-white/95 backdrop-blur-sm border-0">
            <CardContent className="p-6">
              {importError && (
                <Alert variant="destructive" className="mb-6">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{importError}</AlertDescription>
                </Alert>
              )}

              {importSuccess && (
                <Alert className="mb-6 border-green-200 bg-green-50">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-700">
                    Import completed successfully! Redirecting to results...
                  </AlertDescription>
                </Alert>
              )}

              {!data.vendor.email && (
                <Alert className="mb-6 border-orange-200 bg-orange-50">
                  <AlertCircle className="h-4 w-4 text-orange-600" />
                  <AlertDescription className="text-orange-700">
                    Vendor email is required for import. Please edit the vendor information to add an email address.
                  </AlertDescription>
                </Alert>
              )}

              {isImporting && (
                <div className="space-y-4 mb-6">
                  <div className="flex items-center space-x-3">
                    <Loader2 className="h-5 w-5 animate-spin text-purple-600" />
                    <span className="text-gray-700 font-medium">Importing to Ribbon...</span>
                  </div>
                  <Progress value={importProgress} className="h-2" />
                  <p className="text-sm text-gray-600">Processing vendor and product data</p>
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  <p>Ready to import:</p>
                  <p className="font-semibold">
                    1 vendor • {data.products.length} products •{" "}
                    {data.products.reduce((total, product) => total + (product.variantInfo?.variants.length || 1), 0)}{" "}
                    variants
                  </p>
                </div>
                <Button
                  onClick={handleImport}
                  disabled={isImporting || importSuccess}
                  className={`h-12 px-8 text-lg font-semibold bg-gradient-to-r ${getImportColor()} hover:opacity-90 transition-all duration-300 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {isImporting ? (
                    <>
                      <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                      Importing...
                    </>
                  ) : importSuccess ? (
                    <>
                      <CheckCircle className="mr-3 h-5 w-5" />
                      Import Complete
                    </>
                  ) : (
                    <>
                      <Upload className="mr-3 h-5 w-5" />
                      Import to Ribbon
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Email Modal */}
      <Dialog open={emailModalOpen} onOpenChange={setEmailModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Email Required</DialogTitle>
            <DialogDescription>
              A vendor email address is required for importing to Ribbon. Please provide an email address to continue.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="vendor@example.com"
                value={tempEmail}
                onChange={(e) => setTempEmail(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && tempEmail.trim()) {
                    handleEmailSubmit()
                  }
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEmailModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEmailSubmit} disabled={!tempEmail.trim()}>
              Continue Import
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Modals */}
      {editVendorModalOpen && data && (
        <EditVendorModal
          isOpen={editVendorModalOpen}
          onClose={() => setEditVendorModalOpen(false)}
          vendor={data.vendor}
          onSave={handleVendorSave}
        />
      )}

      {editProductModalOpen && selectedProductIndex !== null && data && (
        <EditProductModal
          isOpen={editProductModalOpen}
          onClose={() => {
            setEditProductModalOpen(false)
            setSelectedProductIndex(null)
          }}
          product={data.products[selectedProductIndex]}
          onSave={handleProductSave}
        />
      )}
    </div>
  )
}
