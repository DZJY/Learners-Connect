# File Summarization API

Welcome to the **Learners' Connect API** documentation. This system allows users to buy, sell, upload notes files (PDF, DOCX, MP4), extracts textual content, summarizes it using OpenAI, generates QnA pairs, and stores everything in MongoDB.

## Features

- 🎯 Upload `.pdf`, `.docx`, or `.mp4` files
- 🧠 Automatic summarization via GPT-4
- ❓ Generates 5 detailed QnA pairs per file
- ☁️ Stores file, summary, and QnA in MongoDB (GridFS)
- 📝 Download summary as `.docx`

## Technology Stack

- **Backend:** Next.js (API Routes)
- **Storage:** MongoDB + GridFS
- **AI:** OpenAI (GPT-4)
- **Parsing:** Google Cloud Document AI, Speech-to-Text, Mammoth
- **File Conversion:** FFmpeg WASM
