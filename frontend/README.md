# Intern Management System

A production-ready, modern intern management platform built with React, TypeScript, Vite, and Tailwind CSS.

## 🎯 Overview

The Intern Management System is a comprehensive application designed to streamline the management of intern programs. It provides tools for onboarding, performance tracking, task management, and detailed intern profiling.

## ✨ Features

- **Dark & Light Mode Support** - System preference detection + manual toggle with localStorage persistence
- **Dashboard Overview** - Key metrics and quick access to main features
- **Intern Onboarding** - Form-based onboarding with skill selection, validation, and file upload
- **Performance Tracking** - Table view with filtering by department and status, visual performance indicators
- **Task Planning** - Kanban-style task board (placeholder ready for implementation)
- **Intern Profiles** - Detailed view pages (placeholder ready for implementation)
- **Responsive Design** - Desktop, tablet, and mobile optimized
- **Modern UI** - Clean, minimal, professional design using Tailwind CSS and Radix UI

## 🏗️ Project Structure

```
client/
├── components/
│   ├── layout/
│   │   └── MainLayout.tsx         # Main layout with navbar & sidebar
│   └── ui/                        # Radix UI components
├── context/
│   └── ThemeContext.tsx           # Dark/Light mode management
├── hooks/                         # React hooks
├── mock-data/
│   └── index.ts                   # Sample data for all features
├── pages/
│   ├── Index.tsx                  # Dashboard/Home
│   ├── Onboarding.tsx             # New intern onboarding
│   ├── Performance.tsx            # Performance tracking table
│   ├── Interns.tsx                # Intern profiles (placeholder)
│   ├── Planner.tsx                # Task planner/Kanban (placeholder)
│   └── NotFound.tsx               # 404 page
├── types/
│   └── index.ts                   # TypeScript interfaces
├── App.tsx                        # Routes & app setup
└── global.css                     # Tailwind + theme variables

server/                           # Optional Express backend
├── index.ts
└── routes/
```

## 🎨 Design System

### Colors
- **Primary**: Modern blue (#376FEE)
- **Success**: Green for positive states
- **Warning**: Orange for cautionary states
- **Destructive**: Red for errors/deletions
- **Sidebar**: Dark professional background

### Typography
- **Font Family**: Inter (400, 500, 600, 700)
- **Headings**: Bold, clear hierarchy
- **Body**: Regular weight with muted secondary text

### Components
All UI components are built with:
- Radix UI primitives for accessibility
- Tailwind CSS for styling
- Lucide React icons
- Custom styling for modern look & feel

## 🚀 Getting Started

### Installation

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build

# Run tests
pnpm test

# Type check
pnpm typecheck
```

The app will be available at `http://localhost:8080`

## 📱 Pages

### Dashboard (Home)
- Overview with key metrics
- Quick action cards
- Recent interns preview
- Navigation to all features

### Onboarding
- Multi-step form for adding new interns
- Form validation with helpful error messages
- Skill multi-select from predefined list
- Resume PDF upload (UI only)
- Success/error states
- Form reset after successful submission

### Performance
- Table view of all interns with sortable columns
- Real-time search by name/email
- Filter by department and performance status
- Visual performance indicators (badges, colors)
- Summary statistics at top

### Intern Views (Placeholder)
Ready to implement:
- Individual intern profiles
- Personal details section
- Skills & tech stack
- Performance history
- Assigned tasks
- Tab-based UI

### Planner (Placeholder)
Ready to implement:
- Kanban board with 4 columns
- Drag & drop between columns
- Task creation/editing modals
- Priority and due date support

## 🧩 Key Components

### MainLayout
The main layout wrapper that provides:
- Top navigation bar with theme toggle and user menu
- Collapsible sidebar with navigation
- Responsive design with mobile hamburger menu
- Persistent theme context

```tsx
<MainLayout>
  {/* Page content */}
</MainLayout>
```

### Theme Context
Manages dark/light mode with:
- System preference detection
- localStorage persistence
- Easy toggle function
- Hook for consumption

```tsx
const { theme, toggleTheme } = useTheme();
```

## 📊 Mock Data

Mock data is provided for development and includes:

- **5 Sample Interns** - With varied roles, departments, and performance scores
- **6 Sample Tasks** - Across different statuses and priorities
- Pre-configured avatars using DiceBear API

Edit `client/mock-data/index.ts` to modify sample data.

## 🔄 Data Flow

Currently, the app uses mock data. To connect to a backend:

1. **Create API endpoints** in `server/routes/`
2. **Define shared types** in `shared/api.ts`
3. **Replace mock data fetches** with actual API calls
4. **Use React Query** (already configured) for data fetching

Example API integration pattern:

```tsx
import { useQuery } from '@tanstack/react-query';

const { data: interns } = useQuery({
  queryKey: ['interns'],
  queryFn: async () => {
    const res = await fetch('/api/interns');
    return res.json();
  }
});
```

## 🎯 Next Steps

To extend this system:

### High Priority
1. **Implement Intern Views page** - Detail view, edit capabilities
2. **Build Kanban Board** - Drag-drop using a library like react-beautiful-dnd
3. **Add Backend API** - Express endpoints for CRUD operations
4. **Database Integration** - Use Neon or Supabase for persistence

### Medium Priority
1. **Authentication** - User login and session management
2. **Advanced Filtering** - More complex search and filter combinations
3. **Data Export** - CSV/PDF export capabilities
4. **Notifications** - Toast notifications for actions

### Polish
1. **Loading States** - Skeleton screens and spinners
2. **Error Handling** - Better error messages and recovery
3. **Analytics** - Track intern progress over time
4. **Reports** - Generate performance reports

## 🔧 Configuration

### Tailwind CSS
Colors and theme variables are defined in `client/global.css` as CSS variables and configured in `tailwind.config.ts`.

To customize:
1. Update HSL values in `client/global.css`
2. Colors automatically apply to light and dark modes
3. No additional config needed

### Favicon & App Title
Update in `index.html`:
```html
<title>Intern Management System</title>
<link rel="icon" href="/ims-icon.svg" />
```

## 📝 Available Scripts

```bash
pnpm dev          # Start dev server (client + server)
pnpm build        # Production build
pnpm start        # Start production server
pnpm test         # Run Vitest tests
pnpm typecheck    # TypeScript validation
pnpm format.fix   # Format code with Prettier
```

## 🔐 Environment Variables

Currently no secrets required for the development version. When connecting to backend APIs or databases, add to a `.env` file (example below):

```
VITE_API_URL=http://localhost:3000
```

## 📦 Tech Stack

- **Frontend**: React 18 + TypeScript
- **Bundler**: Vite
- **Styling**: Tailwind CSS 3
- **UI Components**: Radix UI + Lucide Icons
- **State Management**: React Context (theme), React Query (data)
- **Forms**: React Hook Form (extensible)
- **Testing**: Vitest
- **Backend**: Express.js (optional, integrated)
- **Routing**: React Router 6 (SPA mode)

## 🎓 Learning Resources

- [React Documentation](https://react.dev)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Radix UI Components](https://www.radix-ui.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)
- [Vite Guide](https://vitejs.dev/guide)

## 📄 License

Private project. All rights reserved.

---

**Built with ❤️ using modern web technologies**
