# AI-Powered Compliance & Workflow Management System

An intelligent, multi-tenant compliance management platform with AI-powered root cause analysis, workflow automation, SLA monitoring, and comprehensive audit trailing.

## 🎯 Overview

This system helps organizations streamline compliance issue management by:
- **Creating & tracking** compliance issues with automatic SLA monitoring
- **Automating workflows** through customizable state machines with role-based transitions
- **AI-powered insights** using Groq AI for root cause analysis
- **Real-time collaboration** with WebSocket-powered live updates
- **Complete audit trails** for regulatory compliance (21 CFR Part 11)
- **Multi-tenant architecture** with complete data isolation between organizations

## ✨ Key Features

### Issue Management
- ✅ Create, edit, and track compliance issues
- ✅ Flexible categorization (Quality, Process, Safety, Regulatory, Operational)
- ✅ Priority-based prioritization (Critical, High, Medium, Low)
- ✅ SLA countdown with automatic breach detection
- ✅ Assign to teams and track progress
- ✅ Real-time issue status updates across all connected users

### Workflow Automation
- ✅ Customizable state machines (define your own workflow states)
- ✅ Role-based state transitions (Admin, Manager, Reviewer, User)
- ✅ Enforce compliance business rules through transitions
- ✅ Prevent invalid state changes
- ✅ Multiple workflows per organization

### AI Integration
- ✅ **Groq AI** integration for intelligent analysis (llama-3.1-8b-instant model)
- ✅ Generate root cause analysis on-demand
- ✅ Structured compliance insights:
  - Root Cause Identification
  - Contributing Factors
  - Impact Assessment
  - Recommended Corrective Actions
  - Preventive Measures
- ✅ Multiple summary versions per issue

### Monitoring & Analytics
- ✅ **Real-time dashboard** with:
  - Total issues count
  - SLA breach percentage
  - Average resolution time
  - Issues by status (pie chart)
  - Issues by priority (bar chart)
  - Monthly trends (line chart)
- ✅ **SLA Monitoring**:
  - Automatic breach detection (background job)
  - Real-time notifications to assignees
  - Visual countdown timer per issue

### Audit & Compliance
- ✅ Complete audit logging of all actions
- ✅ Track who did what and when
- ✅ Before/after value changes
- ✅ Entity-based audit trail filtering
- ✅ Filter by date range, entity type, and actions

### Real-Time Collaboration
- ✅ **WebSocket-powered live updates**:
  - Instant issue creation/update notifications
  - Real-time SLA breach alerts
  - Status change broadcasts
  - Live dashboard stats
- ✅ Tenant-scoped rooms (organization isolation)
- ✅ User-specific notifications
- ✅ Issue-specific subscribers

### Multi-Tenancy
- ✅ Complete data isolation per organization
- ✅ Automatic tenant filtering at all data layers
- ✅ Per-organization workflows and settings
- ✅ Role-based access control within tenants

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js (v18+)
- **Framework**: Express.js
- **Database**: MongoDB + Mongoose ODM
- **Real-Time**: Socket.IO
- **Authentication**: JWT (7-day expiration)
- **Password Hashing**: bcrypt
- **AI**: Groq AI (llama-3.1-8b-instant via groq-sdk)
- **Task Scheduling**: Node.js native (background jobs)

### Frontend
- **Framework**: React 18
- **Build Tool**: Vite
- **Routing**: React Router v6
- **State Management**: React Context API
- **Real-Time**: Socket.IO Client
- **HTTP Client**: Axios
- **Charts**: Recharts
- **Icons**: React Icons
- **Notifications**: React Hot Toast
- **Styling**: CSS (custom theme system)

### Development Tools
- **API Testing**: Postman
- **Version Control**: Git

## 📋 Prerequisites

- Node.js v18 or higher
- MongoDB (local or Atlas)
- Groq API Key (optional, for AI features)
- npm or yarn

## 🚀 Quick Start

### Option A: Node.js Development (Recommended)

#### 1. Clone & Install Dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

#### 2. Environment Setup

##### Backend (.env)
```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/compliance_system
# OR for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/compliance_system

# JWT
JWT_SECRET=your_super_secret_jwt_key_here_change_in_production
JWT_EXPIRE=7d

# AI (Optional) - Groq
GROQ_API_KEY=your_groq_api_key_here

# CORS
CORS_ORIGIN=http://localhost:5173

# Server Config
SOCKET_PORT=5000
```

##### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```


#### 3. Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000/api
- **Default Login**: 
  - Email: demo@company.com
  - Password: password123

---

### Option B: Docker (Production-Like Environment)

#### 1. Requirements
- Docker Desktop installed and running
- (Optional) Groq API key for AI features

#### 2. Build & Run with Docker Compose

```bash
# From the project root directory
docker-compose up --build

# Or to run in background:
docker-compose up --build -d
```

This will:
- ✅ Start MongoDB container (with persistence)
- ✅ Build and start the backend API
- ✅ Expose backend on http://localhost:5000
- ✅ Create isolated network between services

#### 3. Frontend Setup (Run Separately)

```bash
cd frontend
npm install
npm run dev
# Application runs on http://localhost:5173
```

#### 4. Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000/api
- **MongoDB**: localhost:27017 (accessible from host machine)

#### 5. Docker Compose Commands

```bash
# Start services
docker-compose up -d

# View logs
docker-compose logs -f backend

# Stop services
docker-compose down

# Stop and remove data
docker-compose down -v

# Rebuild after code changes
docker-compose up --build -d
```

#### 6. Passing Groq API Key to Docker

```bash
# Set environment variable before running docker-compose
export GROQ_API_KEY=your_groq_api_key_here

# Or pass directly
GROQ_API_KEY=your_key docker-compose up -d
```

#### 7. Troubleshooting Docker

**Port already in use?**
```bash
# Change port in docker-compose.yml
ports:
  - "5001:5000"  # Maps host:5001 → container:5000
```

**MongoDB connection failed?**
```bash
# Wait for MongoDB to be healthy
docker-compose logs mongo

# Restart services
docker-compose down
docker-compose up -d
```

**Permission denied?**
```bash
# On Windows, ensure Docker Desktop is running
# On Mac/Linux, use sudo if needed
```

---

## � System Screenshots

### Dashboard Overview
![Dashboard Overview](docs/base_1.jpeg)
*Real-time analytics dashboard showing issue statistics, SLA metrics, and trends*

### Issue Management
![Issue Management](docs/1.jpeg)
*Create and manage compliance issues with status tracking and SLA monitoring*

### Workflows & Transitions
![Workflow Management](docs/2.jpeg)
*Define custom workflows with configurable state machines and role-based transitions*

### Audit Trail
![Audit Logging](docs/3.jpeg)
*Comprehensive audit logs tracking all system actions for compliance*

### Real-Time Updates
![Real-Time Collaboration](docs/4.jpeg)
*Live updates and notifications for team collaboration*

## WorkFlow Overview
![Diagram](docs/work.png)

## �📁 Project Structure

```
AI-Powered Compliance System/
├── backend/
│   ├── src/
│   │   ├── app.js                 # Express app setup
│   │   ├── config/                # Configuration files
│   │   │   ├── db.js            # MongoDB connection
│   │   │   └── index.js          # Config loader
│   │   ├── controllers/           # Business logic handlers
│   │   ├── models/                # MongoDB schemas
│   │   ├── routes/                # API endpoints
│   │   ├── services/              # Reusable services (AI, Audit, Workflow)
│   │   ├── middlewares/           # Auth, RBAC, Error handling
│   │   ├── utils/                 # Helper functions
│   │   ├── jobs/                  # Background jobs (SLA checker)
│   │   └── sockets/               # WebSocket handlers
│   ├── postman_collection.json    # API documentation
│   ├── package.json
│   └── Dockerfile
│
├── frontend/
│   ├── src/
│   │   ├── main.jsx               # App entry point
│   │   ├── App.jsx                # Route definitions
│   │   ├── components/            # Reusable UI components
│   │   ├── pages/                 # Full page components
│   │   ├── context/               # React Context (Auth, Socket)
│   │   ├── services/              # API client
│   │   ├── hooks/                 # Custom React hooks
│   │   ├── styles/                # CSS files
│   │   └── utils/                 # Helper functions
│   ├── vite.config.js
│   ├── package.json
│   ├── index.html
│   └── public/
│
├── docs/                           # Documentation
│   ├── 1_onboarding.md
│   ├── 2_system_design.md
│   └── 3_project_status.md
│
├── COMPLETE_CODE_FLOW.md          # Detailed technical flows
└── README.md                       # This file
```



## 🛡️ Security Features

✅ **JWT Token Authentication** - 7-day expiration, httpOnly cookies ready
✅ **bcrypt Password Hashing** - 10 salt rounds
✅ **Multi-Tenant Data Isolation** - Automatic query filtering
✅ **RBAC (Role-Based Access Control)** - Role-based route protection
✅ **Input Validation** - Mongoose schema validation
✅ **Error Handling** - Async error wrapping
✅ **CORS Protected** - Configured for frontend domain
✅ **Audit Logging** - Every action tracked and logged

## 🏢 How Multi-Tenancy Works

This system supports **multiple independent organizations** in a single database with complete data isolation. Each organization's data is automatically filtered and cannot be accessed by users from other organizations.

### Multi-Tenant Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    API Requests                         │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│  1️⃣  Auth Middleware - Verify JWT Token                │
│      - Extracts: user.organization._id                 │
│      - Sets: req.tenantId                              │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│  2️⃣  Tenant Resolver - Create Scope                    │
│      - Creates: req.tenantScope = {                     │
│          organization: req.tenantId                     │
│        }                                                │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│  3️⃣  Controller - Apply Tenant Filter                  │
│      Issue.find({                                       │
│        organization: req.tenantId,  ← Auto-filtered    │
│        ...otherFilters                                  │
│      })                                                 │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│  4️⃣  Database Query - Return Scoped Data              │
│      - Only issues from user's organization            │
│      - Data from other orgs remains hidden             │
└─────────────────────────────────────────────────────────┘
```

