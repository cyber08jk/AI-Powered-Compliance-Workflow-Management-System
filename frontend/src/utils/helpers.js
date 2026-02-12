/**
 * Get CSS class for a status badge
 */
export const getStatusBadgeClass = (status) => {
    const statusMap = {
        'Draft': 'badge-draft',
        'Submitted': 'badge-submitted',
        'Under Review': 'badge-under-review',
        'Approved': 'badge-approved',
        'Rejected': 'badge-rejected',
        'Closed': 'badge-closed',
    };
    return statusMap[status] || 'badge-draft';
};

/**
 * Get CSS class for a priority badge
 */
export const getPriorityBadgeClass = (priority) => {
    const priorityMap = {
        'Critical': 'badge-critical',
        'High': 'badge-high',
        'Medium': 'badge-medium',
        'Low': 'badge-low',
    };
    return priorityMap[priority] || 'badge-medium';
};

/**
 * Format date string
 */
export const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};

/**
 * Format relative time
 */
export const formatRelativeTime = (date) => {
    const now = new Date();
    const diff = now - new Date(date);
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
};
