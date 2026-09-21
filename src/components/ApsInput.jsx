import { Calculator } from 'lucide-react';

function ApsInput({ value, onChange }) {
  return (
    <div className="filter-group">
      <label className="filter-label" htmlFor="aps-score" style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#FFEE00' }}>
        <Calculator size={15} strokeWidth={2} />
        Your APS Score
      </label>
      <input
        id="aps-score"
        type="number"
        min="0"
        max="49"
        className="filter-select"
        placeholder="e.g. 32"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{ color: '#111111', background: '#ffffff' }}
      />
    </div>
  );
}

export default ApsInput;