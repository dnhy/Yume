import { NextResponse } from "next/server";

import { apiGetFresh } from "@/lib/api";
import type { ContentVersion } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await apiGetFresh<ContentVersion>(
      "/api/deadlines/public/version",
    );

    return NextResponse.json(data, {
      headers: { "Cache-Control": "no-store, max-age=0" },
    });
  } catch {
    // 后端不可用时保持静默，前端下一轮继续尝试。
    return NextResponse.json(
      { version: null },
      { headers: { "Cache-Control": "no-store, max-age=0" } },
    );
  }
}
