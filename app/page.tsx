"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  ShoppingBag,
  FileSpreadsheet,
  Globe,
  FileText,
  ArrowRight,
  Sparkles,
  Zap,
  Shield,
  Clock,
  CheckCircle,
  Star,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"

export default function HomePage() {
  const router = useRouter()
  const [hoveredCard, setHoveredCard] = useState<string | null>(null)

  const importOptions = [
    {
      id: "shopify",
      title: "Shopify Store",
      description: "Connect your existing Shopify store and import all products automatically",
      icon: <ShoppingBag className="h-8 w-8" />,
      features: ["Live product sync", "Inventory tracking", "Order history", "Automatic updates"],
      color: "from-emerald-500 to-teal-600",
      bgGradient: "from-emerald-50 to-teal-50",
      route: "/shopify",
      // badge: "Most Popular",
      badgeColor: "bg-emerald-500",
      complexity: "Easy",
      time: "2-5 min",
    },
    {
      id: "csv",
      title: "CSV Upload",
      description: "Upload your product catalog in CSV format and let AI structure it perfectly",
      icon: <FileSpreadsheet className="h-8 w-8" />,
      features: ["AI-powered parsing", "Smart field mapping", "Bulk import", "Flexible format"],
      color: "from-blue-500 to-indigo-600",
      bgGradient: "from-blue-50 to-indigo-50",
      route: "/csv",
      // badge: "AI Powered",
      badgeColor: "bg-blue-500",
      complexity: "Easy",
      time: "3-7 min",
    },
    {
      id: "website",
      title: "Website URL",
      description: "Enter your website URL and let AI extract your brand and product information",
      icon: <Globe className="h-8 w-8" />,
      features: ["Website scraping", "Brand extraction", "Product discovery", "Auto-categorization"],
      color: "from-purple-500 to-violet-600",
      bgGradient: "from-purple-50 to-violet-50",
      route: "/website",
      // badge: "Smart",
      badgeColor: "bg-purple-500",
      complexity: "Easy",
      time: "5-10 min",
    },
    {
      id: "pdf",
      title: "PDF Line Sheet",
      description: "Upload your PDF line sheet and AI will extract all product details automatically",
      icon: <FileText className="h-8 w-8" />,
      features: ["PDF text extraction", "Image recognition", "Price parsing", "Variant detection"],
      color: "from-orange-500 to-red-600",
      bgGradient: "from-orange-50 to-red-50",
      route: "/pdf",
      // badge: "Advanced",
      badgeColor: "bg-orange-500",
      complexity: "Medium",
      time: "7-12 min",
    },
  ]

  const stats = [
    { label: "Vendors Onboarded", value: "3,500+", icon: <ShoppingBag className="h-5 w-5" /> },
    { label: "Products Imported", value: "1.5M+", icon: <FileSpreadsheet className="h-5 w-5" /> },
    { label: "Success Rate", value: "99.8%", icon: <CheckCircle className="h-5 w-5" /> },
    { label: "Avg. Import Time", value: "< 1 min", icon: <Clock className="h-5 w-5" /> },
  ]

  useEffect(() => {
    sessionStorage.clear();
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] -z-10"></div>

      {/* Floating Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-float"></div>
        <div className="absolute bottom-20 right-20 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-float animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float animation-delay-4000"></div>
      </div>

      <div className="relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center pt-16 pb-8 px-4"
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="max-w-4xl mx-auto space-y-6"
          >
            <div className="flex items-center justify-center space-x-3 mb-6">
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Sparkles className="h-8 w-8 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center">
                  <Star className="h-3 w-3 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent">
                  Ribbon Import Hub
                </h1>
                <p className="text-lg text-gray-600 mt-2">Powered by Advanced AI</p>
              </div>
            </div>

            <p className="text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
              Transform your product catalog into a professional Ribbon vendor profile. Choose from multiple import
              methods, all powered by cutting-edge AI technology.
            </p>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex flex-wrap items-center justify-center gap-4 text-sm"
            >
              {[
                { icon: <Zap className="h-4 w-4" />, text: "Lightning Fast", color: "text-yellow-600" },
                { icon: <Shield className="h-4 w-4" />, text: "Enterprise Secure", color: "text-green-600" },
                { icon: <Sparkles className="h-4 w-4" />, text: "AI Powered", color: "text-purple-600" },
                { icon: <CheckCircle className="h-4 w-4" />, text: "99.8% Success Rate", color: "text-blue-600" },
              ].map((item, index) => (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.05 }}
                  className="flex items-center space-x-2 bg-white/80 backdrop-blur-sm rounded-full px-4 py-2 shadow-sm border border-gray-200"
                >
                  <span className={item.color}>{item.icon}</span>
                  <span className="text-gray-700 font-medium">{item.text}</span>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="max-w-6xl mx-auto px-4 mb-16"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                whileHover={{ scale: 1.05, y: -2 }}
                className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 text-center shadow-lg border border-gray-200"
              >
                <div className="flex items-center justify-center mb-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                    <span className="text-white">{stat.icon}</span>
                  </div>
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Import Options */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="max-w-7xl mx-auto px-4 mb-16"
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Choose Your Import Method</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Select the method that works best for your business. All options use advanced AI to ensure perfect data
              transformation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            {importOptions.map((option, index) => (
              <motion.div
                key={option.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + index * 0.1 }}
                whileHover={{ scale: 1.02, y: -5 }}
                onHoverStart={() => setHoveredCard(option.id)}
                onHoverEnd={() => setHoveredCard(null)}
                className="group cursor-pointer"
              >
                <Card className="h-full bg-white/90 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden">
                  <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${option.color}`}></div>

                  {/* Badge */}
                  {option?.badge && <div className="absolute top-4 right-4 z-10">
                    <Badge className={`${option.badgeColor} text-white border-0 shadow-lg text-xs px-2 py-1`}>
                      {option.badge}
                    </Badge>
                  </div>}

                  <CardHeader className="pb-4 pt-6">
                    <div className="flex items-start space-x-4 mb-4">
                      <div
                        className={`w-14 h-14 bg-gradient-to-r ${option.color} rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}
                      >
                        <div className="text-white">{option.icon}</div>
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-xl text-gray-900 mb-2 group-hover:text-gray-700 transition-colors">
                          {option.title}
                        </CardTitle>
                        <div className="flex items-center space-x-3 text-xs text-gray-500 mb-2">
                          {/* <span className="flex items-center space-x-1">
                            <Clock className="h-3 w-3" />
                            <span>{option.time}</span>
                          </span> */}
                          <span className="flex items-center space-x-1">
                            <CheckCircle className="h-3 w-3" />
                            <span>{option.complexity}</span>
                          </span>
                        </div>
                      </div>
                    </div>
                    <CardDescription className="text-gray-600 text-sm leading-relaxed">
                      {option.description}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      {option.features.map((feature, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.8 + idx * 0.1 }}
                          className="flex items-center space-x-2 text-sm text-gray-700"
                        >
                          <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                          <span>{feature}</span>
                        </motion.div>
                      ))}
                    </div>

                    <div className="pt-4 border-t border-gray-100">
                      <Button
                        onClick={() => router.push(option.route)}
                        className={`w-full h-11 font-semibold bg-gradient-to-r ${option.color} hover:shadow-lg transition-all duration-300 rounded-xl group-hover:scale-[1.02]`}
                      >
                        <span>Get Started</span>
                        <ArrowRight
                          className={`ml-2 h-4 w-4 transition-transform duration-300 ${
                            hoveredCard === option.id ? "translate-x-1" : ""
                          }`}
                        />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* How it Works */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="max-w-6xl mx-auto px-4 mb-16"
        >
          <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-2xl overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
            <CardHeader className="text-center pb-8">
              <CardTitle className="text-3xl text-gray-900 mb-4">How It Works</CardTitle>
              <CardDescription className="text-lg text-gray-600 max-w-2xl mx-auto">
                Our AI-powered system transforms your data in three simple steps
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                  {
                    step: 1,
                    title: "Import Your Data",
                    description: "Choose your preferred method and provide your product information",
                    icon: <FileSpreadsheet className="h-6 w-6" />,
                    color: "from-blue-500 to-cyan-500",
                  },
                  {
                    step: 2,
                    title: "AI Processing",
                    description: "Our advanced AI analyzes and structures your data to Ribbon format",
                    icon: <Sparkles className="h-6 w-6" />,
                    color: "from-purple-500 to-pink-500",
                  },
                  {
                    step: 3,
                    title: "Review & Launch",
                    description: "Preview your vendor profile and products, then go live on Ribbon",
                    icon: <CheckCircle className="h-6 w-6" />,
                    color: "from-green-500 to-emerald-500",
                  },
                ].map((item, index) => (
                  <motion.div
                    key={item.step}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.9 + index * 0.1 }}
                    whileHover={{ scale: 1.05, y: -5 }}
                    className="text-center space-y-4 p-6 rounded-2xl hover:bg-gray-50/50 transition-all duration-300"
                  >
                    <div className="relative">
                      <div
                        className={`w-16 h-16 bg-gradient-to-r ${item.color} rounded-2xl flex items-center justify-center mx-auto shadow-lg`}
                      >
                        <div className="text-white">{item.icon}</div>
                      </div>
                      <Badge
                        className={`absolute -top-2 -right-2 w-8 h-8 rounded-full bg-gradient-to-r ${item.color} text-white border-0 flex items-center justify-center text-sm font-bold shadow-lg`}
                      >
                        {item.step}
                      </Badge>
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-gray-900 mb-2">{item.title}</h3>
                      <p className="text-gray-600 leading-relaxed">{item.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1 }}
          className="text-center pb-16 px-4"
        >
          <div className="max-w-2xl mx-auto">
            <p className="text-gray-600 mb-4">
              Need help choosing the right import method? Our AI will guide you through the process.
            </p>
            <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
              <span>✨ AI-Powered</span>
              <span>•</span>
              <span>🔒 Secure</span>
              <span>•</span>
              <span>⚡ Fast</span>
              <span>•</span>
              <span>📞 24/7 Support</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
