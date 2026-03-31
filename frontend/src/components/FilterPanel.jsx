import { useFilters } from "../context/FilterContext";

const MONTH_LABELS = {
  1: "Jan", 2: "Feb", 3: "Mar", 4: "Apr", 5: "May", 6: "Jun",
  7: "Jul", 8: "Aug", 9: "Sep", 10: "Oct", 11: "Nov", 12: "Dec",
};

function FilterPanel() {
  const { filters, filterOptions, toggleFilter, setFilter, resetFilters } = useFilters();

  if (!filterOptions) return null;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 h-full overflow-y-auto filter-panel">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-800">Filters</h2>
        <span className="text-gray-400 cursor-pointer text-xl">⌃</span>
      </div>

      {/* Year */}
      <div className="mb-4">
        <label className="text-sm font-semibold text-gray-700 mb-2 block">Year</label>
        <div className="flex flex-wrap gap-1.5">
          {filterOptions.years.map((year) => (
            <button
              key={year}
              onClick={() => toggleFilter("years", year)}
              className={`toggle-btn text-xs ${filters.years.includes(year) ? "active" : ""}`}
            >
              {year}
            </button>
          ))}
        </div>
      </div>

      {/* Month */}
      <div className="mb-4">
        <label className="text-sm font-semibold text-gray-700 mb-2 block">Month</label>
        <div className="flex flex-wrap gap-1.5">
          {filterOptions.months.map((m) => (
            <button
              key={m}
              onClick={() => toggleFilter("months", m)}
              className={`toggle-btn text-xs ${filters.months.includes(m) ? "active" : ""}`}
            >
              {MONTH_LABELS[m]}
            </button>
          ))}
        </div>
      </div>

      {/* State */}
      <div className="mb-4">
        <label className="text-sm font-semibold text-gray-700 mb-2 block">State</label>
        <select
          className="filter-select"
          value={filters.states[0] || ""}
          onChange={(e) => setFilter("states", e.target.value ? [e.target.value] : [])}
        >
          <option value="">All States</option>
          {filterOptions.states.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {/* City */}
      <div className="mb-4">
        <label className="text-sm font-semibold text-gray-700 mb-2 block">City</label>
        <select
          className="filter-select"
          value={filters.cities[0] || ""}
          onChange={(e) => setFilter("cities", e.target.value ? [e.target.value] : [])}
        >
          <option value="">All Cities</option>
          {filterOptions.cities.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {/* Gender */}
      <div className="mb-4">
        <label className="text-sm font-semibold text-gray-700 mb-2 block">Gender</label>
        <div className="flex gap-4">
          {filterOptions.genders.map((g) => (
            <label key={g} className="flex items-center gap-2 cursor-pointer text-sm text-gray-600">
              <input
                type="radio"
                name="gender"
                checked={filters.genders.includes(g)}
                onChange={() => {
                  if (filters.genders.includes(g)) {
                    setFilter("genders", []);
                  } else {
                    setFilter("genders", [g]);
                  }
                }}
                className="accent-[#2b5797]"
              />
              {g === "M" ? "Male" : "Female"}
            </label>
          ))}
        </div>
      </div>

      {/* Age Group */}
      <div className="mb-4">
        <label className="text-sm font-semibold text-gray-700 mb-2 block">Age Group</label>
        <div className="flex flex-wrap gap-1.5">
          {filterOptions.age_groups.map((ag) => (
            <button
              key={ag}
              onClick={() => toggleFilter("age_groups", ag)}
              className={`toggle-btn text-xs ${filters.age_groups.includes(ag) ? "active" : ""}`}
            >
              {ag}
            </button>
          ))}
        </div>
      </div>

      {/* Coverage Level */}
      <div className="mb-4">
        <label className="text-sm font-semibold text-gray-700 mb-2 block">Coverage Level</label>
        <div className="flex flex-wrap gap-1.5">
          {filterOptions.coverage_levels.map((cl) => (
            <button
              key={cl}
              onClick={() => toggleFilter("coverage_levels", cl)}
              className={`toggle-btn text-xs ${filters.coverage_levels.includes(cl) ? "active" : ""}`}
            >
              {cl}
            </button>
          ))}
        </div>
      </div>

      {/* Provider Specialty */}
      <div className="mb-4">
        <label className="text-sm font-semibold text-gray-700 mb-2 block">Provider Specialty</label>
        <select
          className="filter-select"
          value={filters.specialties[0] || ""}
          onChange={(e) => setFilter("specialties", e.target.value ? [e.target.value] : [])}
        >
          <option value="">All Specialties</option>
          {filterOptions.specialties.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {/* Payer / Insurance */}
      <div className="mb-5">
        <label className="text-sm font-semibold text-gray-700 mb-2 block">Insurance</label>
        <select
          className="filter-select"
          value={filters.payer_names[0] || ""}
          onChange={(e) => setFilter("payer_names", e.target.value ? [e.target.value] : [])}
        >
          <option value="">All Insurance</option>
          {filterOptions.payer_names.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
      </div>

      {/* Reset Button */}
      <button
        onClick={resetFilters}
        className="w-full py-2.5 bg-[#2b5797] text-white rounded-lg font-semibold text-sm hover:bg-[#1e4177] transition-colors"
      >
        Reset Filters
      </button>
    </div>
  );
}

export default FilterPanel;
