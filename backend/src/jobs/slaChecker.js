const cron = require('node-cron');
const Issue = require('../models/Issue');
const { logAction } = require('../services/auditService');

/**
 * SLA Checker Background Job
 * Runs every 5 minutes to check for SLA breaches
 */
const initSLAChecker = (io) => {
    // Run every 5 minutes
    cron.schedule('*/5 * * * *', async () => {
        console.log('[SLA Checker] Running SLA breach scan...');

        try {
            const now = new Date();

            // Find issues that are past due date and not yet marked as breached
            // Exclude final states (Closed, Rejected)
            const overdueIssues = await Issue.find({
                dueDate: { $lt: now },
                slaBreached: false,
                status: { $nin: ['Closed', 'Rejected'] },
            }).populate('organization');

            if (overdueIssues.length === 0) {
                console.log('[SLA Checker] No new SLA breaches found.');
                return;
            }

            console.log(`[SLA Checker] Found ${overdueIssues.length} SLA breach(es).`);

            for (const issue of overdueIssues) {
                issue.slaBreached = true;
                issue.slaBreachedAt = now;
                await issue.save();

                // Create audit log entry
                await logAction({
                    action: 'SLA_BREACH',
                    entity: 'Issue',
                    entityId: issue._id,
                    previousValue: { slaBreached: false },
                    newValue: { slaBreached: true, slaBreachedAt: now },
                    performedBy: issue.createdBy,
                    organization: issue.organization._id,
                });

                // Emit real-time notification
                if (io) {
                    io.to(`tenant-${issue.organization._id}`).emit('sla:breach', {
                        issueId: issue._id,
                        title: issue.title,
                        dueDate: issue.dueDate,
                        breachedAt: now,
                    });
                }
            }

            console.log(`[SLA Checker] Marked ${overdueIssues.length} issue(s) as SLA breached.`);
        } catch (error) {
            console.error('[SLA Checker] Error:', error.message);
        }
    });

    console.log('[SLA Checker] Background job scheduled (every 5 minutes).');
};

module.exports = initSLAChecker;
