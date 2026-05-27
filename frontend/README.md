# VedaAI Assessment Creator - Frontend 🎨

**🔗 Live Demo / Production Link:** [vedaai-assessment-creator-seven.vercel.app](https://vedaai-assessment-creator-seven.vercel.app/)

The VedaAI Assessment Creator frontend is built using Next.js (v16 App Router), Redux Toolkit, React Hook Form, Zod schema validation, and Socket.io-client. It matches the original Figma layout designs precisely, featuring high-fidelity printable assessment details page layouts, Teacher/Student toggles, and client-side high-resolution multi-page PDF generation.

---

## 💎 Premium Frontend Features & Interface Capabilities

1. **State-of-the-Art Next.js Architecture**:
   - Leverages **Next.js App Router** with robust component division (`app` directory routes and dynamic path bindings).
   - Designed around mobile-first responsiveness, transitioning from full desktop layouts to smooth mobile bottom capsule navigation bars.

2. **Advanced Client State Management (Redux Toolkit - RTK)**:
   - Configured with a single store standard utilizing specialized state slices:
     - `assignmentSlice.ts`: Orchestrates real-time CRUD caching, active search filtering, and view state.
     - `socketSlice.ts`: Drives smooth, ticking progress percentage numbers streamed over WebSockets.
     - `generationSlice.ts`: Stores immediate AI worker statuses (`idle` \| `generating` \| `completed` \| `failed`).

3. **High-Fidelity PDF Export Compilation Engine**:
   - Employs runtime dynamic code imports to eliminate SSR hydration issues and keep initial JS bundle sizes featherweight.
   - Utilizes `html2canvas` capturing a double-scale canvas (`scale: 2`) to ensure crystal-clear text vector borders.
   - Uses `jsPDF` executing dynamic page height math shifts to cleanly break pages at question margins without clipping.
   - **Tailwind OKLCH Fix**: Implements custom CSS override styles at runtime to bridge the compatibility gap between `html2canvas` and Tailwind v4's OKLCH color notations.

4. **Native `@media print` Layout Adapters**:
   - Outfitted with native print overrides specifying standard `A4` size and `15mm 20mm` page margins.
   - Hides dashboard cards, header menus, and actions automatically (`no-print`), adjusting option grid layouts cleanly so physical printed sheets feel highly academic and standard.

5. **Dynamic Form Synthesizer (React Hook Form & Zod)**:
   - Validates user input models in real-time. Prevents empty topics, incorrect grades, and invalid date formats.
   - Employs dynamic question row parameters (allowing custom combinations of Multiple Choice, Short Answer, and True/False configurations with tailored mark counts).

6. **Mobile Action Dropdowns & Tap-Outside Event Listeners**:
   - Implements a resilient 3-dot action dropdown featuring dedicated **"View"** and **"Delete"** actions.
   - Mitigates mobile web browser touch bubblings by configuring a native double listener (`click` & `touchstart`) at the document root, using ancestry validation (`.closest('.dropdown-container')`) to verify tap boundary limits.

---

## 🛠️ Frontend Code Map: Implementation Reference

Walk the interviewer through the frontend layers using these file pointers:

| Module / Component | Technical Responsibility | Implementation Path |
| :--- | :--- | :--- |
| **State Store** | Combines slices and configures typed dispatch Hooks | [`src/redux/store.ts`](file:///c:/Users/sudee/Coding%20adda/veda%20ai/vedaai-assessment-creator/frontend/src/redux/store.ts) |
| **Assignments Cache Slice** | Handles actions like `setAssignments`, `addAssignment`, `deleteAssignment` | [`src/redux/slices/assignmentSlice.ts`](file:///c:/Users/sudee/Coding%20adda/veda%20ai/vedaai-assessment-creator/frontend/src/redux/slices/assignmentSlice.ts) |
| **WebSocket Progress Slice** | Tracks dynamic progress values to animate screen loaders | [`src/redux/slices/socketSlice.ts`](file:///c:/Users/sudee/Coding%20adda/veda%20ai/vedaai-assessment-creator/frontend/src/redux/slices/socketSlice.ts) |
| **Dashboard Layout Grid** | Incorporates live query searches, status filters, and Action Dropdowns | [`src/app/assignments/page.tsx`](file:///c:/Users/sudee/Coding%20adda/veda%20ai/vedaai-assessment-creator/frontend/src/app/assignments/page.tsx) |
| **Assessment Creator Form** | Implements React Hook Form and Zod for creating assignments | [`src/app/assignments/create/page.tsx`](file:///c:/Users/sudee/Coding%20adda/veda%20ai/vedaai-assessment-creator/frontend/src/app/assignments/create/page.tsx) |
| **PDF Compiler & Print Sheets** | Drives double-scale canvas renders, page splits, and CSS `@media print` | [`src/app/assignments/[id]/page.tsx`](file:///c:/Users/sudee/Coding%20adda/veda%20ai/vedaai-assessment-creator/frontend/src/app/assignments/%5Bid%5D/page.tsx) (in `handleDownloadPDF` and `@media print`) |
| **Socket Providers** | Injects runtime global configurations and WebSocket listeners | [`src/app/providers.tsx`](file:///c:/Users/sudee/Coding%20adda/veda%20ai/vedaai-assessment-creator/frontend/src/app/providers.tsx) |
| **API Connectors** | Encapsulates axios REST calls to backend routing controllers | [`src/lib/api.ts`](file:///c:/Users/sudee/Coding%20adda/veda%20ai/vedaai-assessment-creator/frontend/src/lib/api.ts) |

---

## 🚀 Setup & Installation

### **Prerequisites**
Ensure you have **Node.js (v18.0.0 or higher)** installed.

### **1. Install Dependencies**
From the `/frontend` directory:
```bash
npm install
```

### **2. Configure Environment Variables**
Create a new file named `.env.local` inside this `/frontend` directory:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```
This env key binds your Next.js application to the active backend API server and Socket.io events.

### **3. Start Development Server**
Launch the Next-Dev compiler:
```bash
npm run dev
```
Open **`http://localhost:3000`** in your browser to view the application.

---

## 🛠️ Main Build & Production Commands

*   **Typecheck and Compile**:
    Validate TypeScript type safety and compile Next.js production builds:
    ```bash
    npm run build
    ```
*   **Run Production Server**:
    Launch production bundles locally:
    ```bash
    npm start
    ```
*   **Lint Check**:
    Run ESLint validation:
    ```bash
    npm run lint
    ```

---

## 📄 Client-Side PDF Generation Engine
VedaAI implements a premium client-side PDF export system:
- **High-Resolution Vector Graphics**: Utilizes double-scale canvas rendering (`scale: 2`) via `html2canvas` to prevent text pixelation.
- **Pristine Page Boundaries**: Strips screen shadows and rounded card borders dynamically during rendering.
- **Dynamic Multi-page A4 Distribution**: Employs mathematical height-shifting loops inside `jspdf` to split questions across A4 margins smoothly.
- **Custom Print Media**: Backup **Print Paper** action formats styles natively using `@media print` directives with standardized `@page` margins, hiding active navigation menus automatically (`no-print`).
