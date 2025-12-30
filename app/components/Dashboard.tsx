"use client";

import { useState, useMemo } from "react";
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
import useWidgetData from "../hooks/useWidgetData";
import WidgetConfigPane from "./WidgetConfigPane";
import useDashboard from "../hooks/useDashboard";

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
  const { layout, widgets, loading, saving, onLayoutChange, createWidget, updateWidget, removeWidget, setWidgetLayoutSizeKey, regenerateDataForWidgets } = useDashboard();
  // local UI-only state
  const [showModal, setShowModal] = useState(false);
  const defaultModalConfig = { size: "small", type: "line", label: "Series A" };
  const [modalInitialConfig, setModalInitialConfig] = useState<any>(defaultModalConfig);
  const [selectedDatasetSize, setSelectedDatasetSize] = useState<"tiny" | "small" | "medium" | "large">("small");
  const [editingWidgetId, setEditingWidgetId] = useState<string | null>(null);
  const [showLeft, setShowLeft] = useState(true);
  const [showRight, setShowRight] = useState(true);

  // compute grid template columns based on visible panes
  // compute grid template columns based on visible panes
  // use minmax for the center column to avoid unexpected collapse
  const gridTemplateColumns = showLeft && showRight ? "240px minmax(0, 1fr) 320px" : showLeft && !showRight ? "240px minmax(0, 1fr)" : !showLeft && showRight ? "minmax(0, 1fr) 320px" : "minmax(0, 1fr)";

  // Memoize derived layout items to avoid recalculating during unrelated state updates
  const computedItems = useMemo(() => {
    return (layout || []).map((it: any) => {
      const widget = widgets?.[it.i];
      const dataLen = widget?.data?.length ?? 0;
      return { item: it, widget, dataLen };
    });
  }, [layout, widgets]);

  function closeModal() {
    setShowModal(false);
    setEditingWidgetId(null);
  }

  async function saveWidgetConfig(cfg?: any) {
    const modalCfg = cfg ?? modalInitialConfig;
    // if editingWidgetId is set, update existing
    if (editingWidgetId) {
      await updateWidget(editingWidgetId, modalCfg);
      setShowModal(false);
      setEditingWidgetId(null);
      return;
    }

    // create new widget from modalConfig
    const id = Date.now().toString();
    const sizeKey: SizeKey = "md";
    const s = SIZE_MAP[sizeKey] || { w: 4, h: 3 };
    const newItem: Layout = { i: id, x: 0, y: 0, w: s.w, h: s.h };
    const newLayout = [...layout, newItem];
    const newWidgets = { ...widgets };
    const ds = generateDataset(['tiny','small','medium','large'].includes(modalCfg.size) ? modalCfg.size : 'small' as any);
    newWidgets[id] = { type: modalCfg.type || 'line', label: modalCfg.label || 'Series', data: ds.data, labels: ds.labels };
    await createWidget(modalCfg);
    setShowModal(false);
    setEditingWidgetId(null);
  }

  // Component to render a widget; keeps rendering logic here, business/data fetching in hook
  function WidgetBox({ id, initial }: { id: string; initial?: any }) {
    const { data, labels, config, loading } = useWidgetData(id, initial);
    const cfg = config || initial || {};

    if (loading) return <div className="flex-1 flex items-center justify-center">Loading...</div>;

    if (!cfg) return <div className="flex-1 flex items-center justify-center text-black">No config</div>;

    const ds = { labels: labels || cfg.labels || [], data: data || cfg.data || [] };

    return (
      <div className="flex flex-col h-full">
        <div className="text-sm font-medium mb-2">{cfg.label || "Widget"}</div>
        <div className="flex-1 min-h-0">
          {cfg.type === "line" && <LineChart labels={ds.labels} data={ds.data} label={cfg.label} />}
          {cfg.type === "bar" && <BarChart labels={ds.labels} data={ds.data} label={cfg.label} />}
          {cfg.type === "area" && <AreaChart labels={ds.labels} data={ds.data} label={cfg.label} />}
        </div>
      </div>
    );
  }

  if (loading) return <div>Loading dashboard...</div>;

  return (
    <div className="p-6 text-black">
      <div style={{ display: "grid", gridTemplateColumns: gridTemplateColumns, gap: 24 }}>
        {/* Left nav */}
        {showLeft && (
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
              <button onClick={() => { setEditingWidgetId(null); setModalInitialConfig(defaultModalConfig); setShowModal(true); }} className="btn">Configure Widget</button>
            </div>
          </div>
          </aside>
        )}

        {/* Center - dashboard grid */}
        <main style={{ minWidth: 480 }}>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-black text-2xl font-semibold">Dashboard</h2>
              <div className="mt-2 text-sm text-black">Dataset size:</div>
              <div className="mt-2 inline-flex rounded-md overflow-hidden border">
                <button onClick={() => { setSelectedDatasetSize("tiny"); regenerateDataForWidgets("tiny"); }} className={`px-3 py-1 ${selectedDatasetSize === "tiny" ? "bg-black text-white" : "bg-white text-black"}`}>Tiny (&lt;100)</button>
                <button onClick={() => { setSelectedDatasetSize("small"); regenerateDataForWidgets("small"); }} className={`px-3 py-1 ${selectedDatasetSize === "small" ? "bg-black text-white" : "bg-white text-black"}`}>Small (&lt;500)</button>
                <button onClick={() => { setSelectedDatasetSize("medium"); regenerateDataForWidgets("medium"); }} className={`px-3 py-1 ${selectedDatasetSize === "medium" ? "bg-black text-white" : "bg-white text-black"}`}>Medium (1k)</button>
                <button onClick={() => { setSelectedDatasetSize("large"); regenerateDataForWidgets("large"); }} className={`px-3 py-1 ${selectedDatasetSize === "large" ? "bg-black text-white" : "bg-white text-black"}`}>Large (10k+)</button>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-sm text-black">{saving ? "Saving..." : "Saved"}</div>
              <button onClick={() => setShowLeft((s) => !s)} className="px-2 py-1 border rounded text-sm">Toggle Nav</button>
              <button onClick={() => setShowRight((s) => !s)} className="px-2 py-1 border rounded text-sm">Toggle Right</button>
            </div>
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
                      <div className="flex items-center justify-between px-2 py-1 border-b bg-gray-50 text-sm">
                        <div className="flex items-center gap-3">
                          <span className="widget-drag-handle cursor-move font-medium">{(widgets[item.i]?.data?.length ?? 0)} pts</span>
                          <div className="inline-flex rounded overflow-hidden border">
                            {(["sm", "md", "lg", "xl"] as Array<Exclude<SizeKey, "random">>).map((k) => {
                              const s = SIZE_MAP[k];
                              const active = (widgets[item.i]?.layoutSize === k) || (item.w === s.w && item.h === s.h);
                              return (
                                <button
                                  key={k}
                                  onClick={(e) => { e.stopPropagation(); setWidgetLayoutSizeKey(item.i, k, SIZE_MAP as any); }}
                                  className={`px-2 py-0.5 text-xs ${active ? 'bg-black text-white' : 'bg-white text-black'}`}
                                  title={`Set size ${k.toUpperCase()}`}
                                >
                                  {k.toUpperCase()}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button onClick={(e) => { e.stopPropagation(); setEditingWidgetId(item.i); setModalInitialConfig(widgets[item.i] || defaultModalConfig); setShowModal(true); }} className="text-xs px-2 py-1 rounded bg-gray-100 hover:bg-gray-200">Edit</button>
                          <button onClick={(e) => { e.stopPropagation(); removeWidget(item.i); }} className="text-xs px-2 py-1 rounded bg-red-100 text-red-700 hover:bg-red-200">Remove</button>
                        </div>
                      </div>
                      <div className="flex-1 p-2 min-h-0">
                        <WidgetBox id={item.i} initial={widgets[item.i]} />
                      </div>
                    </div>
                  </div>
                ))}
            </ReactGridLayout>
          </div>
        </main>

        {/* Right - charts placeholder */}
        {showRight && (
          <aside className="p-4 bg-white rounded-lg shadow-sm">
            <h3 className="text-lg text-black font-semibold mb-3">Charts</h3>
            <div className="flex flex-col gap-3">
              <div className="h-40 bg-gradient-to-br from-sky-50 to-indigo-50 rounded flex items-center justify-center text-black">Chart area</div>
              <div className="h-24 bg-gradient-to-br from-rose-50 to-pink-50 rounded flex items-center justify-center text-black">Chart area</div>
            </div>
          </aside>
        )}
        <WidgetConfigPane
          visible={showModal}
          onClose={closeModal}
          initialConfig={modalInitialConfig}
          onSave={saveWidgetConfig}
          editingWidgetId={editingWidgetId}
        />
      </div>

      <style jsx>{`
        .btn { padding: 8px 10px; background: #111827; color: white; border-radius: 6px; }
        .btn.small { padding: 6px 8px; background: #374151; }
        .widget-box { background: white; border: 1px solid rgba(0,0,0,0.06); border-radius: 8px; height: 100%; overflow: hidden; }
      `}</style>
    </div>
  );
}
