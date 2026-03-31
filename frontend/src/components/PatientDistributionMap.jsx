import { useFilters } from "../context/FilterContext";
import { useState } from "react";

/* Simplified US state paths - showing California highlighted since all data is from CA */
const US_STATES = [
  { id: "CA", name: "California", path: "M 45 120 L 45 200 L 100 220 L 110 200 L 95 120 Z" },
  { id: "WA", name: "Washington", path: "M 65 40 L 105 40 L 105 70 L 65 65 Z" },
  { id: "OR", name: "Oregon", path: "M 60 65 L 105 70 L 100 100 L 55 95 Z" },
  { id: "NV", name: "Nevada", path: "M 100 95 L 115 95 L 125 180 L 105 175 Z" },
  { id: "AZ", name: "Arizona", path: "M 110 195 L 140 195 L 145 240 L 105 240 Z" },
  { id: "UT", name: "Utah", path: "M 120 95 L 150 95 L 150 155 L 125 155 Z" },
  { id: "ID", name: "Idaho", path: "M 110 45 L 135 45 L 140 95 L 105 90 Z" },
  { id: "MT", name: "Montana", path: "M 135 35 L 200 35 L 195 75 L 140 70 Z" },
  { id: "WY", name: "Wyoming", path: "M 150 75 L 200 75 L 200 115 L 150 115 Z" },
  { id: "CO", name: "Colorado", path: "M 150 120 L 210 120 L 210 160 L 150 160 Z" },
  { id: "NM", name: "New Mexico", path: "M 145 170 L 195 170 L 195 240 L 145 240 Z" },
  { id: "ND", name: "North Dakota", path: "M 205 35 L 260 35 L 260 65 L 205 65 Z" },
  { id: "SD", name: "South Dakota", path: "M 205 65 L 260 65 L 260 100 L 205 100 Z" },
  { id: "NE", name: "Nebraska", path: "M 205 100 L 270 100 L 270 130 L 200 130 Z" },
  { id: "KS", name: "Kansas", path: "M 210 135 L 275 135 L 275 165 L 210 165 Z" },
  { id: "OK", name: "Oklahoma", path: "M 210 170 L 280 170 L 285 200 L 210 200 Z" },
  { id: "TX", name: "Texas", path: "M 195 200 L 280 200 L 270 275 L 200 270 Z" },
  { id: "MN", name: "Minnesota", path: "M 260 35 L 305 35 L 305 85 L 265 85 Z" },
  { id: "IA", name: "Iowa", path: "M 270 90 L 310 90 L 310 120 L 270 120 Z" },
  { id: "MO", name: "Missouri", path: "M 275 125 L 320 125 L 325 175 L 275 170 Z" },
  { id: "AR", name: "Arkansas", path: "M 285 175 L 325 175 L 325 210 L 285 210 Z" },
  { id: "LA", name: "Louisiana", path: "M 290 215 L 330 215 L 330 255 L 290 255 Z" },
  { id: "WI", name: "Wisconsin", path: "M 305 40 L 340 40 L 340 85 L 305 80 Z" },
  { id: "IL", name: "Illinois", path: "M 315 90 L 340 90 L 345 155 L 315 155 Z" },
  { id: "MS", name: "Mississippi", path: "M 330 180 L 350 180 L 350 240 L 330 240 Z" },
  { id: "MI", name: "Michigan", path: "M 340 45 L 380 45 L 380 100 L 340 95 Z" },
  { id: "IN", name: "Indiana", path: "M 345 95 L 370 95 L 370 145 L 345 145 Z" },
  { id: "OH", name: "Ohio", path: "M 375 90 L 405 90 L 405 135 L 375 135 Z" },
  { id: "KY", name: "Kentucky", path: "M 340 145 L 405 140 L 405 165 L 340 170 Z" },
  { id: "TN", name: "Tennessee", path: "M 330 170 L 410 165 L 410 185 L 330 190 Z" },
  { id: "AL", name: "Alabama", path: "M 355 190 L 380 190 L 380 240 L 355 240 Z" },
  { id: "GA", name: "Georgia", path: "M 380 185 L 415 185 L 415 235 L 380 235 Z" },
  { id: "FL", name: "Florida", path: "M 385 240 L 430 240 L 440 290 L 400 280 Z" },
  { id: "SC", name: "South Carolina", path: "M 400 180 L 435 170 L 440 195 L 405 200 Z" },
  { id: "NC", name: "North Carolina", path: "M 390 160 L 450 150 L 450 170 L 395 175 Z" },
  { id: "VA", name: "Virginia", path: "M 390 135 L 445 130 L 450 150 L 395 155 Z" },
  { id: "WV", name: "West Virginia", path: "M 390 120 L 415 115 L 410 140 L 385 140 Z" },
  { id: "PA", name: "Pennsylvania", path: "M 385 85 L 440 80 L 440 105 L 385 110 Z" },
  { id: "NY", name: "New York", path: "M 395 50 L 450 45 L 455 80 L 395 85 Z" },
  { id: "NJ", name: "New Jersey", path: "M 440 90 L 455 88 L 455 115 L 443 112 Z" },
  { id: "CT", name: "Connecticut", path: "M 445 72 L 465 70 L 465 82 L 445 84 Z" },
  { id: "MA", name: "Massachusetts", path: "M 445 60 L 475 58 L 475 70 L 445 72 Z" },
  { id: "ME", name: "Maine", path: "M 455 20 L 480 15 L 480 55 L 455 55 Z" },
  { id: "VT", name: "Vermont", path: "M 440 35 L 455 35 L 455 55 L 440 55 Z" },
  { id: "NH", name: "New Hampshire", path: "M 455 35 L 468 32 L 470 58 L 455 58 Z" },
];

function PatientDistributionMap() {
  const { dashboardData } = useFilters();
  const [tooltip, setTooltip] = useState(null);

  if (!dashboardData?.patient_distribution) return null;

  // Create a lookup of state -> patient count
  const stateData = {};
  dashboardData.patient_distribution.forEach((d) => {
    stateData[d.state] = d.patient_count;
  });

  // Map full state names to abbreviations
  const stateNameToAbbr = {};
  US_STATES.forEach((s) => (stateNameToAbbr[s.name] = s.id));

  const getColor = (stateId) => {
    const stateName = US_STATES.find((s) => s.id === stateId)?.name;
    if (stateData[stateName]) return "#2b5797";
    return "#d1dce8";
  };

  const getCount = (stateId) => {
    const stateName = US_STATES.find((s) => s.id === stateId)?.name;
    return stateData[stateName] || 0;
  };

  return (
    <div className="chart-card h-full relative">
      <h3 className="text-sm font-bold text-gray-700 mb-2">Patient Distribution by State</h3>
      <div className="relative">
        <svg viewBox="30 10 470 290" className="w-full h-auto">
          {US_STATES.map((state) => (
            <path
              key={state.id}
              d={state.path}
              fill={getColor(state.id)}
              stroke="#ffffff"
              strokeWidth="1.5"
              opacity={getCount(state.id) > 0 ? 0.9 : 0.5}
              className="cursor-pointer transition-opacity hover:opacity-100"
              onMouseEnter={(e) => {
                const count = getCount(state.id);
                if (count > 0) {
                  setTooltip({
                    name: state.name,
                    count,
                    x: e.clientX,
                    y: e.clientY,
                  });
                }
              }}
              onMouseLeave={() => setTooltip(null)}
            />
          ))}
          {/* Label for California */}
          {getCount("CA") > 0 && (
            <g>
              <rect x="55" y="155" width="45" height="18" rx="3" fill="white" fillOpacity="0.85" />
              <text x="77" y="167" textAnchor="middle" fontSize="7" fill="#2b5797" fontWeight="600">
                California
              </text>
            </g>
          )}
        </svg>
        {tooltip && (
          <div
            className="fixed bg-white border border-gray-200 rounded-lg p-2 shadow-lg text-sm z-50 pointer-events-none"
            style={{ left: tooltip.x + 10, top: tooltip.y - 40 }}
          >
            <p className="font-semibold text-gray-800">{tooltip.name}</p>
            <p className="text-[#2b5797]">↑ {tooltip.count.toLocaleString()} Patients</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default PatientDistributionMap;
