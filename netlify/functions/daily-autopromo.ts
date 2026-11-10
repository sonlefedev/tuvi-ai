// netlify/functions/daily-autopromo.ts
export default async function handler() {
    const site = process.env.URL || "https://sonlexinchao-tuvi.netlify.app";
    await fetch(`${site}/api/auto-broadcast`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cronSource: "netlify-schedule", action: "broadcast_now" }),
    }).catch(() => { });
    return new Response("OK");
}
