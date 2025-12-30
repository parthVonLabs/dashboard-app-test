"use client";

import { useEffect, useState } from "react";
import { Layout } from "react-grid-layout";
import { generateDataset } from "../components/charts/dataGenerator";

type LayoutItem = { i: string; x: number; y: number; w: number; h: number };

export default function useDashboard() {
  const [layout, setLayout] = useState<Layout[]>([]);
  const [widgets, setWidgets] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const res = await fetch("/api/layout");
        const json = await res.json();
        if (!mounted) return;
        if (json?.layout) {
          setLayout(
            json.layout.map((it: any) => ({
              i: String(it.i),
              x: Number(it.x ?? 0),
              y: Number(it.y ?? 0),
              w: Number(it.w ?? 1),
              h: Number(it.h ?? 1)
            }))
          );
        }
        if (json?.widgets) setWidgets(json.widgets || {});
      } catch (e) {
        console.error(e);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
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

  function onLayoutChange(newLayout: Layout[]) {
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

  async function createWidget(config: any) {
    const id = Date.now().toString();
    const sizeKey = (config.size as string) || "small";
    const ds = generateDataset((['tiny','small','medium','large'].includes(sizeKey) ? sizeKey : 'small') as any);
    const item: LayoutItem = { i: id, x: 0, y: 0, w: 4, h: 3 };
    const newLayout = [...layout, item];
    const newWidgets = { ...widgets, [id]: { type: config.type || 'line', label: config.label || 'Series', data: ds.data, labels: ds.labels, layoutSize: sizeKey } };
    setLayout(newLayout);
    setWidgets(newWidgets);
    setSaving(true);
    try {
      await fetch("/api/layout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ layout: newLayout, widgets: newWidgets }) });
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  }

  async function updateWidget(id: string, cfg: any) {
    const newWidgets = { ...widgets, [id]: { ...widgets[id], ...cfg } };
    if (cfg.size) {
      const ds = generateDataset((['tiny','small','medium','large'].includes(cfg.size) ? cfg.size : 'small') as any);
      newWidgets[id].data = ds.data;
      newWidgets[id].labels = ds.labels;
    }
    setWidgets(newWidgets);
    setSaving(true);
    try {
      await fetch("/api/layout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ layout, widgets: newWidgets }) });
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  }

  async function removeWidget(id: string) {
    setSaving(true);
    try {
      const res = await fetch(`/api/widget?id=${encodeURIComponent(id)}`, { method: "DELETE" });
      if (!res.ok) throw new Error(`status ${res.status}`);
      const json = await res.json();
      if (json?.layout) setLayout(json.layout.map((it: any) => ({ i: String(it.i), x: Number(it.x ?? 0), y: Number(it.y ?? 0), w: Number(it.w ?? 1), h: Number(it.h ?? 1) })));
      if (json?.widgets) setWidgets(json.widgets || {});
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  }

  function setWidgetLayoutSize(id: string, w: number, h: number, layoutSize?: string) {
    const newLayout = layout.map((it) => (it.i === id ? { ...it, w, h } : it));
    const newWidgets = { ...widgets, [id]: { ...(widgets[id] || {}), layoutSize } };
    setLayout(newLayout);
    setWidgets(newWidgets);
    setSaving(true);
    fetch("/api/layout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ layout: newLayout, widgets: newWidgets }) })
      .catch((e) => console.error(e))
      .finally(() => setSaving(false));
  }

  // convenience wrapper to accept sizeKey like 'sm','md','lg','xl'
  function setWidgetLayoutSizeKey(id: string, sizeKey: Exclude<string, "random">, sizeMap: Record<string, { w: number; h: number }>) {
    const s = sizeMap[sizeKey] || { w: 4, h: 3 };
    setWidgetLayoutSize(id, s.w, s.h, sizeKey);
  }

  async function regenerateDataForWidgets(size: string) {
    const newWidgets = { ...widgets };
    Object.keys(newWidgets).forEach((id) => {
      const ds = generateDataset((['tiny','small','medium','large'].includes(size) ? size : 'small') as any);
      newWidgets[id] = { ...newWidgets[id], data: ds.data, labels: ds.labels };
    });
    setWidgets(newWidgets);
    setSaving(true);
    try {
      await fetch("/api/layout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ layout, widgets: newWidgets }) });
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  }

  return {
    layout,
    widgets,
    loading,
    saving,
    setLayout,
    setWidgets,
    saveLayout,
    onLayoutChange,
    createWidget,
    updateWidget,
    removeWidget,
    setWidgetLayoutSizeKey,
    regenerateDataForWidgets
  };
}
