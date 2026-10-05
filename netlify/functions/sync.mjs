import { getStore } from "@netlify/blobs";
import { verify } from "../lib/auth.mjs";
export const config = { path: "/api/sync" };
const arr = (a, n) => (Array.isArray(a) ? a.slice(0, n) : []);
export default async (req) => {
  const s = verify((req.headers.get("authorization") || "").replace("Bearer ", ""));
  if (!s) return new Response("unauthorized", { status: 401 });
  const store = getStore("history");
  if (req.method === "PUT") {
    const j = await req.json();
    const body = JSON.stringify({ matches: arr(j.matches, 5000), lists: arr(j.lists, 2000), del: arr(j.del, 1000), tourn: arr(j.tourn, 300) });
    if (body.length > 4e6) return new Response("too big", { status: 413 });
    await store.set(s.uid, body);
    return new Response("ok");
  }
  return Response.json((await store.get(s.uid, { type: "json" })) || { matches: [], lists: [], del: [], tourn: [] });
};
