import type { Config } from "@netlify/functions";
import { env } from "./_shared/env";
import { passwordMatches } from "./_shared/password";
import { readJson, writeJson } from "./_shared/store";

type PreachingRecord = {
  text: string;
  updatedAt: string | null;
};

const EMPTY: PreachingRecord = {
  text: "Check back soon for this week’s location.",
  updatedAt: null,
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
    },
  });
}

export default async (req: Request) => {
  if (req.method === "GET") {
    const record = (await readJson<PreachingRecord>("site-content", "preaching")) ?? EMPTY;
    return json(record);
  }

  if (req.method === "POST" || req.method === "PUT") {
    const expected = env("ADMIN_PASSWORD");
    if (!expected) return json({ error: "Admin password is not configured." }, 500);

    let body: { password?: string; text?: string } = {};
    try {
      body = (await req.json()) as { password?: string; text?: string };
    } catch {
      return json({ error: "Invalid request." }, 400);
    }

    if (!passwordMatches(body.password ?? "", expected)) {
      return json({ error: "Incorrect password." }, 401);
    }

    if (req.method === "POST") {
      return json({ ok: true });
    }

    const text = (body.text ?? "").trim();
    if (!text) return json({ error: "Please enter this week’s location." }, 400);
    if (text.length > 2000) return json({ error: "That message is too long." }, 400);

    const record: PreachingRecord = {
      text,
      updatedAt: new Date().toISOString(),
    };
    await writeJson("site-content", "preaching", record);
    return json(record);
  }

  return json({ error: "Method not allowed." }, 405);
};

export const config: Config = {
  path: "/api/preaching",
  method: ["GET", "POST", "PUT"],
};
