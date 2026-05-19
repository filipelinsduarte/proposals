# Proposal Generation — Automated Process

This file is loaded automatically when working in this repo. Follow this process every time a proposal deck is requested.

---

## Trigger

Any request like "generate a proposal for [URL]", "build a presentation for [client]", or "create a deck" triggers this full automated process.

**Minimum input required:** a website URL.
**Optional context:** sales call notes, co-brand partner, specific problems the prospect mentioned, Reddit audit slug.

---

## The 9-Step Automated Process

### Step 1 — Website & Brand Analysis

Fetch the client URL. Extract:
- **Primary hex** — check in order: `meta[name="theme-color"]`, CSS vars (`--primary`, `--color-primary`, `--brand`, `--accent`), CTA/button background color, most-frequent non-white/black hex in inline styles
- **Font** — Google Fonts `<link>` tag in `<head>`; fall back to `DM Sans` if none found
- **Vertical** — read homepage `<h1>`, `<h2>`, and hero copy to infer product category in one phrase
- **Blog post counts** — crawl `/blog`, `/resources`, or `sitemap.xml`; count posts by year (2024, 2025, 2026 to date)

Derive the full accent family from the primary hex:
- `--accent-bg`: blend primary 10% on white
- `--accent-bd`: blend primary 28% on white
- `--accent-dark`: darken primary 18%

### Step 2 — Competitor Discovery

- Check the client site for any "vs", "compare", "alternatives" or "competitors" pages
- Web search: `"alternatives to [brand]"` and `"[brand] vs"` — extract 3–5 competitor domains
- Confirm each is in the same vertical with a live site

### Step 3 — Ahrefs Data (Ahrefs API — allowed for proposals)

> Note: for proposal generation specifically, use the Ahrefs API directly. The DataForSEO Sheets connector rule applies to one-off manual lookups, not automated builds.

Pull for client + each competitor:
- Domain Rating (DR)
- Organic Keywords
- Monthly Organic Traffic
- Pages Indexed
- Estimate blog post counts from indexed `/blog` pages

### Step 4 — AI Peekaboo Data (API)

Check `reference_api_keys.md` in memory for the API key.

- **If brand exists:** pull score (X/100), total chats analyzed, per-model citation counts (ChatGPT, Gemini, Perplexity, Google AI Mode, Google AIO), top cited domains + counts, prompts where client was cited + their scores
- **If brand does not exist:** create the brand via API, generate ~40 prompts suited to their vertical, populate Slide 07 with "Baseline pending — brand added to AI Peekaboo, data live within 48 hours" placeholder

### Step 5 — Reddit Data

Check for an existing audit first:
- Look in `~/Desktop/backlink-scanner/audits/{slug}/` for scored JSON output
- If found: extract subreddits + member counts, competitor mention counts + sentiment from the scored data

If no audit exists, use the Reddit JSON API:
- Search `reddit.com/search.json?q=[competitor]+[vertical]&sort=relevance&limit=100` for each competitor
- Identify top 3–4 subreddits by post volume in that vertical
- Fetch subreddit subscriber counts from `reddit.com/r/{sub}/about.json`
- Count competitor brand mentions across top posts, assign rough sentiment (positive/negative/neutral) from post score + title tone
- Client mention count will be 0 or near-zero for most cold prospects

Pull reddit.com's citation count from the AI Peekaboo domain data already retrieved in Step 4.

### Step 6 — Problem Synthesis

Derive the 3 root problems with real numbers from all data above:
1. **Content:** last publish date, post counts by year, indexed pages vs competitors, content gap topics (what AI is citing that the client doesn't cover)
2. **Authority:** client DR vs competitor DRs, gap size
3. **AI Visibility:** Peekaboo score + total citations + which models cite them

Write problem bullets using the actual data — no generic placeholder copy.

Identify 5–6 specific missing content topics for Slide 04 by cross-referencing:
- What the client's blog does NOT cover
- What the top cited domains in Peekaboo data are writing about

### Step 7 — Generate the Deck

Build all 15 slides using the vsystems-proposal.html as the structural reference (in this repo). Apply:
- Client branding: `--accent`, `--accent-bg`, `--accent-bd`, `--accent-dark`, client font
- Client favicon via Google S2: `https://www.google.com/s2/favicons?domain=[CLIENT_DOMAIN]&sz=128`
- All real data from Steps 1–6
- Standard boilerplate content for Slides 13, 14, and 15 right column (deliverables, measurement tools, engagement terms — these do not change)

File naming: `[client-slug]-proposal.html` where slug = primary domain without TLD (e.g. `vsystems`, `flexzo`, `spakinect`)

### Step 8 — Pre-deploy Check

Before committing, verify:
- [ ] GA4 tag `G-YV8FCLN403` is in `<head>`
- [ ] `var T=15,D='[domain]',P='SEO / AEO Proposal'` is set correctly in the `.shdr` script
- [ ] No em dashes anywhere in the file
- [ ] No `flex:1` on horizontal card rows (use `flex-shrink:0`)
- [ ] Client row in every table is last, in `accent-bg` highlight, with red numbers
- [ ] All 15 slides are present in the correct order

### Step 9 — Deploy

```bash
cd /tmp/proposals-repo
unset GITHUB_TOKEN
git pull origin main --rebase
git add [filename].html
git commit -m "Add [Client Name] SEO/AEO proposal"
git push origin main
```

Return the live URL: `https://filipelinsduarte.github.io/proposals/[filename].html`

---

## Fixed 16-Slide Order

This order never changes between clients:

| # | Slide | Data source |
|---|-------|-------------|
| 01 | Cover | Client name, domain, date |
| 02 | The Hook | 3 AI query examples (generated for vertical) |
| 03 | Three Root Problems overview | Ahrefs DR + Peekaboo score |
| 04 | Content Freshness deep dive (01/03) | Site crawl + Peekaboo citation data |
| 05 | Authority Gap deep dive (02/03) | Ahrefs DR for client + competitors |
| 06 | No Organic Content Presence (03/03) | Blog counts by year + competitor counts |
| 07 | AI Visibility — Peekaboo data | Full Peekaboo API pull |
| 08 | Competitive Gap — Ahrefs table | Ahrefs: DR + keywords + traffic + indexed + blog |
| 09 | Reddit Opportunity | Reddit audit or JSON API + Peekaboo reddit.com count |
| 10 | Transition | Boilerplate |
| 11 | Content Strategy (3-col) | Generated: comparison pages, buyer guides, topic clusters |
| 12 | Three-Part Fix | Generated targets from data (articles/mo, DR goal) |
| 13 | Deliverables | Boilerplate (7 standard deliverables) |
| 14 | How We Measure Progress | Boilerplate (GSC, GA4, AI Peekaboo) |
| 15 | Your Investment | Left: 4-phase client timeline. Right: pricing cards |
| 16 | CTA / Team | Headline, Calendly CTA, urgency line, 3 team cards |

---

## CSS & Design Hard Rules

- Font: use the font extracted from the client site; fall back to `DM Sans` — never Helvetica, never Arial as the primary
- `--ink`, `--ink2`, `--ink3`, `--ink4`, `--paper`, `--paper2`, `--paper3`, `--rule` — always use the standard values from vsystems (these do not change per client, only the accent family changes)
- `flex-shrink:0` on all card rows — never `flex:1`
- **`flex-shrink:0` on every table-wrapping div** — never `flex:1;min-height:0` on a table container. The table border must end at the last data row, not stretch to fill remaining space.
- `.shdr` JS injection for every slide header — never repeat header HTML inline
- Client row in every table: always last, always `background:var(--accent-bg)`, always red monospace numbers
- All `font-size` values use `clamp(min, preferred-vh, max)` — no fixed px sizes on text
- `h2` font-weight: `700` (not serif, not 400 — vsystems standard, not the proposal-template.html variant)
- No `align-items:stretch` on grid containers
- Slide 01 (cover): no `.shdr` — manual layout with client favicon, tag, headline, "Powered by" row
- Every other slide: starts with `<div class="shdr" data-n="XX"></div>`
- **"Book a 30-Minute Strategy Call" CTA button in slide 16:** always `flex-shrink:0` — never `flex:1`
- **Calendly "Book a 30-min call" link text:** always `color:#2563eb;text-decoration:underline` — visually blue and underlined so it reads as a hyperlink

### Data Source Badges (slides 06, 07, 08, 09)

Slides that pull from a specific data source show a labeled badge **below the divider line**, right-aligned. Add `data-source` to the `.shdr` div:

```html
<div class="shdr" data-n="06" data-source="ahrefs"></div>   <!-- Content / Competitive Gap -->
<div class="shdr" data-n="07" data-source="peekaboo"></div>  <!-- AI Visibility -->
<div class="shdr" data-n="08" data-source="ahrefs"></div>    <!-- Ahrefs Table -->
<div class="shdr" data-n="09" data-source="reddit"></div>    <!-- Reddit Opportunity -->
```

The JS injection reads `data-source` and appends a badge after the divider. Required CSS:

```css
.data-src{display:inline-flex;align-items:center;gap:6px;border:1px solid var(--rule);border-radius:5px;padding:3px 9px;background:var(--paper2);flex-shrink:0}
.data-src span{font-size:clamp(10px,1.25vh,12px);color:var(--ink3);font-weight:500}
.data-src img{height:clamp(13px,1.6vh,16px);width:auto;border-radius:2px;opacity:.85}
```

JS snippet (add `data-source` handling to the `.shdr` forEach):

```js
var src=el.getAttribute('data-source');
var srcHtml='';
if(src){
  var srcMap={
    'ahrefs':['https://www.google.com/s2/favicons?domain=ahrefs.com&sz=32','data from Ahrefs'],
    'peekaboo':['https://www.aipeekaboo.com/icon.jpg','data from Peekaboo'],
    'reddit':['https://www.google.com/s2/favicons?domain=reddit.com&sz=32','data from Reddit']
  };
  if(srcMap[src]) srcHtml='<div class="data-src"><img src="'+srcMap[src][0]+'"><span>'+srcMap[src][1]+'</span></div>';
}
// append srcHtml after the divider:
// el.innerHTML = '...<div class="divider"></div>'+(srcHtml?'<div style="display:flex;justify-content:flex-end;margin-bottom:clamp(5px,0.7vh,9px)">'+srcHtml+'</div>':'');
```

---

## Standard Boilerplate Content

### Slide 12 — Three-Part Fix (hard rules)
- **No specific AI visibility score targets** — never write "score will go from X to Y". Use directional language: "AI visibility score improvement month-over-month, tracked via AI Peekaboo"
- Article and Reddit numbers must match what is promised in slides 13 and 15 (12 articles/month, 20 Reddit comments/month)

### Slide 13 — Deliverables (always these 7, in this order)
1. 12 High-Quality Content Pieces — Per month
2. Content Refresh Programme — Ongoing
3. Schema Markup Implementation — Site-wide
4. On-Page SEO Optimisation — Ongoing
5. Link Building — Ongoing
6. Reddit Presence — 20 comments/month
7. Monthly Reporting — Monthly

### Slide 14 — Measurement Tools (always these 3 cards)
GSC | GA4 | AI Peekaboo

### Slide 15 — Your Investment (structure)

Two-column grid (`grid-template-columns:1.1fr 0.9fr`):

**Left column — 4-phase timeline** (client-specific bullet points per phase):
- Month 1 · Foundation: audit + competitive benchmark + 12 articles + schema + Reddit strategy
- Month 2 · Build: 12 articles + 20 Reddit comments/month + first link outreach
- Month 3 · Compound: 12 articles + 20 Reddit comments/month + comparison pages + link building
- Month 4+ · Ongoing: content compounds, citations grow, DR climbs

Each monthly phase label must explicitly state the article count (12) and Reddit comment count (20) so deliverables are consistent with slide 13.

**Right column — 2 pricing cards:**

Card 1 — Full AI Search Optimization (accent-bg background, "Complete Solution" pill):
- Price: $3,000/month
- Bullets: 12 AI-optimised content pieces/month, 20 Reddit comments/month, backlink outreach
- Footer: "Includes AI Peekaboo subscription for visibility tracking"

Card 2 — Reddit Only (paper2 background, "Entry Point" pill):
- Price: $1,500/month
- Bullets: 20 targeted Reddit comments/month, community focus, monthly report
- Footer: "Scale up to Full AI Search Optimization anytime."

**Below both cards — commitment note (black body text, outside cards):**
"3-month minimum commitment. After month 3, renews month-to-month with 30 days cancellation notice."

### Slide 16 — CTA / Team (structure)

- `h2`: "Ready to Own [Vertical] AI Search Before Competitors Do?" — adapt headline to client vertical
- Calendly CTA button (full-width, accent-bg): "Book a 30-Minute Strategy Call" linking to `https://calendly.com/filipe-aipeekaboo/30min`
- Urgency paragraph (centred, ink3): name 1–2 specific competitors the client risks losing to
- "The Team" label (uppercase, ink3)
- 3-column grid of team cards: Filipe Lins Duarte, John Rice, Danny Kirk — always all three, same bios and LinkedIn links as ICEBABE slide 16

---

## Co-brand Header

If Filipe mentions a co-brand partner (e.g. "Tact Marketing"), add their favicon + linked name to the `.shdr` JS injection alongside the AI Peekaboo logo. Default (no co-brand): only AI Peekaboo appears.

---

## Agency Contact Details

Always use in CTAs:
- Email: `filipe@aipeekaboo.com`
- Calendly: `https://calendly.com/filipe-aipeekaboo/30min`
