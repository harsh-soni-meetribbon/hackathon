"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { CheckCircle, Loader2, Store, Package, User, Sparkles } from "lucide-react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"

interface ProcessStep {
  id: string
  title: string
  description: string
  status: "pending" | "processing" | "completed" | "error"
  icon: React.ReactNode
}

export default function ProcessPage() {
  const [steps, setSteps] = useState<ProcessStep[]>([
    {
      id: "connect",
      title: "Connecting to Shopify",
      description: "Establishing secure connection to your store",
      status: "pending",
      icon: <Store className="h-5 w-5" />,
    },
    {
      id: "fetch",
      title: "Fetching Store Data",
      description: "Retrieving store information and products",
      status: "pending",
      icon: <Package className="h-5 w-5" />,
    },
    {
      id: "transform",
      title: "AI Data Transformation",
      description: "Converting data to Ribbon schema format",
      status: "pending",
      icon: <Sparkles className="h-5 w-5" />,
    },
    {
      id: "profile",
      title: "Building Vendor Profile",
      description: "Creating your vendor profile and product catalog",
      status: "pending",
      icon: <User className="h-5 w-5" />,
    },
  ])

  const [currentStep, setCurrentStep] = useState(0)
  const [progress, setProgress] = useState(0)
  const router = useRouter()
  const [importType, setImportType] = useState<"shopify" | "csv">("shopify")

  useEffect(() => {
    // Check if credentials exist for Shopify or if it's CSV import
    const credentials = sessionStorage.getItem("shopifyCredentials")
    const type = sessionStorage.getItem("importType") || "shopify"
    setImportType(type as "shopify" | "csv")

    if (type === "csv") {
      // For CSV, data should already be processed, go directly to preview
      const processedData = sessionStorage.getItem("processedData")
      if (processedData) {
        router.push("/preview")
        return
      } else {
        router.push("/csv")
        return
      }
    }

    if (!credentials) {
      router.push("/")
      return
    }

    // Continue with existing Shopify processing logic...

    const { url, token } = JSON.parse(credentials)

    // Process steps with real API calls
    const processSteps = async () => {
      try {
        for (let i = 0; i < steps.length; i++) {
          // Update current step to processing
          setSteps((prev) =>
            prev.map((step, index) => ({
              ...step,
              status: index === i ? "processing" : index < i ? "completed" : "pending",
            })),
          )
          setCurrentStep(i)
          setProgress((i / steps.length) * 100)

          // Real processing based on step
          if (i === 0) {
            // Step 1: Connect to Shopify - just wait a moment for UI
            await new Promise((resolve) => setTimeout(resolve, 1000))
          } else if (i === 1) {
            // Step 2: Fetch real data from Shopify
            const response = await fetch("/api/shopify", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                shopifyUrl: url,
                adminToken: token,
              }),
            })

            if (!response.ok) {
              throw new Error("Failed to fetch Shopify data")
            }

            const shopifyData = await response.json()
            sessionStorage.setItem("processedData", JSON.stringify(shopifyData))
          } else {
            // Steps 3-4: AI transformation and profile building
            await new Promise((resolve) => setTimeout(resolve, 1500))
          }

          // Mark step as completed
          setSteps((prev) =>
            prev.map((step, index) => ({
              ...step,
              status: index <= i ? "completed" : "pending",
            })),
          )
        }

        setProgress(100)

        // Navigate to preview after completion
        setTimeout(() => {
          router.push("/preview")
        }, 1000)
      } catch (error) {
        console.error("Processing error:", error)
        // Handle error - could show error state or redirect back
        setSteps((prev) =>
          prev.map((step, index) => ({
            ...step,
            status: index === currentStep ? "error" : step.status,
          })),
        )
      }
    }

    processSteps()
  }, [router, steps.length])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
      </div>

      <div className="w-full max-w-2xl space-y-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center space-y-4"
        >
          <motion.h1
            className="text-4xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent"
            animate={{
              backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
            }}
            transition={{
              duration: 3,
              repeat: Number.POSITIVE_INFINITY,
              ease: "linear",
            }}
          >
            Processing Your Store
          </motion.h1>
          <p className="text-purple-100 text-lg">Our AI is working its magic to transform your Shopify data</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <Card className="shadow-2xl bg-white/95 backdrop-blur-sm border-0 overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500"></div>
            <CardHeader>
              <CardTitle className="flex items-center space-x-3">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                >
                  <Loader2 className="h-6 w-6 text-purple-600" />
                </motion.div>
                <span className="bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                  Import in Progress
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="space-y-3">
                <div className="flex justify-between text-sm font-medium">
                  <span className="text-gray-700">Overall Progress</span>
                  <motion.span
                    key={Math.round(progress)}
                    initial={{ scale: 1.2 }}
                    animate={{ scale: 1 }}
                    className="text-purple-600"
                  >
                    {Math.round(progress)}%
                  </motion.span>
                </div>
                <div className="relative">
                  <Progress value={progress} className="h-3 bg-gray-200" />
                  <motion.div
                    className="absolute top-0 left-0 h-3 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                  />
                </div>
              </div>

              <div className="space-y-6">
                {steps.map((step, index) => (
                  <motion.div
                    key={step.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center space-x-4"
                  >
                    <motion.div
                      className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center shadow-lg ${
                        step.status === "completed"
                          ? "bg-gradient-to-r from-green-500 to-emerald-500"
                          : step.status === "processing"
                            ? "bg-gradient-to-r from-purple-500 to-pink-500"
                            : "bg-gray-200"
                      }`}
                      whileHover={{ scale: 1.1 }}
                      animate={
                        step.status === "processing"
                          ? {
                              boxShadow: [
                                "0 0 0 0 rgba(168, 85, 247, 0.4)",
                                "0 0 0 10px rgba(168, 85, 247, 0)",
                                "0 0 0 0 rgba(168, 85, 247, 0)",
                              ],
                            }
                          : {}
                      }
                      transition={{
                        duration: 1.5,
                        repeat: step.status === "processing" ? Number.POSITIVE_INFINITY : 0,
                      }}
                    >
                      {step.status === "completed" ? (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        >
                          <CheckCircle className="h-6 w-6 text-white" />
                        </motion.div>
                      ) : step.status === "processing" ? (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                        >
                          <Loader2 className="h-6 w-6 text-white" />
                        </motion.div>
                      ) : (
                        <div className="text-gray-500">{step.icon}</div>
                      )}
                    </motion.div>
                    <div className="flex-1">
                      <h3
                        className={`font-semibold transition-colors duration-300 ${
                          step.status === "processing" ? "text-purple-600" : "text-gray-900"
                        }`}
                      >
                        {step.title}
                      </h3>
                      <p className="text-sm text-gray-600">{step.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-xl border border-blue-100"
              >
                <p className="text-sm text-blue-800">
                  <strong className="text-purple-700">Did you know?</strong> Our AI can process thousands of products
                  and automatically categorize them, optimize descriptions, and ensure all data meets Ribbon's quality
                  standards.
                </p>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
