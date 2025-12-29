"use client";

import React, { useEffect, useState } from "react";
import RGL, { Layout } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend);

import LineChart from "./charts/LineChart";
import BarChart from "./charts/BarChart";
import AreaChart from "./charts/AreaChart";
import { generateDataset } from "./charts/dataGenerator";

const ReactGridLayout = (RGL as any).WidthProvider(RGL);

type SizeKey = "random" | "sm" | "md" | "lg" | "xl";

const SIZE_MAP: Record<Exclude<SizeKey, "random">, { w: number; h: number }> = {
  sm: { w: 2, h: 2 },
  md: { w: 4, h: 3 },
  lg: { w: 6, h: 4 },
  xl: { w: 8, h: 6 }
};

function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export default function Dashboard() {
  const [layout, setLayout] = useState<Layout[]>([]);
  const [loading, setLoading] = useState(true);
  const [widgets, setWidgets] = useState<Record<string, any>>({});
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalConfig, setModalConfig] = useState<any>({ size: "md", type: "line", label: "Series A" });
  const [selectedDatasetSize, setSelectedDatasetSize] = useState<"small" | "medium" | "large">("small");

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/layout");
        const json = await res.json();
        if (json?.layout)
          setLayout(
            json.layout.map((it: any) => ({
              i: String(it.i),
              x: Number(it.x ?? 0),
              y: Number(it.y ?? 0),
              w: Number(it.w ?? 1),
              h: Number(it.h ?? 1)
            }))
          );
        if (json?.widgets) setWidgets(json.widgets || {});
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function saveLayout(lay: Layout[]) {
    setSaving(true);
    try {
      await fetch("/api/layout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ layout: lay, widgets })
      });
    } catch (e) {
      console.error("save failed", e);
    } finally {
      setSaving(false);
    }
  }

  function addWidget(size: SizeKey) {
    const id = Date.now().toString();
    let w = 3,
      h = 3;
    if (size === "random") {
      w = randInt(2, 8);
      h = randInt(2, 6);
    } else {
      const s = SIZE_MAP[size as any];
      w = s.w;
      h = s.h;
    }

    const newItem: Layout = { i: id, x: 0, y: 0, w, h };
    const newLayout = [...layout, newItem];
    const newWidgets = { ...widgets };
    // default widget config
    newWidgets[id] = { type: "line", label: "Series A", data: [randInt(10, 90), randInt(10, 90), randInt(10, 90), randInt(10, 90)] };
    setLayout(newLayout);
    setWidgets(newWidgets);
    // persist both
    setSaving(true);
    fetch("/api/layout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ layout: newLayout, widgets: newWidgets }) }).finally(() => setSaving(false));
  }

  function onLayoutChange(newLayout: Layout[]) {
    // ensure numeric positions and persist
    const normalized = newLayout.map((it: any) => ({
      i: String(it.i),
      x: Number(it.x ?? 0),
      y: Number(it.y ?? 0),
      w: Number(it.w ?? 1),
      h: Number(it.h ?? 1)
    }));
    setLayout(normalized);
    saveLayout(normalized);
  }

  if (loading) return <div>Loading dashboard...</div>;

  return (
    <div className="p-6">
      <div style={{ display: "grid", gridTemplateColumns: "240px 1fr 320px", gap: 24 }}>
        {/* Left nav */}
        <aside className="p-4 bg-white rounded-lg shadow-sm">
          <h3 className="text-lg text-black font-semibold mb-3">Navigation</h3>
          <nav className="flex flex-col gap-2">
            <button className="text-left text-black px-3 py-2 rounded hover:bg-gray-50">Overview</button>
            <button className="text-left text-black px-3 py-2 rounded hover:bg-gray-50">Reports</button>
            <button className="text-left text-black px-3 py-2 rounded hover:bg-gray-50">Alerts</button>
            <button className="text-left text-black px-3 py-2 rounded hover:bg-gray-50">Settings</button>
          </nav>

          <div className="mt-6">
            <h4 className="font-medium mb-2">Add Widget</h4>
            <div className="flex flex-col gap-2">
              <button onClick={() => addWidget("random")} className="btn">Add Random</button>
              <div className="flex gap-2 mt-2">
                <button onClick={() => addWidget("sm")} className="btn small">SM</button>
                <button onClick={() => addWidget("md")} className="btn small">MD</button>
                <button onClick={() => addWidget("lg")} className="btn small">LG</button>
                <button onClick={() => addWidget("xl")} className="btn small">XL</button>
              </div>
            </div>
          </div>
        </aside>

        {/* Center - dashboard grid */}
        <main>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-black text-2xl font-semibold">Dashboard</h2>
            <div className="text-sm text-gray-600">{saving ? "Saving..." : "Saved"}</div>
          </div>

          <div className="bg-white rounded-lg p-4 shadow-sm">
            <ReactGridLayout
              className="layout"
              layout={layout}
              cols={12}
              rowHeight={30}
              onLayoutChange={(nl: Layout[]) => onLayoutChange(nl)}
              draggableHandle={".widget-drag-handle"}
            >
              {layout.map((item: any) => (
                <div key={item.i} data-grid={item} className="p-1">
                  <div className="widget-box h-full flex flex-col">
                    <div className="px-2 py-1 border-b widget-drag-handle cursor-move bg-gray-50 text-sm">Widget {item.i}</div>
                    <div className="flex-1 p-2">
                      {/* render chart if widget config exists */}
                      {widgets[item.i]?.type === "line" && (() => {
                        const cfg = widgets[item.i];
                        const ds = cfg.data && cfg.labels ? { labels: cfg.labels, data: cfg.data } : generateDataset(selectedDatasetSize);
                        return <LineChart labels={ds.labels} data={ds.data} label={cfg.label} />;
                      })()}
                      {widgets[item.i]?.type === "bar" && (() => {
                        const cfg = widgets[item.i];
                        const ds = cfg.data && cfg.labels ? { labels: cfg.labels, data: cfg.data } : generateDataset(selectedDatasetSize);
                        return <BarChart labels={ds.labels} data={ds.data} label={cfg.label} />;
                      })()}
                      {widgets[item.i]?.type === "area" && (() => {
                        const cfg = widgets[item.i];
                        const ds = cfg.data && cfg.labels ? { labels: cfg.labels, data: cfg.data } : generateDataset(selectedDatasetSize);
                        return <AreaChart labels={ds.labels} data={ds.data} label={cfg.label} />;
                      })()}
                      {!widgets[item.i] && <div className="flex-1 flex items-center justify-center text-gray-500">Placeholder</div>}
                    </div>
                  </div>
                </div>
              ))}
            </ReactGridLayout>
          </div>
        </main>

        {/* Right - charts placeholder */}
        <aside className="p-4 bg-white rounded-lg shadow-sm">
          <h3 className="text-lg text-black font-semibold mb-3">Charts</h3>
          <div className="flex flex-col gap-3">
            <div className="h-40 bg-gradient-to-br from-sky-50 to-indigo-50 rounded flex items-center justify-center text-gray-500">Chart area</div>
            <div className="h-24 bg-gradient-to-br from-rose-50 to-pink-50 rounded flex items-center justify-center text-gray-500">Chart area</div>
          </div>
        </aside>
      </div>

      <style jsx>{`
        .btn { padding: 8px 10px; background: #111827; color: white; border-radius: 6px; }
        .btn.small { padding: 6px 8px; background: #374151; }
        .widget-box { background: white; border: 1px solid rgba(0,0,0,0.06); border-radius: 8px; height: 100%; overflow: hidden; }
      `}</style>
    </div>
  );
}
