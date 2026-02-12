const jwt = require('jsonwebtoken');
const config = require('../config');

/**
 * Initialize Socket.IO with tenant-scoped rooms
 */
const initializeSocket = (io) => {
    // Authentication middleware for WebSocket
    io.use((socket, next) => {
        const token = socket.handshake.auth?.token || socket.handshake.query?.token;

        if (!token) {
            return next(new Error('Authentication required'));
        }

        try {
            const decoded = jwt.verify(token, config.jwtSecret);
            socket.userId = decoded.id;
            socket.userRole = decoded.role;
            socket.tenantId = decoded.organization;
            next();
        } catch (error) {
            return next(new Error('Invalid or expired token'));
        }
    });

    io.on('connection', (socket) => {
        console.log(`[Socket] User connected: ${socket.userId} | Tenant: ${socket.tenantId}`);

        // Join tenant-specific room
        socket.join(`tenant-${socket.tenantId}`);

        // Join user-specific room for direct notifications
        socket.join(`user-${socket.userId}`);

        // Handle custom events
        socket.on('issue:subscribe', (issueId) => {
            socket.join(`issue-${issueId}`);
            console.log(`[Socket] User ${socket.userId} subscribed to issue ${issueId}`);
        });

        socket.on('issue:unsubscribe', (issueId) => {
            socket.leave(`issue-${issueId}`);
        });

        socket.on('disconnect', () => {
            console.log(`[Socket] User disconnected: ${socket.userId}`);
        });

        socket.on('error', (error) => {
            console.error(`[Socket] Error for user ${socket.userId}:`, error.message);
        });
    });

    console.log('[Socket] WebSocket server initialized');
};

module.exports = initializeSocket;
