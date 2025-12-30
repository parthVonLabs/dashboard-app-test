"use client";

import { Line } from "react-chartjs-2";
import { sampleForRender } from "./dataGenerator";

type Props = {
  labels: string[];
  data: number[];
  label?: string;
};

export default function AreaChart({ labels, data, label = "Series" }: Props) {
  const sampled = sampleForRender(labels, data);
  const options = { responsive: true, maintainAspectRatio: false };
  const chartData = { labels: sampled.labels, datasets: [{ label, data: sampled.data, borderColor: "#ef4444", backgroundColor: "rgba(239,68,68,0.12)", fill: true, tension: 0.3 }] };
  return <Line options={options} data={chartData} />;
}
