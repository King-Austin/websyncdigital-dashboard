# Websync — Live Metrics Integration Plan

How to replace the placeholder SEO / analytics / uptime numbers on the client
**Metrics** page with real data fetched per website. Build these one at a time;
each is independent. All run **server-side** (keys never touch the browser).

The metrics page already reads each site's stored values from `ws_websites`
(`seo_score`, `monthly_visits`, `form_submissions`, `status`, `domain_expiry`).
Each integration below is a background job / API route that **writes fresh values
into those same columns**, so the UI needs no further changes once data flows in.

---

## 1. SEO score — Google PageSpeed Insights API  ⭐ easiest first

- **What it gives:** live Lighthouse SEO, performance, accessibility, best-practices scores for any URL.
- **Setup:** none per-site. One API key from Google Cloud (PageSpeed Insights API enabled).
- **Env:** `PAGESPEED_API_KEY=`
- **Call:** `GET https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=<site>&category=seo&category=performance&key=<KEY>`
- **Write back:** `ws_websites.seo_score = Math.round(lighthouseResult.categories.seo.score * 100)`
- **Cadence:** on-demand ("Refresh score" button) or a daily cron.
- **Cost:** free (25k calls/day).
- **Effort:** ~1 route + a button. Recommended starting point.

## 2. Traffic / visits — Google Analytics 4 Data API

- **What it gives:** real sessions, users, pageviews per site.
- **Setup (per site):** add the GA4 tag to each client website; create a GA4 property; store its `property_id` on the `ws_websites` row (new column `ga4_property_id`).
- **Auth:** a Google **service account** with read access added to each GA4 property. JSON key in env.
- **Env:** `GA4_SA_CLIENT_EMAIL=`, `GA4_SA_PRIVATE_KEY=`
- **Call:** `runReport` on the GA4 Data API for `sessions` / `activeUsers` over last 30 days.
- **Write back:** `ws_websites.monthly_visits`.
- **Cadence:** daily cron.
- **Cost:** free.
- **Effort:** medium — needs the per-site GA property + service-account access. Standard agency practice.

## 3. Search rankings / clicks — Google Search Console API

- **What it gives:** real search impressions, clicks, average position, top queries per domain.
- **Setup (per site):** verify each domain in Search Console; grant the same service account access.
- **Env:** reuse the GA4 service account.
- **Call:** `searchanalytics.query` for the domain over last 28 days.
- **Write back:** optional new columns (`search_clicks`, `search_impressions`, `avg_position`) or a JSON blob.
- **Cadence:** weekly cron.
- **Cost:** free.
- **Effort:** medium. Pairs naturally with GA4 (same auth).

## 4. Uptime / status — UptimeRobot API

- **What it gives:** real up/down state + response time, making the Live/Down badge truthful.
- **Setup (per site):** create a monitor per URL in UptimeRobot (can be automated via their API).
- **Env:** `UPTIMEROBOT_API_KEY=`
- **Call:** `POST https://api.uptimerobot.com/v2/getMonitors` with the monitor ids.
- **Write back:** `ws_websites.status` = `live` (up) / `down` / `maintenance`.
- **Cadence:** every 5–15 min cron, or read live on page load.
- **Cost:** free tier (50 monitors).
- **Effort:** low–medium.

## 5. Form submissions — self-hosted (you build the sites)

- **What it gives:** real contact-form counts, since Websync builds every client site.
- **Setup:** point each site's form to a Websync endpoint (`/api/form-intake?site=<id>`), or insert into a new `ws_form_submissions` table.
- **Write back:** count rows per site → `ws_websites.form_submissions`.
- **Cost:** free.
- **Effort:** low. No third party needed — most accurate of all.

---

## Suggested build order

1. **PageSpeed SEO score** — instant real data, zero per-site setup.
2. **UptimeRobot status** — makes the status badge real.
3. **Form submissions** — your own data, fully accurate.
4. **GA4 visits** — the big one; needs per-site tags + service account.
5. **Search Console** — layer on once GA4 auth exists.

## Columns to add later (when wiring GA4 / Search Console)

```sql
ALTER TABLE ws_websites ADD COLUMN IF NOT EXISTS ga4_property_id   TEXT;
ALTER TABLE ws_websites ADD COLUMN IF NOT EXISTS uptimerobot_id    TEXT;
ALTER TABLE ws_websites ADD COLUMN IF NOT EXISTS search_clicks     INTEGER;
ALTER TABLE ws_websites ADD COLUMN IF NOT EXISTS search_impressions INTEGER;
ALTER TABLE ws_websites ADD COLUMN IF NOT EXISTS metrics_updated_at TIMESTAMPTZ;
```

## Keys to obtain

| Integration | Where | Env var |
|---|---|---|
| PageSpeed | Google Cloud → enable PageSpeed Insights API → API key | `PAGESPEED_API_KEY` |
| GA4 + Search Console | Google Cloud → service account + JSON key; add to each property | `GA4_SA_CLIENT_EMAIL`, `GA4_SA_PRIVATE_KEY` |
| UptimeRobot | uptimerobot.com → My Settings → API key | `UPTIMEROBOT_API_KEY` |
