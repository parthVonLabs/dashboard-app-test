// Simple in-memory store shared between API route handlers for POC
type LayoutItem = { i: string; x: number; y: number; w: number; h: number };

let savedLayout: LayoutItem[] = [];

let savedWidgets: Record<string, any> = {};

export function getLayout() {
  return savedLayout;
}

export function setLayout(layout: LayoutItem[]) {
  savedLayout = layout.map((l) => ({ ...l }));
}

export function getWidgets() {
  return { ...savedWidgets };
}

export function setWidgets(widgets: Record<string, any>) {
  savedWidgets = { ...widgets };
}

export function getWidget(id: string) {
  return savedWidgets[id];
}

export function setWidget(id: string, cfg: any) {
  savedWidgets[id] = cfg;
}

export function deleteWidget(id: string) {
  delete savedWidgets[id];
}
