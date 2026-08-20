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

type EmailAttachment = { filename: string; content: string };

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  return btoa(binary);
}

const MAX_ATTACHMENT_MB = 15;
const ALLOWED_ATTACHMENT_EXTENSIONS = /\.(pdf|docx?|jpe?g|png|ai|psd|eps|svg)$/i;

async function fileToAttachment(file: File): Promise<{ attachment?: EmailAttachment; error?: string }> {
  if (file.size > MAX_ATTACHMENT_MB * 1024 * 1024) {
    return { error: `File is larger than ${MAX_ATTACHMENT_MB}MB. Please send a smaller file or call/text us instead.` };
  }
  if (!ALLOWED_ATTACHMENT_EXTENSIONS.test(file.name)) {
    return { error: 'Unsupported file type. Please upload a PDF, Word doc, image, AI, PSD, EPS, or SVG file.' };
  }
  const buffer = await file.arrayBuffer();
  return { attachment: { filename: file.name, content: arrayBufferToBase64(buffer) } };
}

async function sendNotificationEmail(
  env: Bindings,
  subject: string,
  text: string,
  replyTo?: string,
  attachments?: EmailAttachment[]
) {
  if (!env.RESEND_API_KEY || !env.NOTIFY_EMAIL) {
    console.log('EMAIL SKIPPED: missing RESEND_API_KEY or NOTIFY_EMAIL', {
      hasKey: !!env.RESEND_API_KEY,
      notifyEmail: env.NOTIFY_EMAIL,
    });
    return;
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
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
        ...(attachments && attachments.length ? { attachments } : {}),
      }),
    });
    const bodyText = await res.text();
    if (!res.ok) {
      console.log('EMAIL FAILED', res.status, bodyText);
    } else {
      console.log('EMAIL SENT OK', res.status, bodyText);
    }
  } catch (err) {
    console.log('EMAIL THREW', err instanceof Error ? err.message : String(err));
  }
}

function getClientIp(c: { req: { header: (name: string) => string | undefined } }): string {
  return c.req.header('CF-Connecting-IP') ?? 'unknown';
}

/** Simple D1-backed sliding-window rate limit. Returns true if the request is allowed. */
async function checkRateLimit(
  env: Bindings,
  ip: string,
  endpoint: string,
  maxRequests: number,
  windowMinutes: number
): Promise<boolean> {
  if (ip === 'unknown') return true; // fail open if we can't identify the caller

  const windowStart = new Date(Date.now() - windowMinutes * 60_000).toISOString().slice(0, 19).replace('T', ' ');

  const { results } = await env.DB.prepare(
    `SELECT COUNT(*) as cnt FROM rate_limits WHERE ip = ? AND endpoint = ? AND created_at > ?`
  )
    .bind(ip, endpoint, windowStart)
    .all();

  const count = (results[0] as { cnt: number } | undefined)?.cnt ?? 0;
  if (count >= maxRequests) return false;

  await env.DB.prepare(`INSERT INTO rate_limits (ip, endpoint) VALUES (?, ?)`).bind(ip, endpoint).run();

  // Cheap opportunistic cleanup so the table doesn't grow forever — no cron needed.
  if (Math.random() < 0.05) {
    const dayAgo = new Date(Date.now() - 24 * 60 * 60_000).toISOString().slice(0, 19).replace('T', ' ');
    await env.DB.prepare(`DELETE FROM rate_limits WHERE created_at < ?`).bind(dayAgo).run();
  }

  return true;
}

type OrderArgs = {
  name: string;
  email: string;
  phone?: string;
  category?: string;
  items: unknown;
  notes?: string;
};

async function saveOrder(env: Bindings, args: OrderArgs) {
  await env.DB.prepare(
    `INSERT INTO orders (name, email, phone, category, items_json, notes) VALUES (?, ?, ?, ?, ?, ?)`
  )
    .bind(args.name, args.email, args.phone ?? null, args.category ?? null, JSON.stringify(args.items), args.notes ?? null)
    .run();
}

function formatItemsForEmail(items: unknown): string {
  if (typeof items === 'string') return items;
  if (Array.isArray(items)) {
    return items
      .map((item, i) => {
        if (item && typeof item === 'object') {
          const lines = Object.entries(item as Record<string, unknown>).map(
            ([key, value]) => `    ${key}: ${value}`
          );
          return `  Item ${i + 1}:\n${lines.join('\n')}`;
        }
        return `  Item ${i + 1}: ${item}`;
      })
      .join('\n');
  }
  if (items && typeof items === 'object') {
    return Object.entries(items as Record<string, unknown>)
      .map(([key, value]) => `  ${key}: ${value}`)
      .join('\n');
  }
  return String(items);
}

function nowStamp(): string {
  return new Date().toLocaleString('en-US', { timeZone: 'America/New_York', dateStyle: 'medium', timeStyle: 'short' }) + ' ET';
}

function notifyOrder(env: Bindings, ctx: Pick<ExecutionContext, 'waitUntil'>, args: OrderArgs, source: string) {
  ctx.waitUntil(
    sendNotificationEmail(
      env,
      `New ${args.category ?? 'order'} request from ${args.name} (${source})`,
      [
        `NEW ORDER / QUOTE REQUEST`,
        `Received: ${nowStamp()}`,
        `Source: ${source}`,
        `Category: ${args.category ?? 'Not specified'}`,
        '',
        '--- Customer Contact Info ---',
        `Name: ${args.name}`,
        `Email: ${args.email}`,
        `Phone: ${args.phone ?? 'Not provided'}`,
        '',
        '--- What They Want ---',
        formatItemsForEmail(args.items),
        '',
        '--- Notes ---',
        args.notes ?? 'None',
        '',
        `Reply directly to this email to respond to ${args.name} at ${args.email}.`,
      ].join('\n'),
      args.email
    )
  );
}

type ContactArgs = { name: string; email: string; message: string };

async function saveContact(env: Bindings, args: ContactArgs) {
  await env.DB.prepare(`INSERT INTO contact_messages (name, email, message) VALUES (?, ?, ?)`)
    .bind(args.name, args.email, args.message)
    .run();
}

function notifyContact(
  env: Bindings,
  ctx: Pick<ExecutionContext, 'waitUntil'>,
  args: ContactArgs,
  source: string,
  attachment?: EmailAttachment
) {
  ctx.waitUntil(
    sendNotificationEmail(
      env,
      `New website message from ${args.name} (${source})`,
      [
        `NEW CONTACT MESSAGE`,
        `Received: ${nowStamp()}`,
        `Source: ${source}`,
        '',
        '--- Customer Contact Info ---',
        `Name: ${args.name}`,
        `Email: ${args.email}`,
        '',
        '--- Message ---',
        args.message,
        ...(attachment ? ['', `Attached file: ${attachment.filename} (see attachment on this email)`] : []),
        '',
        `Reply directly to this email to respond to ${args.name} at ${args.email}.`,
      ].join('\n'),
      args.email,
      attachment ? [attachment] : undefined
    )
  );
}

// Returns a Date whose UTC getters reflect America/New_York wall-clock time right now,
// so callers can pull out date/weekday/time without manual DST offset math.
function nowInBusinessTZ(): Date {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York',
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
  }).formatToParts(new Date());
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? '00';
  return new Date(Date.UTC(
    Number(get('year')), Number(get('month')) - 1, Number(get('day')),
    Number(get('hour')) % 24, Number(get('minute')), Number(get('second'))
  ));
}

function dateStr(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function hhmm(d: Date): string {
  return d.toISOString().slice(11, 16);
}

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const TIME_PATTERN = /^\d{2}:\d{2}$/;
const SLOT_MINUTES = 30;
const MAX_BOOKING_DAYS_AHEAD = 60;

// Sunday(0) is "by appointment" (phone/text only) -- not offered as self-serve slots.
const BUSINESS_HOURS: Record<number, { open: string; close: string } | null> = {
  0: null,
  1: { open: '07:00', close: '15:00' },
  2: { open: '07:00', close: '15:00' },
  3: { open: '07:00', close: '15:00' },
  4: { open: '07:00', close: '15:00' },
  5: { open: '07:00', close: '15:00' },
  6: { open: '09:00', close: '15:00' },
};

function weekdayOf(dateOnly: string): number {
  return new Date(`${dateOnly}T00:00:00Z`).getUTCDay();
}

function generateSlotsForWeekday(dayOfWeek: number): string[] {
  const hours = BUSINESS_HOURS[dayOfWeek];
  if (!hours) return [];
  const slots: string[] = [];
  let [h, m] = hours.open.split(':').map(Number);
  const [closeH, closeM] = hours.close.split(':').map(Number);
  while (h < closeH || (h === closeH && m < closeM)) {
    slots.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
    m += SLOT_MINUTES;
    if (m >= 60) {
      m -= 60;
      h += 1;
    }
  }
  return slots;
}

type AppointmentArgs = { name: string; email: string; phone?: string; date: string; time: string; notes?: string };

async function saveAppointment(env: Bindings, args: AppointmentArgs) {
  await env.DB.prepare(
    `INSERT INTO appointments (name, email, phone, appt_date, appt_time, notes) VALUES (?, ?, ?, ?, ?, ?)`
  )
    .bind(args.name, args.email, args.phone ?? null, args.date, args.time, args.notes ?? null)
    .run();
}

function notifyAppointment(env: Bindings, ctx: Pick<ExecutionContext, 'waitUntil'>, args: AppointmentArgs, source: string) {
  ctx.waitUntil(
    sendNotificationEmail(
      env,
      `New appointment booked: ${args.name} — ${args.date} ${args.time} (${source})`,
      [
        `NEW APPOINTMENT BOOKED`,
        `Received: ${nowStamp()}`,
        `Source: ${source}`,
        '',
        '--- Customer Contact Info ---',
        `Name: ${args.name}`,
        `Email: ${args.email}`,
        `Phone: ${args.phone ?? 'Not provided'}`,
        '',
        '--- Appointment ---',
        `Date: ${args.date}`,
        `Time: ${args.time}`,
        '',
        '--- Notes ---',
        args.notes ?? 'None',
        '',
        `Reply directly to this email to respond to ${args.name} at ${args.email}.`,
      ].join('\n'),
      args.email
    )
  );
}

// The Workers AI backend for this model validates `tools` strictly against the
// OpenAI function-calling schema (tools[].type === 'function' with a nested
// `function` object) -- the older flat {name, description, parameters} shape
// that used to be accepted now gets rejected with a 400 from the model backend.
type ChatTool = {
  type: 'function';
  function: {
    name: string;
    description: string;
    parameters: {
      type: string;
      properties: Record<string, { type: string; description: string }>;
      required: string[];
    };
  };
};

const CHAT_TOOLS: ChatTool[] = [
  {
    type: 'function',
    function: {
      name: 'submit_order',
      description:
        "Submit a product or service order/quote request. Only call this after the customer has typed their own real name and a real email address earlier in this conversation, plus a clear description of what they want. Never invent or guess these values. Covers signs, banners, vinyl, vehicle graphics, window tint, printing, apparel, graphic design, websites, branding, and packages.",
      parameters: {
        type: 'object',
        properties: {
          name: { type: 'string', description: "The exact name the customer typed in the chat. Never a placeholder." },
          email: { type: 'string', description: "The exact email address the customer typed in the chat. Never a placeholder." },
          phone: { type: 'string', description: 'Phone number, only if the customer actually gave one' },
          category: {
            type: 'string',
            description: 'One of: dtf, signs, vinyl, vehicle, tint, printing, apparel, design, web, branding, packages',
          },
          items: {
            type: 'string',
            description: 'Plain description of what they want — product/service name(s), quantity, size, color, etc.',
          },
          notes: { type: 'string', description: 'Any extra details: deadline, artwork status, install needs, etc.' },
        },
        required: ['name', 'email', 'items'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'submit_contact_message',
      description:
        "Send a general message to the shop when the customer's request isn't a specific product order. Only call this after the customer has typed their own real name and a real email address earlier in this conversation. Never invent or guess these values.",
      parameters: {
        type: 'object',
        properties: {
          name: { type: 'string', description: "The exact name the customer typed in the chat. Never a placeholder." },
          email: { type: 'string', description: "The exact email address the customer typed in the chat. Never a placeholder." },
          message: { type: 'string', description: 'The message to send to the shop' },
        },
        required: ['name', 'email', 'message'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'check_availability',
      description:
        "Check real open appointment slots for a specific date. Always call this before telling a customer a time is available, and before calling book_appointment — never guess or assume a time is open.",
      parameters: {
        type: 'object',
        properties: {
          date: {
            type: 'string',
            description:
              'The date to check, in YYYY-MM-DD format. Compute this from what the customer said (e.g. "tomorrow", "next Monday") using the current date given above in this prompt.',
          },
        },
        required: ['date'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'book_appointment',
      description:
        "Book a confirmed appointment slot. Only call this after check_availability has shown the exact date+time is open, AND the customer has typed their own real name and real email earlier in this conversation. Never invent or guess these values.",
      parameters: {
        type: 'object',
        properties: {
          name: { type: 'string', description: "The exact name the customer typed in the chat. Never a placeholder." },
          email: { type: 'string', description: "The exact email address the customer typed in the chat. Never a placeholder." },
          phone: { type: 'string', description: 'Phone number, only if the customer actually gave one' },
          date: { type: 'string', description: 'YYYY-MM-DD — must be a date/time check_availability just confirmed is open' },
          time: { type: 'string', description: 'HH:MM in 24-hour time — must be a time check_availability just confirmed is open' },
          notes: { type: 'string', description: 'What the appointment is for, if the customer mentioned it' },
        },
        required: ['name', 'email', 'date', 'time'],
      },
    },
  },
];

const PLACEHOLDER_PATTERNS = /customer|example\.com|placeholder|your name|your email|full name|n\/a|unknown/i;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function looksLikeRealContact(name: unknown, email: unknown): string | null {
  if (typeof name !== 'string' || typeof email !== 'string') return 'name and email must be text';
  if (name.trim().length < 2) return 'name is missing or too short';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return 'email does not look like a valid email address';
  if (PLACEHOLDER_PATTERNS.test(name) || PLACEHOLDER_PATTERNS.test(email)) {
    return 'name or email looks like a placeholder/example value, not something the customer actually typed';
  }
  return null;
}

function buildSystemPrompt(): string {
  const today = nowInBusinessTZ();
  const todayLabel = today.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });
  const todayStr = dateStr(today);

  return `You are Asigns Bot — the friendly, knowledgeable AI guide for Asigns & Printing,
a sign, print, and apparel shop in Siler City, NC. You help customers get quick answers about
signs, vehicle wraps, banners, DTF transfers, custom apparel, and websites, and guide them to
take the next step (call, text, visit the shop page, or use the online design tools).

Today is ${todayLabel} (${todayStr}), Eastern time. Use this to resolve any relative date the
customer mentions ("tomorrow", "next Monday", "this Saturday") into an exact YYYY-MM-DD before
calling check_availability or book_appointment.

Never narrate your own decision process out loud (no "I don't need to call a function", "I will
respond with plain text," etc.) — just answer directly, as if the customer can't see your reasoning.

## Business Info
- Name:    Asigns & Printing
- Address: 420 E 3rd St, Siler City, NC 27344
- Phone:   336-215-0518
- Text:    336-215-0518
- Website: asignsinc.com
- Hours:   Mon–Fri 7:00 AM–3:00 PM, Sat 9:00 AM–3:00 PM, Sun by appointment
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

## Placing Orders and Quotes Yourself
You can complete an order or quote request directly in the conversation using the submit_order
and submit_contact_message tools — you don't have to just point people at a form.
- A plain question with no order intent (pricing, "what do you offer," how-to, etc.) gets a direct
  plain-text answer from the price sheet above and no tool call. Only move toward gathering order
  details once the customer has actually said they want to order or get a quote submitted.
- Once you have all three required pieces — name, email, and what they want — anywhere in the
  conversation (this message or an earlier one), call submit_order in that same reply immediately.
  Don't recap and ask "should I go ahead?" first — confirmation happens after the tool call
  succeeds, not before. Phone and notes are optional; never stall waiting on them.
- name and email must be the customer's own real values actually typed in this conversation —
  never a placeholder like "Customer" or "customer@example.com". If you don't have their real name
  and email yet, ask for them in plain text; don't call the tool until you do.
- Never claim something was submitted unless the tool call actually happened and succeeded.

## Booking Appointments
Customers can book a real 30-minute slot directly in the chat using check_availability and
book_appointment — this checks and reserves the same calendar as the site's booking page.
- Booking hours: Mon–Fri 7:00 AM–3:00 PM, Sat 9:00 AM–3:00 PM, all Eastern time, in 30-minute
  slots. Sunday has no self-serve slots — it's by appointment via phone/text only.
- When a customer wants to schedule/book/come by, figure out the exact date they mean (using
  today's date above), then call check_availability for that date before saying anything is open.
- Only offer the real times check_availability returned — never invent or assume a time is free.
- Once the customer picks one of the real open times AND you have their real name and email, call
  book_appointment immediately with that exact date/time — don't recap and ask permission first.
- If a date turns out to be a Sunday or fully booked, say so and offer to check another day, or
  point them to [ACTION:open:book.html] to browse the calendar themselves.

## Website Navigation
Guide users using these action tags (the front-end converts them into clickable buttons):
- Shop:                [ACTION:open:shop.html]
- Book an appointment:  [ACTION:open:book.html]
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
- Never narrate your own reasoning or tool-use decisions (e.g. never say things like "I don't
  need to call a function for this" or "I will respond with plain text") — the customer can't see
  your internal process, so jump straight into the actual answer with no meta-commentary about it.
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
}

const CHAT_MODEL = '@cf/meta/llama-3.3-70b-instruct-fp8-fast';

const app = new Hono<{ Bindings: Bindings }>();

app.use('*', async (c, next) => {
  const corsMiddleware = cors({ origin: c.env.ALLOWED_ORIGIN ?? '*' });
  return corsMiddleware(c, next);
});

app.post('/api/chat', async (c) => {
  const ip = getClientIp(c);
  if (!(await checkRateLimit(c.env, ip, 'chat', 30, 5))) {
    return c.json({ error: 'Too many requests — please slow down and try again shortly.' }, 429);
  }

  const body = await c.req.json<{ messages?: { role: string; content: string }[] }>();
  const incoming = Array.isArray(body.messages) ? body.messages : [];

  if (!incoming.length) {
    return c.json({ error: 'messages array is required' }, 400);
  }

  if (incoming.some((m) => typeof m.content !== 'string' || m.content.length > 4000)) {
    return c.json({ error: 'A message is too long or invalid (max 4000 characters).' }, 400);
  }

  const messages: any[] = [{ role: 'system', content: buildSystemPrompt() }, ...incoming.slice(-20)];

  try {
    const actionsTaken: string[] = [];
    // Guards against the model re-issuing the same submission across rounds — once a
    // given tool has successfully completed once in this request, it can't run again.
    const completedTools = new Set<string>();
    let stopOfferingTools = false;

    for (let round = 0; round < 3; round++) {
      const result = (await c.env.AI.run(CHAT_MODEL, {
        messages,
        max_tokens: 800,
        ...(stopOfferingTools ? {} : { tools: CHAT_TOOLS }),
      })) as {
        response?: string;
        tool_calls?: { name?: string; arguments?: unknown; function?: { name: string; arguments: unknown } }[];
      };

      // The response shape for tool_calls has been observed both flat ({name, arguments})
      // and nested OpenAI-style ({function: {name, arguments}}) depending on backend
      // version -- normalize defensively rather than assume one or the other.
      const rawToolCalls = result.tool_calls ?? [];
      const toolCalls = rawToolCalls.map((call) => ({
        name: call.function?.name ?? call.name ?? '',
        arguments: call.function?.arguments ?? call.arguments,
      }));

      if (!toolCalls.length) {
        return c.json({ content: result.response ?? '', actionsTaken });
      }

      // Reconstruct in the OpenAI-compatible shape the backend expects when replaying
      // tool_calls back into the conversation (id/type/function.arguments-as-string) —
      // this differs from the shape the response itself may use.
      const idedCalls = toolCalls.map((call, i) => ({
        id: `call_${round}_${i}`,
        type: 'function' as const,
        function: {
          name: call.name,
          arguments: typeof call.arguments === 'string' ? call.arguments : JSON.stringify(call.arguments),
        },
      }));

      messages.push({ role: 'assistant', content: result.response ?? '', tool_calls: idedCalls });

      for (let i = 0; i < toolCalls.length; i++) {
        const call = toolCalls[i];
        const args = typeof call.arguments === 'string' ? JSON.parse(call.arguments) : (call.arguments as Record<string, unknown>);
        let toolResult = 'OK';

        if (completedTools.has(call.name)) {
          toolResult = 'This was already submitted successfully earlier in this conversation — do not submit it again. Just confirm with the customer in your reply.';
        } else {
          try {
            if (call.name === 'submit_order') {
              const orderArgs = args as unknown as OrderArgs;
              const contactIssue = looksLikeRealContact(orderArgs.name, orderArgs.email);
              if (contactIssue) {
                toolResult = `ERROR: ${contactIssue}. You should not have called this tool yet. Do not call it again in this reply — instead, respond in plain text: if the customer asked an informational/pricing question, just answer it directly from the info you already have, and only ask for their real name and email if they've actually asked to place an order or send a message.`;
                stopOfferingTools = true;
              } else if (!orderArgs.items) {
                toolResult = 'ERROR: missing required field (items) — ask the customer what they want to order.';
              } else {
                await saveOrder(c.env, orderArgs);
                notifyOrder(c.env, c.executionCtx, orderArgs, 'AI chat');
                toolResult = 'Order submitted successfully.';
                actionsTaken.push('order');
                completedTools.add(call.name);
                stopOfferingTools = true;
              }
            } else if (call.name === 'submit_contact_message') {
              const contactArgs = args as unknown as ContactArgs;
              const contactIssue = looksLikeRealContact(contactArgs.name, contactArgs.email);
              if (contactIssue) {
                toolResult = `ERROR: ${contactIssue}. You should not have called this tool yet. Do not call it again in this reply — instead, respond in plain text: if the customer asked an informational/pricing question, just answer it directly from the info you already have, and only ask for their real name and email if they've actually asked to place an order or send a message.`;
                stopOfferingTools = true;
              } else if (!contactArgs.message) {
                toolResult = 'ERROR: missing required field (message) — ask the customer what they want to say.';
              } else {
                await saveContact(c.env, contactArgs);
                notifyContact(c.env, c.executionCtx, contactArgs, 'AI chat');
                toolResult = 'Message submitted successfully.';
                actionsTaken.push('contact');
                completedTools.add(call.name);
                stopOfferingTools = true;
              }
            } else if (call.name === 'check_availability') {
              const dateArg = String((args as { date?: unknown }).date ?? '');
              if (!DATE_PATTERN.test(dateArg)) {
                toolResult = 'ERROR: date must be in YYYY-MM-DD format. Ask the customer to confirm which day they mean, or compute the exact date yourself from today\'s date above.';
              } else {
                const todayStr = dateStr(nowInBusinessTZ());
                if (dateArg < todayStr) {
                  toolResult = `ERROR: ${dateArg} is in the past. Ask the customer for a future date.`;
                } else {
                  const dow = weekdayOf(dateArg);
                  const allSlots = generateSlotsForWeekday(dow);
                  if (!allSlots.length) {
                    toolResult = `${dateArg} is a Sunday — the shop doesn't take online bookings that day, it's by appointment only. Tell the customer to call/text 336-215-0518 to arrange a Sunday visit, or offer to check a different day.`;
                  } else {
                    const { results } = await c.env.DB.prepare(
                      `SELECT appt_time FROM appointments WHERE appt_date = ? AND status = 'confirmed'`
                    ).bind(dateArg).all();
                    const booked = new Set(results.map((r) => (r as { appt_time: string }).appt_time));
                    const nowHHMM = dateArg === todayStr ? hhmm(nowInBusinessTZ()) : null;
                    const open = allSlots.filter((t) => !booked.has(t) && (!nowHHMM || t > nowHHMM));
                    toolResult = open.length
                      ? `Open slots on ${dateArg}: ${open.join(', ')} (30-minute slots, Eastern time).`
                      : `No open slots left on ${dateArg}. Offer to check a nearby date instead.`;
                  }
                }
              }
            } else if (call.name === 'book_appointment') {
              const apptArgs = args as unknown as AppointmentArgs;
              const contactIssue = looksLikeRealContact(apptArgs.name, apptArgs.email);
              if (contactIssue) {
                toolResult = `ERROR: ${contactIssue}. You should not have called this tool yet — ask the customer directly for their real name and email first.`;
                stopOfferingTools = true;
              } else if (!DATE_PATTERN.test(apptArgs.date ?? '') || !TIME_PATTERN.test(apptArgs.time ?? '')) {
                toolResult = 'ERROR: date must be YYYY-MM-DD and time must be HH:MM. Call check_availability first to get a valid date/time.';
              } else {
                const dow = weekdayOf(apptArgs.date);
                const validSlots = generateSlotsForWeekday(dow);
                if (!validSlots.includes(apptArgs.time)) {
                  toolResult = `ERROR: ${apptArgs.time} on ${apptArgs.date} is not a bookable slot. Call check_availability for that date and offer the customer one of the real open times.`;
                } else {
                  const { results } = await c.env.DB.prepare(
                    `SELECT id FROM appointments WHERE appt_date = ? AND appt_time = ? AND status = 'confirmed'`
                  ).bind(apptArgs.date, apptArgs.time).all();
                  if (results.length) {
                    toolResult = `ERROR: ${apptArgs.time} on ${apptArgs.date} was just booked by someone else. Call check_availability again and offer the customer another open time.`;
                  } else {
                    await saveAppointment(c.env, apptArgs);
                    notifyAppointment(c.env, c.executionCtx, apptArgs, 'AI chat');
                    toolResult = `Appointment booked for ${apptArgs.date} at ${apptArgs.time}.`;
                    actionsTaken.push('appointment');
                    completedTools.add(call.name);
                    stopOfferingTools = true;
                  }
                }
              }
            } else {
              toolResult = `ERROR: unknown tool ${call.name}`;
            }
          } catch (toolErr) {
            toolResult = 'ERROR: something went wrong submitting this — apologize and suggest the customer call/text 336-215-0518 instead.';
          }
        }

        messages.push({ role: 'tool', tool_call_id: idedCalls[i].id, content: toolResult });
      }
    }

    // Ran out of rounds — ask the model for a final plain-text reply without tools.
    const fallback = (await c.env.AI.run(CHAT_MODEL, { messages, max_tokens: 400 })) as { response?: string };
    return c.json({ content: fallback.response ?? '', actionsTaken });
  } catch (err) {
    console.error('CHAT ERROR', err instanceof Error ? err.message : String(err), err instanceof Error ? err.stack : '');
    return c.json({ error: 'AI request failed' }, 502);
  }
});

app.post('/api/orders', async (c) => {
  const ip = getClientIp(c);
  if (!(await checkRateLimit(c.env, ip, 'orders', 8, 10))) {
    return c.json({ error: 'Too many requests — please slow down and try again shortly.' }, 429);
  }

  const body = await c.req.json<OrderArgs & { honeypot?: string }>();

  if (body.honeypot) {
    // Bot filled in a field real users never see — pretend success, do nothing.
    return c.json({ ok: true });
  }

  if (!body.name || !body.email || !body.items) {
    return c.json({ error: 'name, email, and items are required' }, 400);
  }

  const itemsStr = typeof body.items === 'string' ? body.items : JSON.stringify(body.items);
  if (body.name.length > 200 || body.email.length > 200 || (body.phone ?? '').length > 50 || itemsStr.length > 5000 || (body.notes ?? '').length > 5000) {
    return c.json({ error: 'One or more fields is too long.' }, 400);
  }
  if (!EMAIL_PATTERN.test(body.email)) {
    return c.json({ error: 'Please provide a valid email address.' }, 400);
  }

  await saveOrder(c.env, body);
  notifyOrder(c.env, c.executionCtx, body, 'website form');

  return c.json({ ok: true });
});

app.get('/api/availability', async (c) => {
  const ip = getClientIp(c);
  if (!(await checkRateLimit(c.env, ip, 'availability', 60, 5))) {
    return c.json({ error: 'Too many requests — please slow down and try again shortly.' }, 429);
  }

  const date = c.req.query('date') ?? '';
  if (!DATE_PATTERN.test(date)) {
    return c.json({ error: 'A valid date (YYYY-MM-DD) is required.' }, 400);
  }

  const todayStr = dateStr(nowInBusinessTZ());
  if (date < todayStr) {
    return c.json({ error: 'That date is in the past.' }, 400);
  }
  const maxDate = dateStr(new Date(nowInBusinessTZ().getTime() + MAX_BOOKING_DAYS_AHEAD * 86400000));
  if (date > maxDate) {
    return c.json({ error: `Please pick a date within the next ${MAX_BOOKING_DAYS_AHEAD} days.` }, 400);
  }

  const dow = weekdayOf(date);
  const allSlots = generateSlotsForWeekday(dow);
  if (!allSlots.length) {
    return c.json({ date, closed: true, slots: [] });
  }

  const { results } = await c.env.DB.prepare(
    `SELECT appt_time FROM appointments WHERE appt_date = ? AND status = 'confirmed'`
  ).bind(date).all();
  const booked = new Set(results.map((r) => (r as { appt_time: string }).appt_time));
  const nowHHMM = date === todayStr ? hhmm(nowInBusinessTZ()) : null;

  const slots = allSlots
    .filter((t) => !nowHHMM || t > nowHHMM)
    .map((t) => ({ time: t, available: !booked.has(t) }));

  return c.json({ date, closed: false, slots });
});

app.post('/api/book', async (c) => {
  const ip = getClientIp(c);
  if (!(await checkRateLimit(c.env, ip, 'book', 8, 10))) {
    return c.json({ error: 'Too many requests — please slow down and try again shortly.' }, 429);
  }

  const body = await c.req.json<AppointmentArgs & { honeypot?: string }>();

  if (body.honeypot) {
    return c.json({ ok: true });
  }

  if (!body.name || !body.email || !body.date || !body.time) {
    return c.json({ error: 'name, email, date, and time are required' }, 400);
  }
  if (body.name.length > 200 || body.email.length > 200 || (body.phone ?? '').length > 50 || (body.notes ?? '').length > 2000) {
    return c.json({ error: 'One or more fields is too long.' }, 400);
  }
  if (!EMAIL_PATTERN.test(body.email)) {
    return c.json({ error: 'Please provide a valid email address.' }, 400);
  }
  if (!DATE_PATTERN.test(body.date) || !TIME_PATTERN.test(body.time)) {
    return c.json({ error: 'Invalid date or time format.' }, 400);
  }

  const todayStr = dateStr(nowInBusinessTZ());
  if (body.date < todayStr) {
    return c.json({ error: 'That date is in the past.' }, 400);
  }

  const dow = weekdayOf(body.date);
  const validSlots = generateSlotsForWeekday(dow);
  if (!validSlots.includes(body.time)) {
    return c.json({ error: 'That time is not available for booking.' }, 400);
  }

  const { results } = await c.env.DB.prepare(
    `SELECT id FROM appointments WHERE appt_date = ? AND appt_time = ? AND status = 'confirmed'`
  ).bind(body.date, body.time).all();
  if (results.length) {
    return c.json({ error: 'That slot was just booked by someone else — please pick another time.' }, 409);
  }

  await saveAppointment(c.env, body);
  notifyAppointment(c.env, c.executionCtx, body, 'website form');

  return c.json({ ok: true });
});

app.post('/api/contact', async (c) => {
  const ip = getClientIp(c);
  if (!(await checkRateLimit(c.env, ip, 'contact', 8, 10))) {
    return c.json({ error: 'Too many requests — please slow down and try again shortly.' }, 429);
  }

  const contentType = c.req.header('Content-Type') ?? '';
  let name = '';
  let email = '';
  let message = '';
  let honeypot = '';
  let file: File | undefined;

  if (contentType.includes('multipart/form-data')) {
    const form = await c.req.parseBody();
    name = typeof form.name === 'string' ? form.name : '';
    email = typeof form.email === 'string' ? form.email : '';
    message = typeof form.message === 'string' ? form.message : '';
    honeypot = typeof form.honeypot === 'string' ? form.honeypot : '';
    if (form.file instanceof File && form.file.size > 0) {
      file = form.file;
    }
  } else {
    const body = await c.req.json<ContactArgs & { honeypot?: string }>();
    name = body.name ?? '';
    email = body.email ?? '';
    message = body.message ?? '';
    honeypot = body.honeypot ?? '';
  }

  if (honeypot) {
    return c.json({ ok: true });
  }

  if (!name || !email || !message) {
    return c.json({ error: 'name, email, and message are required' }, 400);
  }

  if (name.length > 200 || email.length > 200 || message.length > 5000) {
    return c.json({ error: 'One or more fields is too long.' }, 400);
  }
  if (!EMAIL_PATTERN.test(email)) {
    return c.json({ error: 'Please provide a valid email address.' }, 400);
  }

  let attachment: EmailAttachment | undefined;
  if (file) {
    const result = await fileToAttachment(file);
    if (result.error) {
      return c.json({ error: result.error }, 400);
    }
    attachment = result.attachment;
  }

  const messageWithFileNote = attachment ? `${message}\n\n[Attached file: ${attachment.filename}]` : message;
  const contactArgs: ContactArgs = { name, email, message: messageWithFileNote };

  await saveContact(c.env, contactArgs);
  notifyContact(c.env, c.executionCtx, contactArgs, 'website form', attachment);

  return c.json({ ok: true });
});

function requireAdmin(c: { req: { header: (name: string) => string | undefined }; env: Bindings }) {
  return c.req.header('x-admin-key') === c.env.ADMIN_KEY && !!c.env.ADMIN_KEY;
}

app.get('/api/admin/orders', async (c) => {
  if (!(await checkRateLimit(c.env, getClientIp(c), 'admin', 30, 10))) {
    return c.json({ error: 'Too many requests.' }, 429);
  }
  if (!requireAdmin(c)) return c.json({ error: 'unauthorized' }, 401);
  const { results } = await c.env.DB.prepare(`SELECT * FROM orders ORDER BY created_at DESC LIMIT 200`).all();
  return c.json({ orders: results });
});

app.get('/api/admin/contact-messages', async (c) => {
  if (!(await checkRateLimit(c.env, getClientIp(c), 'admin', 30, 10))) {
    return c.json({ error: 'Too many requests.' }, 429);
  }
  if (!requireAdmin(c)) return c.json({ error: 'unauthorized' }, 401);
  const { results } = await c.env.DB.prepare(`SELECT * FROM contact_messages ORDER BY created_at DESC LIMIT 200`).all();
  return c.json({ messages: results });
});

app.get('/api/admin/appointments', async (c) => {
  if (!(await checkRateLimit(c.env, getClientIp(c), 'admin', 30, 10))) {
    return c.json({ error: 'Too many requests.' }, 429);
  }
  if (!requireAdmin(c)) return c.json({ error: 'unauthorized' }, 401);
  const { results } = await c.env.DB.prepare(
    `SELECT * FROM appointments WHERE status = 'confirmed' AND appt_date >= date('now') ORDER BY appt_date, appt_time LIMIT 200`
  ).all();
  return c.json({ appointments: results });
});

app.post('/api/admin/appointments/:id/cancel', async (c) => {
  if (!(await checkRateLimit(c.env, getClientIp(c), 'admin', 30, 10))) {
    return c.json({ error: 'Too many requests.' }, 429);
  }
  if (!requireAdmin(c)) return c.json({ error: 'unauthorized' }, 401);
  const id = c.req.param('id');
  await c.env.DB.prepare(`UPDATE appointments SET status = 'cancelled' WHERE id = ?`).bind(id).run();
  return c.json({ ok: true });
});

export default app;
