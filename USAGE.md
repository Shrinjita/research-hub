# Taskoscope Usage Guide

## Running the Application

### Development Mode

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Production Build

```bash
npm run build
npm run preview
```

## Mock API

The prototype uses client-side mock endpoints in `src/services/mockApi.ts`. No separate server required.

### Switching to Real Backend

1. Create `src/services/api.ts`:

```typescript
const API_BASE = import.meta.env.VITE_API_BASE || 'https://api.taskoscope.io';

export const api = {
  async login(email: string, password: string) {
    const res = await fetch(`${API_BASE}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    if (!res.ok) throw new Error('Login failed');
    return res.json();
  },
  async register(name: string, email: string, password: string) {
    const res = await fetch(`${API_BASE}/api/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    });
    if (!res.ok) throw new Error('Registration failed');
    return res.json();
  },
  async me(token: string) {
    const res = await fetch(`${API_BASE}/api/me`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Authentication failed');
    return res.json();
  },
  async ingest(sessionId: string, sources: Array<{ url: string; type: 'web' | 'pdf' }>) {
    const res = await fetch(`${API_BASE}/api/ingest`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId, sources })
    });
    if (!res.ok) throw new Error('Ingest failed');
    return res.json();
  },
  async extract(url: string) {
    const res = await fetch(`${API_BASE}/api/extract`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url })
    });
    if (!res.ok) throw new Error('Extract failed');
    return res.json();
  },
  async summarize(sessionId: string, sourceIds: string[]) {
    const res = await fetch(`${API_BASE}/api/summarize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId, sourceIds })
    });
    if (!res.ok) throw new Error('Summarize failed');
    return res.json();
  },
  async exportSession(sessionId: string, format: 'bibtex' | 'json', citations: any[]) {
    const res = await fetch(`${API_BASE}/api/export`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId, format, citations })
    });
    if (!res.ok) throw new Error('Export failed');
    return res.blob();
  }
};
```

2. Update imports in components from `mockApi` to `api`

## MCP Server (Optional)

### Starting the MCP Server

```bash
cd mcp-server
npm install
node index.js
```

Server runs on port 3001 by default.

### Environment Setup

```bash
export VITE_MCP_SERVER_URL=http://localhost:3001
```

## Demo Walkthrough

### Step 1: Login
- Navigate to `/login`
- Enter: `demo@taskoscope.io` / `demo123`
- Click "Sign in"

### Step 2: Dashboard
- View mode tiles
- Click "Research Mode" to enter

### Step 3: Create Project
- Click "Start New Project"
- Enter project name (default: "Quantum Computing Basics")
- Click "Create Project"
- Two demo sources auto-load:
  - Wikipedia: Quantum computing
  - PDF: Quantum Basics

### Step 4: Explore Sources
- Click source cards to select
- Wikipedia loads in iframe viewer
- PDF shows placeholder (PDF.js integration point)

### Step 5: Capture Citation
- Click "Capture" on any source card
- Watch animated overlay: "Generating APA Citation..."
- Success message: "Citation saved → See Sidebar"
- Citation appears in right panel

### Step 6: Generate Literature Survey
- Click "Generate Survey" in topbar
- Loading state shows
- Survey renders in center pane with:
  - Abstract
  - Key concepts
  - References

### Step 7: Export
- Click "Export" in topbar
- Downloads `citations.bib` file
- Contains BibTeX entries for all captured citations

## Extension Demo (Simulated)

In browser console:

```javascript
import { extensionStub } from '/src/services/extensionStubs';

// Simulate sending a page from extension
extensionStub.simulateSendCurrentPage();

// Simulate citation capture
extensionStub.simulateCaptureCitation('Selected text');

// Simulate tab list
extensionStub.simulateTabList();
```

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Esc` | Close modals/overlays |
| `Enter` | Submit forms |

## Troubleshooting

### "Invalid token" on page load
Clear localStorage: `localStorage.removeItem('taskoscope_token')`

### Iframe not loading
Some sites block iframe embedding. Wikipedia demo works in most browsers.

### Export not downloading
Check browser popup blocker settings.

## API Response Examples

### Login Response
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "1",
    "name": "Demo User",
    "email": "demo@taskoscope.io"
  }
}
```

### Extract Response
```json
{
  "title": "Quantum computing",
  "authors": ["Wikipedia contributors"],
  "year": "2024",
  "doi": null,
  "text": "Quantum computing is...",
  "citationAPA": "Wikipedia contributors. (2024). Quantum computing...",
  "bibtex": "@misc{wiki:quantum_computing,...}"
}
```

### Summarize Response
```json
{
  "summaryHtml": "<h2>Literature Survey...</h2>...",
  "references": [
    { "sourceId": "src-123", "excerpt": "Key quote..." }
  ]
}
```
