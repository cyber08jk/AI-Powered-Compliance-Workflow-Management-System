import { useState, useEffect } from 'react';
import { auditService } from '../services/api';
import { formatDate, formatRelativeTime } from '../utils/helpers';
import { FiShield, FiFilter } from 'react-icons/fi';
import toast from 'react-hot-toast';

const ACTION_COLORS = {
    CREATE: { bg: 'rgba(16,185,129,0.1)', color: '#34d399' },
    UPDATE: { bg: 'rgba(59,130,246,0.1)', color: '#60a5fa' },
    DELETE: { bg: 'rgba(239,68,68,0.1)', color: '#f87171' },
    STATUS_CHANGE: { bg: 'rgba(245,158,11,0.1)', color: '#fbbf24' },
    WORKFLOW_TRANSITION: { bg: 'rgba(139,92,246,0.1)', color: '#a78bfa' },
    AI_SUMMARY_GENERATED: { bg: 'rgba(99,102,241,0.1)', color: '#818cf8' },
    SLA_BREACH: { bg: 'rgba(239,68,68,0.1)', color: '#f87171' },
    LOGIN: { bg: 'rgba(16,185,129,0.1)', color: '#34d399' },
    REGISTER: { bg: 'rgba(59,130,246,0.1)', color: '#60a5fa' },
    ASSIGNMENT: { bg: 'rgba(245,158,11,0.1)', color: '#fbbf24' },
};

const AuditLogPage = () => {
    const [logs, setLogs] = useState([]);
    const [pagination, setPagination] = useState({});
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({ entity: '', action: '', page: 1 });

    useEffect(() => { fetchLogs(); }, [filters]);

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const params = {};
            Object.entries(filters).forEach(([k, v]) => { if (v) params[k] = v; });
            const res = await auditService.getAll(params);
            setLogs(res.data.data);
            setPagination(res.data.pagination);
        } catch {
            toast.error('Failed to load audit logs');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <div className="page-header">
                <div>
                    <h2>Audit Logs</h2>
                    <p>Immutable record of all system actions</p>
                </div>
            </div>

            <div className="filters-bar">
                <select className="form-control" value={filters.entity} onChange={(e) => setFilters({ ...filters, entity: e.target.value, page: 1 })}>
                    <option value="">All Entities</option>
                    {['Issue', 'Workflow', 'User', 'Organization'].map((e) => <option key={e} value={e}>{e}</option>)}
                </select>
                <select className="form-control" value={filters.action} onChange={(e) => setFilters({ ...filters, action: e.target.value, page: 1 })}>
                    <option value="">All Actions</option>
                    {Object.keys(ACTION_COLORS).map((a) => <option key={a} value={a}>{a}</option>)}
                </select>
            </div>

            {loading ? (
                <div className="loading-container"><div className="spinner"></div></div>
            ) : logs.length === 0 ? (
                <div className="card empty-state">
                    <FiShield style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.3 }} />
                    <h3>No Audit Logs</h3>
                    <p>System actions will be recorded here.</p>
                </div>
            ) : (
                <div className="card" style={{ padding: 0 }}>
                    {logs.map((log) => {
                        const actionStyle = ACTION_COLORS[log.action] || { bg: 'rgba(100,116,139,0.1)', color: '#94a3b8' };
                        return (
                            <div key={log._id} className="audit-entry">
                                <div className="audit-icon" style={{ background: actionStyle.bg, color: actionStyle.color }}>
                                    <FiShield />
                                </div>
                                <div className="audit-content" style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <h4>
                                            <span style={{ color: actionStyle.color, marginRight: '8px' }}>{log.action}</span>
                                            <span style={{ color: 'var(--text-muted)', fontWeight: '400' }}>on {log.entity}</span>
                                        </h4>
                                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{formatRelativeTime(log.timestamp)}</span>
                                    </div>
                                    <p>by {log.performedBy?.name || 'System'} ({log.performedBy?.role || 'N/A'}) • {formatDate(log.timestamp)}</p>
                                    {(log.previousValue || log.newValue) && (
                                        <div className="audit-values">
                                            {log.previousValue && <span className="audit-prev">Before: {JSON.stringify(log.previousValue)}</span>}
                                            {log.newValue && <span className="audit-new">After: {JSON.stringify(log.newValue)}</span>}
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {pagination.totalPages > 1 && (
                <div className="pagination">
                    <button disabled={pagination.page <= 1} onClick={() => setFilters({ ...filters, page: filters.page - 1 })}>Previous</button>
                    <span>Page {pagination.page} of {pagination.totalPages}</span>
                    <button disabled={pagination.page >= pagination.totalPages} onClick={() => setFilters({ ...filters, page: filters.page + 1 })}>Next</button>
                </div>
            )}
        </div>
    );
};

export default AuditLogPage;
