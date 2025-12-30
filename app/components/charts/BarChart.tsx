"use client";

import { Bar } from "react-chartjs-2";
import { sampleForRender } from "./dataGenerator";

type Props = {
  labels: string[];
  data: number[];
  label?: string;
};

export default function BarChart({ labels, data, label = "Series" }: Props) {
  const sampled = sampleForRender(labels, data);
  const options = { responsive: true, maintainAspectRatio: false };
  const chartData = { labels: sampled.labels, datasets: [{ label, data: sampled.data, backgroundColor: "rgba(16,185,129,0.6)" }] };
  return <Bar options={options} data={chartData} />;
}
