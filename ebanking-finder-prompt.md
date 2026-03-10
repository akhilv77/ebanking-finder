# BankTech Finder — E-Banking Provider Lookup Tool
## Detailed Build Prompt · React + Vite + Tailwind + shadcn/ui

---

## Project Overview

Build a lightweight internal tool called **"BankTech Finder"** for identifying the e-banking / digital banking provider used by US banks and credit unions. Users paste a bank's website URL, the tool calls an existing backend API, and the result is displayed as a structured report on a dedicated result screen.

---

## Tech Stack

| Layer | Choice | Why |
|---|---|---|
| Build tool | Vite | Fast dev server, tiny output |
| UI framework | React 18 | Component model, hooks |
| Routing | React Router v6 | SPA with state passing |
| Styling | TailwindCSS + shadcn/ui | Utility-first, no runtime overhead |
| Async/API state | TanStack Query v5 (useMutation) | Built-in loading/error/success |
| CSV parsing | Papa Parse | Client-side, no backend needed |
| HTTP | Native fetch | No extra dependency |

---

## App Structure

```
src/
├── pages/
│   ├── LandingPage.jsx        # Form + CSV upload
│   └── ResultPage.jsx         # Provider report
├── components/
│   ├── SingleLookupForm.jsx   # URL input + submit
│   ├── CsvUploadSection.jsx   # CSV upload (disabled/coming soon)
│   ├── ProviderBadge.jsx      # Colored chip per provider name
│   ├── LoginUrlList.jsx       # Renders login_urls array
│   └── MatchedPatternsTable.jsx # Parses + displays matched_patterns
├── hooks/
│   └── useBankLookup.js       # TanStack Query mutation
├── lib/
│   └── api.js                 # fetch wrapper
├── App.jsx                    # Router
└── main.jsx
```

---

## Page 1 — Landing Page (/)

### Overall Layout

Two-section layout stacked vertically:
- Top: Single Lookup (active)
- Bottom: Bulk CSV Upload (disabled, coming soon)

A clean top navbar with the product name "BankTech Finder" and a small tagline:
"Identify e-banking providers for US banks & credit unions"

---

### Section A — Single Bank Lookup

```
+--------------------------------------------------+
|  Find E-Banking Provider                         |
|  Enter the homepage URL of any US bank or        |
|  credit union to identify their provider.        |
|                                                  |
|  Bank Website URL                                |
|  [ https://www.nbtc.com/           ] [Find ->]   |
|                                                  |
|  Please enter a valid URL    <- inline error     |
+--------------------------------------------------+
```

**Input field**
- Label: Bank Website URL
- Placeholder: https://www.examplebank.com
- Full URL validation on submit (use new URL() constructor, catch TypeError)
- Show inline error below field: "Please enter a valid URL including https://"
- Trim whitespace before validation

**Submit button**
- Label: Find Provider
- While loading (mutation.isPending): show spinner + label "Analyzing..."
- Disabled while loading

**On API success**: call navigate('/result', { state: { data: mutation.data } })

**On API error**: show a red Alert component (shadcn) below the form:
- Title: Lookup Failed
- Description: error message from API or fallback "Something went wrong. Please try again."
- Do NOT navigate away — stay on landing page

---

### Section B — Bulk CSV Upload (UI only, disabled)

```
+--------------------------------------------------+
|  Bulk Lookup via CSV           [COMING SOON]     |
|  Upload a list of bank URLs to run in batch.     |
|                                                  |
|  [ Download Template ]                           |
|                                                  |
|  +------------------------------------+          |
|  |  Drop CSV here or click to browse  |          |
|  |  (disabled)                        |          |
|  +------------------------------------+          |
|                                                  |
|  [ Run Bulk Lookup ]  <- disabled button         |
+--------------------------------------------------+
```

**CSV Template Download**
- Button: "Download Template"
- Generate client-side using a Blob — no server call:

```js
const csv = `bank_name,url\nExample Bank,https://www.examplebank.com\nFirst Credit Union,https://www.firstcu.org\n`;
const blob = new Blob([csv], { type: 'text/csv' });
const url = URL.createObjectURL(blob);
// trigger <a> download
```

- Downloaded filename: banktech_template.csv

**Dropzone**
- Visually present but pointer-events: none + 50% opacity
- Label: "CSV upload coming soon"
- No file picker opens on click

**Bulk submit button**
- Disabled, grey, with a "Coming Soon" badge overlay

---

## API Integration

### Environment Variable

```
# .env
VITE_API_BASE_URL=http://localhost:8000
```

### src/lib/api.js

```js
export async function lookupBank(url) {
  const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/v1/lookup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Request failed: ${res.status}`);
  }
  return res.json();
}
```

### src/hooks/useBankLookup.js

```js
import { useMutation } from '@tanstack/react-query';
import { lookupBank } from '../lib/api';

export function useBankLookup() {
  return useMutation({ mutationFn: lookupBank });
}
```

Usage in form component:
```js
const mutation = useBankLookup();
// mutation.mutate(urlString)
// mutation.isPending / mutation.isError / mutation.error / mutation.isSuccess
```

---

## Actual API Response Shape

This is the exact response shape returned by the backend. Build all UI around these fields:

```json
{
  "bank_url": "https://www.nbtc.com/",
  "login_urls": [
    "https://secure.nbtc.com/nbtconlinebanking/uux.aspx#/login",
    "https://www.depositorcontrol.com/login",
    "https://cashcon.nbopenbanking.com/login"
  ],
  "login_url": "https://secure.nbtc.com/nbtconlinebanking/uux.aspx#/login",
  "provider": "Q2",
  "all_providers": "Q2, FIS",
  "matched_patterns": "Q2: uux.aspx -> https://secure.nbtc.com/nbtconlinebanking/uux.aspx#/login | FIS: fislbxcentral.com"
}
```

### Field Descriptions

| Field | Type | Description |
|---|---|---|
| bank_url | string | The original URL submitted by the user |
| login_url | string | Primary detected login URL (best match) |
| login_urls | string[] | All login URLs detected across the site |
| provider | string | Primary identified provider (e.g. "Q2") |
| all_providers | string | Comma-separated list of all detected providers |
| matched_patterns | string | Pipe-separated string: provider, pattern, and matched URL per provider |

---

## Routing

```jsx
// App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import ResultPage from './pages/ResultPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/result" element={<ResultPage />} />
      </Routes>
    </BrowserRouter>
  );
}
```

Navigate on success:
```js
navigate('/result', { state: { data: mutation.data } });
```

---

## Page 2 — Result Page (/result)

### Access Data

```js
const { state } = useLocation();
const data = state?.data; // the full API response object
```

If data is null (direct navigation to /result), show a centered empty state:
- Icon: magnifying glass or search emoji
- Message: "No result to display"
- Button: "<- New Search" that navigates to /

---

### Result Page Layout (top to bottom)

---

#### 1. Top Bar

```
[ <- New Search ]       BankTech Finder       [ Copy Report ]
```

- Left: "<- New Search" button (ghost/outline style) -> navigate('/')
- Center: App name (subtle, small)
- Right: "Copy Report" button -> copies plain-text summary to clipboard

---

#### 2. Hero Card — Primary Provider

Large prominent card at the top of the report:

```
+--------------------------------------------------------+
|                                                        |
|   https://www.nbtc.com/          <- bank_url as link   |
|                                                        |
|   Primary Provider                                     |
|   +------------------+                                 |
|   |        Q2        |   <- large ProviderBadge        |
|   +------------------+                                 |
|                                                        |
|   All Detected Providers:   [Q2]   [FIS]               |
|   (split all_providers by ", " -> render each badge)   |
|                                                        |
+--------------------------------------------------------+
```

**ProviderBadge component**

Map known provider names to distinct background colors with white text:

| Provider | Color |
|---|---|
| Q2 | Purple #7c3aed |
| FIS | Blue #2563eb |
| Fiserv | Orange #ea580c |
| Jack Henry | Green #16a34a |
| NCR / NCR Voyix | Red #dc2626 |
| Finastra | Teal #0891b2 |
| Temenos | Indigo #4338ca |
| Unknown/Other | Gray #6b7280 |

- Large variant (primary provider): px-5 py-2 text-lg font-bold rounded-xl
- Small variant (all_providers list): px-3 py-1 text-sm font-semibold rounded-lg

---

#### 3. Primary Login URL Card

```
+----------------------------------------------------------+
|  Primary Login URL                                       |
|                                                          |
|  https://secure.nbtc.com/nbtconlinebanking/uux.aspx...   |
|                                          [ Open -> ]     |
+----------------------------------------------------------+
```

- Show login_url as monospace text, truncated (max ~80 chars), full URL in title tooltip
- "Open ->" button opens the URL in a new tab (target="_blank" rel="noopener noreferrer")
- If login_url is null or empty, show: "No primary login URL detected" in muted text

---

#### 4. All Detected Login URLs

```
+----------------------------------------------------------+
|  All Detected Login URLs  (3)                            |
|                                                          |
|  1.  https://secure.nbtc.com/nbtconlinebanking/uux... [->]|
|  2.  https://www.depositorcontrol.com/login           [->]|
|  3.  https://cashcon.nbopenbanking.com/login          [->]|
+----------------------------------------------------------+
```

- Render login_urls array as a numbered list
- Each row: index number + truncated monospace URL + external link icon button
- Heading shows count: "All Detected Login URLs (3)"
- If login_urls is an empty array or null: show "No additional login URLs found" in muted italic

---

#### 5. Detection Evidence — Matched Patterns

Parse the matched_patterns string and render it as a structured table.

**Input string example:**
```
"Q2: uux.aspx -> https://secure.nbtc.com/nbtconlinebanking/uux.aspx#/login | FIS: fislbxcentral.com"
```

**Parsing logic (implement in MatchedPatternsTable.jsx):**

Step 1: Split by " | " (pipe surrounded by spaces) to get per-provider segments:
```
["Q2: uux.aspx -> https://secure.nbtc.com/…", "FIS: fislbxcentral.com"]
```

Step 2: For each segment, split on the FIRST ": " occurrence to separate provider name from detail:
```
provider = "Q2"
detail   = "uux.aspx -> https://secure.nbtc.com/…"
```

Step 3: If detail contains " -> ", split on first " -> " to get pattern and matched_url:
```
pattern     = "uux.aspx"
matched_url = "https://secure.nbtc.com/nbtconlinebanking/uux.aspx#/login"
```
If no " -> " exists, the entire detail is the pattern and matched_url is null.

**Parsed output for the example:**
```js
[
  { provider: "Q2",  pattern: "uux.aspx",          matched_url: "https://secure.nbtc.com/…" },
  { provider: "FIS", pattern: "fislbxcentral.com",  matched_url: null }
]
```

**Rendered as a table:**

```
+----------------------------------------------------------+
|  Detection Patterns                                      |
|                                                          |
|  Provider  | Pattern            | Matched URL            |
|  ----------|--------------------|----------------------- |
|  [Q2]      | uux.aspx           | https://secure.nbt [->]|
|  [FIS]     | fislbxcentral.com  | —                      |
+----------------------------------------------------------+
```

- Provider column: ProviderBadge (small variant)
- Pattern column: inline code style (monospace, light bg)
- Matched URL column: truncated + [->] icon link if present, em dash if null
- If matched_patterns is null or empty string: hide this section entirely

---

#### 6. Copy Report — Clipboard Content

When user clicks "Copy Report", copy this plain-text string to clipboard:

```
BankTech Finder — Provider Report
==================================
Bank URL:          https://www.nbtc.com/
Primary Provider:  Q2
All Providers:     Q2, FIS

Primary Login URL:
  https://secure.nbtc.com/nbtconlinebanking/uux.aspx#/login

All Login URLs:
  1. https://secure.nbtc.com/nbtconlinebanking/uux.aspx#/login
  2. https://www.depositorcontrol.com/login
  3. https://cashcon.nbopenbanking.com/login

Matched Patterns:
  Q2:  uux.aspx -> https://secure.nbtc.com/nbtconlinebanking/uux.aspx#/login
  FIS: fislbxcentral.com

Generated: 3/10/2026, 2:32 PM
```

After copying, show a brief "Copied!" confirmation — either a shadcn Toast or a simple 2-second timed state that changes the button label to "Copied!" then resets.

---

## Design System

**Typography**
- Font family: DM Sans (import from Google Fonts)
- Headings: font-semibold tracking-tight text-slate-900
- Body/labels: text-sm text-slate-600
- URLs: font-mono text-sm break-all

**Color Palette**
```
Page background:  #f8fafc  (slate-50)
Card surface:     #ffffff  (white)
Card border:      #e2e8f0  (slate-200)
Primary text:     #0f172a  (slate-900)
Muted text:       #64748b  (slate-500)
Primary action:   #2563eb  (blue-600)
```

**Cards**: rounded-xl border border-slate-200 bg-white shadow-sm p-6 mb-4

**Spacing**: gap-6 between cards, p-6 inner padding, generous whitespace

**Primary button**: bg-blue-600 text-white hover:bg-blue-700 rounded-lg px-4 py-2 font-medium

**Ghost button**: border border-slate-200 hover:bg-slate-50 rounded-lg px-4 py-2 font-medium

---

## Loading State

While mutation.isPending is true, replace the form submit button area with:

```
  [spinner]  Analyzing bank website...
             Detecting login pages and provider fingerprints
```

Use Tailwind animate-spin for the spinner. Subtle pulsing subtext (animate-pulse on the subtext).
Do not navigate or show skeleton of result — keep user on landing page until response arrives.

---

## Edge Cases to Handle

| Scenario | Behavior |
|---|---|
| Empty URL field on submit | Inline validation error, no API call fired |
| Invalid URL format | "Please enter a valid URL including https://" below input |
| API returns non-2xx | Red alert on landing page, stay on page, show error message |
| Direct navigation to /result | Empty state with "<- New Search" button |
| login_urls is empty array | "No login URLs detected" fallback message |
| login_urls has 1 item | Still render numbered list, count shows (1) |
| all_providers has 1 provider | Single badge, renders fine |
| matched_patterns is null/empty | Hide Detection Patterns section entirely |
| Provider not in color map | Render gray badge |
| URL too long to display | Tailwind truncate class + title attribute for tooltip |
| login_url is null | "No primary login URL detected" in muted text |

---

## Accessibility Requirements

- All input elements have label with matching htmlFor/id pairing
- Error messages use role="alert" so screen readers announce them immediately
- External link buttons include aria-label="Open [URL] in new tab"
- All icon-only buttons have aria-label
- Color is never the sole indicator of meaning (badges use text labels, not just color)
- Focus is visible on all interactive elements (do not remove outline)

---

## What NOT to Build

- No authentication or login screen
- No backend, database, or server-side code
- No bulk processing logic (just the disabled placeholder UI)
- No result history or saved searches
- No user accounts
