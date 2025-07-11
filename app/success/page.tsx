"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, Store, Package, Users, BarChart3, ExternalLink, Copy } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"

interface ImportResults {
  vendorCreated: boolean
  productsImported: number
  productsFailed: number
  totalProducts: number
  vendorId?: string
  agencyId?: string
}

export default function SuccessPage() {
  const [importResults, setImportResults] = useState<ImportResults | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const results = sessionStorage.getItem("importResults")
    if (results) {
      try {
        setImportResults(JSON.parse(results))
      } catch (error) {
        console.error("Failed to parse import results:", error)
      }
    }
  }, [])

  const stats = importResults || {
    vendorCreated: true,
    productsImported: 0,
    productsFailed: 0,
    totalProducts: 0,
  }

  const copyVendorId = () => {
    if (stats.vendorId) {
      navigator.clipboard.writeText(stats.vendorId)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 right-20 w-96 h-96 bg-green-200 rounded-full mix-blend-multiply filter blur-xl opacity-30"
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 20,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          }}
        />
        <motion.div
          className="absolute bottom-20 left-20 w-96 h-96 bg-emerald-200 rounded-full mix-blend-multiply filter blur-xl opacity-30"
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [360, 180, 0],
          }}
          transition={{
            duration: 25,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          }}
        />
      </div>

      <div className="w-full max-w-4xl space-y-8 relative z-10">
        {/* Success Header */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, type: "spring", stiffness: 100 }}
          className="text-center space-y-6"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 10 }}
          >
            <div className="relative">
              <CheckCircle className="h-20 w-20 text-green-600 mx-auto drop-shadow-lg" />
              <motion.div
                className="absolute inset-0 rounded-full border-4 border-green-400"
                initial={{ scale: 1, opacity: 1 }}
                animate={{ scale: 2, opacity: 0 }}
                transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
              />
            </div>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-5xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent"
          >
            Import Complete!
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-xl text-gray-700 max-w-2xl mx-auto"
          >
            Your Shopify store has been successfully imported to Ribbon in under 60 seconds
          </motion.p>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6"
        >
          {[
            {
              icon: Store,
              value: 1,
              label: "Vendor Profile",
              color: "from-blue-500 to-cyan-500",
            },
            {
              icon: Package,
              value: stats.productsImported,
              label: "Products Imported",
              color: "from-green-500 to-emerald-500",
            },
            { icon: Users, value: 0, label: "Buyers Reached", color: "from-purple-500 to-pink-500" },
            { icon: BarChart3, value: "$0", label: "Revenue Generated", color: "from-orange-500 to-red-500" },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 0.7 + index * 0.1, type: "spring", stiffness: 100 }}
              whileHover={{ scale: 1.05, y: -5 }}
            >
              <Card className="text-center shadow-xl hover:shadow-2xl transition-all duration-300 bg-white/80 backdrop-blur-sm border-0">
                <CardContent className="pt-6 pb-6">
                  <motion.div
                    className={`w-16 h-16 bg-gradient-to-r ${stat.color} rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg`}
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                  >
                    <stat.icon className="h-8 w-8 text-white" />
                  </motion.div>
                  <motion.div
                    key={stat.value}
                    initial={{ scale: 1.5 }}
                    animate={{ scale: 1 }}
                    className="text-3xl font-bold text-gray-900 mb-2"
                  >
                    {stat.value}
                  </motion.div>
                  <p className="text-sm text-gray-600 font-medium">{stat.label}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Import Summary */}
        {importResults && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.0 }}>
            <Card className="shadow-xl bg-white/90 backdrop-blur-sm border-0">
              <CardHeader>
                <CardTitle className="text-2xl bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                  Import Summary
                </CardTitle>
                <CardDescription className="text-base">Details of your successful import to Ribbon</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.1 }}
                    className="space-y-3"
                  >
                    <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                      <strong>Total Products:</strong>
                      <span className="text-blue-600 font-semibold">{stats.totalProducts || stats.productsImported}</span>
                    </div>
                    <div className="flex justify-between p-3 bg-green-50 rounded-lg">
                      <strong>Successfully Imported:</strong>
                      <span className="text-green-600 font-semibold">{stats.productsImported}</span>
                    </div>
                    {stats.productsFailed > 0 && (
                      <div className="flex justify-between p-3 bg-amber-50 rounded-lg">
                        <strong>Failed:</strong>
                        <span className="text-amber-600 font-semibold">{stats.productsFailed}</span>
                      </div>
                    )}
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.2 }}
                    className="space-y-3"
                  >
                    <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                      <strong>Vendor Profile:</strong>
                      <span className="text-green-600 font-semibold">{"Created"}</span>
                    </div>
                    <div className="flex justify-between p-3 bg-purple-50 rounded-lg">
                      <strong>Import Time:</strong>
                      <span className="text-purple-600 font-semibold">Under 60 seconds</span>
                    </div>
                    {stats.vendorId && (
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                          <strong>Vendor ID:</strong>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={copyVendorId}
                            className="h-6 px-2 text-xs bg-transparent"
                          >
                            {copied ? <CheckCircle className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                          </Button>
                        </div>
                        <code className="text-xs text-blue-700 bg-blue-100 px-2 py-1 rounded break-all">
                          {stats.vendorId}
                        </code>
                      </div>
                    )}
                  </motion.div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Next Steps */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.3 }}>
          <Card className="shadow-2xl bg-white/90 backdrop-blur-sm border-0">
            <CardHeader>
              <CardTitle className="text-2xl bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                What's Next?
              </CardTitle>
              <CardDescription className="text-base">
                Your store is now live on Ribbon! Here are some recommended next steps to maximize your success.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.4 }}
                  className="space-y-4"
                >
                  <h3 className="font-bold text-xl text-gray-900 flex items-center">
                    <div className="w-6 h-6 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full mr-3"></div>
                    Immediate Actions
                  </h3>
                  <ul className="space-y-3 text-sm">
                    {[
                      "Review your vendor profile in Ribbon",
                      "Check product listings and pricing",
                      "Set up payment and shipping preferences",
                      "Upload additional product images",
                    ].map((item, index) => (
                      <motion.li
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 1.5 + index * 0.1 }}
                        className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors duration-200"
                      >
                        <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                        <span className="text-gray-700">{item}</span>
                      </motion.li>
                    ))}
                  </ul>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.6 }}
                  className="space-y-4"
                >
                  <h3 className="font-bold text-xl text-gray-900 flex items-center">
                    <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mr-3"></div>
                    Growth Opportunities
                  </h3>
                  <ul className="space-y-3 text-sm">
                    {[
                      "Connect with potential buyers",
                      "Join relevant trade shows",
                      "Optimize product descriptions",
                      "Set up automated inventory sync",
                    ].map((item, index) => (
                      <motion.li
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 1.7 + index * 0.1 }}
                        className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors duration-200"
                      >
                        <div className="h-5 w-5 border-2 border-purple-400 rounded flex-shrink-0" />
                        <span className="text-gray-700">{item}</span>
                      </motion.li>
                    ))}
                  </ul>
                </motion.div>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 2.0 }}
                className="flex flex-col justify-center items-end sm:flex-row gap-4 pt-6"
              >
                {[
                  { href: "/", text: "Go Back", primary: false },
                  { href: `http://localhost:9088/VendorStores/Home/${stats.vendorId}`, text: "Go to Ribbon Dashboard", primary: true, external: true },
                  // { href: "/", text: "Import Another Store", primary: false },
                ].map((button, index) => (
                  <motion.div
                    key={button.text}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex-1 max-w-[300px]"
                  >
                    <Button
                      asChild={!button.external}
                      onClick={button.external ? () => window.open(button.href, "_blank") : undefined}
                      className={`w-full h-12 text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-300 ${
                        button.primary
                          ? "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                          : "bg-white hover:bg-gray-50 text-gray-700 border-2 border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      {button.external ? (
                        <span className="flex items-center">
                          {button.text}
                          <ExternalLink className="ml-2 h-4 w-4" />
                        </span>
                      ) : (
                        <Link href={button.href}>{button.text}</Link>
                      )}
                    </Button>
                  </motion.div>
                ))}
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Support */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 2.2 }}>
          <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-0 shadow-lg">
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <h3 className="font-bold text-xl text-gray-900">Need Help?</h3>
                <p className="text-gray-700">Our support team is here to help you succeed on Ribbon</p>
                <div className="flex justify-center space-x-4 pt-4">
                  {["Contact Support", "View Documentation", "Join Community"].map((text, index) => (
                    <motion.div key={text} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-white/80 hover:bg-white shadow-md hover:shadow-lg transition-all duration-300"
                      >
                        {text}
                      </Button>
                    </motion.div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
