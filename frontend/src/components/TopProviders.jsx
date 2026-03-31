import { useFilters } from "../context/FilterContext";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell, LabelList,
} from "recharts";

const BAR_COLORS = ["#ef5350", "#ff7043", "#ffa726", "#66bb6a", "#42a5f5", "#ab47bc", "#26a69a", "#8d6e63", "#78909c", "#5c6bc0"];

function TopProviders() {
  const { dashboardData } = useFilters();
  if (!dashboardData?.top_providers?.length) return null;

  const data = dashboardData.top_providers.slice(0, 5).map((d) => ({
    ...d,
    shortName: d.name.length > 25 ? d.name.substring(0, 25) + "..." : d.name,
  }));

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload?.length) {
      const d = payload[0].payload;
      return (
        <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-lg text-sm">
          <p className="font-semibold text-gray-800 mb-1">{d.name}</p>
          <p className="text-gray-600">Avg Cost: <span className="font-medium">${d.avg_cost}</span></p>
          <p className="text-gray-600">Encounters: <span className="font-medium">{d.encounter_count.toLocaleString()}</span></p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="chart-card h-full">
      <h3 className="text-sm font-bold text-gray-700 mb-3">Top Providers by Avg Cost per Visit</h3>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} layout="vertical" margin={{ top: 5, right: 50, bottom: 5, left: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
          <XAxis
            type="number"
            tickFormatter={(v) => `$${v}`}
            tick={{ fontSize: 11 }}
          />
          <YAxis
            type="category"
            dataKey="shortName"
            width={120}
            tick={{ fontSize: 10 }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="avg_cost" radius={[0, 4, 4, 0]} barSize={28}>
            {data.map((_, index) => (
              <Cell key={index} fill={BAR_COLORS[index % BAR_COLORS.length]} />
            ))}
            <LabelList
              dataKey="avg_cost"
              position="right"
              formatter={(v) => `$${v}`}
              style={{ fontSize: 11, fill: "#475569", fontWeight: 600 }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default TopProviders;
