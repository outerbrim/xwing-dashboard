import { getStore } from "@netlify/blobs";
import { verify } from "../lib/auth.mjs";
export const config = { path: "/api/sync" };
export default async (req) => {
  const s = verify((req.headers.get("authorization") || "").replace("Bearer ", ""));
  if (!s) return new Response("unauthorized", { status: 401 });
  const store = getStore("history");
  if (req.method === "PUT") {
    const j = await req.json();
    const body = JSON.stringify({ matches: Array.isArray(j.matches) ? j.matches : [], lists: Array.isArray(j.lists) ? j.lists : [] });
    if (body.length > 4e6) return new Response("too big", { status: 413 });
    await store.set(s.uid, body);
    return new Response("ok");
  }
  return Response.json((await store.get(s.uid, { type: "json" })) || { matches: [], lists: [] });
};
