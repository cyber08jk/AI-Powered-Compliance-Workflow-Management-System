/**
 * Tenant Resolver Middleware
 * Ensures all queries are scoped to the authenticated user's organization.
 * tenantId is set by the auth middleware from JWT payload.
 */
const tenantResolver = (req, res, next) => {
    if (!req.tenantId) {
        return res.status(400).json({
            success: false,
            message: 'Tenant context could not be resolved. Please authenticate.',
        });
    }

    // Attach a helper for scoping queries
    req.tenantScope = { organization: req.tenantId };

    next();
};

module.exports = tenantResolver;
