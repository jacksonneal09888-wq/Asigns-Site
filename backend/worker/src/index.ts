import { Hono } from 'hono';
import { cors } from 'hono/cors';

type Bindings = {
  AI: Ai;
  DB: D1Database;
  ALLOWED_ORIGIN: string;
  ADMIN_KEY: string;
  RESEND_API_KEY: string;
  NOTIFY_EMAIL: string;
};

async function sendNotificationEmail(env: Bindings, subject: string, text: string, replyTo?: string) {
  if (!env.RESEND_API_KEY || !env.NOTIFY_EMAIL) return;

  try {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Asigns & Printing Website <onboarding@resend.dev>',
        to: [env.NOTIFY_EMAIL],
        ...(replyTo ? { reply_to: replyTo } : {}),
        subject,
        text,
      }),
    });
  } catch (err) {
    // Notification email is best-effort — never block the form submission on it.
  }
}

const SYSTEM_PROMPT = `You are Asigns Bot — the friendly, knowledgeable AI guide for Asigns & Printing,
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
- Payment: Zelle accepted, sent to 336-215-0518 (send only after the final price is confirmed)
- Sales tax: 7% applied to all shop orders (added on top of the listed price)

## Services / Products & Starting Prices
All prices below are real starting prices from the current price sheet. "From $X" means the
final price depends on size/specs — quote it as a starting point and offer to confirm the exact
price via the contact form or shop. Flat prices (no "From") are the actual price for that item.

### DTF Gang Sheets (fixed pricing, no minimums)
22"x24" $20 · 22"x36" $30 (most popular) · 22"x48" $40 · 22"x60" $50

### Signs & Banners
Yard Signs (18"x24") $15 each · Corrugated Plastic Signs from $15 · PVC Signs from $45 ·
Aluminum Signs from $65 · ACM (Dibond) Signs from $85 · Storefront Signs (free quote) ·
Monument Signs (free quote) · Real Estate Signs from $20 · Construction Signs from $65 ·
Magnetic Vehicle Signs from $75/pair · Vinyl Banners $6.50/sq ft · Mesh Banners $8/sq ft ·
Retractable Banners from $165

### Vinyl Lettering
Door Lettering from $45 · Window Lettering from $55 · Store Hours decal from $35 ·
Wall Lettering from $85 · Reflective Vinyl (free quote)

### Vehicle Graphics
Door Logos $95 · Vehicle Lettering from $175 · Partial Wrap from $850 · Half Wrap from $1,500 ·
Full Car Wrap from $2,500 · Full Pickup Wrap from $2,900 · Cargo Van Wrap from $3,000 ·
Box Truck Wrap from $3,800 · Trailer Wrap from $2,500

### Window Tint
2 Front Windows $99 · Sedan (full) from $250 · SUV (full) from $300 · Pickup (full) from $250 ·
Commercial Vehicles (free quote)

### Printing Services
Business Cards (500) $59 · Flyers (100) $69 · Postcards from $79 · Brochures from $199 ·
Rack Cards from $89 · Stickers from $45 · Labels from $55 · Posters from $20 ·
Blueprints from $5

### Custom Apparel
Custom T-Shirts from $15.99 · Richardson Hats from $16.99 · Embroidered Hats from $19.95 ·
Polo Shirts from $29.95 · Hoodies from $35 · Safety Shirts from $18 · Team Uniforms (free quote,
25+ pieces with tiered pricing) — 24-hour rush turnaround available on apparel

### Graphic Design
Logo Design from $150 · Business Card Design $40 · Flyer Design $65 · Banner Design $65 ·
Social Media Ad $45 · Menu Design from $95

### Website Creation
One-Page Website from $399 · 5-Page Business Website from $799 · E-Commerce Website from $1,499 ·
Website Redesign from $499 · Domain Name Setup from $50 · Web Hosting Setup from $100 ·
Google Business Profile Setup from $150 · Website Maintenance from $75/month

### Business Branding
Brand Identity Package (logo, colors, fonts, guidelines) from $450 · Letterheads from $75 ·
Envelopes from $85 · Social Media Branding Kit from $199 · Facebook & Instagram Business Setup
from $150 (Business Cards, Brochures, Flyers, Rack Cards, Menu Design, and Logo Design are also
available — see Printing Services and Graphic Design above for those prices)

### Packages
Complete Business Starter Package — from $1,499. Includes: custom logo, professional website (up
to 5 pages), business cards, social media setup, Google Business Profile, a yard sign or banner,
and basic brand guidelines.

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
  shop would know and that isn't listed above — e.g. exact final pricing beyond the "from"
  starting price, current job status, real-time availability, or anything about a specific
  past order.
- If you don't know something even at a general-knowledge level, say so plainly instead of
  guessing, and offer the contact/call action.

## Personality & Rules
- Warm, confident, and thorough — like a great shop employee who genuinely knows the trade
- Default to 3–6 sentences; give more detail when the question calls for it (e.g. a how-to or
  comparison), don't pad simple questions
- Always end with a clear next step or an offer to help further
- If asked in Spanish, respond fully in Spanish
- Quote the real starting prices listed above confidently — they are current and accurate.
  For "From $X" items, be clear it's a starting price and the final quote depends on size/specs.
  Never invent a price that isn't listed above; if asked about something not on the price sheet,
  say pricing isn't listed and offer to get a quote via the shop or contact form.
- Never invent other Asigns & Printing-specific facts (dates, stock, order status) — general
  trade knowledge is fine to state confidently`;

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

  c.executionCtx.waitUntil(
    sendNotificationEmail(
      c.env,
      `New ${body.category ?? 'order'} request from ${body.name}`,
      [
        `New order/quote request from the website (${body.category ?? 'unspecified category'})`,
        '',
        `Name: ${body.name}`,
        `Email: ${body.email}`,
        `Phone: ${body.phone ?? 'Not provided'}`,
        '',
        'Items:',
        JSON.stringify(body.items, null, 2),
        '',
        `Notes: ${body.notes ?? 'None'}`,
      ].join('\n'),
      body.email
    )
  );

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

  c.executionCtx.waitUntil(
    sendNotificationEmail(
      c.env,
      `New website message from ${body.name}`,
      [
        'New contact form message from the website',
        '',
        `Name: ${body.name}`,
        `Email: ${body.email}`,
        '',
        'Message:',
        body.message,
      ].join('\n'),
      body.email
    )
  );

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
