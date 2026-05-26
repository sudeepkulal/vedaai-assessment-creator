# VedaAI Assessment Creator - Frontend 🎨

The VedaAI Assessment Creator frontend is built using Next.js (v16 App Router), Redux Toolkit, React Hook Form, Zod schema validation, and Socket.io-client. It matches the original Figma layout designs precisely, featuring high-fidelity printable assessment details page layouts, Teacher/Student toggles, and client-side high-resolution multi-page PDF generation.

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
