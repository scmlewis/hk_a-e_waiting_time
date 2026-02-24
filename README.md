# Hong Kong A&E Waiting Time Monitor

A professional, high-performance web application providing live visibility into Accident & Emergency (A&E) waiting times across all public hospitals in Hong Kong. Built with a focus on speed, clarity, and mobile-first accessibility.

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)

## ✨ Key Features

- **🔴 Live Data Synchronization:** Real-time updates from official Hospital Authority open data endpoints.
- **⚡ Proactive Performance:** Ultra-lightweight bundle and optimized rendering for instant load times.
- **📍 Smart Location Services:** Optional GPS integration to automatically surface the nearest medical facilities.
- **📊 Comprehensive Triage View:** Detailed breakdown of waiting times across all five triage categories (Critical to Non-urgent).
- **🌓 Adaptive Interface:** Full support for System Light/Dark modes with high-contrast accessibility optimizations.
- **📱 Responsive by Design:** Engineered for seamless performance across mobile devices, tablets, and desktops.

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
# Run unit and integration tests
npm test

# Execute linting checks
npm run lint

# Build for production
npm run build
```

## 📈 Observability & Telemetry
Designed for production-level monitoring, the app includes:
- **Health Tracking:** Automated source staleness detection and refresh error logging.
- **Interaction Analytics:** Anonymous telemetry for feature engagement (sorting, filtering, search behavior).
- **Error Reporting:** Global exception tracking and unhandled promise rejection monitoring.

---
*Disclaimer: This application is a monitoring tool based on open data. For life-threatening emergencies, always dial 999 directly.*
