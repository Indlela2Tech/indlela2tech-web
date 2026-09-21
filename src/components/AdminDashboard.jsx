import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { LayoutDashboard, LogOut, Building2, GraduationCap, BarChart3 } from 'lucide-react';
import ManageInstitutions from './ManageInstitutions';
import ManageCourses from './ManageCourses';
import AdminReports from './AdminReports';

export default function AdminDashboard() {
  const [checking, setChecking] = useState(true);
  const [session, setSession] = useState(null);
  const [activeTab, setActiveTab] = useState('institutions');
  const navigate = useNavigate();

  useEffect(() => {
    async function checkSession() {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
      setChecking(false);
      if (!data.session) navigate('/admin/login');
    }
    checkSession();
  }, [navigate]);

  async function handleLogout() {
    await supabase.auth.signOut();
    navigate('/admin/login');
  }

  if (checking) return <p style={{ padding: '20px', color: '#111111' }}>Checking login…</p>;
  if (!session) return null;

  const tabButtonStyle = (tab) => ({
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '10px 16px',
    borderRadius: '10px 10px 0 0',
    border: '2px solid #111111',
    borderBottom: activeTab === tab ? '2px solid #ffffff' : '2px solid #111111',
    background: activeTab === tab ? '#FFEE00' : '#f5f5f5',
    color: '#111111',
    fontWeight: 600,
    fontSize: '14px',
    cursor: 'pointer',
    marginBottom: '-2px',
  });

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0, color: '#111111' }}>
          <LayoutDashboard size={24} strokeWidth={2} />
          Admin Dashboard
        </h1>
        <button onClick={handleLogout} className="back-button" style={{ margin: 0 }}>
          <LogOut size={16} strokeWidth={2} />
          <span>Log Out</span>
        </button>
      </div>

      <p style={{ color: '#555555', fontSize: '15px', marginBottom: '20px' }}>
        Logged in as <strong style={{ color: '#111111' }}>{session.user.email}</strong>.
      </p>

      <div style={{ display: 'flex', gap: '4px', borderBottom: '2px solid #111111', flexWrap: 'wrap' }}>
        <button onClick={() => setActiveTab('institutions')} style={tabButtonStyle('institutions')}>
          <Building2 size={16} strokeWidth={2} /> Institutions
        </button>
        <button onClick={() => setActiveTab('courses')} style={tabButtonStyle('courses')}>
          <GraduationCap size={16} strokeWidth={2} /> Courses & Subjects
        </button>
        <button onClick={() => setActiveTab('reports')} style={tabButtonStyle('reports')}>
          <BarChart3 size={16} strokeWidth={2} /> Reports
        </button>
      </div>

      <div style={{ paddingTop: '24px' }}>
        {activeTab === 'institutions' && <ManageInstitutions />}
        {activeTab === 'courses' && <ManageCourses />}
        {activeTab === 'reports' && <AdminReports />}
      </div>
    </div>
  );
}