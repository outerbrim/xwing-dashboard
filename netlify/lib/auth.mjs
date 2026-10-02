import { createHmac, timingSafeEqual } from "node:crypto";
const mac = (p) => createHmac("sha256", Netlify.env.get("SESSION_SECRET")).update(p).digest("base64url");
export const sign = (o) => { const p = Buffer.from(JSON.stringify(o)).toString("base64url"); return p + "." + mac(p); };
export const verify = (t) => {
  try {
    const [p, s] = String(t).split(".");
    const e = mac(p);
    if (!s || s.length !== e.length || !timingSafeEqual(Buffer.from(s), Buffer.from(e))) return null;
    const o = JSON.parse(Buffer.from(p, "base64url").toString());
    return o.exp > Date.now() ? o : null;
  } catch { return null; }
};
