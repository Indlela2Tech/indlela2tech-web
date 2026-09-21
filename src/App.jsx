import { Routes, Route } from 'react-router-dom';
import NavBar from './components/NavBar';
import HomePage from './components/HomePage';
import BrowsePage from './components/BrowsePage';
import CourseDetail from './components/CourseDetail';
import ShortlistPage from './components/ShortlistPage';
import AboutPage from './components/AboutPage';
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/AdminDashboard';
import InstitutionsPage from './components/InstitutionsPage';
import InstitutionDetail from './components/InstitutionDetail';
import ComparePage from './components/ComparePage';

function App() {
  return (
    <div>
      <NavBar />
      <main style={{ padding: '1.5rem' }}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/browse" element={<BrowsePage />} />
          <Route path="/course/:id" element={<CourseDetail />} />
          <Route path="/institutions" element={<InstitutionsPage />} />
          <Route path="/institutions/:id" element={<InstitutionDetail />} />
          <Route path="/compare/:idA/:idB" element={<ComparePage />} />
          <Route path="/shortlist" element={<ShortlistPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminDashboard />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;