# Emergence Frontend

A React TypeScript application for managing AI agents, built with Tailwind CSS and React Router.

## Features

- **TypeScript**: Full type safety and better development experience
- **Tailwind CSS**: Utility-first CSS framework for rapid UI development
- **React Router**: Client-side routing for navigation
- **Axios**: HTTP client for API communication
- **Responsive Design**: Mobile-first responsive layout

## Project Structure

```
src/
├── components/          # Reusable React components
├── pages/              # Page components
├── services/           # API services and utilities
├── types/              # TypeScript interfaces
├── App.tsx             # Main application component
├── index.tsx           # Application entry point
└── index.css           # Global styles with Tailwind
```

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Backend server running on http://localhost:3001

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm start
   ```

3. Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

### Available Scripts

- `npm start` - Runs the app in development mode
- `npm test` - Launches the test runner
- `npm run build` - Builds the app for production
- `npm run eject` - Ejects from Create React App (one-way operation)

## API Integration

The frontend is configured to communicate with the backend API at `http://localhost:3001/api`. 

### API Services

- **agentsAPI**: Complete CRUD operations for agents
- **healthAPI**: Health check endpoint

### Example Usage

```typescript
import { agentsAPI } from './services/api';

// Get all agents
const response = await agentsAPI.getAll();

// Create new agent
const formData = new FormData();
formData.append('name', 'My Agent');
formData.append('file', file);
const result = await agentsAPI.create(formData);
```

## Styling

This project uses Tailwind CSS for styling. The configuration is in `tailwind.config.js`.

### Custom Classes

You can add custom CSS classes in `src/index.css` or `src/App.css`.

## Development

### Adding New Components

1. Create component files in `src/components/`
2. Use TypeScript interfaces from `src/types/`
3. Style with Tailwind CSS classes

### Adding New Pages

1. Create page components in `src/pages/`
2. Add routes in `src/App.tsx`
3. Update navigation as needed

## Build for Production

```bash
npm run build
```

This creates an optimized production build in the `build` folder.

## Environment Variables

Create a `.env` file in the root directory for environment-specific configuration:

```
REACT_APP_API_URL=http://localhost:3001/api
```

## Contributing

1. Follow TypeScript best practices
2. Use Tailwind CSS for styling
3. Write meaningful component and function names
4. Add proper TypeScript interfaces for all data structures
