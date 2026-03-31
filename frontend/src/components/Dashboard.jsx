import { useFilters } from "../context/FilterContext";
import FilterPanel from "./FilterPanel";
import KPICards from "./KPICards";
import CostVsCoverage from "./CostVsCoverage";
import EncountersByAge from "./EncountersByAge";
import TopProviders from "./TopProviders";
import InsuranceImpact from "./InsuranceImpact";
import PatientDistributionMap from "./PatientDistributionMap";
import TopProvidersBreakdown from "./TopProvidersBreakdown";
import ActiveTags from "./ActiveTags";

function Dashboard() {
  const { dashboardData, loading, error } = useFilters();

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#eef2f7]">
        <div className="bg-white p-8 rounded-xl shadow-lg text-center max-w-md">
          <div className="text-4xl mb-3">⚠️</div>
          <h2 className="text-xl font-semibold text-red-600 mb-2">Connection Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <p className="text-sm text-gray-400">
            Make sure the backend is running at{" "}
            <code className="bg-gray-100 px-2 py-1 rounded">http://localhost:5000</code>
          </p>
        </div>
      </div>
    );
  }

  if (loading || !dashboardData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#eef2f7]">
        <div className="text-center">
          <div className="w-14 h-14 border-4 border-[#2b5797] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg font-medium">Loading dashboard data...</p>
          <p className="text-gray-400 text-sm mt-1">Connecting to backend</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#eef2f7]">
      {/* Header Bar */}
      <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center gap-4 shadow-sm">
        <div className="bg-[#2b5797] text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2 text-sm">
          <span className="text-lg">📊</span> Dashboard
        </div>
        <h1 className="text-xl font-bold text-gray-700">Hospital Matching Dashboard</h1>
        <span className="text-xs text-gray-400 ml-auto">Type 2 Diabetes Management</span>
      </div>

      {/* Main Layout: Sidebar + Content */}
      <div className="flex p-4 gap-4">
        {/* Left Sidebar - Filters */}
        <div className="w-[220px] flex-shrink-0">
          <FilterPanel />
        </div>

        {/* Main Content Area */}
        <div className="flex-1 min-w-0">
          {/* KPI Cards Row */}
          <KPICards />

          {/* Row 2: Scatter Chart + Map */}
          <div className="grid grid-cols-3 gap-4 mt-4">
            <div className="col-span-2">
              <CostVsCoverage />
            </div>
            <div className="col-span-1">
              <PatientDistributionMap />
            </div>
          </div>

          {/* Row 3: Age Group + Top Providers + Provider Breakdown */}
          <div className="grid grid-cols-3 gap-4 mt-4">
            <div className="col-span-1">
              <EncountersByAge />
            </div>
            <div className="col-span-1">
              <TopProviders />
            </div>
            <div className="col-span-1">
              <TopProvidersBreakdown />
            </div>
          </div>

          {/* Row 4: Insurance Impact */}
          <div className="grid grid-cols-3 gap-4 mt-4">
            <div className="col-span-1">
              <InsuranceImpact />
            </div>
          </div>

          {/* Active Filter Tags */}
          <ActiveTags />
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
