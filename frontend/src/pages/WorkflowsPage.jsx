import { useState, useEffect } from 'react';
import { workflowService } from '../services/api';
import { FiPlus, FiEdit, FiTrash2, FiArrowRight } from 'react-icons/fi';
import toast from 'react-hot-toast';
import Modal from '../components/Modal';

const ROLES = ['Admin', 'Manager', 'Reviewer', 'User'];

const WorkflowsPage = () => {
    const [workflows, setWorkflows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editId, setEditId] = useState(null);
    const [form, setForm] = useState({
        name: '',
        states: ['Draft', 'Submitted', 'Under Review', 'Approved', 'Rejected', 'Closed'],
        transitions: [],
        initialState: 'Draft',
        finalStates: ['Closed', 'Rejected'],
        isDefault: true,
    });
    const [newState, setNewState] = useState('');
    const [newTransition, setNewTransition] = useState({ from: '', to: '', allowedRoles: [] });

    useEffect(() => { fetchWorkflows(); }, []);

    const fetchWorkflows = async () => {
        try {
            const res = await workflowService.getAll();
            setWorkflows(res.data.data);
        } catch {
            toast.error('Failed to load workflows');
        } finally {
            setLoading(false);
        }
    };

    const addState = () => {
        if (newState && !form.states.includes(newState)) {
            setForm({ ...form, states: [...form.states, newState] });
            setNewState('');
        }
    };

    const removeState = (state) => {
        setForm({
            ...form,
            states: form.states.filter((s) => s !== state),
            transitions: form.transitions.filter((t) => t.from !== state && t.to !== state),
            finalStates: form.finalStates.filter((s) => s !== state),
        });
    };

    const addTransition = () => {
        if (newTransition.from && newTransition.to && newTransition.allowedRoles.length > 0) {
            setForm({ ...form, transitions: [...form.transitions, { ...newTransition }] });
            setNewTransition({ from: '', to: '', allowedRoles: [] });
        } else {
            toast.error('Please fill all transition fields');
        }
    };

    const removeTransition = (index) => {
        setForm({ ...form, transitions: form.transitions.filter((_, i) => i !== index) });
    };

    const toggleRole = (role) => {
        const roles = newTransition.allowedRoles.includes(role)
            ? newTransition.allowedRoles.filter((r) => r !== role)
            : [...newTransition.allowedRoles, role];
        setNewTransition({ ...newTransition, allowedRoles: roles });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editId) {
                await workflowService.update(editId, form);
                toast.success('Workflow updated');
            } else {
                await workflowService.create(form);
                toast.success('Workflow created');
            }
            closeModal();
            fetchWorkflows();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to save workflow');
        }
    };

    const handleEdit = (wf) => {
        setEditId(wf._id);
        setForm({
            name: wf.name,
            states: wf.states,
            transitions: wf.transitions,
            initialState: wf.initialState,
            finalStates: wf.finalStates,
            isDefault: wf.isDefault,
        });
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this workflow?')) return;
        try {
            await workflowService.delete(id);
            toast.success('Workflow deleted');
            fetchWorkflows();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Cannot delete');
        }
    };

    const closeModal = () => {
        setShowModal(false);
        setEditId(null);
        setForm({
            name: '',
            states: ['Draft', 'Submitted', 'Under Review', 'Approved', 'Rejected', 'Closed'],
            transitions: [],
            initialState: 'Draft',
            finalStates: ['Closed', 'Rejected'],
            isDefault: true,
        });
    };

    if (loading) {
        return <div className="loading-container"><div className="spinner"></div></div>;
    }

    return (
        <div>
            <div className="page-header">
                <div>
                    <h2>Workflow Configuration</h2>
                    <p>Define and manage compliance workflow states and transitions</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                    <FiPlus /> New Workflow
                </button>
            </div>

            {workflows.length === 0 ? (
                <div className="card empty-state">
                    <h3>No Workflows</h3>
                    <p>Create your first workflow to get started.</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gap: '20px' }}>
                    {workflows.map((wf) => (
                        <div key={wf._id} className="card">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
                                        <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#2c3e50', margin: 0 }}>
                                            {wf.name}
                                        </h3>
                                        {wf.isDefault && <span className="badge badge-approved">Default</span>}
                                    </div>
                                    <p className="text-sm text-muted">{wf.states.length} states • {wf.transitions.length} transitions</p>
                                </div>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <button className="btn btn-secondary btn-sm" onClick={() => handleEdit(wf)}>
                                        <FiEdit /> Edit
                                    </button>
                                    {!wf.isDefault && (
                                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(wf._id)}>
                                            <FiTrash2 />
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                                {/* States */}
                                <div>
                                    <label style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#7f8c8d', fontWeight: '600', display: 'block', marginBottom: '10px' }}>States</label>
                                    <div className="workflow-states">
                                        {wf.states.map((state) => (
                                            <span
                                                key={state}
                                                className={`workflow-state ${state === wf.initialState ? 'initial' : ''} ${wf.finalStates.includes(state) ? 'final' : ''}`}
                                            >
                                                {state}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {/* Transitions Summary */}
                                <div>
                                    <label style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#7f8c8d', fontWeight: '600', display: 'block', marginBottom: '10px' }}>Transitions</label>
                                    <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                                        {wf.transitions.length === 0 ? (
                                            <p className="text-muted">No transitions defined</p>
                                        ) : (
                                            wf.transitions.map((t, i) => (
                                                <div key={i} className="workflow-transition">
                                                    <span>{t.from}</span>
                                                    <FiArrowRight style={{ color: '#3498db' }} />
                                                    <span>{t.to}</span>
                                                    <div className="roles">
                                                        {t.allowedRoles.map((r) => (
                                                            <span key={r} className="role-tag">{r}</span>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Create/Edit Modal */}
            <Modal isOpen={showModal} onClose={closeModal} title={editId ? '✏️ Edit Workflow' : '➕ Create New Workflow'} size="lg">
                <form onSubmit={handleSubmit}>
                    
                    {/* Step 1: Basic Information */}
                    <div className="form-section-header">📋 Basic Information</div>
                    <div className="form-group">
                        <label>Workflow Name *</label>
                        <input
                            type="text"
                            className="form-control"
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            placeholder="e.g., Security Review Process"
                            required
                            autoFocus
                        />
                    </div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '13px', cursor: 'pointer', marginBottom: '24px' }}>
                        <input
                            type="checkbox"
                            checked={form.isDefault}
                            onChange={(e) => setForm({ ...form, isDefault: e.target.checked })}
                            style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                        />
                        <span style={{ fontWeight: '500', color: '#2c3e50' }}>⭐ Set as default workflow for new issues</span>
                    </label>

                    {/* Step 2: States */}
                    <div className="form-section-header">⚙️ Define Workflow States</div>
                    {form.states.length > 0 && (
                        <div style={{ marginBottom: '12px' }}>
                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                {form.states.map((state) => (
                                    <div key={state} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 12px', background: '#3498db', color: 'white', borderRadius: '6px', fontSize: '13px', fontWeight: '600' }}>
                                        {state}
                                        <button
                                            type="button"
                                            onClick={() => removeState(state)}
                                            style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontSize: '16px', padding: '0', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                            title="Remove state"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
                        <input
                            type="text"
                            className="form-control"
                            value={newState}
                            onChange={(e) => setNewState(e.target.value)}
                            placeholder="Enter state name (e.g., Pending, Approved)"
                            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addState())}
                        />
                        <button type="button" className="btn btn-secondary btn-sm" onClick={addState} style={{ whiteSpace: 'nowrap', fontWeight: '600' }}>➕ Add State</button>
                    </div>

                    {/* Step 3: Initial & Final States */}
                    {form.states.length > 0 && (
                        <>
                            <div className="form-section-header">🔀 State Flow</div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                                <div>
                                    <label style={{ fontSize: '12px', fontWeight: '700', color: '#2c3e50', textTransform: 'uppercase', marginBottom: '8px', display: 'block', letterSpacing: '0.5px' }}>🟢 Initial State (Starting Point)</label>
                                    <select
                                        className="form-control"
                                        value={form.initialState}
                                        onChange={(e) => setForm({ ...form, initialState: e.target.value })}
                                    >
                                        <option value="">Select initial state...</option>
                                        {form.states.map((s) => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label style={{ fontSize: '12px', fontWeight: '700', color: '#2c3e50', textTransform: 'uppercase', marginBottom: '8px', display: 'block', letterSpacing: '0.5px' }}>🔴 Final States (End Points)</label>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', padding: '8px', background: '#ffffff', borderRadius: '5px', border: '1px solid #d5dbdd', minHeight: '40px', alignItems: 'center' }}>
                                        {form.states.map((s) => (
                                            <label key={s} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', cursor: 'pointer' }}>
                                                <input
                                                    type="checkbox"
                                                    checked={form.finalStates.includes(s)}
                                                    onChange={(e) => {
                                                        const fs = e.target.checked
                                                            ? [...form.finalStates, s]
                                                            : form.finalStates.filter((f) => f !== s);
                                                        setForm({ ...form, finalStates: fs });
                                                    }}
                                                />
                                                <span>{s}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    {/* Step 4: Transitions */}
                    {form.states.length > 1 && (
                        <>
                            <div className="form-section-header">🔄 State Transitions</div>
                            {form.transitions.length > 0 && (
                                <div style={{ marginBottom: '16px', maxHeight: '200px', overflowY: 'auto' }}>
                                    {form.transitions.map((t, i) => (
                                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px', background: '#f8f9fa', borderLeft: '3px solid #3498db', borderRadius: '4px', marginBottom: '8px', fontSize: '12px' }}>
                                            <span style={{ fontWeight: '700', minWidth: '80px', color: '#2c3e50' }}>{t.from}</span>
                                            <span style={{ color: '#3498db', fontSize: '14px' }}>→</span>
                                            <span style={{ fontWeight: '700', minWidth: '80px', color: '#2c3e50' }}>{t.to}</span>
                                            <div style={{ display: 'flex', gap: '4px', alignItems: 'center', marginLeft: 'auto' }}>
                                                {t.allowedRoles.length > 0 ? (
                                                    t.allowedRoles.map((r) => <span key={r} style={{ display: 'inline-block', padding: '3px 8px', background: '#3498db', color: 'white', borderRadius: '3px', fontSize: '10px', fontWeight: '600' }}>{r}</span>)
                                                ) : (
                                                    <span style={{ color: '#e74c3c', fontWeight: '600' }}>⚠️ No roles</span>
                                                )}
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => removeTransition(i)}
                                                style={{ background: 'none', border: 'none', color: '#e74c3c', cursor: 'pointer', fontSize: '16px', padding: '0', width: '24px', height: '24px' }}
                                                title="Remove transition"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                            <div style={{ padding: '12px', background: '#ffffff', borderRadius: '6px', marginBottom: '24px', border: '1px solid #d5dbdd' }}>
                                <label style={{ fontSize: '11px', fontWeight: '700', color: '#3498db', textTransform: 'uppercase', display: 'block', marginBottom: '12px', letterSpacing: '0.5px' }}>New Transition</label>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '10px', marginBottom: '12px' }}>
                                    <select
                                        className="form-control"
                                        value={newTransition.from}
                                        onChange={(e) => setNewTransition({ ...newTransition, from: e.target.value })}
                                        style={{ fontSize: '12px' }}
                                    >
                                        <option value="">From State</option>
                                        {form.states.map((s) => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                    <select
                                        className="form-control"
                                        value={newTransition.to}
                                        onChange={(e) => setNewTransition({ ...newTransition, to: e.target.value })}
                                        style={{ fontSize: '12px' }}
                                    >
                                        <option value="">To State</option>
                                        {form.states.map((s) => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                    <button type="button" className="btn btn-secondary btn-sm" onClick={addTransition} style={{ whiteSpace: 'nowrap', fontWeight: '600' }}>Add</button>
                                </div>
                                <label style={{ fontSize: '11px', fontWeight: '700', color: '#3498db', textTransform: 'uppercase', display: 'block', marginBottom: '10px', letterSpacing: '0.5px' }}>Who Can Use?</label>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                                    {ROLES.map((r) => (
                                        <label key={r} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', cursor: 'pointer', padding: '6px 8px', background: newTransition.allowedRoles.includes(r) ? '#d4e9f5' : 'transparent', borderRadius: '4px', fontWeight: '600' }}>
                                            <input
                                                type="checkbox"
                                                checked={newTransition.allowedRoles.includes(r)}
                                                onChange={() => toggleRole(r)}
                                                style={{ width: '14px', height: '14px', cursor: 'pointer' }}
                                            />
                                            {r}
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}

                    {/* Form Actions */}
                    <div className="modal-actions">
                        <button type="button" className="btn btn-secondary" onClick={closeModal}>Cancel</button>
                        <button type="submit" className="btn btn-primary">{editId ? '💾 Update' : '✨ Create'}</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default WorkflowsPage;
