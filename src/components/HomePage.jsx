import { useNavigate } from 'react-router-dom';
import BrandName from './BrandName';
import APSExplainer from './APSExplainer';
import GlossaryTerms from './GlossaryTerms';
import MisconceptionNotes from './MisconceptionNotes';
import NSFASNote from './NSFASNote';
import SchoolPrompt from './SchoolPrompt';
import FeedbackForm from './FeedbackForm';
import RecommendedCourses from './RecommendedCourses';
import { Search, Scale, Route } from 'lucide-react';

function HomePage() {
  const navigate = useNavigate();

  return (
    <>
      <section className="hero">
        <h1>
          Welcome to <BrandName />
        </h1>
        <p className="tagline">Your Guide to Tech Tertiary Education</p>
        <button className="cta-button" onClick={() => navigate('/browse')}>
          Get Started
        </button>
      </section>

      <SchoolPrompt />

      <section className="intro">
        <p style={{ color: '#111111' }}>
          Indlela2Tech is here to help senior learners from grade 10 to 12 discover
          opportunities beyond high school. Explore public universities and TVET
          colleges, learn about available study options, and find the pathway
          that best matches your goals and dreams. Your future is within reach.
          Let Indlela2Tech help you find the way.
        </p>
      </section>

      <section className="features">
        <div className="feature-card" onClick={() => navigate('/browse')} style={{ cursor: 'pointer' }}>
          <Search size={28} strokeWidth={2} color="#111111" style={{ marginBottom: '8px' }} />
          <h3 style={{ color: '#111111' }}>Explore Courses</h3>
          <p style={{ color: '#111111' }}>Find tech programs that match your goals.</p>
        </div>
        <div className="feature-card" onClick={() => navigate('/institutions')} style={{ cursor: 'pointer' }}>
          <Scale size={28} strokeWidth={2} color="#111111" style={{ marginBottom: '8px' }} />
          <h3 style={{ color: '#111111' }}>Compare Institutions</h3>
          <p style={{ color: '#111111' }}>See what tertiary options are out there.</p>
        </div>
        <div className="feature-card" onClick={() => navigate('/browse')} style={{ cursor: 'pointer' }}>
          <Route size={28} strokeWidth={2} color="#111111" style={{ marginBottom: '8px' }} />
          <h3 style={{ color: '#111111' }}>Plan Your Path</h3>
          <p style={{ color: '#111111' }}>Get guidance on the right route for you.</p>
        </div>
      </section>

      <RecommendedCourses />

      <APSExplainer />
      <GlossaryTerms />
      <MisconceptionNotes />
      <NSFASNote />
      <FeedbackForm contactEmail="team@indlela2tech.pages.dev" />

      <footer className="site-footer">
        <p>&copy; {new Date().getFullYear()} Indlela2Tech. All rights reserved.</p>
      </footer>
    </>
  );
}

export default HomePage;