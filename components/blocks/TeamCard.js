"use client";

import { useState } from "react";

const personalityColors = {
  Cold: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  Hot: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
  Evil: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
  Angel:
    "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300",
  GentleWoman:
    "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300",
  Gentleman:
    "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
};

const personalityLabels = {
  Cold: { en: "Cold", fa: "سرد" },
  Hot: { en: "Hot", fa: "گرم" },
  Evil: { en: "Evil", fa: "شیطانی" },
  Angel: { en: "Angel", fa: "فرشته" },
  GentleWoman: { en: "GentleWoman", fa: "بانوی مهربان" },
  Gentleman: { en: "Gentleman", fa: "آقای محترم" },
};

const statNames = {
  en: ["Power", "Speed", "Endurance", "Energy", "Timing", "Experience"],
  fa: ["قدرت", "سرعت", "استقامت", "انرژی", "زمان‌بندی", "تجربه"],
};

export default function TeamCard({ member, locale }) {
  const isRTL = locale === "fa";
  const [isExpanded, setIsExpanded] = useState(false);

  const name = isRTL && member.nameFa ? member.nameFa : member.name;
  const role = isRTL && member.roleFa ? member.roleFa : member.role;
  const bio = isRTL && member.bioFa ? member.bioFa : member.bio;
  const details =
    isRTL && member.fullDetailsFa ? member.fullDetailsFa : member.fullDetails;

  const stats = [
    member.statPower,
    member.statSpeed,
    member.statEndurance,
    member.statEnergy,
    member.statTiming,
    member.statExperience,
  ];

  const labels = isRTL ? statNames.fa : statNames.en;

  return (
    <>
      {/* Card */}
      <div
        onClick={() => setIsExpanded(true)}
        className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 text-center hover:shadow-xl transition-all cursor-pointer group"
      >
        {/* Avatar */}
        <div className="relative mx-auto w-24 h-24 mb-4">
          {member.image ? (
            <img
              src={member.image}
              alt={name}
              className="w-24 h-24 rounded-full object-cover border-4 border-indigo-100 dark:border-indigo-900"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-3xl font-bold border-4 border-indigo-100 dark:border-indigo-900">
              {name.charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-50">
          {name}
        </h3>
        <p className="text-sm text-indigo-600 dark:text-indigo-400 font-medium mb-3">
          {role}
        </p>

        {bio && (
          <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-4">
            {bio}
          </p>
        )}

        {/* Personality badges */}
        {member.personality?.length > 0 && (
          <div className="flex flex-wrap justify-center gap-1">
            {member.personality.map((p) => (
              <span
                key={p}
                className={`px-2 py-0.5 rounded-full text-xs font-medium ${personalityColors[p]}`}
              >
                {isRTL ? personalityLabels[p].fa : personalityLabels[p].en}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Expanded Modal */}
      {isExpanded && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => setIsExpanded(false)}
        >
          <div
            className="bg-white dark:bg-gray-900 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-8 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setIsExpanded(false)}
              className="float-right text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-2xl"
            >
              ✕
            </button>

            <div className="text-center mb-6">
              <div className="mx-auto w-28 h-28 mb-4">
                {member.image ? (
                  <img
                    src={member.image}
                    alt={name}
                    className="w-28 h-28 rounded-full object-cover border-4 border-indigo-200 dark:border-indigo-800"
                  />
                ) : (
                  <div className="w-28 h-28 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-4xl font-bold border-4 border-indigo-200 dark:border-indigo-800">
                    {name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-50">
                {name}
              </h2>
              <p className="text-indigo-600 dark:text-indigo-400 font-medium">
                {role}
              </p>
            </div>

            {/* Personality */}
            {member.personality?.length > 0 && (
              <div className="flex flex-wrap justify-center gap-2 mb-6">
                {member.personality.map((p) => (
                  <span
                    key={p}
                    className={`px-3 py-1 rounded-full text-sm font-medium ${personalityColors[p]}`}
                  >
                    {isRTL ? personalityLabels[p].fa : personalityLabels[p].en}
                  </span>
                ))}
              </div>
            )}

            {/* Bio */}
            {details && (
              <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-6 whitespace-pre-line">
                {details}
              </p>
            )}

            {/* FIFA Radar Chart */}
            <div className="flex justify-center mb-4">
              <RadarChart stats={stats} labels={labels} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// SVG Radar Chart
function RadarChart({ stats, labels }) {
  const size = 260;
  const center = size / 2;
  const radius = 100;
  const levels = 6;
  const angleSlice = (2 * Math.PI) / 6;

  const getPoint = (i, value) => {
    const angle = angleSlice * i - Math.PI / 2;
    const r = (value / 6) * radius;
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle),
    };
  };

  // Grid
  const gridLines = [];
  for (let level = 1; level <= levels; level++) {
    const points = [];
    for (let i = 0; i < 6; i++) {
      points.push(getPoint(i, level));
    }
    gridLines.push(
      <polygon
        key={level}
        points={points.map((p) => `${p.x},${p.y}`).join(" ")}
        fill="none"
        stroke={level === 6 ? "#6366f1" : "#e5e7eb"}
        strokeWidth={level === 6 ? 2 : 1}
      />,
    );
  }

  // Axes
  const axes = [];
  for (let i = 0; i < 6; i++) {
    const point = getPoint(i, 6);
    axes.push(
      <line
        key={i}
        x1={center}
        y1={center}
        x2={point.x}
        y2={point.y}
        stroke="#e5e7eb"
        strokeWidth={1}
      />,
    );
  }

  // Data polygon
  const dataPoints = stats.map((value, i) => getPoint(i, value));
  const dataPath = dataPoints.map((p) => `${p.x},${p.y}`).join(" ");

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {axes}
      {gridLines}
      <polygon
        points={dataPath}
        fill="rgba(99,102,241,0.3)"
        stroke="#6366f1"
        strokeWidth={2}
      />
      {dataPoints.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={4} fill="#6366f1" />
      ))}
      {/* Labels */}
      {labels.map((label, i) => {
        const angle = angleSlice * i - Math.PI / 2;
        const labelR = radius + 25;
        const x = center + labelR * Math.cos(angle);
        const y = center + labelR * Math.sin(angle);
        return (
          <text
            key={i}
            x={x}
            y={y}
            textAnchor="middle"
            dominantBaseline="middle"
            className="text-[10px] fill-gray-600 dark:fill-gray-400"
            fontWeight="600"
          >
            {label}
          </text>
        );
      })}
      {/* Center value labels */}
      {stats.map((value, i) => {
        const point = getPoint(i, value);
        const angle = angleSlice * i - Math.PI / 2;
        const offsetX = 12 * Math.cos(angle);
        const offsetY = 12 * Math.sin(angle);
        return (
          <text
            key={i}
            x={point.x + offsetX}
            y={point.y + offsetY}
            textAnchor="middle"
            dominantBaseline="middle"
            className="text-[11px] fill-indigo-600 dark:fill-indigo-400"
            fontWeight="bold"
          >
            {value}
          </text>
        );
      })}
    </svg>
  );
}
