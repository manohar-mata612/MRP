import { useFilters } from "../context/FilterContext";

const FILTER_LABELS = {
  years: "Year",
  months: "Month",
  states: "State",
  cities: "City",
  genders: "Gender",
  age_groups: "Age",
  coverage_levels: "Coverage",
  specialties: "Specialty",
  payer_names: "Insurance",
};

const MONTH_NAMES = {
  1: "January", 2: "February", 3: "March", 4: "April",
  5: "May", 6: "June", 7: "July", 8: "August",
  9: "September", 10: "October", 11: "November", 12: "December",
};

const FILTER_ICONS = {
  years: "📅",
  months: "📅",
  states: "🏛️",
  cities: "🏙️",
  genders: "👤",
  age_groups: "👥",
  coverage_levels: "🛡️",
  specialties: "⚕️",
  payer_names: "💳",
};

function ActiveTags() {
  const { getActiveTags, removeFilter } = useFilters();
  const tags = getActiveTags();

  if (tags.length === 0) return null;

  const formatLabel = (key, value) => {
    if (key === "months") return MONTH_NAMES[value] || value;
    if (key === "genders") return value === "M" ? "Male" : "Female";
    return value;
  };

  return (
    <div className="flex flex-wrap gap-2 mt-3">
      {tags.map((tag, i) => (
        <div key={`${tag.key}-${tag.value}-${i}`} className="filter-tag">
          <span>{FILTER_ICONS[tag.key] || "🔹"}</span>
          <span>{formatLabel(tag.key, tag.value)}</span>
          <button onClick={() => removeFilter(tag.key, tag.value)}>×</button>
        </div>
      ))}
    </div>
  );
}

export default ActiveTags;
