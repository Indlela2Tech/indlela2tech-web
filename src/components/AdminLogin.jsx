import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { LogIn } from 'lucide-react';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });

    setLoading(false);

    if (signInError) {
      setError(signInError.message);
      return;
    }

    navigate('/admin');
  }

  return (
    <div style={{ maxWidth: '380px', margin: '60px auto', padding: '32px 28px', border: '2px solid #111111', borderTop: '6px solid #FFEE00', borderRadius: '14px' }}>
      <h1 style={{ fontSize: '22px', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px', color: '#111111' }}>
        <LogIn size={22} strokeWidth={2} />
        Admin Login
      </h1>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div>
          <label htmlFor="admin-email" style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px', color: '#111111' }}>
            Email
          </label>
          <input
            id="admin-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ width: '100%', boxSizing: 'border-box', padding: '10px 12px', fontSize: '14px', borderRadius: '8px', border: '1px solid #d0d0d0', color: '#111111', background: '#ffffff' }}
          />
        </div>

        <div>
          <label htmlFor="admin-password" style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px', color: '#111111' }}>
            Password
          </label>
          <input
            id="admin-password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: '100%', boxSizing: 'border-box', padding: '10px 12px', fontSize: '14px', borderRadius: '8px', border: '1px solid #d0d0d0', color: '#111111', background: '#ffffff' }}
          />
        </div>

        {error && <p style={{ fontSize: '13px', color: '#a33', margin: 0 }}>{error}</p>}

        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>
    </div>
  );
}