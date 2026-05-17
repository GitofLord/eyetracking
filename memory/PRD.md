# SanoTracking.AI - Product Requirements Document

## Original Problem Statement
SanoTracking.AI - Elite Pharmaceutical Neuromarketing & Eye-Tracking Simulator specifically engineered for the PHARMACEUTICAL INDUSTRY. Analyzes medical advertisements, HCP portals, and patient awareness materials. Turkish language interface.

## Architecture
- **Frontend:** React with Tailwind CSS, Framer Motion, React Confetti, Recharts
- **Backend:** FastAPI with Python
- **Database:** MongoDB
- **AI Integration:** Gemini 3 Flash (image analysis), Gemini Nano Banana (heat map/saliency generation)

## User Personas
1. **Pharmaceutical Marketing Managers** - Validate ad effectiveness, track team performance
2. **Medical Advertisement Designers** - Get objective feedback, compare designs
3. **HCP Portal Managers** - Optimize interfaces, share with teams

## Core Requirements (Static)
- Turkish language interface
- Heat Map simulation & Saliency Mask
- SanoScore (0-100) with animated gauge
- Before/After/Benchmark comparison
- KPI metrics (TTFF, AOI, Cognitive Load)
- Recommendations (Doz Artırımı, Yan Etkiler, Tedavi Planı)
- Analysis history with save/delete
- A/B Test Comparison
- Competitor Benchmark Analysis
- Batch Upload (Multiple Images)
- Historical Trend Analysis
- Team Sharing

## What's Been Implemented (Jan 2026)
### Phase 1 (Initial MVP)
- [x] Full Turkish interface
- [x] Image upload with drag & drop
- [x] AI-powered image analysis (Gemini 3 Flash)
- [x] Heat map generation (Gemini Nano Banana)
- [x] Saliency mask generation
- [x] SanoScore gauge with animation
- [x] KPI dashboard (7 metrics)
- [x] Recommendation cards
- [x] Analysis history with CRUD

### Phase 2 (Updates)
- [x] SanoScore digital display with blinking effect
- [x] Terms & KPIs modal with eye-tracking terminology
- [x] PDF report download
- [x] Improved KPI cards (7 compact cards)

### Phase 3 (A/B & Competitor)
- [x] A/B Test Mode in history section
- [x] Metric comparison bars
- [x] AI-powered comparison summary
- [x] Competitor Benchmark against Top 10 Global Pharma

### Phase 4 (Batch, Trends, Teams)
- [x] Batch Upload (max 10 files at once)
- [x] Historical Trend Analysis with charts:
  - Line chart (Score Trend over time)
  - Pie chart (Score Distribution)
  - Bar chart (Metric Averages)
- [x] Team Sharing:
  - Create/Delete teams
  - Add/Remove members with roles (viewer/editor/admin)
  - Share analyses with teams

## API Endpoints
### Core
- POST /api/analyze - Analyze single image
- POST /api/analyze-batch - Analyze multiple images
- GET /api/history - Get analysis history
- GET /api/analysis/{id} - Get specific analysis
- DELETE /api/analysis/{id} - Delete analysis

### Comparison
- POST /api/compare - A/B test comparison
- GET /api/competitor-benchmark/{id} - Compare against global pharma

### Analytics
- GET /api/trends - Get historical trend data
- GET /api/stats - Get overall statistics

### Teams
- POST /api/teams - Create team
- GET /api/teams - List teams
- GET /api/teams/{id} - Get team details
- POST /api/teams/{id}/members - Add member
- DELETE /api/teams/{id}/members/{mid} - Remove member
- POST /api/teams/{id}/share - Share analyses
- GET /api/teams/{id}/analyses - Get shared analyses
- DELETE /api/teams/{id} - Delete team

## Prioritized Backlog
### P0 (Must Have) - COMPLETED
- ✅ Core analysis workflow
- ✅ Heat map generation
- ✅ A/B Test comparison
- ✅ Competitor benchmarking
- ✅ Batch upload
- ✅ Trend analysis
- ✅ Team sharing

### P1 (Should Have) - FUTURE
- [ ] User authentication
- [ ] Export all analyses as Excel
- [ ] Email notifications for team shares

### P2 (Nice to Have) - FUTURE
- [ ] Real-time collaboration
- [ ] Custom benchmark profiles
- [ ] API access for third-party integrations

## Next Tasks
1. User authentication system
2. Email notifications for team activities
3. Excel export for all analyses
