import { useFilters } from "../context/FilterContext";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, Cell, LabelList,
} from "recharts";

const COLORS = { Low: "#3b82a0", Medium: "#4caf50", High: "#2e7d32" };

function EncountersByAge() {
  const { dashboardData } = useFilters();
  if (!dashboardData?.encounters_by_age?.length) return null;

  const data = dashboardData.encounters_by_age.map((d) => ({
    ...d,
    total: d.Low + d.Medium + d.High,
  }));

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload?.length) {
      return (
        <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-lg text-sm">
          <p className="font-semibold text-gray-800 mb-1">Age: {label}</p>
          {payload.map((p) => (
            <p key={p.name} className="text-gray-600">
              <span style={{ color: p.fill }}>●</span> {p.name}: {p.value.toLocaleString()}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="chart-card h-full">
      <h3 className="text-sm font-bold text-gray-700 mb-3">Encounters by Age Group</h3>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} layout="vertical" margin={{ top: 5, right: 40, bottom: 5, left: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
          <XAxis type="number" tick={{ fontSize: 11 }} />
          <YAxis
            type="category"
            dataKey="age_group"
            width={45}
            tick={{ fontSize: 12 }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="Low" stackId="a" fill={COLORS.Low} radius={[0, 0, 0, 0]}>
            <LabelList
              dataKey="total"
              position="right"
              formatter={(v) => v.toLocaleString()}
              style={{ fontSize: 11, fill: "#475569", fontWeight: 600 }}
            />
          </Bar>
          <Bar dataKey="Medium" stackId="a" fill={COLORS.Medium} />
          <Bar dataKey="High" stackId="a" fill={COLORS.High} radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
      <div className="flex justify-center gap-4 mt-2">
        {Object.entries(COLORS).map(([key, color]) => (
          <span key={key} className="flex items-center gap-1 text-xs text-gray-600">
            <span className="w-3 h-3 rounded-sm inline-block" style={{ background: color }}></span>
            {key}
          </span>
        ))}
      </div>
    </div>
  );
}

export default EncountersByAge;
