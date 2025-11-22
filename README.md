# Workdeck Platform

A unified SaaS platform combining the Dashboard and Resource Planner applications.

## Features

- **Dashboard** - Main platform with navigation menubar and comprehensive project overview
- **Resource Planner** - Workforce capacity management and billable optimization tool

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

This will start the development server at `http://localhost:3000`

### Build

```bash
npm run build
```

This creates an optimized production build in the `dist` directory.

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
workdeck-platform/
├── src/
│   ├── pages/
│   │   ├── Dashboard/         # Dashboard application
│   │   └── ResourcePlanner/   # Resource Planner application
│   ├── App.tsx                # Main app with routing
│   └── main.tsx               # Entry point
├── index.html
├── package.json
├── vite.config.ts
└── vercel.json                # Vercel deployment configuration
```

## Routing

- `/` - Dashboard (Homepage)
- `/planner` - Resource Planner

## Deployment

### Deploy to Vercel

1. Install Vercel CLI (if not already installed):
   ```bash
   npm install -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

3. Deploy:
   ```bash
   vercel
   ```

   For production deployment:
   ```bash
   vercel --prod
   ```

### Alternative: Deploy via Vercel Dashboard

1. Push your code to a Git repository (GitHub, GitLab, or Bitbucket)
2. Go to [vercel.com](https://vercel.com)
3. Click "New Project"
4. Import your repository
5. Vercel will auto-detect Vite and configure the build settings
6. Click "Deploy"

## Technology Stack

- **Framework:** React 18
- **Build Tool:** Vite
- **Routing:** React Router v7
- **UI Components:** Radix UI
- **Styling:** Tailwind CSS
- **Charts:** Recharts
- **TypeScript:** For type safety

## License

Private
