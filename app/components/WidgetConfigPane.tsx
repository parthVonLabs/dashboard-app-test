"use client";

import React from "react";

type Props = {
  visible: boolean;
  onClose: () => void;
  initialConfig: any;
  onSave: (cfg: any) => void;
  editingWidgetId: string | null;
};

export default function WidgetConfigPane({ visible, onClose, initialConfig, onSave, editingWidgetId }: Props) {
  const [local, setLocal] = React.useState<any>(initialConfig || { size: 'small', type: 'line', label: 'Series A' });

  React.useEffect(() => {
    if (visible) setLocal(initialConfig || { size: 'small', type: 'line', label: 'Series A' });
  }, [visible, initialConfig]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose}></div>
      <div className="relative bg-white rounded-lg p-6 w-[480px] shadow-lg">
        <h3 className="text-lg font-semibold mb-3">Configure Widget {editingWidgetId ?? ''}</h3>
        <div className="flex flex-col gap-3">
          <label className="text-sm">Type</label>
          <select value={local.type} onChange={(e) => setLocal({ ...local, type: e.target.value })} className="border px-2 py-1 rounded">
            <option value="line">Line</option>
            <option value="bar">Bar</option>
            <option value="area">Area</option>
          </select>

          <label className="text-sm">Dataset size</label>
          <div className="inline-flex rounded-md overflow-hidden border">
            <button onClick={() => setLocal({ ...local, size: 'tiny' })} className={`px-3 py-1 ${local.size === 'tiny' ? 'bg-black text-white' : 'bg-white text-black'}`}>Tiny (&lt;100)</button>
            <button onClick={() => setLocal({ ...local, size: 'small' })} className={`px-3 py-1 ${local.size === 'small' ? 'bg-black text-white' : 'bg-white text-black'}`}>Small (&lt;500)</button>
            <button onClick={() => setLocal({ ...local, size: 'medium' })} className={`px-3 py-1 ${local.size === 'medium' ? 'bg-black text-white' : 'bg-white text-black'}`}>Medium (1k)</button>
            <button onClick={() => setLocal({ ...local, size: 'large' })} className={`px-3 py-1 ${local.size === 'large' ? 'bg-black text-white' : 'bg-white text-black'}`}>Large (10k+)</button>
          </div>

          <label className="text-sm">Label</label>
          <input value={local.label} onChange={(e) => setLocal({ ...local, label: e.target.value })} className="border px-2 py-1 rounded" />

          <div className="flex justify-end gap-2 mt-4">
            <button onClick={onClose} className="px-3 py-1 rounded border">Cancel</button>
            <button onClick={() => onSave(local)} className="px-3 py-1 rounded bg-black text-white">{editingWidgetId ? 'Save' : 'Create'}</button>
          </div>
        </div>
      </div>
    </div>
  );
}
