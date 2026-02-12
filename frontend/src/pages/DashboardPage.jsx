import { useState, useEffect } from 'react';
import { dashboardService } from '../services/api';
import { FiFileText, FiAlertTriangle, FiClock, FiCheckCircle } from 'react-icons/fi';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import toast from 'react-hot-toast';

const COLORS = ['#6366f1', '#60a5fa', '#fbbf24', '#34d399', '#f87171', '#a78bfa', '#f472b6'];

// Custom Tooltip Component
const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
        const data = payload[0];
        return (
            <div style={{
                background: '#0f172a',
                border: '2px solid #6366f1',
                borderRadius: '8px',
                padding: '12px',
                color: '#ecf0f1',
                fontWeight: '600',
                boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)'
            }}>
                <p style={{ margin: '0', fontSize: '14px' }}>
                    {data.payload.status || data.payload.category || data.payload.label}: <span style={{ color: '#60a5fa' }}>{data.value}</span>
                </p>
            </div>
        );
    }
    return null;
};

const DashboardPage = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const res = await dashboardService.getStats();
            setStats(res.data.data);
        } catch (err) {
            toast.error('Failed to load dashboard');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
                <p className="text-muted">Loading dashboard...</p>
            </div>
        );
    }

    if (!stats) return null;

    return (
        <div>
            <div className="page-header">
                <div>
                    <h2>Dashboard</h2>
                    <p>Compliance analytics and issue overview</p>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon blue"><FiFileText /></div>
                    <div className="stat-content">
                        <h3>{stats.totalIssues}</h3>
                        <p>Total Issues</p>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon red"><FiAlertTriangle /></div>
                    <div className="stat-content">
                        <h3>{stats.sla.breachPercentage || 0}%</h3>
                        <p>SLA Breached</p>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon yellow"><FiClock /></div>
                    <div className="stat-content">
                        <h3>{stats.avgResolutionTime.avgDays}d</h3>
                        <p>Avg Resolution Time</p>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon green"><FiCheckCircle /></div>
                    <div className="stat-content">
                        <h3>{stats.sla.onTrack}</h3>
                        <p>On Track</p>
                    </div>
                </div>
            </div>

            {/* Charts */}
            <div className="charts-grid">
                {/* Status Breakdown Pie Chart */}
                <div className="chart-card">
                    <h3>Issues by Status</h3>
                    {stats.statusBreakdown.length > 0 ? (
                        <>
                            <ResponsiveContainer width="100%" height={250}>
                                <PieChart>
                                    <Pie
                                        data={stats.statusBreakdown}
                                        dataKey="count"
                                        nameKey="status"
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={50}
                                        outerRadius={90}
                                        paddingAngle={2}
                                        label={false}
                                    >
                                        {stats.statusBreakdown.map((_, i) => (
                                            <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(99, 102, 241, 0.1)' }} />
                                </PieChart>
                            </ResponsiveContainer>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginTop: '16px', paddingTop: '12px', borderTop: '1px solid rgba(99,102,241,0.1)' }}>
                                {stats.statusBreakdown.map((item, i) => (
                                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                                        <div style={{ width: '12px', height: '12px', borderRadius: '2px', background: COLORS[i % COLORS.length] }}></div>
                                        <span style={{ color: 'var(--text-secondary)' }}>{item.status}:</span>
                                        <span style={{ fontWeight: '600', color: 'white' }}>{item.count}</span>
                                    </div>
                                ))}
                            </div>
                        </>
                    ) : (
                        <div className="empty-state"><p>No issues yet</p></div>
                    )}
                </div>

                {/* Category Breakdown */}
                <div className="chart-card">
                    <h3>Issues by Category</h3>
                    {stats.categoryBreakdown.length > 0 ? (
                        <ResponsiveContainer width="100%" height={280}>
                            <BarChart data={stats.categoryBreakdown}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,102,241,0.1)" />
                                <XAxis dataKey="category" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(99, 102, 241, 0.1)' }} />
                                <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="empty-state"><p>No data available</p></div>
                    )}
                </div>

                {/* Monthly Trend */}
                <div className="chart-card">
                    <h3>Monthly Issue Trend</h3>
                    {stats.monthlyTrend.length > 0 ? (
                        <ResponsiveContainer width="100%" height={280}>
                            <LineChart data={stats.monthlyTrend.map(m => ({ ...m, label: `${m.year}-${String(m.month).padStart(2, '0')}` }))}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,102,241,0.1)" />
                                <XAxis dataKey="label" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(99, 102, 241, 0.1)' }} />
                                <Line type="monotone" dataKey="count" stroke="#8b5cf6" strokeWidth={2} dot={{ fill: '#8b5cf6' }} />
                            </LineChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="empty-state"><p>Not enough data for trends</p></div>
                    )}
                </div>

                {/* SLA Overview */}
                <div className="chart-card">
                    <h3>SLA Overview</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '20px 0' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ color: 'var(--text-secondary)' }}>Total Tracked</span>
                            <span style={{ fontWeight: '700', fontSize: '20px' }}>{stats.sla.total}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ color: 'var(--success)' }}>✓ On Track</span>
                            <span style={{ fontWeight: '700', fontSize: '20px', color: 'var(--success)' }}>{stats.sla.onTrack}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ color: 'var(--danger)' }}>✗ Breached</span>
                            <span style={{ fontWeight: '700', fontSize: '20px', color: 'var(--danger)' }}>{stats.sla.breached}</span>
                        </div>
                        <div style={{ marginTop: '8px' }}>
                            <div style={{ height: '8px', background: 'var(--bg-tertiary)', borderRadius: '4px', overflow: 'hidden' }}>
                                <div style={{
                                    height: '100%',
                                    width: `${100 - stats.sla.breachPercentage}%`,
                                    background: 'linear-gradient(90deg, #10b981, #34d399)',
                                    borderRadius: '4px',
                                    transition: 'width 1s ease',
                                }}></div>
                            </div>
                            <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '6px', textAlign: 'right' }}>
                                {stats.sla.breachPercentage}% breach rate
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Issues */}
            <div className="card">
                <h3 style={{ marginBottom: '16px', fontSize: '16px', fontWeight: '600' }}>Recent Issues</h3>
                {stats.recentIssues.length > 0 ? (
                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Title</th>
                                    <th>Status</th>
                                    <th>Priority</th>
                                    <th>Assigned To</th>
                                    <th>Due Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stats.recentIssues.map((issue) => (
                                    <tr key={issue._id}>
                                        <td>{issue.title}</td>
                                        <td><span className={`badge badge-${issue.status.toLowerCase().replace(' ', '-')}`}>{issue.status}</span></td>
                                        <td><span className={`badge badge-${issue.priority.toLowerCase()}`}>{issue.priority}</span></td>
                                        <td>{issue.assignedTo?.name || 'Unassigned'}</td>
                                        <td style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                                            {new Date(issue.dueDate).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="empty-state"><p>No issues created yet.</p></div>
                )}
            </div>
        </div>
    );
};

export default DashboardPage;
