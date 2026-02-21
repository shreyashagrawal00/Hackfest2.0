# BRDagent ✦

**Automated Requirements Intelligence**

BRDagent is a premium, AI-driven platform designed to transform fragmented business communications into structured, professional Business Requirement Documents (BRDs).

## ❖ Problem Statement
Project managers and business analysts spend countess hours manually extracting requirement signals from high-noise data sources like email threads, meeting transcripts, and chat archives. This process is:
1. **Time-Consuming**: Searching through hundreds of messages is inefficient.
2. **Error-Prone**: Critical requirement signals are easily missed in fragmented conversations.
3. **Inconsistent**: Formatting and structuring documents manually leads to variability in quality.

**BRDagent** solves this by acting as a specialized intelligence layer that ingests multi-source data and generates high-fidelity documentation instantly.

---

## 🏗 Architecture
The application is built with a focus on high-performance signal extraction and premium user experience.

- **Frontend Core**: [Next.js 16 (App Router)](https://nextjs.org/) + [React 19](https://react.dev/).
- **Aesthetic Layer**: Custom Vanilla CSS with a **tactile paper-tier** design system, featuring fractal noise overlays and radial gradients for a premium feel.
- **Identity & Security**: [Google Identity Services (GIS)](https://developers.google.com/identity/gsi/web) for secure OAuth 2.0 flow.
- **Intelligence Ingestion**: [Gmail API](https://developers.google.com/gmail/api) integration to fetch project-relevant email feeds.
- **Document Engine**: Client-side document assembly with [html2pdf.js](https://github.com/eKoopmans/html2pdf.js) for high-quality A4 PDF exports.

---

## 🛠 Tech Stack
- **Languages**: [TypeScript](https://www.typescriptlang.org/), JavaScript.
- **Framework**: Next.js 16 (Turbopack).
- **Styling**: Vanilla CSS (Global Variables + Modular Components).
- **Integration**: Google Cloud Platform (OAuth 2.0, Gmail GSuite).
- **Export**: PDF.js / html2canvas / jspdf (via html2pdf).

---

## 🚀 Deployment & Setup

### Environment Variables
To run this project, you will need to add the following variables to your `.env.local` file:
`NEXT_PUBLIC_GOOGLE_CLIENT_ID` (Obtained from Google Cloud Console)

### Local Development
1. Clone the repository.
2. Run `npm install`.
3. Start the dev server: `npm run dev`.

### Deployment
This project is optimized for deployment on [Vercel](https://vercel.com/):
1. Connect your repository to Vercel.
2. Configure the `NEXT_PUBLIC_GOOGLE_CLIENT_ID` in the environment settings.
3. Deploy.

---

## ✦ Key Features
- **Live Intelligence Feed**: Connect Gmail to see real-time signal extraction.
- **Interactive Editor**: AI-assisted editing and requirement validation.
- **Paper-Tier Aesthetics**: A workspace designed for focus and professional pride.
- **One-Click Export**: Professional PDF generation with proper page breaks and styling.
