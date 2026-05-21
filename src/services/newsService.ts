export interface FeedItem {
  id: string;
  headline: string;
  caption: string;
  source: string;
  cat: string;
  catColor: string;
  mag: 'high' | 'medium' | 'low';
  img: string;
  link: string;
  pubDate: string;
  action: string;
}

// Static fallback Pakistan business news (always visible, even offline)
const STATIC_NEWS: FeedItem[] = [
  {
    id: 'static-1', cat: 'Tax', catColor: '#f59e0b', mag: 'high',
    headline: 'FBR Introduces New Withholding Tax on Business Transactions',
    caption: 'The Federal Board of Revenue has issued new SRO updating withholding tax rates on services and goods. All registered businesses must update their invoicing and deduction rates immediately.',
    source: 'FBR Pakistan', pubDate: new Date(Date.now() - 2 * 3600000).toISOString(),
    img: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600',
    link: 'https://www.fbr.gov.pk',
    action: 'Update your withholding tax deductions on all vendor payments immediately.',
  },
  {
    id: 'static-2', cat: 'Economy', catColor: '#06b6d4', mag: 'medium',
    headline: 'SBP Holds Policy Rate — Businesses Get Breathing Room',
    caption: 'State Bank of Pakistan Monetary Policy Committee kept the benchmark interest rate unchanged, providing relief to businesses with existing loans and credit lines.',
    source: 'State Bank of Pakistan', pubDate: new Date(Date.now() - 5 * 3600000).toISOString(),
    img: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=600',
    link: 'https://www.sbp.org.pk',
    action: 'Review your financing costs and explore fixed-rate options before next MPC meeting.',
  },
  {
    id: 'static-3', cat: 'Labour', catColor: '#3b82f6', mag: 'high',
    headline: 'Punjab Minimum Wage Revised to PKR 37,000 Per Month',
    caption: 'Punjab government officially notified the revised minimum wage. All businesses with employees in Punjab must update payroll immediately or face penalties up to PKR 100,000.',
    source: 'Punjab Labour Dept', pubDate: new Date(Date.now() - 8 * 3600000).toISOString(),
    img: 'https://images.unsplash.com/photo-1521737852567-6949f3f9f2b5?w=600',
    link: 'https://www.pmd.punjab.gov.pk',
    action: 'Update all employee salaries below PKR 37,000 before next payroll cycle.',
  },
  {
    id: 'static-4', cat: 'Trade', catColor: '#8b5cf6', mag: 'medium',
    headline: 'Customs Duty Changes on 200+ Import Categories',
    caption: 'Federal Budget brings major revisions to import tariffs. Electronics, raw materials, and machinery duties have been restructured. Importers must reassess landed costs.',
    source: 'FBR Customs', pubDate: new Date(Date.now() - 12 * 3600000).toISOString(),
    img: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=600',
    link: 'https://www.fbr.gov.pk',
    action: 'Review your import categories and recalculate landed costs with new tariff rates.',
  },
  {
    id: 'static-5', cat: 'Licensing', catColor: '#10b981', mag: 'medium',
    headline: 'SECP Launches New Online Company Registration Portal',
    caption: 'Securities and Exchange Commission Pakistan has launched a revamped eServices portal making company registration and annual filing faster. Processing time reduced to 24 hours.',
    source: 'SECP Pakistan', pubDate: new Date(Date.now() - 18 * 3600000).toISOString(),
    img: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600',
    link: 'https://eservices.secp.gov.pk',
    action: 'File your annual returns through the new portal to avoid late filing penalties.',
  },
  {
    id: 'static-6', cat: 'Food/Health', catColor: '#f97316', mag: 'high',
    headline: 'Punjab Food Authority Begins Crackdown — 500 Businesses Fined',
    caption: 'PFA launched a province-wide inspection drive targeting restaurants, food manufacturers, and retailers. Businesses without valid food licences face fines up to PKR 500,000 and sealing.',
    source: 'Punjab Food Authority', pubDate: new Date(Date.now() - 24 * 3600000).toISOString(),
    img: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600',
    link: 'https://www.pfa.punjab.gov.pk',
    action: 'Renew your PFA licence immediately and ensure all food handling staff are certified.',
  },
  {
    id: 'static-7', cat: 'Tax', catColor: '#f59e0b', mag: 'high',
    headline: 'Last Date for Income Tax Returns: File Now to Avoid Surcharge',
    caption: 'FBR reminds all businesses and individuals that the deadline for filing annual income tax returns is approaching. Late filers face automatic surcharges of 0.1% per month on tax payable.',
    source: 'FBR Pakistan', pubDate: new Date(Date.now() - 30 * 3600000).toISOString(),
    img: 'https://images.unsplash.com/photo-1554224154-26032ffc0d07?w=600',
    link: 'https://iris.fbr.gov.pk',
    action: 'Log in to IRIS portal and complete your tax return before the deadline.',
  },
  {
    id: 'static-8', cat: 'Economy', catColor: '#06b6d4', mag: 'low',
    headline: 'Pakistan GDP Growth Forecast at 3.5% — IMF Report',
    caption: 'International Monetary Fund revised Pakistan GDP growth forecast upward citing improved fiscal management, stable rupee, and recovery in manufacturing and services sectors.',
    source: 'IMF / Dawn Business', pubDate: new Date(Date.now() - 36 * 3600000).toISOString(),
    img: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600',
    link: 'https://www.imf.org',
    action: 'Plan for moderate growth — review your business expansion targets for next quarter.',
  },
  {
    id: 'static-9', cat: 'Labour', catColor: '#3b82f6', mag: 'medium',
    headline: 'EOBI Increases Monthly Contribution Rate for Employers',
    caption: 'Employees Old-Age Benefits Institution has revised the monthly contribution rate. Employers must update payroll systems to deduct the new EOBI rate from employee wages and match with employer contribution.',
    source: 'EOBI Pakistan', pubDate: new Date(Date.now() - 48 * 3600000).toISOString(),
    img: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=600',
    link: 'https://www.eobi.gov.pk',
    action: 'Update payroll software with new EOBI contribution rates and register new employees.',
  },
  {
    id: 'static-10', cat: 'Trade', catColor: '#8b5cf6', mag: 'medium',
    headline: 'PSQCA Makes New Product Standards Mandatory for 50 Categories',
    caption: 'Pakistan Standards and Quality Control Authority has enforced updated quality standards for electronics, food packaging, and construction materials. Non-compliant goods face import ban and market withdrawal.',
    source: 'PSQCA', pubDate: new Date(Date.now() - 56 * 3600000).toISOString(),
    img: 'https://images.unsplash.com/photo-1565043589221-1a6fd9ae45c7?w=600',
    link: 'https://www.psqca.com.pk',
    action: 'Check if your products fall under new PSQCA categories and obtain required certifications.',
  },
];

const RSS_SOURCES = [
  'https://www.dawn.com/feeds/business',
  'https://www.thenews.com.pk/rss/2/3',
  'https://arynews.tv/feed/',
];

function extractText(html: string): string {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#039;/g, "'").replace(/\s+/g, ' ').trim();
}

function extractImage(str: string): string | null {
  const m = str.match(/https?:\/\/[^\s"'<>]+\.(jpg|jpeg|png|webp)/i);
  return m ? m[0] : null;
}

const FALLBACK_IMGS = [
  'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=600',
  'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600',
  'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600',
  'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=600',
  'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600',
];

function categorize(text: string): Pick<FeedItem, 'cat' | 'catColor' | 'mag' | 'action'> {
  const t = text.toLowerCase();
  if (t.match(/tax|fbr|ntn|gst|withholding|sro|income tax/))
    return { cat: 'Tax', catColor: '#f59e0b', mag: 'high', action: 'Review your tax compliance and filings with FBR.' };
  if (t.match(/labour|minimum wage|eobi|worker|employee|salary/))
    return { cat: 'Labour', catColor: '#3b82f6', mag: 'medium', action: 'Check your payroll and labour law compliance.' };
  if (t.match(/import|export|customs|duty|trade|tariff/))
    return { cat: 'Trade', catColor: '#8b5cf6', mag: 'medium', action: 'Review your trade and customs compliance.' };
  if (t.match(/food|pfa|drug|health|drap/))
    return { cat: 'Food/Health', catColor: '#f97316', mag: 'medium', action: 'Ensure your food safety licences are up to date.' };
  if (t.match(/secp|company|registr|licence|license/))
    return { cat: 'Licensing', catColor: '#10b981', mag: 'medium', action: 'Check your business registrations and licences.' };
  if (t.match(/inflation|gdp|economy|interest rate|budget|rupee|dollar|sbp/))
    return { cat: 'Economy', catColor: '#06b6d4', mag: 'low', action: 'Stay updated on economic conditions affecting your business.' };
  return { cat: 'Business', catColor: '#6b7280', mag: 'low', action: 'Stay updated on this business development.' };
}

function fetchWithTimeout(url: string, ms: number): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  return fetch(url, { signal: controller.signal }).finally(() => clearTimeout(timer));
}

async function fetchRSSSource(rssUrl: string, sourceLabel: string): Promise<FeedItem[]> {
  const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}`;
  const res = await fetchWithTimeout(apiUrl, 10000);
  if (!res.ok) return [];
  const data = await res.json();
  if (data.status !== 'ok' || !Array.isArray(data.items)) return [];

  return data.items.slice(0, 15).map((item: any, i: number): FeedItem => {
    const title = extractText(item.title || '');
    const desc = extractText(item.description || item.content || '');
    const { cat, catColor, mag, action } = categorize(title + ' ' + desc);
    const img =
      extractImage(item.content || '') ||
      extractImage(item.description || '') ||
      item.thumbnail ||
      (item.enclosure && item.enclosure.link) ||
      FALLBACK_IMGS[i % FALLBACK_IMGS.length];

    return {
      id: item.guid || item.link || `live-${rssUrl}-${i}`,
      headline: title || 'Business Update',
      caption: desc.slice(0, 250),
      source: sourceLabel,
      cat, catColor, mag, img,
      link: item.link || '',
      pubDate: item.pubDate || new Date().toISOString(),
      action,
    };
  });
}

// Module-level state
let allItems: FeedItem[] = [...STATIC_NEWS];
let liveLoaded = false;

export function resetNewsFeed() {
  allItems = [...STATIC_NEWS];
  liveLoaded = false;
}

export async function loadInitialNews(): Promise<FeedItem[]> {
  // Always return static news immediately
  if (liveLoaded) return allItems;

  // Try to fetch live news in background
  try {
    const sources = [
      { url: RSS_SOURCES[0], label: 'Dawn Business' },
      { url: RSS_SOURCES[1], label: 'The News' },
    ];

    const results = await Promise.allSettled(
      sources.map(s => fetchRSSSource(s.url, s.label))
    );

    const liveItems: FeedItem[] = [];
    results.forEach(r => {
      if (r.status === 'fulfilled') liveItems.push(...r.value);
    });

    if (liveItems.length > 0) {
      const staticIds = new Set(STATIC_NEWS.map(s => s.id));
      const freshLive = liveItems.filter(i => !staticIds.has(i.id));
      allItems = [...freshLive, ...STATIC_NEWS];
    }
    liveLoaded = true;
  } catch {
    // Keep static news on error
  }

  return allItems;
}

export async function loadMoreNews(): Promise<FeedItem[]> {
  // Try third source for more content
  if (allItems.length < 30) {
    try {
      const more = await fetchRSSSource(RSS_SOURCES[2], 'ARY News');
      if (more.length > 0) {
        const existIds = new Set(allItems.map(i => i.id));
        const fresh = more.filter(i => !existIds.has(i.id));
        allItems = [...allItems, ...fresh];
      }
    } catch { /* keep existing */ }
  }
  return allItems;
}
