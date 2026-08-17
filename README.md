<div align="center">
  <h1>🏢 Complete Enterprise Resource Planning (ERP) System</h1>
  <p>
    <strong>A robust, scalable, and feature-rich ERP solution built with the MERN stack (MongoDB, Express, React, Node.js).</strong>
  </p>
  <p>
    <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
    <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node" />
    <img src="https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express" />
    <img src="https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB" />
    <img src="https://img.shields.io/badge/Material--UI-0081CB?style=for-the-badge&logo=mui&logoColor=white" alt="MUI" />
  </p>
</div>

<br />

## 📖 Table of Contents
- [Overview](#-overview)
- [Core Modules & Features](#-core-modules--features)
- [Technology Stack](#-technology-stack)
- [Project Architecture](#-project-architecture)
- [Prerequisites](#-prerequisites)
- [Installation & Setup](#-installation--setup)
- [Environment Variables](#-environment-variables)
- [Available Scripts](#-available-scripts)
- [Docker Deployment](#-docker-deployment)
- [License](#-license)

---

## 🎯 Overview

This ERP system is designed to streamline operations, enhance communication, and provide data-driven insights across an organization. It centralizes various business processes—such as human resources, inventory, finance, and customer relationship management (CRM)—into a single, intuitive interface. 

It leverages real-time technologies, modern UI/UX paradigms, and even AI capabilities to automate and optimize enterprise workloads.

---

## 🧩 Core Modules & Features

### 1. 🔐 Security & Access Control
- **Role-Based Access Control (RBAC)**: Fine-grained permissions for Admins, Managers, and Employees.
- **JWT Authentication**: Secure stateless session management.
- **Data Encryption**: `bcryptjs` for secure password hashing and secure data storage.
- **Rate Limiting & Security Headers**: Integrated `express-rate-limit` and `helmet` to protect against DDoS and common web vulnerabilities.

### 2. 📊 Analytics & Reporting
- **Dynamic Dashboards**: Built with `recharts` and `chart.js` for real-time KPI tracking.
- **Advanced Exporting**: 
  - Export grid data and financials to Excel using `exceljs` and `xlsx`.
  - Generate customized PDF reports and invoices on the fly with `pdfkit`, `jspdf`, and `html2canvas`.

### 3. 🗓️ Scheduling & Task Management
- **Interactive Calendars**: Powered by `@fullcalendar/react` and `react-big-calendar` for visualizing deadlines, meetings, and shift schedules.
- **Drag & Drop Task Boards**: Agile-friendly task management using `react-dnd`.

### 4. 💬 Real-Time Communication & Notifications
- **WebSockets**: Live updates, chat features, and notifications via `socket.io`.
- **Email & Push Notifications**: Automated emails via `nodemailer` and browser push notifications using `web-push`.

### 5. 🤖 AI & Advanced Integrations
- **AI Analytics**: Integrated `@tensorflow/tfjs` and `openai` for predictive insights, smart Q&A, and automated data processing.
- **Location Tracking**: `@react-google-maps/api` for supply chain and asset geographical tracking.
- **QR Code & Inventory Tracking**: Print and scan QR codes natively using `qrcode` and `qr-scanner`.

### 6. 💰 Finance & Billing
- **Payment Processing**: Integrated `stripe` SDK for handling subscriptions, client billing, and secure financial transactions.

### 7. 📁 Document & Asset Management
- **Cloud Storage**: Deep integration with `@google-cloud/storage` for enterprise file hosting.
- **Local Fallbacks**: `multer` for local server uploads.
- **Rich Text Editing**: `tinymce-react` for WYSIWYG document editing.

---

## 💻 Technology Stack

| Category | Technologies / Libraries Used |
| :--- | :--- |
| **Frontend Framework** | React.js (v18), React Router DOM (v7) |
| **UI Components** | Material-UI (MUI v5), Emotion, Styled Components |
| **Data Visualization** | Recharts, Chart.js, React-Chartjs-2 |
| **State & API** | Axios, Context API |
| **Backend Runtime** | Node.js, Express.js |
| **Database & ORM** | MongoDB, Mongoose |
| **Authentication** | JSON Web Tokens (JWT), Speakeasy (2FA) |
| **Real-time** | Socket.io |
| **File Handling** | Multer, Google Cloud Storage, Archiver |
| **Document Generation** | PDFKit, jsPDF, ExcelJS |

---

## 🏗️ Project Architecture

```text
ERP/
├── backend/                  # Node.js Server Environment
│   ├── src/
│   │   ├── controllers/      # Route handlers / Business logic
│   │   ├── models/           # Mongoose DB Schemas
│   │   ├── routes/           # Express API endpoints definition
│   │   ├── middlewares/      # Auth, Error handling, Uploads
│   │   ├── utils/            # Helper functions, Mailer, PDF generators
│   │   └── app.js            # Express application setup
│   ├── database/             # Database connection logic
│   ├── uploads/              # Local storage for non-cloud assets
│   └── package.json          # Backend dependencies
│
├── frontend/                 # React Client Environment
│   ├── public/               # Static files (index.html, manifest, icons)
│   ├── src/
│   │   ├── components/       # Reusable UI components (Buttons, Modals)
│   │   ├── pages/            # View components (Dashboard, Login, Settings)
│   │   ├── context/          # React Context (Auth State, Theme State)
│   │   ├── hooks/            # Custom React Hooks
│   │   ├── services/         # Axios API clients
│   │   └── utils/            # Formatting and helper logic
│   └── package.json          # Frontend dependencies
│
├── package.json              # Root config (concurrent scripts)
└── README.md                 # Project Documentation
```

---

## ⚙️ Prerequisites

Before you begin, ensure you have met the following requirements:
*   **Node.js**: v16.0.0 or higher.
*   **MongoDB**: A local installation or a MongoDB Atlas connection URI.
*   **Git**: For version control.

---

## 🚀 Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd ERP
   ```

2. **Install all dependencies:**
   This project uses `npm-run-all` to easily install dependencies for both the frontend and backend simultaneously from the root directory.
   ```bash
   npm run install-all
   ```

3. **Start the Development Server:**
   To run both the React frontend and Node/Express backend simultaneously using `concurrently`:
   ```bash
   npm run dev
   ```
   *   **Frontend**: `http://localhost:3000` (Proxy configured to point to backend)
   *   **Backend**: `http://localhost:5000`

---

## 🔐 Environment Variables

You will need to configure environment variables for both the backend and frontend.

### Backend (`backend/.env`)
Create a `.env` file in the `backend/` directory:
```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/erp-db

# Authentication
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRES_IN=30d

# Payments (Stripe)
STRIPE_SECRET_KEY=sk_test_your_stripe_key

# Cloud Storage (Google Cloud)
GCS_PROJECT_ID=your-gcp-project-id
GCS_KEYFILE_PATH=./path/to/your/gcp-service-account.json
GCS_BUCKET_NAME=your-erp-bucket

# Email Services
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=2525
SMTP_USER=your_smtp_user
SMTP_PASS=your_smtp_password
```

### Frontend (`frontend/.env`)
Create a `.env` file in the `frontend/` directory if necessary (e.g., for public API keys):
```env
REACT_APP_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
REACT_APP_STRIPE_PUBLIC_KEY=pk_test_your_stripe_public_key
```

---

## 📜 Available Scripts

In the root directory, you can run:

*   `npm run dev`: Starts both frontend and backend concurrently in development mode.
*   `npm run install-all`: Installs dependencies in both `frontend` and `backend` folders.
*   `npm run start`: Starts the backend server (typically for production environments).
*   `npm run cleanup`: Stops running processes and removes `node_modules` folders for a fresh start.

In the `backend` directory:
*   `npm run seed`: Runs the database seeder to populate initial data (Users, Roles, etc.).

---

## 🐳 Docker Deployment

This repository is fully container-ready with Dockerfiles for both frontend and backend.

**To build the images:**
```bash
# Build Backend
docker build -t erp-backend ./backend

# Build Frontend
docker build -t erp-frontend ./frontend
```

*(For a fully automated deployment, a `docker-compose.yml` file is recommended to orchestrate the Node.js server, React UI build, and a MongoDB container instance.)*

---

## 📄 License

This project is licensed under the **ISC License**.
