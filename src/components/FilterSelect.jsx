function FilterSelect({ label, value, onChange, options, icon: Icon }) {
  return (
    <div className="filter-group">
      <label className="filter-label" style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#FFEE00' }}>
        {Icon && <Icon size={15} strokeWidth={2} />}
        {label}
      </label>
      <select
        className="filter-select"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{ color: '#111111', background: '#ffffff' }}
      >
        <option value="">All</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  );
}

export default FilterSelect;