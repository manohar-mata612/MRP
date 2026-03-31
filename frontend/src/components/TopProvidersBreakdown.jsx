import { useFilters } from "../context/FilterContext";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from "recharts";

function TopProvidersBreakdown() {
  const { dashboardData } = useFilters();
  if (!dashboardData?.top_providers_breakdown?.length) return null;

  const data = dashboardData.top_providers_breakdown.slice(0, 5).map((d) => ({
    name: d.name.length > 20 ? d.name.substring(0, 20) + "..." : d.name,
    fullName: d.name,
    Low_oop: d.Low_oop || 0,
    Low_covered: d.Low_covered || 0,
    Medium_oop: d.Medium_oop || 0,
    Medium_covered: d.Medium_covered || 0,
    High_oop: d.High_oop || 0,
    High_covered: d.High_covered || 0,
  }));

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload?.length) {
      const d = payload[0]?.payload;
      return (
        <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-lg text-sm">
          <p className="font-semibold text-gray-800 mb-1">{d.fullName}</p>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1">
            <p className="text-gray-500">Low OOP:</p><p className="font-medium">${d.Low_oop}</p>
            <p className="text-gray-500">Low Covered:</p><p className="font-medium">${d.Low_covered}</p>
            <p className="text-gray-500">Med OOP:</p><p className="font-medium">${d.Medium_oop}</p>
            <p className="text-gray-500">Med Covered:</p><p className="font-medium">${d.Medium_covered}</p>
            <p className="text-gray-500">High OOP:</p><p className="font-medium">${d.High_oop}</p>
            <p className="text-gray-500">High Covered:</p><p className="font-medium">${d.High_covered}</p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="chart-card h-full">
      <h3 className="text-sm font-bold text-gray-700 mb-3">Top Providers by Avg Cost per Visit</h3>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={data} margin={{ top: 5, right: 20, bottom: 40, left: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 9, angle: -20, textAnchor: "end" }}
            height={50}
          />
          <YAxis
            tickFormatter={(v) => `$${v}`}
            tick={{ fontSize: 11 }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize: 10 }} iconType="square" />
          <Bar dataKey="Low_oop" name="Out-of-Pocket" stackId="low" fill="#ef5350" barSize={18} />
          <Bar dataKey="Low_covered" name="Insurance Covered" stackId="low" fill="#4caf50" barSize={18} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default TopProvidersBreakdown;
