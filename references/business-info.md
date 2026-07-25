# Business Info — Asigns & Printing

```
Business Name: Asigns & Printing
Tagline: Custom Designs for Any Industry
What it does: Full-service sign shop, print shop, and apparel decorator — signs, vehicle wraps, banners, DTF transfers, custom apparel, and websites, designed and produced locally.

Address: 420 E 3rd St, Siler City, NC 27344
Main Phone: 336-215-0518
Text/Alternate Phone: 336-215-0518
Email: asigns025@gmail.com (contact form + order notifications sent here via Resend)
Website: asignsinc.com

Hours:
  Mon: 7:00 AM – 3:00 PM
  Tue: 7:00 AM – 3:00 PM
  Wed: 7:00 AM – 3:00 PM
  Thu: 7:00 AM – 3:00 PM
  Fri: 7:00 AM – 3:00 PM
  Sat: 9:00 AM – 3:00 PM
  Sun: By appointment

Languages spoken: English and Spanish — site has a full EN/ES toggle (i18n.js), bot responds in Spanish when addressed in Spanish

Brand colors (hex):
  Primary: #ffa728 (gold)
  Secondary/Accent: #2ba4ff (blue), #ff7a00 (deep gold/orange)
  Dark background: #000000 / #0f1115

Fonts:
  Heading: Russo One
  Body: Poppins

Pages needed:
  [x] Homepage
  [x] Shop
  [ ] Member/Student Portal
  [ ] Kiosk
  [ ] Booking/Scheduling
  [x] Blog/News — resources.html (DTF prep + heat press guides)
  [x] Other: Gang Sheet Builder (gang-builder.html), Tee Designer (tee-designer.html) — existing interactive tools, kept as-is

Services / Programs offered:
  1. Custom signage (design, print, install)
  2. Vehicle wraps & magnets
  3. Banners, flags, yard signs, window graphics, vinyl lettering
  4. Window tint (vehicle)
  5. Digital printing & graphic design
  6. DTF (direct-to-film) transfers & gang sheets
  7. Custom apparel / T-shirt printing (24-hour rush available)
  8. Website design & creation

Products to sell (Shop page — real starting prices as of the owner's current price sheet):
  Category 1 — DTF Gang Sheets: 22"x24" $20, 22"x36" $30 (most popular), 22"x48" $40, 22"x60" $50 — links to gang-builder.html
  Category 2 — Signs & Banners: Yard Signs $15 ea, Corrugated from $15, PVC from $45, Aluminum from $65,
    ACM/Dibond from $85, Storefront (quote), Monument (quote), Real Estate from $20, Construction from $65,
    Magnetic Vehicle Signs from $75/pair, Vinyl Banners $6.50/sq ft, Mesh Banners $8/sq ft, Retractable from $165
  Category 3 — Vinyl Lettering: Door from $45, Window from $55, Store Hours from $35, Wall from $85, Reflective (quote)
  Category 4 — Vehicle Graphics: Door Logos $95, Lettering from $175, Partial Wrap from $850, Half Wrap from $1,500,
    Full Car from $2,500, Full Pickup from $2,900, Cargo Van from $3,000, Box Truck from $3,800, Trailer from $2,500
  Category 5 — Window Tint: 2 Front Windows $99, Sedan from $250, SUV from $300, Pickup from $250, Commercial (quote)
  Category 6 — Printing Services: Business Cards (500) $59, Flyers (100) $69, Postcards from $79, Brochures from $199,
    Rack Cards from $89, Stickers from $45, Labels from $55, Posters from $20, Blueprints from $5
  Category 7 — Custom Apparel: T-Shirts from $15.99, Richardson Hats from $16.99, Embroidered Hats from $19.95,
    Polo Shirts from $29.95, Hoodies from $35, Safety Shirts from $18, Team Uniforms (quote, 25+ tiered) — links to tee-designer.html
  Category 8 — Graphic Design: Logo from $150, Business Card $40, Flyer $65, Banner $65, Social Media Ad $45, Menu from $95
  Category 9 — Website Creation: One-Page from $399, 5-Page Business from $799, E-Commerce from $1,499,
    Redesign from $499, Domain Setup from $50, Hosting Setup from $100, Google Business Profile Setup from $150,
    Maintenance from $75/month
  Category 10 — Business Branding: Brand Identity Package from $450, Letterheads from $75, Envelopes from $85,
    Social Media Branding Kit from $199, Facebook & Instagram Business Setup from $150
    (Business Cards/Brochures/Flyers/Rack Cards/Menu Design/Logo Design overlap with Printing/Design categories above — not duplicated)
  Category 11 — Packages: Complete Business Starter Package from $1,499 (logo, 5-page website, business cards,
    social media setup, Google Business Profile, yard sign or banner, basic brand guidelines)

Contact form sends email to: asigns025@gmail.com via Resend (Worker /api/contact + /api/orders, reply-to set to the customer)
Order form sends email to: same as above

Payment methods: Zelle, sent to 336-215-0518 (shown in the shop's order form; customer sends after final price is confirmed, with an "I've already paid" checkbox that flags the order notes)

Sales tax: 7% applied to all shop cart totals (subtotal/tax/total breakdown shown in cart, order sheet, and included in the order notification email)

Google Sheet calendar? N

Bot name: Asigns Bot (Asigns & Printing AI assistant)
Bot capabilities: can complete orders/quotes and general contact messages directly in chat via
  tool-calling (submit_order, submit_contact_message) — writes to the same D1 tables and triggers
  the same email notification as the website forms. Hard-validates that name/email are real values
  typed by the customer (rejects placeholder-looking values) before ever saving to the database.
Bot personality: Friendly, sharp, helpful
```
