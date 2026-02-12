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

#### 3. Database Setup

```bash
# MongoDB must be running
# For local MongoDB:
mongod

# For MongoDB Atlas, provide connection string in backend/.env
```

#### 4. Start the Application

##### Terminal 1 - Backend
```bash
cd backend
npm start
# Server runs on http://localhost:5000
```

##### Terminal 2 - Frontend
```bash
cd frontend
npm run dev
# Application runs on http://localhost:5173
```

#### 5. Access the Application

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

## 🔐 Authentication & Authorization

### User Roles & Permissions

| Role     | Capabilities |
|----------|-------------|
| **Admin**    | Full system control, manage workflows, manage all users, delete issues, view audit logs |
| **Manager**  | Operational oversight, delete issues, view audit logs, transition issues (based on workflow) |
| **Reviewer** | Approval authority, transition to approved, view assigned/all issues |
| **User**     | Create issues, view all tenant issues, update issue details, limited transitions |

### Login Flow
1. User registers with email, password, and creates organization
2. First user becomes organization Admin
3. Admin can create additional users with different roles
4. JWT token automatically includes organization ID
5. All API requests are automatically filtered by user's organization

## 📊 Main Workflows

### Creating an Issue
1. Navigate to Issues page
2. Click "Create Issue" button
3. Fill in details:
   - Title & Description
   - Category (Quality, Process, Safety, Regulatory, Operational)
   - Priority (Critical, High, Medium, Low)
   - Assign to user (optional)
   - Due date
4. Submit → Issue created in "Draft" state
5. Workflow transitions available based on your role

### Transitioning Issues
1. Open issue detail page
2. Click "Change Status" button
3. Select allowed next state (varies by role and workflow)
4. Confirmation → Status updated, audit logged, real-time notification sent

### Generating AI Summary
1. Open issue detail page
2. Scroll to "AI Root Cause Analysis" section
3. Click "Generate Summary"
4. AI analyzes issue and returns structured insights
5. Summary stored for future reference

### Monitoring SLA
- Dashboard shows SLA breach percentage
- Each issue displays countdown timer
- **Red** = Critical (< 24 hours)
- **Yellow** = Warning (< 7 days)
- **Green** = On Track
- Background job checks every 10 seconds

## 🔌 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication Header
All protected endpoints require:
```
Authorization: Bearer {JWT_TOKEN}
```

### Key Endpoints

#### Authentication
- `POST /auth/register` - Create new organization & admin user
- `POST /auth/login` - Login and get JWT token
- `GET /auth/me` - Get current user details
- `GET /auth/users` - List organization users
- `POST /auth/users` - Create new user

#### Issues
- `POST /issues` - Create issue
- `GET /issues` - List issues (with filters)
- `GET /issues/:id` - Get issue details
- `PUT /issues/:id` - Update issue
- `PATCH /issues/:id/transition` - Change issue status
- `DELETE /issues/:id` - Delete issue

#### Workflows
- `GET /workflows` - List workflows
- `POST /workflows` - Create workflow
- `PUT /workflows/:id` - Update workflow
- `DELETE /workflows/:id` - Delete workflow

#### Dashboard
- `GET /dashboard` - Get dashboard statistics

#### Audit
- `GET /audit` - Get audit logs
- `GET /audit/entity/{entity}/{entityId}` - Get entity-specific audit trail

#### AI
- `POST /ai/summarize/:issueId` - Generate AI summary
- `GET /ai/summaries/:issueId` - Get issue summaries

**See `postman_collection.json` for complete API documentation with request/response examples.**

## 🔄 Real-Time Features

### WebSocket Events

**Issue Events** (broadcast to entire organization)
- `issue:created` - New issue created
- `issue:updated` - Issue modified
- `issue:deleted` - Issue removed
- `issue:statusChanged` - Status transitioned

**User Notifications** (sent to specific user)
- `sla:breached` - SLA deadline missed
- `issue:assigned` - Issue assigned to user

**Dashboard Updates**
- Real-time chart updates when issues change
- Live SLA statistics
- Instant KPI updates

## 🧪 Testing with Postman

1. **Import Collection**
   - Open Postman
   - File → Import → Select `backend/postman_collection.json`

2. **Setup Variables**
   - Create environment with:
     - `baseUrl`: http://localhost:5000/api
     - `token`: (will be auto-populated on login)

3. **Run Requests**
   - Register first user/organization
   - Login (token auto-stored)
   - Create issues, workflows, etc.
   - Test transitions and workflows

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

### Real-World Example

**Two Organizations, Single Database:**

```
Organizations:
├── Demo Company (Org ID: ORG_A)
│   ├── Users: demo@company.com (Admin)
│   └── Issues: Issue #1, Issue #3
│
└── Acme Corporation (Org ID: ORG_B)
    ├── Users: admin@acme.com (Admin)
    └── Issues: Issue #2, Issue #4

Database Issues Collection (All Mixed):
├── { id: 1, title: "Issue 1", organization: ORG_A }
├── { id: 2, title: "Issue 2", organization: ORG_B }
├── { id: 3, title: "Issue 3", organization: ORG_A }
└── { id: 4, title: "Issue 4", organization: ORG_B }
```

**When Demo Company User Calls `/api/issues`:**
```javascript
// Request automatically filtered:
Issue.find({ organization: ORG_A })

// Returns only:
├── Issue #1 (Demo Company) ✅
└── Issue #3 (Demo Company) ✅
// Issues #2 & #4 hidden from this user ❌
```

**When Acme Corp User Calls `/api/issues`:**
```javascript
// Request automatically filtered:
Issue.find({ organization: ORG_B })

// Returns only:
├── Issue #2 (Acme Corp) ✅
└── Issue #4 (Acme Corp) ✅
// Issues #1 & #3 hidden from this user ❌
```

### Key Benefits

| Aspect | Benefit |
|--------|---------|
| **Data Security** | Complete isolation - no data leakage between orgs |
| **Cost Efficient** | Single database for multiple organizations |
| **Automatic Filtering** | Tenant ID from JWT, applied to every query |
| **No Manual Checks** | Filtering happens at middleware level |
| **Tamper-Proof** | JWT is signed, cannot be forged |
| **Scalable** | Add new orgs without infrastructure changes |

### Configuration

Tenant header is configured in `.env`:
```env
TENANT_HEADER=x-tenant-id
```

> **Note**: This header name is for future flexibility. Currently, tenant ID is **extracted from JWT token** during authentication, not from HTTP headers, which makes it more secure.

### API Examples

**Login (get organization-scoped token):**
```bash
POST /api/auth/login
{
  "email": "demo@company.com",
  "password": "password123"
}
# Returns JWT with organization: "ORG_A_ID"
```

**Access Issues (auto-scoped to organization):**
```bash
GET /api/issues
Authorization: Bearer eyJhbGc...  # Contains organization info
# Automatically returns only ORG_A issues
```

**Create Issue (auto-assigned to organization):**
```bash
POST /api/issues
Authorization: Bearer eyJhbGc...
{
  "title": "New Issue",
  "description": "..."
}
# Automatically saved with organization: ORG_A_ID
```

## 📈 Performance

- **Database Indexes** on organization, status, dueDate for fast queries
- **Pagination** (20 items/page) for large datasets
- **Lazy Loading** of AI summaries and details
- **WebSocket Rooms** for efficient broadcasting
- **Background Job** runs asynchronously without blocking requests

## � Troubleshooting

### Frontend not loading?
```bash
# Clear node_modules and reinstall
cd frontend
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Backend connection error?
```bash
# Check MongoDB is running
mongod

# Check backend is running on correct port
curl http://localhost:5000/api/health
```

### WebSocket connection failed?
- Check CORS_ORIGIN in backend/.env matches frontend URL
- Verify Socket.IO is initialized in browser console
- Check browser WebSocket support

### AI summaries not generating?
- Verify GROQ_API_KEY is set in backend/.env
- Check Groq API account is active with available quota
- Verify API key has proper permissions
- Check backend console logs for `[AIService]` debug messages
- Mock fallback will be used if API key is not configured

## 📦 Deployment

### Docker Deployment (Recommended for Production)

#### Using Docker Compose (Simplest)

```bash
# Build and run both MongoDB and backend
docker-compose up -d --build

# View logs
docker-compose logs -f backend

# Stop everything
docker-compose down
```

**Environment Variables** (in docker-compose.yml):
```env
NODE_ENV=production
MONGODB_URI=mongodb://admin:password123@mongo:27017/compliance_db?authSource=admin
JWT_SECRET=<strong_random_secret>
GROQ_API_KEY=<your_groq_api_key>
CORS_ORIGIN=<production_frontend_url>
```

#### Manual Docker Build (Advanced)

```bash
# Build image
cd backend
docker build -t compliance-system:latest .

# Run with external MongoDB
docker run -p 5000:5000 \
  -e MONGO_URI=mongodb://your-mongodb-host:27017/compliance_db \
  -e JWT_SECRET=<strong_random_secret> \
  -e GROQ_API_KEY=<your_groq_api_key> \
  compliance-system:latest
```

### Production Configuration

Set these environment variables in your deployment platform (AWS, Heroku, etc.):

```env
NODE_ENV=production
MONGODB_URI=<production_mongodb_uri>
JWT_SECRET=<strong_random_secret>
CORS_ORIGIN=<production_frontend_url>
GROQ_API_KEY=<your_groq_api_key>
PORT=5000
```

### Frontend Deployment

Frontend can be deployed to:
- **Vercel** (recommended for Vite)
- **Netlify**
- **GitHub Pages**
- **AWS S3 + CloudFront**

```bash
# Build for production
cd frontend
npm run build

# Output in frontend/dist/
```

## 🤖 Groq AI Setup

### What is Groq AI?
Groq is an AI inference platform that provides fast and efficient LLM access. This system uses **Llama 3.1 8B-Instant** model for root cause analysis.

### Getting Groq API Key

1. **Visit Groq Console**: https://console.groq.com
2. **Create Account** or Login
3. **Generate API Key**:
   - Navigate to API Keys section
   - Click "Create API Key"
   - Copy the key (keep it secret!)
4. **Add to backend `.env`**:
   ```env
   GROQ_API_KEY=your_generated_key_here
   ```

### Groq Models Available
The system uses `llama-3.1-8b-instant`:
- **Fast inference**: Optimized for compliance analysis
- **Cost-effective**: Lower latency and pricing
- **Reliable**: Production-ready model

### Mock Fallback
If `GROQ_API_KEY` is not configured:
- System automatically generates **mock summaries** for development
- Mock summaries follow the same structure as real AI responses
- Useful for testing without API quota
- Check backend console for `[AIService]` debug messages

### Testing AI Features

#### Option 1: With Groq API (Recommended)
```bash
# 1. Set API key in backend/.env
GROQ_API_KEY=gsk_your_key_here

# 2. Start backend
cd backend
npm start

# 3. Create issue and generate summary via UI
# Backend will call Groq API
```

#### Option 2: Without Groq API (Development)
```bash
# 1. Leave GROQ_API_KEY empty or don't set it
# 2. Start backend
cd backend
npm start

# 3. Create issue and generate summary via UI
# Backend will return mock summary automatically
```

### API Quota & Rate Limits
- Groq offers **free tier** with generous daily limits
- Check your usage at: https://console.groq.com/usage
- Rate limits display in dashboard
- Upgrade plans for higher volume if needed

### Troubleshooting Groq Integration

**Problem**: "GROQ_API_KEY not found" message
```
Solution: Set GROQ_API_KEY in backend/.env and restart server
```

**Problem**: "API Key invalid or expired"
```
Solution: 
- Regenerate new key in Groq console
- Verify key format is correct (starts with gsk_)
- Check for extra spaces or characters
```

**Problem**: "Rate limit exceeded"
```
Solution:
- Free tier has limits (check console.groq.com/usage)
- Upgrade tier or wait for quota reset
- Code handles errors gracefully with mock fallback
```

**Problem**: AI summaries showing "Mock" responses
```
This means:
- GROQ_API_KEY is not set (development mode)
- API key is invalid/expired
- API quota exceeded
- Network connectivity issue

Check backend console for [AIService] debug logs
```

