import { sign, verify } from "../lib/auth.mjs";
export const config = { path: "/api/discord-callback" };
const UA = { "User-Agent": "xwing-dashboard (netlify, 1.0)" };
export default async (req) => {
  const u = new URL(req.url), origin = u.origin;
  const fail = () => Response.redirect(origin + "/#autherr=1", 302);
  const code = u.searchParams.get("code");
  if (!code || !verify(u.searchParams.get("state"))) return fail();
  try {
    const tr = await fetch("https://discord.com/api/oauth2/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded", ...UA },
      body: new URLSearchParams({
        client_id: Netlify.env.get("DISCORD_CLIENT_ID"),
        client_secret: Netlify.env.get("DISCORD_CLIENT_SECRET"),
        grant_type: "authorization_code",
        code,
        redirect_uri: origin + "/api/discord-callback",
      }),
    });
    if (!tr.ok) return fail();
    const { access_token } = await tr.json();
    const ur = await fetch("https://discord.com/api/users/@me", { headers: { Authorization: "Bearer " + access_token, ...UA } });
    if (!ur.ok) return fail();
    const d = await ur.json();
    const token = sign({ uid: d.id, name: d.global_name || d.username, exp: Date.now() + 90 * 864e5 });
    return Response.redirect(origin + "/#auth=" + token, 302);
  } catch { return fail(); }
};
