"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { motion } from "framer-motion"
import { Save, X, Link, Instagram } from "lucide-react"

interface VendorData {
  brandName: string
  email: string
  description: string
  webSite: string
  currencyCode: string
  address?: string
  address2?: string
  city: string
  state: string
  zipCode: string
  country: string
  tel?: string
  firstName?: string
  lastName?: string
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

interface EditVendorModalProps {
  isOpen: boolean
  onClose: () => void
  vendor: VendorData
  onSave: (updatedVendor: VendorData) => void
}

export function EditVendorModal({ isOpen, onClose, vendor, onSave }: EditVendorModalProps) {
  // Initialize form data, extracting instagramHandle and lookbookURL from links for easier editing
  const [formData, setFormData] = useState<VendorData>(() => {
    const instagramLink = vendor?.store?.links?.find((link) => link.linkName === "Instagram") || "";
    const lookbookLink = vendor?.store?.links?.find((link) => link.linkName === "Lookbook") || "";
    return {
      ...vendor,
      // Temporarily store these as direct properties for form binding
      instagramHandle: instagramLink ? instagramLink?.linkValue?.replace("https://instagram.com/", "@") : "",
      lookbookURL: lookbookLink ? lookbookLink?.linkValue : vendor?.store?.lookbookURL || "",
    } as VendorData & { instagramHandle?: string; lookbookURL?: string }
  })
  const [isSaving, setIsSaving] = useState(false)

  const handleInputChange = (field: keyof VendorData | string, value: string) => {
    if (field === "instagramHandle" || field === "lookbookURL") {
      setFormData((prev) => ({ ...prev, [field]: value }))
    } else if (field.startsWith("store.")) {
      const path = field.split(".")
      setFormData((prev) => {
        const current: any = { ...prev }
        let nested = current
        for (let i = 0; i < path.length - 1; i++) {
          nested[path[i]] = { ...nested[path[i]] }
          nested = nested[path[i]]
        }
        nested[path[path.length - 1]] = value
        return current
      })
    } else {
      setFormData((prev) => ({ ...prev, [field]: value }))
    }
  }

  const handleSave = async () => {
    setIsSaving(true)

    // Reconstruct the links array before saving
    const updatedLinks = formData.store.links.filter(
      (link) => link.linkName !== "Instagram" && link.linkName !== "Lookbook",
    )
    if (formData?.instagramHandle && formData?.instagramHandle?.trim() !== "") {
      updatedLinks.push({
        linkName: "Instagram",
        linkValue: `https://instagram.com/${formData.instagramHandle.replace(/^@/, "")}`,
      })
    }
    if (formData?.lookbookURL && formData?.lookbookURL.trim() !== "") {
      updatedLinks.push({ linkName: "Lookbook", linkValue: formData.lookbookURL })
    }

    const finalVendorData: VendorData = {
      ...formData,
      store: {
        ...formData.store,
        links: updatedLinks,
        lookbookURL: formData?.lookbookURL, // Ensure lookbookURL is also stored directly in store object if needed by Ribbon
      },
    }

    // Remove temporary fields before saving
    delete (finalVendorData as any).instagramHandle
    delete (finalVendorData as any).lookbookURL

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))
    onSave(finalVendorData)
    setIsSaving(false)
    onClose()
  }

  const lookBookURL = (formData as any)?.store?.lookBookURL || (formData as any)?.store?.lookbookURL;

  console.log({lookBookURL})

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white/95 backdrop-blur-sm border-0 shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
            Edit Vendor Profile
          </DialogTitle>
          <DialogDescription className="text-base text-gray-600">
            Update your vendor information and store details
          </DialogDescription>
        </DialogHeader>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-6"
        >
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="brandName" className="text-gray-700 font-medium">
                  Brand Name *
                </Label>
                <Input
                  id="brandName"
                  value={formData.brandName}
                  onChange={(e) => handleInputChange("brandName", e.target.value)}
                  className="h-11 border-2 border-gray-200 focus:border-purple-500 transition-all duration-300"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-700 font-medium">
                  Email *
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className="h-11 border-2 border-gray-200 focus:border-purple-500 transition-all duration-300"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-gray-700 font-medium">
                  First Name
                </Label>
                <Input
                  id="firstName"
                  value={formData.firstName || ""}
                  onChange={(e) => handleInputChange("firstName", e.target.value)}
                  className="h-11 border-2 border-gray-200 focus:border-purple-500 transition-all duration-300"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-gray-700 font-medium">
                  Last Name
                </Label>
                <Input
                  id="lastName"
                  value={formData.lastName || ""}
                  onChange={(e) => handleInputChange("lastName", e.target.value)}
                  className="h-11 border-2 border-gray-200 focus:border-purple-500 transition-all duration-300"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="webSite" className="text-gray-700 font-medium">
                  Website
                </Label>
                <Input
                  id="webSite"
                  type="url"
                  value={formData.webSite}
                  onChange={(e) => handleInputChange("webSite", e.target.value)}
                  className="h-11 border-2 border-gray-200 focus:border-purple-500 transition-all duration-300"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tel" className="text-gray-700 font-medium">
                  Phone
                </Label>
                <Input
                  id="tel"
                  type="tel"
                  value={formData.tel || ""}
                  onChange={(e) => handleInputChange("tel", e.target.value)}
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
                placeholder="Describe your brand and what makes it unique..."
              />
            </div>
          </div>

          {/* Brand Assets & Socials */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Brand Assets & Socials</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="avatarURL" className="text-gray-700 font-medium">
                  Logo URL (from Shopify)
                </Label>
                <div className="flex items-center space-x-2">
                  {formData.avatarURL && (
                    <img
                      src={formData.avatarURL || "/placeholder.svg"}
                      alt="Logo"
                      className="h-10 w-10 object-contain rounded-md"
                    />
                  )}
                  <Input
                    id="avatarURL"
                    value={formData.avatarURL || ""}
                    onChange={(e) => handleInputChange("avatarURL", e.target.value)}
                    className="h-11 border-2 border-gray-200 focus:border-purple-500 transition-all duration-300"
                    readOnly // Sourced from Shopify, not directly editable here
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="profileURL" className="text-gray-700 font-medium">
                  Cover Image URL (from Shopify)
                </Label>
                <div className="flex items-center space-x-2">
                  {formData?.store?.profileURL && (
                    <img
                      src={formData?.store?.profileURL || "/placeholder.svg"}
                      alt="Cover"
                      className="h-10 w-10 object-cover rounded-md"
                    />
                  )}
                  <Input
                    id="profileURL"
                    value={formData?.store?.profileURL || ""}
                    onChange={(e) => handleInputChange("store.profileURL", e.target.value)}
                    className="h-11 border-2 border-gray-200 focus:border-purple-500 transition-all duration-300"
                    readOnly // Sourced from Shopify, not directly editable here
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="instagramHandle" className="text-gray-700 font-medium">
                  Instagram Handle
                </Label>
                <div className="relative">
                  <Instagram className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="instagramHandle"
                    value={(formData as any).instagramHandle || ""}
                    onChange={(e) => handleInputChange("instagramHandle", e.target.value)}
                    className="h-11 border-2 border-gray-200 focus:border-purple-500 transition-all duration-300 pl-10"
                    placeholder="@yourbrand"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="lookbookURL" className="text-gray-700 font-medium">
                  Lookbook URL
                </Label>
                <div className="relative">
                  <Link className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="lookbookURL"
                    type="url"
                    value={typeof lookBookURL === "string" ? lookBookURL : Array.isArray(lookBookURL) ? lookBookURL?.[0]?.imageSrc : ""}
                    onChange={(e) => handleInputChange("lookbookURL", e.target.value)}
                    className="h-11 border-2 border-gray-200 focus:border-purple-500 transition-all duration-300 pl-10"
                    placeholder="https://yourbrand.com/lookbook"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Address Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Address Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="address" className="text-gray-700 font-medium">
                  Address Line 1
                </Label>
                <Input
                  id="address"
                  value={formData?.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  className="h-11 border-2 border-gray-200 focus:border-purple-500 transition-all duration-300"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="address2" className="text-gray-700 font-medium">
                  Address Line 2
                </Label>
                <Input
                  id="address2"
                  value={formData.address2 || ""}
                  onChange={(e) => handleInputChange("address2", e.target.value)}
                  className="h-11 border-2 border-gray-200 focus:border-purple-500 transition-all duration-300"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city" className="text-gray-700 font-medium">
                  City
                </Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => handleInputChange("city", e.target.value)}
                  className="h-11 border-2 border-gray-200 focus:border-purple-500 transition-all duration-300"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state" className="text-gray-700 font-medium">
                  State/Province
                </Label>
                <Input
                  id="state"
                  value={formData.state}
                  onChange={(e) => handleInputChange("state", e.target.value)}
                  className="h-11 border-2 border-gray-200 focus:border-purple-500 transition-all duration-300"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="zipCode" className="text-gray-700 font-medium">
                  ZIP/Postal Code
                </Label>
                <Input
                  id="zipCode"
                  value={formData.zipCode}
                  onChange={(e) => handleInputChange("zipCode", e.target.value)}
                  className="h-11 border-2 border-gray-200 focus:border-purple-500 transition-all duration-300"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="country" className="text-gray-700 font-medium">
                  Country
                </Label>
                <Input
                  id="country"
                  value={formData.country}
                  onChange={(e) => handleInputChange("country", e.target.value)}
                  className="h-11 border-2 border-gray-200 focus:border-purple-500 transition-all duration-300"
                />
              </div>
            </div>
          </div>

          {/* Business Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Business Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="currencyCode" className="text-gray-700 font-medium">
                  Currency Code
                </Label>
                <Input
                  id="currencyCode"
                  value={formData.currencyCode}
                  onChange={(e) => handleInputChange("currencyCode", e.target.value)}
                  className="h-11 border-2 border-gray-200 focus:border-purple-500 transition-all duration-300"
                  placeholder="USD, EUR, GBP, etc."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="priceRange" className="text-gray-700 font-medium">
                  Price Range
                </Label>
                <Input
                  id="priceRange"
                  value={formData?.store?.priceRange || ""}
                  onChange={(e) => handleInputChange("store.priceRange", e.target.value)}
                  className="h-11 border-2 border-gray-200 focus:border-purple-500 transition-all duration-300"
                  placeholder="e.g., $50 - $500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="paymentTerms" className="text-gray-700 font-medium">
                  Payment Terms
                </Label>
                <Input
                  id="paymentTerms"
                  value={formData.store?.paymentTerms || ""}
                  onChange={(e) => handleInputChange("store.paymentTerms", e.target.value)}
                  className="h-11 border-2 border-gray-200 focus:border-purple-500 transition-all duration-300"
                  placeholder="e.g., Net 30, Credit Card"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="shippingPolicy" className="text-gray-700 font-medium">
                  Shipping Policy
                </Label>
                <Input
                  id="shippingPolicy"
                  value={formData.store?.shippingPolicy || ""}
                  onChange={(e) => handleInputChange("store.shippingPolicy", e.target.value)}
                  className="h-11 border-2 border-gray-200 focus:border-purple-500 transition-all duration-300"
                  placeholder="e.g., Standard rates apply"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="estimatedShipTimes" className="text-gray-700 font-medium">
                  Estimated Ship Times
                </Label>
                <Input
                  id="estimatedShipTimes"
                  value={formData.store?.estimatedShipTimes || ""}
                  onChange={(e) => handleInputChange("store.estimatedShipTimes", e.target.value)}
                  className="h-11 border-2 border-gray-200 focus:border-purple-500 transition-all duration-300"
                  placeholder="e.g., 3-5 business days"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="returnsAndExchanges" className="text-gray-700 font-medium">
                  Returns & Exchanges
                </Label>
                <Input
                  id="returnsAndExchanges"
                  value={formData.store?.returnsAndExchanges || ""}
                  onChange={(e) => handleInputChange("store.returnsAndExchanges", e.target.value)}
                  className="h-11 border-2 border-gray-200 focus:border-purple-500 transition-all duration-300"
                  placeholder="e.g., 30-day return policy"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="vendorHighlightMessage" className="text-gray-700 font-medium">
                  Vendor Highlight Message
                </Label>
                <Input
                  id="vendorHighlightMessage"
                  value={formData.store?.vendorHighlightMessage || ""}
                  onChange={(e) => handleInputChange("store.vendorHighlightMessage", e.target.value)}
                  className="h-11 border-2 border-gray-200 focus:border-purple-500 transition-all duration-300"
                  placeholder="e.g., Quality products with fast shipping"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="vendorNotes" className="text-gray-700 font-medium">
                  Vendor Notes
                </Label>
                <Textarea
                  id="vendorNotes"
                  value={formData.store?.vendorNotes || ""}
                  onChange={(e) => handleInputChange("store.vendorNotes", e.target.value)}
                  className="min-h-[80px] border-2 border-gray-200 focus:border-purple-500 transition-all duration-300"
                  placeholder="Any additional notes about the vendor..."
                />
              </div>
            </div>
          </div>
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
