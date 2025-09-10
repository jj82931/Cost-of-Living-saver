Still in progressing.....................

# Cost-of-Living Saver

A privacy-first web app that helps people in Australia cut recurring household costs. Upload a bill or a plan, get a clean side-by-side comparison, see projected yearly savings, and generate ready-to-send negotiation emails.

## Why this matters in Australia

Cost pressure is the top concern for most households in Australia. People face:

* Complex energy tariffs and solar FIT rules that are hard to compare
* Mobile and internet plans with changing promotions and hidden trade-offs
* Private health insurance with confusing coverage tiers and waiting periods

The result is money left on the table, especially for students, new migrants, and busy families. This project aims to turn scattered information into clear actions that save dollars with minimal effort.

## What the product does

* Extracts key fields from bills and plan PDFs or screenshots
* Simulates annual cost across electricity, gas, mobile, internet, and health insurance
* Explains the recommendations in simple English, with assumptions made explicit
* Generates negotiation emails and call scripts that a user can copy and send
* Stores only derived fields, not raw documents, to respect privacy

## Who this is for

* Individuals and families who want fast, trustworthy comparisons
* HR and People teams evaluating candidates who can ship user-centric, AI-enabled products that solve real problems at national scale

## Key features

* Bill parsing and field extraction
* Plan matching and annual cost simulation
* Savings overview across categories on one dashboard
* One-click generation of negotiation emails and checklists
* Map and quality overlays for internet and mobile where relevant
* PDF export for a shareable savings report

## How it works

1. **Input**
   Users upload a bill or paste plan details. OCR and lightweight information extraction turn it into a structured record.

2. **Compare**
   The app loads plan data from public sources or curated seed datasets and runs a transparent simulation to estimate yearly cost.

3. **Explain**
   A small, low-cost LLM writes a short, plain-English rationale and generates action templates such as emails or call scripts.

4. **Act**
   Users copy, send, and switch. The app avoids storing raw documents to keep sensitive data local.

## Data strategy

* User-provided bills and CSV exports
* Official or public datasets where available, such as energy product reference data, health insurance product summaries, and broadband quality reports
* Small curated seed sets for plan fields where APIs are limited, reviewed and updated on a schedule

No aggressive web crawling. Terms of service and legal constraints are respected.

## Technology

* **Frontend**: Next.js, TypeScript, React
* **Design system**: Tailwind CSS, shadcn/ui, Radix Primitives, minimal white aesthetic with high contrast and accessible focus states
* **Data and auth**: Supabase free tier with Row Level Security
* **On-device intelligence**: onnxruntime-web and lightweight classifiers for extraction and classification where possible
* **OCR and parsing**: Tesseract or PDF text parsing, with format-aware fallbacks
* **LLM usage**: GPT nano or DeepSeek for short explanations and document generation, with strict token budgets and caching
* **Performance and privacy**: browser-first parsing, short prompts, local caching, no storage of raw uploads
* **Packaging**: PWA basics for offline access to recent reports

## What I tried to solve

* Turn a stack of confusing bills into clear, comparable numbers
* Make the switch friction low by giving users email and call scripts, not just charts
* Keep costs near zero by running small models in the browser and using low-cost APIs only where helpful
* Respect data privacy through minimal retention and client-side processing

## What is not included

* Legal or financial advice
* Automated switching on the user’s behalf
* Real-time scraping of commercial comparison sites

## Security and privacy

* Raw uploads are processed in memory and deleted after extraction
* Only derived fields such as kWh usage, unit rates, and plan attributes are stored
* Server keys stay on the server, logs are scrubbed of personal data
* Clear user controls for re-compute and data removal

## Repository structure

```
src/app/               Next.js app routes
src/components/        UI components (cards, tables, modals)
src/lib/               parsers, sim, data, llm, compose, match, estimator
src/types/             Shared TypeScript types
src/tests/             Unit and snapshot tests
data/                  Public seed datasets for local development
styles/print.css       Print styles for PDF export
```

## Getting started

1. Clone the repo and install dependencies
2. Copy `.env.example` to `.env.local` and add your LLM key if needed
3. Run `npm run dev` and open the app
4. Use sample bills in `fixtures/` to see the end-to-end flow

## License

MIT, with additional terms for dataset usage where applicable.
