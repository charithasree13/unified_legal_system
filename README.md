# Unified Legal Management System

A comprehensive full-stack legal management platform designed for Advocates, Clients, and Legal Administrators. The system includes case management, document verification & signing, real-time client-advocate chat, automated land unit conversion, court fee calculators, and AI-assisted case summarization.

## 🚀 Features

- **Multi-Role Authentication & Access**: Secure JWT authentication with role-based access control (Advocate, Client, Admin).
- **Case & Project Tracking**: End-to-end case tracking, hearings schedule, status updates, and milestone monitoring.
- **Real-Time Messaging**: Real-time WebSocket support for client-advocate communications.
- **Legal Tools & Calculators**:
  - Land Conversion Calculator (SqFt, SqYard, Acre, Hectare, Bigha, Cent, Gunta).
  - State & Court Fee Regulatory Calculator (Maharashtra, Delhi, Karnataka, etc.).
- **Document Vault**: Upload, organize, preview, and manage legal documents securely.
- **Audit Logs & Security**: Comprehensive activity tracking, CSRF protection, Helmet HTTP security headers.
- **Resilient Database Layer**: MongoDB Atlas integration with mock JSON fallback mode.

---

## 📁 Repository Structure

```
unified-legal-system/
├── client/              # React + Vite frontend application
│   ├── src/             # Pages, Components, Hooks, State Stores
│   ├── public/          # Static assets
│   └── package.json     # Frontend dependencies
├── server/              # Node.js + Express + TypeScript backend API
│   ├── src/             # Controllers, Models, Routes, Sockets, Middleware
│   ├── data/            # Seed data / Mock JSON database fallback
│   ├── uploads/         # Uploaded documents directory
│   ├── .env.example     # Environment variable template
│   └── package.json     # Backend dependencies
├── verify_api.js        # Core algorithm verification unit test runner
├── package.json         # Workspace root scripts
└── README.md            # Project documentation
```

---

## 🛠️ Setup & Installation

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+ recommended)
- [npm](https://www.npmjs.com/)
- [MongoDB](https://www.mongodb.com/) (Optional - fallback mock DB is built-in)

### 1. Clone the Repository
```bash
git clone https://github.com/charithasree13/unified_legal_system.git
cd unified_legal_system
```

### 2. Install Dependencies
```bash
# Install root, client, and server dependencies
npm run install:all
```

### 3. Environment Configuration
Create a `.env` file inside the `server/` directory based on `server/.env.example`:

```bash
cp server/.env.example server/.env
```

Edit `server/.env`:
```env
PORT=5000
JWT_SECRET=your_jwt_secret_key_here
JWT_REFRESH_SECRET=your_jwt_refresh_secret_key_here
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/unified-legal-system?retryWrites=true&w=majority
USE_MOCK_DB=false
```

---

## 🚦 Running the Application

### Development Mode (Runs Server + Client concurrently)
```bash
npm run dev
```
- **Frontend App**: `http://localhost:5173` (or port indicated by Vite)
- **Backend API**: `http://localhost:5000`

### Running Server Only
```bash
npm run dev:server
```

### Running Client Only
```bash
npm run dev:client
```

---

## 🧪 Verification & Testing

To verify core land conversion algorithms and court fee calculations:
```bash
node verify_api.js
```

---

## 📦 Deployment Instructions

### Build for Production
```bash
npm run build
```

- **Frontend build output**: `client/dist`
- **Backend build output**: `server/dist`

### Starting Production Backend
```bash
cd server
npm start
```

---

## 🛡️ License

This project is licensed under the MIT License.
