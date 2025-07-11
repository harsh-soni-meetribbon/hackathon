"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Store, Zap, CheckCircle, Sparkles, ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"

export default function ShopifyPage() {
  const [shopifyUrl, setShopifyUrl] = useState("")
  const [adminToken, setAdminToken] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      // Validate Shopify URL format
      const urlPattern = /^https:\/\/[a-zA-Z0-9-]+\.myshopify\.com$/
      if (!urlPattern.test(shopifyUrl)) {
        throw new Error("Please enter a valid Shopify store URL (e.g., https://your-store.myshopify.com)")
      }

      if (!adminToken.trim()) {
        throw new Error("Admin token is required")
      }

      // Store credentials in sessionStorage for the next step
      sessionStorage.setItem(
        "shopifyCredentials",
        JSON.stringify({
          url: shopifyUrl,
          token: adminToken,
        }),
      )

      sessionStorage.setItem("importType", "shopify")

      // Navigate to processing page
      router.push("/process")
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="w-full max-w-2xl space-y-8 relative z-10">
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
                <Store className="h-10 w-10 text-white drop-shadow-lg" />
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full animate-pulse"></div>
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
                Shopify Import
              </h1>
            </motion.div>
          </div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-xl text-purple-100"
          >
            Connect your Shopify store and import everything in 60 seconds
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex items-center justify-center space-x-8 text-sm text-purple-200"
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2"
            >
              <Zap className="h-4 w-4 text-yellow-400" />
              <span>Lightning Fast</span>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2"
            >
              <CheckCircle className="h-4 w-4 text-green-400" />
              <span>AI Powered</span>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2"
            >
              <Store className="h-4 w-4 text-blue-400" />
              <span>Complete Import</span>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Main Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <Card className="shadow-2xl bg-white/95 backdrop-blur-sm border-0 overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500"></div>
            <CardHeader className="pb-6">
              <CardTitle className="text-2xl bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                Connect Your Shopify Store
              </CardTitle>
              <CardDescription className="text-gray-600 text-base">
                Enter your Shopify store details to begin the import process. We'll pull your store information,
                products, and transform everything to match Ribbon's format.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="space-y-2"
                >
                  <Label htmlFor="shopify-url" className="text-gray-700 font-medium">
                    Shopify Store URL
                  </Label>
                  <div className="relative">
                    <Input
                      id="shopify-url"
                      type="url"
                      placeholder="https://your-store.myshopify.com"
                      value={shopifyUrl}
                      onChange={(e) => setShopifyUrl(e.target.value)}
                      required
                      className="pl-10 h-12 border-2 border-gray-200 focus:border-purple-500 transition-all duration-300 rounded-xl"
                    />
                    <Store className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  </div>
                </motion.div>

                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="space-y-2"
                >
                  <Label htmlFor="admin-token" className="text-gray-700 font-medium">
                    Admin API Token
                  </Label>
                  <div className="relative">
                    <Input
                      id="admin-token"
                      type="password"
                      placeholder="shpat_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                      value={adminToken}
                      onChange={(e) => setAdminToken(e.target.value)}
                      required
                      className="pl-10 h-12 border-2 border-gray-200 focus:border-purple-500 transition-all duration-300 rounded-xl"
                    />
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"></div>
                  </div>
                  <p className="text-xs text-gray-500 ml-1">
                    Your token needs read permissions for products, shop, and inventory
                  </p>
                </motion.div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Alert variant="destructive" className="border-red-200 bg-red-50">
                      <AlertDescription className="text-red-700">{error}</AlertDescription>
                    </Alert>
                  </motion.div>
                )}

                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.7 }}>
                  <Button
                    type="submit"
                    className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 transition-all duration-300 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                        <span className="animate-pulse">Connecting...</span>
                      </>
                    ) : (
                      <>
                        <Zap className="mr-3 h-5 w-5" />
                        Start Import Process
                      </>
                    )}
                  </Button>
                </motion.div>
              </form>
            </CardContent>
          </Card>
        </motion.div>

        {/* How it works */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="text-xl bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                How it works
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                {[
                  {
                    step: 1,
                    title: "Connect Store",
                    description: "Securely connect your Shopify store",
                    icon: <Store className="h-5 w-5" />,
                    color: "from-blue-500 to-cyan-500",
                  },
                  {
                    step: 2,
                    title: "AI Processing",
                    description: "AI transforms your data to Ribbon format",
                    icon: <Sparkles className="h-5 w-5" />,
                    color: "from-purple-500 to-pink-500",
                  },
                  {
                    step: 3,
                    title: "Review & Import",
                    description: "Preview and approve your vendor profile",
                    icon: <CheckCircle className="h-5 w-5" />,
                    color: "from-green-500 to-emerald-500",
                  },
                ].map((item, index) => (
                  <motion.div
                    key={item.step}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 + index * 0.1 }}
                    whileHover={{ scale: 1.05, y: -5 }}
                    className="text-center space-y-3 p-4 rounded-xl hover:bg-white/50 transition-all duration-300"
                  >
                    <div
                      className={`w-12 h-12 bg-gradient-to-r ${item.color} rounded-full flex items-center justify-center mx-auto shadow-lg`}
                    >
                      <div className="text-white">{item.icon}</div>
                    </div>
                    <p className="font-semibold text-gray-900">{item.title}</p>
                    <p className="text-gray-600">{item.description}</p>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
