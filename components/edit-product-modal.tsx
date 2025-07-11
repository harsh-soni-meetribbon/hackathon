"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { motion } from "framer-motion"
import { Save, X, Plus, Package, ImageIcon, Tag } from "lucide-react"

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

interface EditProductModalProps {
  isOpen: boolean
  onClose: () => void
  product: ProductData
  onSave: (updatedProduct: ProductData) => void
}

export function EditProductModal({ isOpen, onClose, product, onSave }: EditProductModalProps) {
  const [formData, setFormData] = useState<ProductData>(product)
  const [isSaving, setIsSaving] = useState(false)
  const [newCategory, setNewCategory] = useState("")
  const [newImageUrl, setNewImageUrl] = useState("")

  const handleInputChange = (field: keyof ProductData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleVariantChange = (variantIndex: number, field: string, value: any) => {
    if (!formData.variantInfo) return

    const updatedVariants = [...formData.variantInfo.variants]
    updatedVariants[variantIndex] = { ...updatedVariants[variantIndex], [field]: value }

    setFormData((prev) => ({
      ...prev,
      variantInfo: {
        ...prev.variantInfo!,
        variants: updatedVariants,
      },
    }))
  }

  const addCategory = () => {
    if (newCategory.trim() && !formData.category.includes(newCategory.trim())) {
      setFormData((prev) => ({
        ...prev,
        category: [...prev.category, newCategory.trim()],
      }))
      setNewCategory("")
    }
  }

  const removeCategory = (categoryToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      category: prev.category.filter((cat) => cat !== categoryToRemove),
    }))
  }

  const addImageUrl = () => {
    if (newImageUrl.trim() && !formData.imagesURL.includes(newImageUrl.trim())) {
      setFormData((prev) => ({
        ...prev,
        imagesURL: [...prev.imagesURL, newImageUrl.trim()],
      }))
      setNewImageUrl("")
    }
  }

  const removeImageUrl = (urlToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      imagesURL: prev.imagesURL.filter((url) => url !== urlToRemove),
    }))
  }

  const handleSave = async () => {
    setIsSaving(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))
    onSave(formData)
    setIsSaving(false)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white/95 backdrop-blur-sm border-0 shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
            Edit Product
          </DialogTitle>
          <DialogDescription className="text-base text-gray-600">
            Update product information and variants
          </DialogDescription>
        </DialogHeader>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="media">Media & Categories</TabsTrigger>
              <TabsTrigger value="variants">Variants</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-6 mt-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Product Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-gray-700 font-medium">
                      Product Name *
                    </Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      className="h-11 border-2 border-gray-200 focus:border-purple-500 transition-all duration-300"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sku" className="text-gray-700 font-medium">
                      SKU *
                    </Label>
                    <Input
                      id="sku"
                      value={formData.sku}
                      onChange={(e) => handleInputChange("sku", e.target.value)}
                      className="h-11 border-2 border-gray-200 focus:border-purple-500 transition-all duration-300"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="price" className="text-gray-700 font-medium">
                      Price *
                    </Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => handleInputChange("price", Number.parseFloat(e.target.value) || 0)}
                      className="h-11 border-2 border-gray-200 focus:border-purple-500 transition-all duration-300"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="wholesale" className="text-gray-700 font-medium">
                      Wholesale Price
                    </Label>
                    <Input
                      id="wholesale"
                      type="number"
                      step="0.01"
                      value={formData.wholesale || ""}
                      onChange={(e) => handleInputChange("wholesale", Number.parseFloat(e.target.value) || undefined)}
                      className="h-11 border-2 border-gray-200 focus:border-purple-500 transition-all duration-300"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="stock" className="text-gray-700 font-medium">
                      Stock Quantity
                    </Label>
                    <Input
                      id="stock"
                      type="number"
                      value={formData.stock}
                      onChange={(e) => handleInputChange("stock", Number.parseInt(e.target.value) || 0)}
                      className="h-11 border-2 border-gray-200 focus:border-purple-500 transition-all duration-300"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="qty" className="text-gray-700 font-medium">
                      Minimum Quantity
                    </Label>
                    <Input
                      id="qty"
                      type="number"
                      value={formData.qty || ""}
                      onChange={(e) => handleInputChange("qty", Number.parseInt(e.target.value) || undefined)}
                      className="h-11 border-2 border-gray-200 focus:border-purple-500 transition-all duration-300"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description" className="text-gray-700 font-medium">
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    className="min-h-[100px] border-2 border-gray-200 focus:border-purple-500 transition-all duration-300"
                    placeholder="Describe the product features and benefits..."
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="media" className="space-y-6 mt-6">
              {/* Images */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2 flex items-center">
                  <ImageIcon className="h-5 w-5 mr-2" />
                  Product Images
                </h3>
                <div className="space-y-3">
                  <div className="flex space-x-2">
                    <Input
                      placeholder="Enter image URL"
                      value={newImageUrl}
                      onChange={(e) => setNewImageUrl(e.target.value)}
                      className="flex-1"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault()
                          addImageUrl()
                        }
                      }}
                    />
                    <Button onClick={addImageUrl} size="sm">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {formData.imagesURL.map((url, index) => (
                      <div key={index} className="relative group">
                        <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                          <img
                            src={url || "/placeholder.svg"}
                            alt={`Product ${index + 1}`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement
                              target.src = "/placeholder.svg?height=150&width=150"
                            }}
                          />
                        </div>
                        <Button
                          size="sm"
                          variant="destructive"
                          className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => removeImageUrl(url)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Categories */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2 flex items-center">
                  <Tag className="h-5 w-5 mr-2" />
                  Categories
                </h3>
                <div className="space-y-3">
                  <div className="flex space-x-2">
                    <Input
                      placeholder="Add category"
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      className="flex-1"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault()
                          addCategory()
                        }
                      }}
                    />
                    <Button onClick={addCategory} size="sm">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.category.map((cat, index) => (
                      <Badge key={index} variant="secondary" className="flex items-center space-x-1">
                        <span>{cat}</span>
                        <button onClick={() => removeCategory(cat)} className="ml-1 hover:text-red-500">
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="variants" className="space-y-6 mt-6">
              {/* Variants */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2 flex items-center">
                  <Package className="h-5 w-5 mr-2" />
                  Product Variants
                </h3>
                {formData.variantInfo && formData.variantInfo.variants.length > 0 ? (
                  <div className="space-y-4">
                    {formData.variantInfo.variants.map((variant, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-gray-900">
                            Variant {index + 1}: {variant.options.join(", ")}
                          </h4>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div className="space-y-1">
                            <Label className="text-sm">SKU</Label>
                            <Input
                              value={variant.sku}
                              onChange={(e) => handleVariantChange(index, "sku", e.target.value)}
                              className="h-9"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-sm">Price</Label>
                            <Input
                              type="number"
                              step="0.01"
                              value={variant.price}
                              onChange={(e) =>
                                handleVariantChange(index, "price", Number.parseFloat(e.target.value) || 0)
                              }
                              className="h-9"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-sm">Stock</Label>
                            <Input
                              type="number"
                              value={variant.stock}
                              onChange={(e) =>
                                handleVariantChange(index, "stock", Number.parseInt(e.target.value) || 0)
                              }
                              className="h-9"
                            />
                          </div>
                        </div>
                        {variant.wholesale !== undefined && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <Label className="text-sm">Wholesale Price</Label>
                              <Input
                                type="number"
                                step="0.01"
                                value={variant.wholesale || ""}
                                onChange={(e) =>
                                  handleVariantChange(
                                    index,
                                    "wholesale",
                                    Number.parseFloat(e.target.value) || undefined,
                                  )
                                }
                                className="h-9"
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-sm">UPC</Label>
                              <Input
                                value={variant.upc || ""}
                                onChange={(e) => handleVariantChange(index, "upc", e.target.value)}
                                className="h-9"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Package className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No variants found for this product</p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>

        <DialogFooter className="flex gap-3 pt-6">
          <Button
            variant="outline"
            onClick={onClose}
            className="px-6 py-2 border-2 border-gray-200 hover:border-gray-300 transition-all duration-300 bg-transparent"
          >
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 transition-all duration-300"
            >
              {isSaving ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                    className="h-4 w-4 mr-2"
                  >
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                  </motion.div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </motion.div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
