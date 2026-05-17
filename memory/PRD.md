# SanoTracking.AI - Product Requirements Document

## Original Problem Statement
SanoTracking.AI - Elite Pharmaceutical Neuromarketing & Eye-Tracking Simulator specifically engineered for the PHARMACEUTICAL INDUSTRY. Analyzes medical advertisements, HCP portals, and patient awareness materials. Evaluates designs based on Trust, Regulatory Clarity, and Cognitive Ease. Turkish language interface.

## Architecture
- **Frontend:** React with Tailwind CSS, Framer Motion, React Confetti
- **Backend:** FastAPI with Python
- **Database:** MongoDB
- **AI Integration:** Gemini 3 Flash (image analysis), Gemini Nano Banana (heat map/saliency generation)

## User Personas
1. **Pharmaceutical Marketing Managers** - Need to validate ad effectiveness before launch
2. **Medical Advertisement Designers** - Want objective feedback on design decisions
3. **HCP Portal Managers** - Need to optimize healthcare professional interfaces

## Core Requirements (Static)
- Turkish language interface
- Heat Map simulation with visual overlay
- Saliency Mask (B&W hierarchy visualization)
- SanoScore (0-100) with animated gauge
- Before/After/Benchmark comparison
- KPI metrics (TTFF, AOI, Cognitive Load)
- Recommendations (Doz Artırımı, Yan Etkiler, Tedavi Planı)
- Analysis history with save/delete
- A/B Test Comparison
- Competitor Benchmark Analysis

## What's Been Implemented (Jan 2026)
### Phase 1 (Initial MVP)
- [x] Full Turkish interface
- [x] Image upload with drag & drop
- [x] AI-powered image analysis (Gemini 3 Flash)
- [x] Heat map generation (Gemini Nano Banana)
- [x] Saliency mask generation
- [x] SanoScore gauge with animation
- [x] Score breakdown (Trust Factor, Regulatory Visibility, CTA Focus)
- [x] Before/After/Benchmark comparison cards
- [x] KPI dashboard (7 metrics)
- [x] Recommendation cards
- [x] Analysis history with CRUD operations
- [x] Confetti effect for high scores (>80)
- [x] Red flash effect for critical scores (<40)
- [x] Loading animation with cycling metrics

### Phase 2 (Updates)
- [x] SanoScore digital display on right with blinking effect
- [x] Terms & KPIs modal with eye-tracking terminology
- [x] PDF report download
- [x] Improved KPI cards (7 compact cards)

### Phase 3 (A/B & Competitor Features)
- [x] A/B Test Mode in history section
- [x] Select 2 analyses for comparison
- [x] A/B comparison results with winner announcement
- [x] Metric comparison bars (SanoScore, Trust, Regulatory, CTA, TTFF)
- [x] AI-powered comparison summary
- [x] Competitor Benchmark button
- [x] Ranking against Top 10 Global Pharma (Pfizer, Roche, Merck, etc.)
- [x] Percentile calculation and summary

## API Endpoints
- POST /api/analyze - Analyze uploaded image
- GET /api/history - Get analysis history
- GET /api/analysis/{id} - Get specific analysis
- DELETE /api/analysis/{id} - Delete analysis
- POST /api/compare - Compare two analyses (A/B test)
- GET /api/competitor-benchmark/{id} - Compare against global pharma

## Prioritized Backlog
### P0 (Must Have) - COMPLETED
- ✅ Core analysis workflow
- ✅ Heat map generation
- ✅ Saliency mask generation
- ✅ A/B Test comparison
- ✅ Competitor benchmarking

### P1 (Should Have) - FUTURE
- [ ] Multiple image batch analysis
- [ ] Historical trend analysis
- [ ] Export all analyses as Excel

### P2 (Nice to Have) - FUTURE
- [ ] User authentication
- [ ] Team collaboration features
- [ ] Custom benchmark profiles
- [ ] Real eye-tracking device integration

## Next Tasks
1. Multiple image batch upload and analysis
2. Historical trend charts for repeated analyses
3. Team sharing and collaboration features
