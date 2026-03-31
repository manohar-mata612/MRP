import { useFilters } from "../context/FilterContext";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from "recharts";

function InsuranceImpact() {
  const { dashboardData } = useFilters();
  if (!dashboardData?.insurance_impact?.length) return null;

  const data = dashboardData.insurance_impact;

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload?.length) {
      return (
        <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-lg text-sm">
          <p className="font-semibold text-gray-800 mb-1">{label} Coverage</p>
          {payload.map((p) => (
            <p key={p.name} className="text-gray-600">
              <span style={{ color: p.fill }}>●</span> {p.name}: ${p.value.toLocaleString()}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="chart-card h-full">
      <h3 className="text-sm font-bold text-gray-700 mb-3">Insurance Impact on Out-of-Pocket Costs</h3>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="coverage_level"
            tick={{ fontSize: 12 }}
          />
          <YAxis
            tickFormatter={(v) => `$${v}`}
            tick={{ fontSize: 11 }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ fontSize: 11 }}
            iconType="square"
          />
          <Bar
            dataKey="out_of_pocket"
            name="Out-of-Pocket"
            fill="#ef5350"
            radius={[4, 4, 0, 0]}
            barSize={30}
          />
          <Bar
            dataKey="insurance_covered"
            name="Insurance Covered"
            fill="#4caf50"
            radius={[4, 4, 0, 0]}
            barSize={30}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default InsuranceImpact;
