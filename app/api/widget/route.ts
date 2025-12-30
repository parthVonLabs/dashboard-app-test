import { NextResponse } from "next/server";
import { getWidget, deleteWidget, getWidgets, setWidgets, getLayout, setLayout } from "../_store";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    if (!id) return NextResponse.json({ error: "missing id" }, { status: 400 });
    const widget = getWidget(id);
    if (!widget) return NextResponse.json({ error: "not found" }, { status: 404 });
    // Return widget config including data/labels if present
    return NextResponse.json({ widget });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const url = new URL(req.url);
    const id = decodeURIComponent(url.searchParams.get("id") as string);
    console.log("DELETE widget id:", id);

    if (!id) return NextResponse.json({ error: "missing id" }, { status: 400 });

    // remove widget from store
    deleteWidget(id);

    // also remove from widgets map and layout
    const widgets = getWidgets();
    if (widgets && widgets[id]) {
      const copy = { ...widgets };
      delete copy[id];
      setWidgets(copy);
    }

    const layout = getLayout();
    const newLayout = Array.isArray(layout) ? layout.filter((it: any) => String(it.i) !== String(id)) : layout;
    setLayout(newLayout as any);

    return NextResponse.json({ ok: true, layout: getLayout(), widgets: getWidgets() });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
