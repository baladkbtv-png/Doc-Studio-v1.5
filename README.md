# Document Studio v1.5

AI-powered multi-format workspace for documents, spreadsheets, presentations, PDFs, invoices, and images.

**Repository:** https://github.com/baladkbtv-png/Doc-Studio-v1.5

App design and content are unchanged from the original project files.

## Why there is no instant phone-install URL from GitHub Pages

This project is a **Next.js** app with API routes. GitHub Pages only hosts static files, so it cannot run this app as a live PWA.

To get an HTTPS link you can open on your phone and install:

1. Open https://vercel.com/new
2. Import `baladkbtv-png/Doc-Studio-v1.5`
3. Deploy
4. Open the Vercel URL on your phone
5. Browser menu → **Add to Home Screen**

Optional env vars if you use those features:
- `DATABASE_URL` (PostgreSQL)
- `OPENROUTER_API_KEY`
