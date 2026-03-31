import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { fetchFilterOptions, fetchDashboardData } from "../utils/api";

const FilterContext = createContext();

const INITIAL_FILTERS = {
  years: [],
  months: [],
  states: [],
  cities: [],
  genders: [],
  age_groups: [],
  coverage_levels: [],
  specialties: [],
  payer_names: [],
};

export function FilterProvider({ children }) {
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [filterOptions, setFilterOptions] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load filter options on mount
  useEffect(() => {
    fetchFilterOptions()
      .then(setFilterOptions)
      .catch((err) => setError(err.message));
  }, []);

  // Fetch dashboard data whenever filters change
  const loadDashboard = useCallback(async () => {
    setLoading(true);
    try {
      // Only send non-empty filter arrays
      const activeFilters = {};
      for (const [key, value] of Object.entries(filters)) {
        if (Array.isArray(value) && value.length > 0) {
          activeFilters[key] = value;
        }
      }
      const data = await fetchDashboardData(activeFilters);
      setDashboardData(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  // Filter update helpers
  const toggleFilter = (key, value) => {
    setFilters((prev) => {
      const current = prev[key];
      const updated = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      return { ...prev, [key]: updated };
    });
  };

  const setFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setFilters(INITIAL_FILTERS);
  };

  const removeFilter = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: prev[key].filter((v) => v !== value),
    }));
  };

  // Get all active filter tags for display
  const getActiveTags = () => {
    const tags = [];
    for (const [key, values] of Object.entries(filters)) {
      if (Array.isArray(values)) {
        values.forEach((value) => {
          tags.push({ key, value, label: String(value) });
        });
      }
    }
    return tags;
  };

  return (
    <FilterContext.Provider
      value={{
        filters,
        filterOptions,
        dashboardData,
        loading,
        error,
        toggleFilter,
        setFilter,
        resetFilters,
        removeFilter,
        getActiveTags,
      }}
    >
      {children}
    </FilterContext.Provider>
  );
}

export function useFilters() {
  const context = useContext(FilterContext);
  if (!context) {
    throw new Error("useFilters must be used within a FilterProvider");
  }
  return context;
}
