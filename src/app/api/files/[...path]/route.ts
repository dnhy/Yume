import { NextResponse } from "next/server";

import { getApiBaseUrl } from "@/lib/api";

export async function GET(
  _request: Request,
  context: { params: Promise<{ path: string[] }> },
) {
  const { path } = await context.params;
  const target = `${getApiBaseUrl()}/api/app/file/${path.join("/")}`;

  const response = await fetch(target, { cache: "no-store" });

  if (!response.ok) {
    return new NextResponse("Not Found", { status: response.status });
  }

  const headers = new Headers();
  const contentType = response.headers.get("content-type");
  const cacheControl = response.headers.get("cache-control");

  if (contentType) headers.set("content-type", contentType);
  if (cacheControl) headers.set("cache-control", cacheControl);

  return new NextResponse(response.body, { status: 200, headers });
}
