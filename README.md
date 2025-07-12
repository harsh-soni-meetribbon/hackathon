# Ribbon Import Hub

Welcome to the **Ribbon Import Hub** – a powerful and user-friendly tool that helps you import product and vendor data into the Ribbon platform from multiple sources. 🚀

---

## 📦 What It Does

The Ribbon Import Hub is a **Next.js** application designed to simplify e-commerce data import using AI capabilities. It supports:

- 🔗 **Shopify stores**  
- 📄 **CSV files**  
- 🌐 **Website URLs**  
- 📝 **PDF line sheets**

The app walks you through:

1. Connecting your data source  
2. Processing & previewing structured data  
3. Importing everything into Ribbon  

🎯 **Accurate, fast, and intuitive.**

---

## ⚙️ Getting Started

### ✅ Prerequisites

Make sure you have the following installed:

- Node.js (v18 or higher) 🟢  
- npm or Yarn 📦

---

### 🛠️ Installation

1. **Clone the repository**

```bash
git clone <your-repository-url>
cd ribbon-import-app
```

> 💡 If you're using the v0 Code Project, you already have the files — skip this step!

2. **Install dependencies**

```bash
npm install
# or
yarn install
```

---

### 🔐 Environment Variables

You'll need a `GEMINI_API_KEY` for AI-powered data processing.

1. Create a `.env.local` file in the root of your project:

```bash
touch .env.local
```

2. Add your Gemini API key:

```env
GEMINI_API_KEY=your_actual_api_key_here
```

---

### ▶️ Running the App

Start the development server:

```bash
npm run dev
# or
yarn dev
```

Open your browser and go to:  
👉 [http://localhost:3000](http://localhost:3000)

---

## 🎉 You're All Set!

You're ready to import data into Ribbon!

---

## 📃 License

MIT License – feel free to fork, clone, and build something amazing. ✨
