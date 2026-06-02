// Test for the Market Opportunity formula used in the Reddit audit dashboards.
// Run with:  cd /tmp/proposals-repo && npx vitest run tests/opportunity.test.mjs
//
// This mirrors computeOpportunity() inside reddit-audit-skylead.html exactly:
//   capture rate = min(CAP, PER_LISTING_CTR x (reddit results across 3 runs / 3))
//   reddit-bound searches = monthly volume x capture rate
//   ad-equivalent value   = reddit-bound searches x cost-per-click
import { describe, it, expect } from 'vitest';

const PER_LISTING_CTR = 0.04;
const CAP = 0.30;

function computeOpportunity(keywords, subs) {
  const rows = keywords.map((k) => {
    const vol = k.search_volume || 0;
    const cpc = k.cpc || 0;
    const presence = (k.reddit_sum_across_runs || 0) / 3;
    const rate = Math.min(CAP, PER_LISTING_CTR * presence);
    const reddit_bound = vol * rate;
    const value = reddit_bound * cpc;
    return { keyword: k.keyword, vol, cpc, rate, reddit_bound, value };
  });
  const totVol = rows.reduce((s, r) => s + r.vol, 0);
  const totBound = rows.reduce((s, r) => s + r.reddit_bound, 0);
  const totValue = rows.reduce((s, r) => s + r.value, 0);
  return {
    rows,
    totVol,
    totBound,
    totValue,
    share: totVol ? totBound / totVol : 0,
    members: subs.reduce((s, x) => s + (x.subscribers || 0), 0),
    visitors: subs.reduce((s, x) => s + (x.weekly_visitors || 0), 0),
    contributions: subs.reduce((s, x) => s + (x.weekly_contributions || 0), 0),
  };
}

// Real Skylead audit data (search_volume + cpc from DataForSEO, Reddit counts from the SERP runs).
const KEYWORDS = [
  { keyword: 'skylead', search_volume: 320, cpc: 4.88, reddit_sum_across_runs: 3 },
  { keyword: 'multichannel outreach tool', search_volume: 0, cpc: 0, reddit_sum_across_runs: 6 },
  { keyword: 'LinkedIn automation tool', search_volume: 1000, cpc: 16.99, reddit_sum_across_runs: 9 },
  { keyword: 'email warmup tool', search_volume: 720, cpc: 23.97, reddit_sum_across_runs: 4 },
  { keyword: 'smart sequences outreach', search_volume: 0, cpc: 0, reddit_sum_across_runs: 2 },
  { keyword: 'AI data enrichment outreach', search_volume: 0, cpc: 0, reddit_sum_across_runs: 2 },
  { keyword: 'Clay alternative', search_volume: 480, cpc: 43.13, reddit_sum_across_runs: 0 },
  { keyword: 'Lemlist alternative', search_volume: 90, cpc: 29.47, reddit_sum_across_runs: 0 },
  { keyword: 'Waalaxy alternative', search_volume: 30, cpc: 19.58, reddit_sum_across_runs: 0 },
  { keyword: 'Expandi alternative', search_volume: 20, cpc: 15.03, reddit_sum_across_runs: 0 },
  { keyword: 'Instantly alternative', search_volume: 140, cpc: 35.96, reddit_sum_across_runs: 0 },
  { keyword: 'Apollo alternative', search_volume: 320, cpc: 33.47, reddit_sum_across_runs: 0 },
  { keyword: 'LinkedIn automation safe ban', search_volume: 0, cpc: 0, reddit_sum_across_runs: 6 },
  { keyword: 'best outreach tool 2026', search_volume: 0, cpc: 0, reddit_sum_across_runs: 5 },
  { keyword: 'email deliverability help', search_volume: 0, cpc: 0, reddit_sum_across_runs: 4 },
  { keyword: 'outbound tool sprawl consolidate', search_volume: 0, cpc: 0, reddit_sum_across_runs: 2 },
  { keyword: 'cheapest LinkedIn automation', search_volume: 0, cpc: 0, reddit_sum_across_runs: 2 },
  { keyword: 'switch LinkedIn automation tool', search_volume: 0, cpc: 0, reddit_sum_across_runs: 2 },
];

const SUBS = [
  { name: 'GrowthHacking', subscribers: 340000, weekly_visitors: 27200, weekly_contributions: 1020 },
  { name: 'automation', subscribers: 280000, weekly_visitors: 22400, weekly_contributions: 840 },
  { name: 'EmailMarketing', subscribers: 140000, weekly_visitors: 11200, weekly_contributions: 420 },
  { name: 'leadgeneration', subscribers: 95000, weekly_visitors: 7600, weekly_contributions: 285 },
];

describe('Market Opportunity formula', () => {
  const o = computeOpportunity(KEYWORDS, SUBS);

  it('caps the capture rate at 30%', () => {
    // LinkedIn automation tool: 9/3 = 3 listings x 4% = 12% (under cap)
    const linkedin = o.rows.find((r) => r.keyword === 'LinkedIn automation tool');
    expect(linkedin.rate).toBeCloseTo(0.12, 5);
    // No keyword in this set should exceed the cap.
    expect(Math.max(...o.rows.map((r) => r.rate))).toBeLessThanOrEqual(CAP);
  });

  it('gives zero Reddit share to keywords where Reddit never ranked', () => {
    const clay = o.rows.find((r) => r.keyword === 'Clay alternative');
    expect(clay.rate).toBe(0);
    expect(clay.reddit_bound).toBe(0);
    expect(clay.value).toBe(0);
  });

  it('totals the targeted search demand', () => {
    expect(o.totVol).toBe(3120);
  });

  it('computes Reddit-bound monthly searches', () => {
    // 320*.04 + 1000*.12 + 720*(4/3*.04) = 12.8 + 120 + 38.4 = 171.2
    expect(o.totBound).toBeCloseTo(171.2, 1);
  });

  it('computes the ad-equivalent monthly value', () => {
    // 12.8*4.88 + 120*16.99 + 38.4*23.97 = 62.46 + 2038.8 + 920.45 = 3021.7
    expect(o.totValue).toBeCloseTo(3021.7, 0);
  });

  it('computes the overall Reddit share of search demand', () => {
    expect(o.share).toBeCloseTo(0.0549, 3);
  });

  it('totals community reach across subreddits', () => {
    expect(o.members).toBe(855000);
    expect(o.visitors).toBe(68400);
    expect(o.contributions).toBe(2565);
  });
});
