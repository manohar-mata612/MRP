import { useFilters } from "../context/FilterContext";
import {
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ZAxis, Legend,
} from "recharts";

const COVERAGE_ORDER = { Low: 1, Medium: 2, High: 3 };
const COLORS = { Low: "#3b82a0", Medium: "#4caf50", High: "#2e7d32" };

function CostVsCoverage() {
  const { dashboardData } = useFilters();
  if (!dashboardData?.cost_vs_coverage?.length) return null;

  const data = dashboardData.cost_vs_coverage
    .map((d) => ({
      ...d,
      x: COVERAGE_ORDER[d.coverage_level] || 0,
      y: d.avg_cost,
      z: d.patient_count,
    }))
    .sort((a, b) => a.x - b.x);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload?.length) {
      const d = payload[0].payload;
      return (
        <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-lg text-sm">
          <p className="font-semibold text-gray-800">{d.coverage_level} Coverage</p>
          <p className="text-gray-600">Avg Cost: <span className="font-medium">${d.avg_cost}</span></p>
          <p className="text-gray-600">Patients: <span className="font-medium">{d.patient_count.toLocaleString()}</span></p>
          <p className="text-gray-600">Encounters: <span className="font-medium">{d.encounter_count.toLocaleString()}</span></p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="chart-card h-full">
      <h3 className="text-sm font-bold text-gray-700 mb-3">Avg Treatment Cost vs Coverage Level</h3>
      <ResponsiveContainer width="100%" height={250}>
        <ScatterChart margin={{ top: 10, right: 20, bottom: 20, left: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            type="number"
            dataKey="x"
            domain={[0.5, 3.5]}
            ticks={[1, 2, 3]}
            tickFormatter={(v) => ["", "Low", "Medium", "High"][v]}
            label={{ value: "Coverage Level", position: "bottom", offset: 0, fontSize: 12 }}
            tick={{ fontSize: 12 }}
          />
          <YAxis
            type="number"
            dataKey="y"
            tickFormatter={(v) => `$${v}`}
            label={{ value: "$ per Encounter", angle: -90, position: "insideLeft", offset: -5, fontSize: 12 }}
            tick={{ fontSize: 11 }}
          />
          <ZAxis type="number" dataKey="z" range={[200, 2000]} />
          <Tooltip content={<CustomTooltip />} />
          <Scatter
            data={data}
            fill="#4caf50"
            fillOpacity={0.6}
            stroke="#2e7d32"
            strokeWidth={1}
          />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
}

export default CostVsCoverage;
