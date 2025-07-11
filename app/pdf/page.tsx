"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Upload, FileText, CheckCircle, AlertCircle, Loader2, ArrowLeft, Sparkles, Zap, Brain } from "lucide-react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"

export default function PDFPage() {
  const [file, setFile] = useState<File | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState("")
  const [isDragOver, setIsDragOver] = useState(false)
  const router = useRouter()

  const handleFileSelect = (selectedFile: File) => {
    if (!selectedFile.type.includes("pdf")) {
      setError("Please select a valid PDF file")
      return
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      setError("File size must be less than 10MB")
      return
    }

    setFile(selectedFile)
    setError("")
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)

    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile) {
      handleFileSelect(droppedFile)
    }
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      handleFileSelect(selectedFile)
    }
  }

  const handleSubmit = async () => {
    if (!file) return

    setIsProcessing(true)
    setProgress(0)
    setError("")

    try {
      const formData = new FormData()
      formData.append("file", file)

      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 400)

      const response = await fetch("/api/pdf/process", {
        method: "POST",
        body: formData,
      })

      clearInterval(progressInterval)
      setProgress(100)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to process PDF file")
      }

      const result = await response.json()

      // Store processed data
      sessionStorage.setItem("processedData", JSON.stringify(result))
      sessionStorage.setItem("importType", "pdf")

      // Navigate to preview
      setTimeout(() => {
        router.push("/preview")
      }, 1000)
    } catch (err) {
      console.error("PDF processing error:", err)
      setError(err instanceof Error ? err.message : "An error occurred while processing the file")
      setProgress(0)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-red-900 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-red-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-orange-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
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
                <FileText className="h-10 w-10 text-white drop-shadow-lg" />
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-red-400 to-pink-400 rounded-full animate-pulse"></div>
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-red-200 bg-clip-text text-transparent">
                PDF Import
              </h1>
            </motion.div>
          </div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-xl text-red-100"
          >
            Upload your PDF catalog and let AI extract vendor and product data
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex items-center justify-center space-x-8 text-sm text-red-200"
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
              <span>OCR & Analysis</span>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2"
            >
              <Zap className="h-4 w-4 text-green-400" />
              <span>Smart Extract</span>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Upload Area */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <Card className="shadow-2xl bg-white/95 backdrop-blur-sm border-0 overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 via-pink-500 to-orange-500"></div>
            <CardHeader className="pb-6">
              <CardTitle className="text-2xl bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                Upload Your PDF File
              </CardTitle>
              <CardDescription className="text-gray-600 text-base">
                Upload your product catalog, brochure, or any PDF document. Our AI will extract vendor information and
                product details.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {!file ? (
                <motion.div
                  initial={{ scale: 0.95 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.5 }}
                  className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${
                    isDragOver
                      ? "border-red-500 bg-red-50 scale-105"
                      : "border-gray-300 hover:border-red-400 hover:bg-red-50/50"
                  }`}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                >
                  <div className="space-y-4">
                    <div className="flex justify-center">
                      <div
                        className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                          isDragOver
                            ? "bg-red-500 scale-110"
                            : "bg-gradient-to-r from-red-500 to-pink-500 hover:scale-110"
                        }`}
                      >
                        <Upload className="h-8 w-8 text-white" />
                      </div>
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-gray-900 mb-2">
                        {isDragOver ? "Drop your PDF file here" : "Drag & drop your PDF file here"}
                      </p>
                      <p className="text-gray-600 mb-4">or click to browse files</p>
                      <input type="file" accept=".pdf" onChange={handleFileInput} className="hidden" id="file-input" />
                      <label htmlFor="file-input">
                        <Button
                          type="button"
                          variant="outline"
                          className="bg-white border-2 border-red-200 text-red-700 hover:bg-red-50 hover:border-red-300"
                          asChild
                        >
                          <span className="cursor-pointer">
                            <FileText className="mr-2 h-4 w-4" />
                            Choose PDF File
                          </span>
                        </Button>
                      </label>
                    </div>
                    <p className="text-xs text-gray-500">Maximum file size: 10MB</p>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  className="bg-green-50 border-2 border-green-200 rounded-xl p-6"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                      <FileText className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{file.name}</p>
                      {/* <p className="text-sm text-gray-600">{(file.size / 1024 / 1024 ).toFixed(2)} B</p> */}
                    </div>
                    <CheckCircle className="h-6 w-6 text-green-500" />
                  </div>
                </motion.div>
              )}

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
                    <Loader2 className="h-5 w-5 animate-spin text-red-600" />
                    <span className="text-gray-700 font-medium">Processing your PDF file...</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                  <p className="text-sm text-gray-600">AI is reading and analyzing your document</p>
                </motion.div>
              )}

              {file && !isProcessing && (
                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
                  <Button
                    onClick={handleSubmit}
                    className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 transition-all duration-300 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
                  >
                    <Sparkles className="mr-3 h-5 w-5" />
                    Process with AI
                  </Button>
                </motion.div>
              )}
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
                PDF Processing Features
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-900">Supported Content:</h4>
                  <ul className="space-y-1 text-gray-600">
                    <li>• Product catalogs</li>
                    <li>• Company brochures</li>
                    <li>• Price lists</li>
                    <li>• Vendor information sheets</li>
                    <li>• Trade show materials</li>
                  </ul>
                </div>
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-900">AI Capabilities:</h4>
                  <ul className="space-y-1 text-gray-600">
                    <li>• OCR text extraction</li>
                    <li>• Smart data recognition</li>
                    <li>• Product categorization</li>
                    <li>• Price detection</li>
                    <li>• Contact info extraction</li>
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
