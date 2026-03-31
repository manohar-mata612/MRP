import { useFilters } from "../context/FilterContext";

function GaugeChart({ value }) {
  const angle = Math.min(Math.max((value / 100) * 180, 0), 180);
  const getColor = (val) => {
    if (val < 40) return "#ef4444";
    if (val < 65) return "#f59e0b";
    return "#22c55e";
  };

  return (
    <div className="gauge-container mx-auto mt-1">
      <svg viewBox="0 0 100 55" className="w-full h-full">
        {/* Background arc */}
        <path
          d="M 10 50 A 40 40 0 0 1 90 50"
          fill="none"
          stroke="#e5e7eb"
          strokeWidth="8"
          strokeLinecap="round"
        />
        {/* Colored arc segments */}
        <path
          d="M 10 50 A 40 40 0 0 1 36 17"
          fill="none"
          stroke="#ef4444"
          strokeWidth="8"
          strokeLinecap="round"
          opacity="0.3"
        />
        <path
          d="M 36 17 A 40 40 0 0 1 64 17"
          fill="none"
          stroke="#f59e0b"
          strokeWidth="8"
          strokeLinecap="round"
          opacity="0.3"
        />
        <path
          d="M 64 17 A 40 40 0 0 1 90 50"
          fill="none"
          stroke="#22c55e"
          strokeWidth="8"
          strokeLinecap="round"
          opacity="0.3"
        />
        {/* Needle */}
        <line
          x1="50"
          y1="50"
          x2={50 + 32 * Math.cos((Math.PI * (180 - angle)) / 180)}
          y2={50 - 32 * Math.sin((Math.PI * (180 - angle)) / 180)}
          stroke={getColor(value)}
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <circle cx="50" cy="50" r="3" fill={getColor(value)} />
      </svg>
    </div>
  );
}

function KPICards() {
  const { dashboardData } = useFilters();
  if (!dashboardData) return null;

  const { kpis, prediction } = dashboardData;

  return (
    <div className="grid grid-cols-4 gap-4">
      {/* Total Patients */}
      <div className="kpi-card bg-gradient-to-br from-[#2b6cb0] to-[#3b82a0] text-white rounded-xl p-4 shadow-md">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium opacity-90">Total Patients</span>
          <svg className="w-5 h-5 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        </div>
        <p className="text-3xl font-bold">{kpis.total_patients.toLocaleString()}</p>
      </div>

      {/* Total Encounters */}
      <div className="kpi-card bg-gradient-to-br from-[#3b82a0] to-[#4a9bb5] text-white rounded-xl p-4 shadow-md">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium opacity-90">Total Encounters</span>
          <svg className="w-5 h-5 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        <p className="text-3xl font-bold">{kpis.total_encounters.toLocaleString()}</p>
      </div>

      {/* Avg Treatment Cost */}
      <div className="kpi-card bg-gradient-to-br from-[#4caf50] to-[#66bb6a] text-white rounded-xl p-4 shadow-md">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium opacity-90">Avg Treatment Cost</span>
          <svg className="w-5 h-5 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        </div>
        <p className="text-3xl font-bold">${kpis.avg_treatment_cost.toLocaleString()}</p>
      </div>

      {/* Predicted Cost per Visit */}
      <div className="kpi-card bg-gradient-to-br from-[#e8a838] to-[#f5b74e] text-white rounded-xl p-4 shadow-md">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm font-medium opacity-90">Pred. Cost per Visit</span>
          <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">
            {prediction?.trend_direction === "up" ? "↑" : "↓"}
            {prediction?.trend_percent}%
          </span>
        </div>
        <p className="text-2xl font-bold">${prediction?.predicted_cost}</p>
        <div className="flex items-center justify-between mt-1">
          <div>
            <span className="text-xs opacity-80">
              {prediction?.trend_direction === "up" ? "↑" : "↓"} {prediction?.trend_percent}%
            </span>
            <div className="mt-1">
              <span className="text-[10px] bg-green-600/60 px-2 py-0.5 rounded-full">RandomForest</span>
            </div>
          </div>
          <div className="text-center">
            <GaugeChart value={prediction?.accuracy_percent || 0} />
            <span className="text-[10px] font-semibold">{prediction?.accuracy_percent}% Accurate</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default KPICards;
