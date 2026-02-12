const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Organization = require('../models/Organization');
const Workflow = require('../models/Workflow');
const config = require('../config');
const asyncHandler = require('../utils/asyncHandler');
const { logAction } = require('../services/auditService');

// Generate JWT token
const generateToken = (user) => {
    return jwt.sign(
        { id: user._id, role: user.role, organization: user.organization },
        config.jwtSecret,
        { expiresIn: config.jwtExpiresIn }
    );
};

/**
 * @desc    Register a new organization and admin user
 * @route   POST /api/auth/register
 * @access  Public
 */
const register = asyncHandler(async (req, res) => {
    const { name, email, password, organizationName, industry } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        return res.status(400).json({ success: false, message: 'Email already registered.' });
    }

    // Create organization
    const organization = await Organization.create({
        name: organizationName,
        slug: organizationName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        industry: industry || 'Other',
    });

    // Create admin user
    const user = await User.create({
        name,
        email,
        password,
        role: 'Admin',
        organization: organization._id,
    });

    // Create default workflow for the organization
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

    // Audit log
    await logAction({
        action: 'REGISTER',
        entity: 'User',
        entityId: user._id,
        newValue: { name: user.name, email: user.email, role: user.role },
        performedBy: user._id,
        organization: organization._id,
    });

    const token = generateToken(user);

    res.status(201).json({
        success: true,
        data: {
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                organization: {
                    id: organization._id,
                    name: organization.name,
                    slug: organization.slug,
                },
            },
        },
    });
});

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ success: false, message: 'Please provide email and password.' });
    }

    const user = await User.findOne({ email }).select('+password').populate('organization');
    if (!user) {
        return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
        return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    if (!user.isActive) {
        return res.status(401).json({ success: false, message: 'Account has been deactivated.' });
    }

    // Audit log
    await logAction({
        action: 'LOGIN',
        entity: 'User',
        entityId: user._id,
        performedBy: user._id,
        organization: user.organization._id,
    });

    const token = generateToken(user);

    res.json({
        success: true,
        data: {
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                organization: {
                    id: user.organization._id,
                    name: user.organization.name,
                    slug: user.organization.slug,
                },
            },
        },
    });
});

/**
 * @desc    Get current user profile
 * @route   GET /api/auth/me
 * @access  Private
 */
const getMe = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id).populate('organization');

    res.json({
        success: true,
        data: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            isActive: user.isActive,
            createdAt: user.createdAt,
            organization: {
                id: user.organization._id,
                name: user.organization.name,
                slug: user.organization.slug,
            },
        },
    });
});

/**
 * @desc    Get all users in the same organization
 * @route   GET /api/auth/users
 * @access  Private (Admin, Manager)
 */
const getUsers = asyncHandler(async (req, res) => {
    const users = await User.find({ organization: req.tenantId }).select('-password').populate('organization', 'name slug');

    res.json({
        success: true,
        count: users.length,
        data: users,
    });
});

/**
 * @desc    Create a new user in the organization
 * @route   POST /api/auth/users
 * @access  Private (Admin)
 */
const createUser = asyncHandler(async (req, res) => {
    const { name, email, password, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
        return res.status(400).json({ success: false, message: 'Email already registered.' });
    }

    const user = await User.create({
        name,
        email,
        password,
        role: role || 'User',
        organization: req.tenantId,
    });

    await logAction({
        action: 'CREATE',
        entity: 'User',
        entityId: user._id,
        newValue: { name: user.name, email: user.email, role: user.role },
        performedBy: req.user._id,
        organization: req.tenantId,
    });

    res.status(201).json({
        success: true,
        data: user,
    });
});

module.exports = { register, login, getMe, getUsers, createUser };
