import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from './icons';

export default function BackButton() {
  const navigate = useNavigate();

  return (
    <button className="back-button" onClick={() => navigate(-1)}>
      <ChevronLeft />
      <span>Back</span>
    </button>
  );
}
