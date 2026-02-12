const express = require('express');
const http = require('http');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { Server } = require('socket.io');

const config = require('./config');
const connectDB = require('./config/db');
const errorHandler = require('./middlewares/errorHandler');
const initializeSocket = require('./sockets');
const initSLAChecker = require('./jobs/slaChecker');

// Route imports
const authRoutes = require('./routes/authRoutes');
const issueRoutes = require('./routes/issueRoutes');
const workflowRoutes = require('./routes/workflowRoutes');
const auditRoutes = require('./routes/auditRoutes');
const aiRoutes = require('./routes/aiRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

// Initialize Express app
const app = express();
const server = http.createServer(app);

// Socket.IO setup
const io = new Server(server, {
    cors: {
        origin: ['http://localhost:3000', 'http://localhost:5173'],
        methods: ['GET', 'POST'],
        credentials: true,
    },
});

// Make io accessible to controllers
app.set('io', io);

// Initialize WebSocket handlers
initializeSocket(io);

// Security Middleware
app.use(helmet());
app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:5173'],
    credentials: true,
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
    message: { success: false, message: 'Too many requests, please try again later.' },
});
app.use('/api/', limiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Logging
if (config.nodeEnv === 'development') {
    app.use(morgan('dev'));
} else {
    app.use(morgan('combined'));
}

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'AI-Powered Compliance System is running',
        environment: config.nodeEnv,
        timestamp: new Date().toISOString(),
    });
});

// API root endpoint
app.get('/api', (req, res) => {
    res.json({
        success: true,
        message: 'AI-Powered Compliance & Workflow Management System',
        version: '1.0.0',
        endpoints: {
            health: '/api/health',
            auth: '/api/auth',
            issues: '/api/issues',
            workflows: '/api/workflows',
            audit: '/api/audit',
            ai: '/api/ai',
            dashboard: '/api/dashboard',
        },
        documentation: 'See Postman collection in repository',
    });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/issues', issueRoutes);
app.use('/api/workflows', workflowRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/dashboard', dashboardRoutes);

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `Route ${req.method} ${req.originalUrl} not found`,
    });
});

// Error handler
app.use(errorHandler);

// Seed database with demo data
const seedDatabase = async () => {
    const User = require('./models/User');
    const Organization = require('./models/Organization');
    const Workflow = require('./models/Workflow');

    try {
        // Check if demo user exists
        const existingUser = await User.findOne({ email: 'demo@company.com' });
        if (!existingUser) {
            console.log('[Seed] Creating demo organization and user...');

            // Create demo organization
            const organization = await Organization.create({
                name: 'Demo Company',
                slug: 'demo-company',
                industry: 'Other',
            });

            // Create demo admin user
            const user = await User.create({
                name: 'Demo Admin',
                email: 'demo@company.com',
                password: 'password123',
                role: 'Admin',
                organization: organization._id,
                isActive: true,
            });

            // Create default workflow
            await Workflow.create({
                name: 'Default Compliance Workflow',
                organization: organization._id,
                states: ['Draft', 'Submitted', 'Under Review', 'Approved', 'Rejected', 'Closed'],
                transitions: [
                    { from: 'Draft', to: 'Submitted', allowedRoles: ['Admin', 'Manager', 'Reviewer', 'User'] },
                    { from: 'Submitted', to: 'Under Review', allowedRoles: ['Admin', 'Manager', 'Reviewer'] },
                    { from: 'Under Review', to: 'Approved', allowedRoles: ['Admin', 'Manager'] },
                    { from: 'Under Review', to: 'Rejected', allowedRoles: ['Admin', 'Manager'] },
                    { from: 'Approved', to: 'Closed', allowedRoles: ['Admin', 'Manager'] },
                    { from: 'Rejected', to: 'Draft', allowedRoles: ['Admin', 'Manager', 'User'] },
                ],
                initialState: 'Draft',
                finalStates: ['Closed', 'Rejected'],
                isDefault: true,
            });

            console.log('[Seed] ✅ Demo data created successfully!');
            console.log('[Seed] 📧 Email: demo@company.com');
            console.log('[Seed] 🔐 Password: password123');
        }
    } catch (error) {
        console.error('[Seed] Error seeding database:', error.message);
    }
};

// Start server
const start = async () => {
    try {
        await connectDB();

        // Seed demo data
        await seedDatabase();

        // Initialize SLA checker background job
        initSLAChecker(io);

        server.listen(config.port, () => {
            console.log(`
========================================
  🚀 Compliance System Backend
  📡 Server: http://localhost:${config.port}
  🌍 Environment: ${config.nodeEnv}
  📊 Health: http://localhost:${config.port}/api/health
  🔌 WebSocket: Enabled
  ⏰ SLA Checker: Running
========================================
      `);
        });
    } catch (error) {
        console.error('Failed to start server:', error.message);
        process.exit(1);
    }
};

start();

module.exports = app;
