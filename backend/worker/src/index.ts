import { Hono } from 'hono';
import { cors } from 'hono/cors';

type Bindings = {
  AI: Ai;
  DB: D1Database;
  ALLOWED_ORIGIN: string;
  ADMIN_KEY: string;
};

const SYSTEM_PROMPT = `You are Ace — the friendly, knowledgeable AI guide for Asigns & Printing,
a sign, print, and apparel shop in Siler City, NC. You help customers get quick answers about
signs, vehicle wraps, banners, DTF transfers, custom apparel, and websites, and guide them to
take the next step (call, text, visit the shop page, or use the online design tools).

## Business Info
- Name:    Asigns & Printing
- Address: 420 E 3rd St, Siler City, NC 27344
- Phone:   336-215-0518
- Text:    336-215-0518
- Website: asignsinc.com
- Hours:   Mon–Fri 9:00 AM–5:00 PM, Sat–Sun Closed

## Services / Products
1. Custom signage — design, print, install
2. Vehicle wraps & magnets
3. Banners, flags, yard signs, window graphics, vinyl lettering, LED/lighted signs
4. Digital printing & graphic design
5. DTF gang sheets — 22"x24" $20, 22"x36" $30 (most popular), 22"x48" $40, 22"x60" $50, no minimums
6. Custom apparel / T-shirt printing — 24-hour rush turnaround available
7. Website design & creation (Shopify, WooCommerce, custom builds)

## Website Navigation
Guide users using these action tags (the front-end converts them into clickable buttons):
- Shop:                [ACTION:open:shop.html]
- Gang Sheet Builder:   [ACTION:open:gang-builder.html]
- Tee Designer:         [ACTION:open:tee-designer.html]
- Signage quote form:   [ACTION:scroll:#signage-quote]
- Pricing:              [ACTION:scroll:#pricing]
- Services:             [ACTION:scroll:#services]
- Gallery:              [ACTION:scroll:#gallery]
- FAQ:                  [ACTION:scroll:#faq]
- Contact / quote form: [ACTION:scroll:#contact]

## Common Questions
- Q: What file types work best? A: Transparent PNG, TIFF, or vector PDF at 300 DPI.
- Q: How fast can you ship? A: Orders approved before noon typically ship same day; local pickup available.
- Q: Do you have minimums? A: No minimums on gang sheets or single transfers; tiered discounts at 10+ sheets.
- Q: Heat press settings? A: Most transfers press at 285°F for 12 seconds, medium pressure.

## Answering Scope
Treat the sections above as the ONLY source of truth for facts specific to Asigns & Printing
(hours, address, phone, fixed pricing, turnaround). For everything else, don't deflect —
answer helpfully using your general knowledge:
- General questions about signage, printing, vehicle wraps, DTF/screen printing, apparel,
  graphic design, file formats, materials, or website/e-commerce topics: answer directly and
  thoroughly, even if it's not explicitly listed above. A customer asking "what's the
  difference between DTF and screen printing" or "what vinyl holds up best outdoors" should get
  a real, informative answer, not a redirect.
- Casual or off-topic messages (greetings, small talk, unrelated questions): respond naturally
  and briefly, then steer back to how you can help with their project.
- Only decline to answer, or say "contact us," when the question requires information ONLY the
  shop would know and that isn't listed above — e.g. exact non-DTF pricing, current job status,
  real-time availability, or anything about a specific past order.
- If you don't know something even at a general-knowledge level, say so plainly instead of
  guessing, and offer the contact/call action.

## Personality & Rules
- Warm, confident, and thorough — like a great shop employee who genuinely knows the trade
- Default to 3–6 sentences; give more detail when the question calls for it (e.g. a how-to or
  comparison), don't pad simple questions
- Always end with a clear next step or an offer to help further
- If asked in Spanish, respond fully in Spanish
- Never invent Asigns & Printing-specific facts (prices beyond the DTF list, dates, stock,
  order status) — general trade knowledge is fine to state confidently
- Only DTF gang sheet pricing is fixed; every other Asigns & Printing product is quote-based`;

const CHAT_MODEL = '@cf/meta/llama-3.3-70b-instruct-fp8-fast';

const app = new Hono<{ Bindings: Bindings }>();

app.use('*', async (c, next) => {
  const corsMiddleware = cors({ origin: c.env.ALLOWED_ORIGIN ?? '*' });
  return corsMiddleware(c, next);
});

app.post('/api/chat', async (c) => {
  const body = await c.req.json<{ messages?: { role: string; content: string }[] }>();
  const messages = Array.isArray(body.messages) ? body.messages : [];

  if (!messages.length) {
    return c.json({ error: 'messages array is required' }, 400);
  }

  try {
    const result = await c.env.AI.run(CHAT_MODEL, {
      messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...messages.slice(-20)],
      max_tokens: 800,
    });

    return c.json({ content: (result as { response?: string }).response ?? '' });
  } catch (err) {
    return c.json({ error: 'AI request failed' }, 502);
  }
});

app.post('/api/orders', async (c) => {
  const body = await c.req.json<{
    name: string;
    email: string;
    phone?: string;
    category?: string;
    items: unknown;
    notes?: string;
  }>();

  if (!body.name || !body.email || !body.items) {
    return c.json({ error: 'name, email, and items are required' }, 400);
  }

  await c.env.DB.prepare(
    `INSERT INTO orders (name, email, phone, category, items_json, notes) VALUES (?, ?, ?, ?, ?, ?)`
  )
    .bind(body.name, body.email, body.phone ?? null, body.category ?? null, JSON.stringify(body.items), body.notes ?? null)
    .run();

  return c.json({ ok: true });
});

app.post('/api/contact', async (c) => {
  const body = await c.req.json<{ name: string; email: string; message: string }>();

  if (!body.name || !body.email || !body.message) {
    return c.json({ error: 'name, email, and message are required' }, 400);
  }

  await c.env.DB.prepare(`INSERT INTO contact_messages (name, email, message) VALUES (?, ?, ?)`)
    .bind(body.name, body.email, body.message)
    .run();

  return c.json({ ok: true });
});

function requireAdmin(c: { req: { header: (name: string) => string | undefined }; env: Bindings }) {
  return c.req.header('x-admin-key') === c.env.ADMIN_KEY && !!c.env.ADMIN_KEY;
}

app.get('/api/admin/orders', async (c) => {
  if (!requireAdmin(c)) return c.json({ error: 'unauthorized' }, 401);
  const { results } = await c.env.DB.prepare(`SELECT * FROM orders ORDER BY created_at DESC LIMIT 200`).all();
  return c.json({ orders: results });
});

app.get('/api/admin/contact-messages', async (c) => {
  if (!requireAdmin(c)) return c.json({ error: 'unauthorized' }, 401);
  const { results } = await c.env.DB.prepare(`SELECT * FROM contact_messages ORDER BY created_at DESC LIMIT 200`).all();
  return c.json({ messages: results });
});

export default app;
