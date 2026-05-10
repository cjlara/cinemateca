// Netlify serverless function — TMDB proxy
// Keeps TMDB_API_KEY on the server; never exposed to the browser.

export default async (req) => {
  const url     = new URL(req.url);
  const path    = url.searchParams.get("path");

  if (!path) {
    return new Response(JSON.stringify({ error: "Missing path param" }), { status: 400 });
  }

  // Build TMDB URL, forwarding all query params except "path"
  const tmdbURL = new URL(`https://api.themoviedb.org/3${path}`);
  for (const [k, v] of url.searchParams.entries()) {
    if (k !== "path") tmdbURL.searchParams.set(k, v);
  }
  tmdbURL.searchParams.set("api_key", process.env.TMDB_API_KEY);

  try {
    const res  = await fetch(tmdbURL.toString());
    const data = await res.json();

    return new Response(JSON.stringify(data), {
      status: res.status,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "s-maxage=300", // cache 5 min en Netlify Edge
      },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
};

export const config = { path: "/.netlify/functions/tmdb" };
