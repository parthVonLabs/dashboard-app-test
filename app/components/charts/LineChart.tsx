"use client";

import { Line } from "react-chartjs-2";
import { sampleForRender } from "./dataGenerator";

type Props = {
  labels: string[];
  data: number[];
  label?: string;
};

export default function LineChart({ labels, data, label = "Series" }: Props) {
  const sampled = sampleForRender(labels, data);
  const options = { responsive: true, maintainAspectRatio: false };
  const chartData = { labels: sampled.labels, datasets: [{ label, data: sampled.data, borderColor: "#2563eb", backgroundColor: "rgba(37,99,235,0.08)", tension: 0.3 }] };
  return <Line options={options} data={chartData} />;
}
