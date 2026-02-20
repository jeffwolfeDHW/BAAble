# BAAble — BAA Management Platform

A production-ready web application for managing HIPAA Business Associate Agreements (BAAs) with intelligent compliance analysis, version control, e-signature workflows, and team management.

## Tech Stack

- **React 18** with TypeScript
- **Vite** for fast builds and HMR
- **Tailwind CSS** for utility-first styling
- **React Router** for navigation
- **Vitest** + React Testing Library for testing
- **ESLint** + Prettier for code quality

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Project Structure

```
src/
├── components/
│   ├── layout/         # Header, Navigation, AppLayout
│   ├── modals/         # UploadModal, AgreementDetail, VersionHistory, ESignature
│   └── ui/             # Badge, Modal, StatCard (reusable primitives)
├── context/            # AuthContext, AgreementContext, TeamContext
├── data/               # Mock data and seed data
├── hooks/              # useComplianceAnalysis, useFileUpload, useModalState
├── pages/              # Dashboard, Agreements, Compliance, Team, Templates
├── types/              # TypeScript interfaces and type definitions
└── utils/              # Compliance analysis, agreement helpers
```

## Key Features

- **Dashboard** — Overview stats, compliance alerts, and recent agreements
- **Agreements Management** — Full CRUD with search, filtering, and table view
- **Compliance Analysis** — Automated detection of breach notification conflicts and expiration warnings
- **Team Management** — Role-based access (Admin, Internal, External Counsel)
- **E-Signature Workflows** — Send agreements for electronic signature
- **Version Control** — Track agreement revisions with full history
- **AI Document Upload** — Simulated OCR/AI extraction from uploaded PDFs
- **BAA Templates** — Pre-built templates for Covered Entity, Business Associate, and Subcontractor agreements

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start dev server on port 5173 |
| `npm run build` | Type-check and build for production |
| `npm run preview` | Preview production build |
| `npm run test` | Run tests with Vitest |
| `npm run lint` | Lint with ESLint |
| `npm run format` | Format with Prettier |
| `npm run type-check` | TypeScript type checking |

## Environment Variables

Copy `.env.example` to `.env` and configure:

```
VITE_APP_TITLE=BAAble
VITE_API_URL=http://localhost:3001/api
```

## Architecture Notes

This is currently a **front-end prototype** with mock data. To connect to a real backend:

1. Replace mock data in `src/data/mock-data.ts` with API calls
2. Update context providers to fetch/persist data via `VITE_API_URL`
3. Integrate a real e-signature service (DocuSign, HelloSign, etc.)
4. Add authentication (OAuth, JWT) to `AuthContext`
5. Connect AI document extraction to a real OCR/NLP service

## License

MIT
