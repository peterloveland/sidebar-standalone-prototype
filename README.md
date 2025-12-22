# GitHub Issues Sidebar Prototype

A modern, redesigned GitHub Issues sidebar built with React, Vite, TypeScript, and shadcn/ui components. Features a clean interface with local storage-based persistence.

## Features

- 🎨 Modern UI with shadcn/ui components
- 🔍 Real-time search and filtering
- 📊 Issue state management (open/closed)
- 🏷️ Label support
- 💾 Local storage persistence (no backend needed)
- 📱 Responsive design
- ⚡ Fast and lightweight

## Tech Stack

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **shadcn/ui** - Component library
- **Lucide React** - Icons
- **localStorage** - Data persistence

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) to view it in your browser.

### Build

```bash
npm run build
```

## Deployment to GitHub Pages

1. **Initialize Git and push to GitHub:**

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/sidebar-2.git
git push -u origin main
```

2. **Build the project:**

```bash
npm run build
```

3. **Deploy to GitHub Pages:**

```bash
# Install gh-pages package
npm install -D gh-pages

# Add deploy script to package.json
npm pkg set scripts.deploy="npm run build && gh-pages -d dist"

# Deploy
npm run deploy
```

4. **Configure GitHub Pages:**
   - Go to your repository settings
   - Navigate to "Pages" section
   - Select `gh-pages` branch as source
   - Your site will be available at `https://YOUR_USERNAME.github.io/sidebar-2/`

## Data Storage

The prototype uses browser's `localStorage` for data persistence. Sample issues are automatically created on first load. All data is stored locally in your browser.

### Database Operations

The app includes a simple database layer (`src/lib/db.ts`) that provides:
- `getAll()` - Get all issues
- `getById(id)` - Get a specific issue
- `create(issue)` - Create a new issue
- `update(id, updates)` - Update an issue
- `delete(id)` - Delete an issue
- `filter(predicate)` - Filter issues

## Project Structure

```
src/
├── components/
│   ├── ui/              # shadcn/ui components
│   │   ├── badge.tsx
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   └── input.tsx
│   ├── IssueItem.tsx    # Issue list item component
│   ├── IssueDetail.tsx  # Issue detail view
│   └── IssuesSidebar.tsx # Main sidebar component
├── hooks/
│   └── useIssues.ts     # Issues management hook
├── lib/
│   ├── db.ts            # localStorage database layer
│   └── utils.ts         # Utility functions
├── App.tsx              # Root component
└── main.tsx             # Entry point
```

## Customization

### Changing the base URL

Edit `vite.config.ts`:

```typescript
export default defineConfig({
  base: '/your-repo-name/',
})
```

### Adding new issue fields

Modify the `Issue` interface in `src/lib/db.ts` and update the UI components accordingly.

## License

MIT
