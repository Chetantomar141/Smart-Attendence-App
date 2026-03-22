import React, { useEffect, useRef, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Sector,
} from "recharts";
import gsap from "gsap";

const renderActiveShape = (props) => {
  const RADIAN = Math.PI / 180;
  const {
    cx, cy, midAngle, innerRadius, outerRadius,
    startAngle, endAngle, fill, payload, percent, value, name
  } = props;

  const sin = Math.sin(-RADIAN * midAngle);
  const cos = Math.cos(-RADIAN * midAngle);

  const sx = cx + (outerRadius + 10) * cos;
  const sy = cy + (outerRadius + 10) * sin;
  const mx = cx + (outerRadius + 30) * cos;
  const my = cy + (outerRadius + 30) * sin;

  const ex = mx + (cos >= 0 ? 1 : -1) * 22;
  const ey = my;

  const textAnchor = cos >= 0 ? "start" : "end";

  return (
    <g>
      {/* Center Text FIXED for theme */}
      <text
        x={cx}
        y={cy}
        dy={8}
        textAnchor="middle"
        className="font-black text-lg fill-gray-800 dark:fill-white"
      >
        {payload.totalLabel || "Total"}
      </text>

      <Sector {...props} />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + 6}
        outerRadius={outerRadius + 10}
        fill={fill}
      />

      <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" />
      <circle cx={ex} cy={ey} r={3} fill={fill} />

      {/* Label FIXED */}
      <text
        x={ex + (cos >= 0 ? 12 : -12)}
        y={ey}
        textAnchor={textAnchor}
        className="text-xs font-bold fill-gray-700 dark:fill-white"
      >
        {`${name}: ${value}`}
      </text>

      <text
        x={ex + (cos >= 0 ? 12 : -12)}
        y={ey + 15}
        textAnchor={textAnchor}
        className="text-[10px] fill-gray-500 dark:fill-gray-400"
      >
        {`${(percent * 100).toFixed(1)}%`}
      </text>
    </g>
  );
};

const CircularChart = ({ title, data, colors, prefix = "" }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const chartRef = useRef(null);

  useEffect(() => {
    // 🔥 GSAP Entry Animation
    gsap.fromTo(
      chartRef.current,
      { opacity: 0, y: 15, scale: 0.98 },
      { opacity: 1, y: 0, scale: 1, duration: 0.3, ease: "power2.out" }
    );

    // 🔥 Stagger animation for legend
    gsap.from(".legend-item", {
      opacity: 0,
      y: 10,
      stagger: 0.05,
      duration: 0.3,
      ease: "power2.out"
    });
  }, []);

  const handleHover = (e, isEnter) => {
    gsap.to(e.currentTarget, {
      scale: isEnter ? 1.02 : 1,
      duration: 0.2,
      ease: "power2.out",
    });
  };

  const totalValue = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <div
      ref={chartRef}
      onMouseEnter={(e) => handleHover(e, true)}
      onMouseLeave={(e) => handleHover(e, false)}
      className="p-6 rounded-2xl bg-white dark:bg-gray-900 
      border border-gray-200 dark:border-gray-700 
      shadow-md hover:shadow-xl transition-all duration-300"
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-6 flex-wrap gap-2">
        <h3 className="text-sm font-black text-gray-700 dark:text-gray-300 uppercase tracking-widest">
          {title}
        </h3>

        <div className="flex flex-wrap gap-3">
          {data.map((entry, index) => (
            <div key={index} className="flex items-center gap-1.5 legend-item">
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: colors[index % colors.length] }}
              />
              <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase">
                {entry.name}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="h-[250px] w-full">
        <ResponsiveContainer>
          <PieChart>
            <Pie
              activeIndex={activeIndex}
              activeShape={renderActiveShape}
              data={data.map((d) => ({
                ...d,
                totalLabel: `${prefix}${totalValue}`,
              }))}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              dataKey="value"
              onMouseEnter={(_, i) => setActiveIndex(i)}
              animationDuration={400}
            >
              {data.map((entry, index) => (
                <Cell
                  key={index}
                  fill={colors[index % colors.length]}
                  className="cursor-pointer"
                />
              ))}
            </Pie>

            <Tooltip
              contentStyle={{
                background: "#1e293b",
                borderRadius: "10px",
                border: "none",
                color: "#fff",
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Footer */}
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-between">
        <p className="text-xs font-semibold text-gray-500">
          Dynamic Report
        </p>
        <p className="text-xs font-bold text-blue-500">
          Live Sync
        </p>
      </div>
    </div>
  );
};

export default CircularChart;