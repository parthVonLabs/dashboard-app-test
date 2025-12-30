import { NextResponse } from "next/server";
import { getLayout, setLayout, getWidgets, setWidgets } from "../_store";

export async function GET() {
  return NextResponse.json({ layout: getLayout(), widgets: getWidgets() });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const okLayout = body?.layout && Array.isArray(body.layout);
    const okWidgets = body?.widgets && typeof body.widgets === "object";
    if (okLayout) setLayout(body.layout.map((it: any) => ({ ...it })));
    if (okWidgets) setWidgets({ ...body.widgets });
    if (okLayout || okWidgets) {
      return NextResponse.json({ layout: getLayout(), widgets: getWidgets() });
    }
    return NextResponse.json({ error: "invalid payload" }, { status: 400 });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
