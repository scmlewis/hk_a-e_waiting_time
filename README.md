# Hong Kong A&E Waiting Time Monitor

A professional, high-performance web application providing live visibility into Accident & Emergency (A&E) waiting times across all public hospitals in Hong Kong. Built with a focus on speed, clarity, and mobile-first accessibility.

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)

---

## Why this exists

When someone needs an A&E department, the last thing they should do is drive to the one with a 4-hour queue. This surfaces live waiting times for every Hong Kong A&E so the nearest short-wait option is one glance away.

## ✨ Key Features

- **🗺️ Interactive Map View:** A dependency-free SVG map plotting all 18 public A&E hospitals by real location, colour-coded by the selected triage category, with your GPS position overlaid and tap-for-details popups (wait time, call hospital, open in Maps).
- **🔴 Live Data Synchronization:** Real-time updates from official Hospital Authority open data endpoints.
- **⚡ Proactive Performance:** Ultra-lightweight bundle and optimized rendering for instant load times.
- **📍 Smart Location Services:** Optional GPS integration to automatically surface the nearest medical facilities and show your position on the map.
- **📊 Comprehensive Triage View:** Detailed waiting times across all five triage categories (Critical to Non-urgent) plus an at-a-glance Overview summary.
- **🌐 Bilingual Interface:** Full English and Traditional Chinese (繁體中文) switching.
- **🌓 Adaptive Interface:** Full support for System Light/Dark modes with high-contrast accessibility optimizations.
- **📱 Responsive by Design:** Engineered for seamless performance across mobile devices, tablets, and desktops, with three switchable views — Wait Times, Overview, and Map.

## 🛠 Tech Stack

- **Frontend:** React 19 + TypeScript
- **Styling:** Tailwind CSS (Modern Grid layouts & custom design system)
- **Build Tooling:** Vite for near-instant HMR and optimized production builds
- **Testing:** Vitest + React Testing Library (TDD-driven implementation)
- **Quality:** ESLint + TypeScript Strict Mode

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Installation
```bash
# Clone the repository
git clone https://github.com/yourusername/ae-waiting-time.git

# Install dependencies
npm install

# Launch development server
npm run dev
```

### Environment Configuration
The application supports primary and fallback data sources for maximum reliability. Configure these in your `.env` file:
```env
VITE_AE_PRIMARY_ENDPOINT=https://your-api-endpoint.com/data
VITE_AE_FALLBACK_ENDPOINT=https://fallback-endpoint.com/data
```

## 🧪 Testing & Quality Assurance
The project maintains high reliability through a comprehensive test suite covering core logic and UI components.

```bash
# Run tests in watch mode (default)
npm test

# Run the full test suite once (CI-friendly)
npx vitest run

# Execute linting checks
npm run lint

# Type-check and build for production
npm run build
```

## 📈 Observability & Telemetry
Designed for production-level monitoring, the app includes:
- **Health Tracking:** Automated source staleness detection and refresh error logging.
- **Interaction Analytics:** Anonymous telemetry for feature engagement (view switches, sorting, filtering, search, and map marker taps).
- **Error Reporting:** Global exception tracking and unhandled promise rejection monitoring.

---
*Disclaimer: This application is a monitoring tool based on open data. For life-threatening emergencies, always dial 999 directly.*

**▶ Live demo:** https://scmlewis.github.io/hk_a-e_waiting_time/
---

If this saved you time or gave you an idea, a ⭐ on the repo is appreciated — it helps others find it.
