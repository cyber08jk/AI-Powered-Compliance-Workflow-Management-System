import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { issueService, aiService, workflowService, auditService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { getStatusBadgeClass, getPriorityBadgeClass, formatDate, formatRelativeTime } from '../utils/helpers';
import useSLACountdown from '../hooks/useSLACountdown';
import { FiArrowLeft, FiCpu, FiClock, FiShield, FiTrash2, FiCheckCircle, FiInfo } from 'react-icons/fi';
import toast from 'react-hot-toast';

const IssueDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, hasRole } = useAuth();
    const [issue, setIssue] = useState(null);
    const [loading, setLoading] = useState(true);
    const [transitions, setTransitions] = useState([]);
    const [aiLoading, setAiLoading] = useState(false);
    const [auditLogs, setAuditLogs] = useState([]);
    const [showAudit, setShowAudit] = useState(false);

    useEffect(() => { fetchIssue(); }, [id]);

    const fetchIssue = async () => {
        try {
            const [issueRes, wfRes] = await Promise.all([
                issueService.getById(id),
                workflowService.getAll(),
            ]);
            setIssue(issueRes.data.data);

            // Find available transitions for the current status
            if (wfRes.data.data && wfRes.data.data.length > 0) {
                const defaultWf = wfRes.data.data.find((w) => w.isDefault) || wfRes.data.data[0];
                const available = defaultWf.transitions.filter(
                    (t) => t.from === issueRes.data.data.status && t.allowedRoles.includes(user.role)
                );
                setTransitions(available);
            }
        } catch {
            toast.error('Issue not found');
            navigate('/issues');
        } finally {
            setLoading(false);
        }
    };

    const handleTransition = async (newStatus) => {
        try {
            await issueService.transition(id, newStatus);
            toast.success(`Status changed to ${newStatus}`);
            fetchIssue();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Transition failed');
        }
    };

    const handleAISummary = async () => {
        setAiLoading(true);
        try {
            const res = await aiService.generateSummary(id);
            toast.success(`AI Summary v${res.data.data.summary.version} generated`);
            fetchIssue();
        } catch (err) {
            toast.error(err.response?.data?.message || 'AI generation failed');
        } finally {
            setAiLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('Are you sure you want to delete this issue?')) return;
        try {
            await issueService.delete(id);
            toast.success('Issue deleted');
            navigate('/issues');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Delete failed');
        }
    };

    const fetchAuditLogs = async () => {
        try {
            const res = await auditService.getEntityLogs('Issue', id);
            setAuditLogs(res.data.data);
            setShowAudit(true);
        } catch {
            toast.error('Failed to load audit logs');
        }
    };

    if (loading) {
        return <div className="loading-container"><div className="spinner"></div></div>;
    }

    if (!issue) return null;

    return (
        <div className="detail-container">
            {/* Header */}
            <div className="detail-header">
                <button className="btn btn-secondary btn-sm" onClick={() => navigate('/issues')} title="Back to Issues">
                    <FiArrowLeft /> Back
                </button>
                <div className="detail-header-title">
                    <h2>{issue.title}</h2>
                    <p>Created {formatDate(issue.createdAt)} by {issue.createdBy?.name || 'System'}</p>
                </div>
                <div className="detail-header-actions">
                    <button className="btn btn-primary btn-sm" onClick={handleAISummary} disabled={aiLoading} title="Generate AI Summary">
                        <FiCpu /> {aiLoading ? 'Generating...' : 'AI Summary'}
                    </button>
                    <button className="btn btn-secondary btn-sm" onClick={fetchAuditLogs} title="View Audit Trail">
                        <FiShield /> Audit Log
                    </button>
                    {hasRole('Admin', 'Manager') && (
                        <button className="btn btn-danger btn-sm" onClick={handleDelete} title="Delete Issue">
                            <FiTrash2 />
                        </button>
                    )}
                </div>
            </div>

            {/* Main Content */}
            <div className="detail-grid">
                {/* Left Column - Main Details */}
                <div className="detail-main">
                    {/* Issue Details Card */}
                    <div className="detail-card">
                        <h3><FiInfo /> Issue Details</h3>
                        
                        <div className="detail-field">
                            <label>Description</label>
                            <p>{issue.description}</p>
                        </div>

                        <div className="detail-field-grid">
                            <div className="detail-field">
                                <label>Category</label>
                                <p>{issue.category}</p>
                            </div>
                            <div className="detail-field">
                                <label>Priority</label>
                                <p><span className={`badge ${getPriorityBadgeClass(issue.priority)}`}>{issue.priority}</span></p>
                            </div>
                            <div className="detail-field">
                                <label>Assigned To</label>
                                <p>{issue.assignedTo?.name || 'Unassigned'}</p>
                            </div>
                        </div>
                    </div>

                    {/* AI Summaries Card */}
                    {issue.aiSummaries && issue.aiSummaries.length > 0 && (
                        <div className="detail-card">
                            <h3><FiCpu /> AI Root Cause Summaries</h3>
                            <div className="ai-summary-container">
                                {issue.aiSummaries
                                    .slice()
                                    .sort((a, b) => b.version - a.version)
                                    .map((summary) => (
                                        <div key={summary._id} className="ai-summary">
                                            <h4>
                                                <FiCheckCircle /> Version {summary.version}
                                            </h4>
                                            <div className="ai-summary-content">{summary.summary}</div>
                                            <div className="ai-summary-meta">
                                                <span>Model: {summary.model}</span>
                                                <span>{formatDate(summary.generatedAt)}</span>
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Column - Sidebar */}
                <div className="detail-sidebar">
                    {/* Status Card */}
                    <div className="detail-card">
                        <h3>Status</h3>
                        
                        <div className="detail-status">
                            <span className={`badge ${getStatusBadgeClass(issue.status)} detail-status-badge`}>
                                {issue.status}
                            </span>
                        </div>

                        {transitions.length > 0 && (
                            <div className="detail-status-transitions">
                                <label>Available Transitions</label>
                                <div className="detail-status-buttons">
                                    {transitions.map((t) => (
                                        <button
                                            key={t.to}
                                            className="detail-status-button"
                                            onClick={() => handleTransition(t.to)}
                                            title={`Transition to ${t.to}`}
                                        >
                                            → {t.to}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* SLA Card */}
                    <div className="detail-card">
                        <h3><FiClock /> SLA Tracking</h3>
                        
                        <div className="detail-sla">
                            <div className="detail-field">
                                <label>Due Date</label>
                                <p>{formatDate(issue.dueDate)}</p>
                            </div>
                            
                            <div className="detail-sla-time">
                                <FiClock />
                                <SLADisplay dueDate={issue.dueDate} slaBreached={issue.slaBreached} />
                            </div>

                            {issue.slaBreached && (
                                <div className="detail-sla-breached">
                                    SLA Breached {issue.slaBreachedAt ? `on ${formatDate(issue.slaBreachedAt)}` : ''}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Timeline Card */}
                    <div className="detail-card">
                        <h3>Timeline</h3>
                        <div className="detail-timeline">
                            <div className="timeline-item">
                                <div className="timeline-dot"></div>
                                <div className="timeline-content">
                                    <div className="timeline-label">Created</div>
                                    <p className="timeline-date">{formatDate(issue.createdAt)}</p>
                                </div>
                            </div>
                            <div className="timeline-item">
                                <div className="timeline-dot"></div>
                                <div className="timeline-content">
                                    <div className="timeline-label">Last Updated</div>
                                    <p className="timeline-date">{formatDate(issue.updatedAt)}</p>
                                </div>
                            </div>
                            {issue.resolvedAt && (
                                <div className="timeline-item">
                                    <div className="timeline-dot"></div>
                                    <div className="timeline-content">
                                        <div className="timeline-label">Resolved</div>
                                        <p className="timeline-date">{formatDate(issue.resolvedAt)}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Audit Log Modal */}
            {showAudit && (
                <div className="modal-overlay" onClick={() => setShowAudit(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <h3>Audit Trail</h3>
                        {auditLogs.length === 0 ? (
                            <p className="text-muted">No audit entries found.</p>
                        ) : (
                            <div style={{ marginBottom: '20px' }}>
                                {auditLogs.map((log) => (
                                    <div key={log._id} className="audit-entry">
                                        <div className="audit-icon">
                                            <FiShield />
                                        </div>
                                        <div className="audit-content">
                                            <h4>{log.action}</h4>
                                            <p>by {log.performedBy?.name || 'System'} • {formatRelativeTime(log.timestamp)}</p>
                                            {(log.previousValue || log.newValue) && (
                                                <div className="audit-values">
                                                    {log.previousValue && <span className="audit-prev">Before: {JSON.stringify(log.previousValue)}</span>}
                                                    {log.newValue && <span className="audit-new">After: {JSON.stringify(log.newValue)}</span>}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        <div className="modal-actions">
                            <button className="btn btn-secondary" onClick={() => setShowAudit(false)}>Close</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const SLADisplay = ({ dueDate, slaBreached }) => {
    const { timeLeft, status } = useSLACountdown(dueDate, slaBreached);
    return (
        <span className={`sla-countdown ${status}`}>
            {timeLeft}
        </span>
    );
};

export default IssueDetailPage;
