"use client";

import { useEffect, useState } from "react";

export default function useWidgetData(id: string, initial?: any) {
  const [data, setData] = useState<number[] | null>(initial?.data ?? null);
  const [labels, setLabels] = useState<string[] | null>(initial?.labels ?? null);
  const [config, setConfig] = useState<any>(initial ?? null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      try {
        const res = await fetch(`/api/widget?id=${encodeURIComponent(id)}`);
        if (!res.ok) throw new Error(`status ${res.status}`);
        const json = await res.json();
        if (!mounted) return;
        const w = json?.widget;
        if (w) {
          setConfig(w);
          setData(w.data ?? null);
          setLabels(w.labels ?? null);
        }
      } catch (e) {
        // fallback to initial config if available
        if (initial) {
          setConfig(initial);
          setData(initial.data ?? null);
          setLabels(initial.labels ?? null);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, [id]);

  return { data, labels, config, loading };
}
