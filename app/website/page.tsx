"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Globe, Search, CheckCircle, AlertCircle, Loader2, ArrowLeft, Sparkles, Zap, Brain } from "lucide-react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"

export default function WebsitePage() {
  const [url, setUrl] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState("")
  const [isValidUrl, setIsValidUrl] = useState(false)
  const router = useRouter()

  const validateUrl = (inputUrl: string) => {
    try {
      new URL(inputUrl)
      setIsValidUrl(true)
      setError("")
    } catch {
      setIsValidUrl(false)
      if (inputUrl.length > 0) {
        setError("Please enter a valid URL (e.g., https://example.com)")
      }
    }
  }

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputUrl = e.target.value
    setUrl(inputUrl)
    validateUrl(inputUrl)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!url || !isValidUrl) {
      setError("Please enter a valid website URL")
      return
    }

    setIsProcessing(true)
    setProgress(0)
    setError("")

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 15
        })
      }, 300)

      const response = await fetch("/api/website/process", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
      })

      clearInterval(progressInterval)
      setProgress(100)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to process website")
      }

      const result = await response.json()

      // Store processed data
      sessionStorage.setItem("processedData", JSON.stringify(result))
      sessionStorage.setItem("importType", "website")

      // Navigate to preview
      setTimeout(() => {
        router.push("/preview")
      }, 1000)
    } catch (err) {
      console.error("Website processing error:", err)
      setError(err instanceof Error ? err.message : "An error occurred while processing the website")
      setProgress(0)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-green-900 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-green-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-emerald-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-teal-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
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
                <Globe className="h-10 w-10 text-white drop-shadow-lg" />
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full animate-pulse"></div>
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-green-200 bg-clip-text text-transparent">
                Website Import
              </h1>
            </motion.div>
          </div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-xl text-green-100"
          >
            Enter a website URL and let AI extract vendor and product information
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex items-center justify-center space-x-8 text-sm text-green-200"
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2"
            >
              <Sparkles className="h-4 w-4 text-yellow-400" />
              <span>AI Powered</span>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2"
            >
              <Brain className="h-4 w-4 text-purple-400" />
              <span>Smart Analysis</span>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2"
            >
              <Zap className="h-4 w-4 text-green-400" />
              <span>Auto Extract</span>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* URL Input Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <Card className="shadow-2xl bg-white/95 backdrop-blur-sm border-0 overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500"></div>
            <CardHeader className="pb-6">
              <CardTitle className="text-2xl bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                Enter Website URL
              </CardTitle>
              <CardDescription className="text-gray-600 text-base">
                Provide the URL of the website you want to analyze. Our AI will extract vendor information and product
                details.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      type="url"
                      placeholder="https://example.com"
                      value={url}
                      onChange={handleUrlChange}
                      className="pl-10 h-12 text-lg border-2 border-gray-200 focus:border-green-500 rounded-xl"
                      disabled={isProcessing}
                    />
                    {isValidUrl && url && (
                      <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-green-500" />
                    )}
                  </div>
                </div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Alert variant="destructive" className="border-red-200 bg-red-50">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription className="text-red-700">{error}</AlertDescription>
                    </Alert>
                  </motion.div>
                )}

                {isProcessing && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <Loader2 className="h-5 w-5 animate-spin text-green-600" />
                      <span className="text-gray-700 font-medium">Analyzing website...</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                    <p className="text-sm text-gray-600">AI is extracting vendor and product information</p>
                  </motion.div>
                )}

                {!isProcessing && (
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <Button
                      type="submit"
                      disabled={!isValidUrl || !url}
                      className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 transition-all duration-300 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Search className="mr-3 h-5 w-5" />
                      Analyze Website
                    </Button>
                  </motion.div>
                )}
              </form>
            </CardContent>
          </Card>
        </motion.div>

        {/* Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="text-xl bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                What We Extract
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-900">Vendor Information:</h4>
                  <ul className="space-y-1 text-gray-600">
                    <li>• Brand name and description</li>
                    <li>• Contact information</li>
                    <li>• Business address</li>
                    <li>• Website and social links</li>
                  </ul>
                </div>
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-900">Product Details:</h4>
                  <ul className="space-y-1 text-gray-600">
                    <li>• Product names and descriptions</li>
                    <li>• Pricing information</li>
                    <li>• Product categories</li>
                    <li>• Images and specifications</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
