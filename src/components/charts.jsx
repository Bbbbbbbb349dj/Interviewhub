import React from 'react';
import {
  Chart as ChartJS, CategoryScale, LinearScale, RadialLinearScale,
  PointElement, LineElement, BarElement, ArcElement, Filler, Tooltip, Legend,
} from 'chart.js';
import { Line, Radar, Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, RadialLinearScale, PointElement, LineElement, BarElement, ArcElement, Filler, Tooltip, Legend);

const gridColor = 'rgba(148,163,184,0.15)';
const tickColor = 'rgba(100,116,139,0.9)';

const baseOptions = {
  responsive: true,
  maintainAspectRatio: false,
  interaction: { mode: 'index', intersect: false },
  plugins: { legend: { display: false } },
  animation: { duration: 900, easing: 'easeOutQuart' },
};

export function LineChart({ labels, data, color = '#06b6d4', label = 'Score' }) {
  return (
    <Line
      data={{
        labels,
        datasets: [{
          label, data,
          borderColor: color, borderWidth: 2.5,
          pointBackgroundColor: color, pointRadius: 4, pointHoverRadius: 6,
          tension: 0.4, fill: true,
          backgroundColor: (ctx) => {
            const h = ctx.chart.height || 300;
            const g = ctx.chart.ctx.createLinearGradient(0, 0, 0, h);
            g.addColorStop(0, color + '55'); g.addColorStop(1, color + '00');
            return g;
          },
        }],
      }}
      options={{
        ...baseOptions,
        scales: {
          x: { grid: { color: gridColor }, ticks: { color: tickColor, font: { size: 11 } } },
          y: { min: 0, max: 100, grid: { color: gridColor }, ticks: { color: tickColor, font: { size: 11 } } },
        },
      }}
    />
  );
}

export function RadarChart({ labels, data }) {
  const colors = ['#2563eb', '#10b981', '#ec4899', '#f59e0b', '#f97316', '#8b5cf6'];
  return (
    <Radar
      data={{
        labels,
        datasets: [{
          label: 'Skill', data,
          backgroundColor: 'rgba(99,102,241,0.18)',
          borderColor: '#6366f1', borderWidth: 2,
          pointBackgroundColor: labels.map((_, i) => colors[i % colors.length]),
          pointRadius: 4,
        }],
      }}
      options={{
        ...baseOptions,
        scales: {
          r: {
            min: 0, max: 100,
            grid: { color: gridColor }, angleLines: { color: gridColor },
            pointLabels: { color: tickColor, font: { size: 11, weight: 'bold' } },
            ticks: { display: false },
          },
        },
      }}
    />
  );
}

export function BarChart({ labels, data, colors }) {
  return (
    <Bar
      data={{
        labels,
        datasets: [{ data, backgroundColor: colors, borderRadius: 8, borderSkipped: false, maxBarThickness: 40 }],
      }}
      options={{
        ...baseOptions,
        scales: {
          x: { grid: { display: false }, ticks: { color: tickColor, font: { size: 11 } } },
          y: { min: 0, max: 100, grid: { color: gridColor }, ticks: { color: tickColor, font: { size: 11 }, callback: (v) => v + '%' } },
        },
      }}
    />
  );
}

export function Donut({ labels, data, colors }) {
  return (
    <Doughnut
      data={{
        labels,
        datasets: [{ data, backgroundColor: colors, borderWidth: 0, hoverOffset: 6 }],
      }}
      options={{ ...baseOptions, cutout: '68%', plugins: { legend: { position: 'bottom', labels: { color: tickColor, boxWidth: 10, font: { size: 11 } } } } }}
    />
  );
}
