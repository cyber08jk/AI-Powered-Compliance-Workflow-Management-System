import { useState, useEffect } from 'react';
import { FiMoreVertical, FiUser, FiClock } from 'react-icons/fi';
import useSLACountdown from '../hooks/useSLACountdown';
import '../styles/kanban.css';

const getPriorityColor = (priority) => {
    const colors = {
        'Critical': '#ef4444',
        'High': '#f97316',
        'Medium': '#eab308',
        'Low': '#3b82f6',
    };
    return colors[priority] || '#94a3b8';
};

const getStatusColor = (status) => {
    const colors = {
        'Draft': '#9ca3af',
        'Submitted': '#3b82f6',
        'Under Review': '#f97316',
        'Approved': '#10b981',
        'Rejected': '#ef4444',
        'Closed': '#6b7280',
    };
    return colors[status] || '#94a3b8';
};

const IssueCard = ({ issue, onClick, onContextMenu }) => {
    const { timeLeft, status } = useSLACountdown(issue.dueDate, issue.slaBreached);

    return (
        <div className="kanban-card" onClick={onClick} onContextMenu={onContextMenu}>
            <div className="card-header">
                <div className="card-title">{issue.title}</div>
                <button className="card-menu-btn" onClick={(e) => e.stopPropagation()}>
                    <FiMoreVertical size={16} />
                </button>
            </div>

            <div className="card-description">
                {issue.description?.substring(0, 100)}
                {issue.description?.length > 100 ? '...' : ''}
            </div>

            <div className="card-metadata">
                <span className="priority-badge" style={{ borderLeftColor: getPriorityColor(issue.priority) }}>
                    {issue.priority}
                </span>
                <span className="category-badge">{issue.category}</span>
            </div>

            <div className="card-sla">
                <FiClock size={12} />
                <span className={`sla-text ${status}`}>{timeLeft}</span>
            </div>

            <div className="card-footer">
                {issue.assignedTo ? (
                    <div className="assignee">
                        <div className="avatar" title={issue.assignedTo.name}>
                            {issue.assignedTo.name?.charAt(0).toUpperCase()}
                        </div>
                        <span className="assignee-name">{issue.assignedTo.name?.split(' ')[0]}</span>
                    </div>
                ) : (
                    <div className="assignee-placeholder">
                        <FiUser size={14} />
                        <span>Unassigned</span>
                    </div>
                )}
            </div>
        </div>
    );
};

const KanbanColumn = ({ status, issues, onCardClick, workflowStates }) => {
    const issueCount = issues.length;

    return (
        <div className="kanban-column">
            <div className="column-header">
                <div className="column-title">
                    <span className="status-indicator" style={{ backgroundColor: getStatusColor(status) }}></span>
                    <h3>{status}</h3>
                    <span className="issue-count">{issueCount}</span>
                </div>
            </div>

            <div className="kanban-cards-container">
                {issues.length === 0 ? (
                    <div className="empty-column">
                        <p>No issues</p>
                    </div>
                ) : (
                    issues.map((issue) => (
                        <IssueCard
                            key={issue._id}
                            issue={issue}
                            onClick={() => onCardClick(issue._id)}
                        />
                    ))
                )}
            </div>
        </div>
    );
};

const KanbanBoard = ({ issues, statuses, onCardClick, loading }) => {
    const [columns, setColumns] = useState({});

    useEffect(() => {
        const groupedIssues = {};
        statuses.forEach((status) => {
            groupedIssues[status] = issues.filter(issue => issue.status === status);
        });
        setColumns(groupedIssues);
    }, [issues, statuses]);

    return (
        <div className="kanban-board-wrapper">
            {loading ? (
                <div className="loading-container">
                    <div className="spinner"></div>
                </div>
            ) : (
                <div className="kanban-board">
                    {statuses.map((status) => (
                        <KanbanColumn
                            key={status}
                            status={status}
                            issues={columns[status] || []}
                            onCardClick={onCardClick}
                            workflowStates={statuses}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default KanbanBoard;
