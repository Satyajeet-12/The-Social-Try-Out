# The Social Try-Out

Dark-themed React prototype for a hackathon concept focused on AI-assisted virtual try-on for Indian fashion shoppers.

## What is implemented

- Scrollable dashboard UI with project title and multilingual switch (English/Hindi)
- Gender-based fashion flows:
  - Male: Shirts, Jeans, Shorts
  - Female: Kurtis, Tops, Dresses, Jeans
- Product variation cards and **Try-On** flow
- Basic measurement collection (chest, waist, height, weight)
- Two try-on capture options:
  1. Upload a pre-clicked user photo
  2. Live capture with timer for 4 profiles (front, back, left, right)
- AI-style simulated output:
  - Upload mode: image output with selected outfit overlay
  - Live mode: generated rotating video (`webm`) composed from 4 profile shots
- Size recommendation (S/M/L/XL heuristic)
- Personalized recommendations based on chosen category/item
- Vendor onboarding and catalog management section

> Note: This version is a production-style UI prototype. The AI cloth swapping is simulated on-device so you can demo full flow without paid APIs.

## Run

```bash
npm install
npm run dev
```

Build:

```bash
npm run build
```
