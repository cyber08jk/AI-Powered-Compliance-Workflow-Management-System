import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const RegisterPage = () => {
    const [form, setForm] = useState({
        name: '',
        email: '',
        password: '',
        organizationName: '',
        industry: 'Pharma',
    });
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await register(form);
            toast.success('Organization registered successfully!');
            navigate('/dashboard');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div style={{ textAlign: 'center', marginBottom: '8px', fontSize: '40px' }}>🏢</div>
                <h2>Register Organization</h2>
                <p>Create your compliance management workspace</p>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Organization Name</label>
                        <input
                            type="text"
                            name="organizationName"
                            className="form-control"
                            placeholder="e.g. Acme Pharma Inc."
                            value={form.organizationName}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Industry</label>
                        <select name="industry" className="form-control" value={form.industry} onChange={handleChange}>
                            <option value="Pharma">Pharma</option>
                            <option value="MedTech">MedTech</option>
                            <option value="Manufacturing">Manufacturing</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Admin Name</label>
                        <input
                            type="text"
                            name="name"
                            className="form-control"
                            placeholder="Your full name"
                            value={form.name}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Email Address</label>
                        <input
                            type="email"
                            name="email"
                            className="form-control"
                            placeholder="admin@organization.com"
                            value={form.email}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Password</label>
                        <input
                            type="password"
                            name="password"
                            className="form-control"
                            placeholder="Minimum 6 characters"
                            value={form.password}
                            onChange={handleChange}
                            required
                            minLength={6}
                        />
                    </div>
                    <button type="submit" className="btn btn-primary" disabled={loading}>
                        {loading ? 'Creating...' : 'Create Organization'}
                    </button>
                </form>

                <div className="auth-link">
                    Already registered? <Link to="/login">Sign in</Link>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;
