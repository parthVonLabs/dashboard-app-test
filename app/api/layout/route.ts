import { NextResponse } from "next/server";

// In-memory saved layout for POC. This will reset when server restarts.
let savedLayout = [];

// widgetConfigs keyed by widget id. Example: { '1': { type: 'line', options: {...} } }
let savedWidgets: Record<string, any> = {};

export async function GET() {
  return NextResponse.json({ layout: savedLayout, widgets: savedWidgets });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const okLayout = body?.layout && Array.isArray(body.layout);
    const okWidgets = body?.widgets && typeof body.widgets === "object";
    if (okLayout) savedLayout = body.layout.map((it: any) => ({ ...it }));
    if (okWidgets) savedWidgets = { ...body.widgets };
    if (okLayout || okWidgets) {
      return NextResponse.json({ layout: savedLayout, widgets: savedWidgets });
    }
    return NextResponse.json({ error: "invalid payload" }, { status: 400 });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
