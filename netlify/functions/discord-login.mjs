import { sign } from "../lib/auth.mjs";
export const config = { path: "/api/discord-login" };
export default async (req) => {
  const origin = new URL(req.url).origin;
  const q = new URLSearchParams({
    client_id: Netlify.env.get("DISCORD_CLIENT_ID"),
    response_type: "code",
    redirect_uri: origin + "/api/discord-callback",
    scope: "identify",
    state: sign({ exp: Date.now() + 600000 }),
  });
  return Response.redirect("https://discord.com/oauth2/authorize?" + q, 302);
};
