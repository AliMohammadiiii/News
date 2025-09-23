// API Base URL - you can change this to your actual API endpoint
const API_BASE_URL = resolveApiBase();

/**
 * Resolve API base URL with priority:
 * 1) URL query ?apiBase=...
 * 2) localStorage 'apiBase'
 * 3) import.meta.env.VITE_API_BASE_URL
 * 4) same-origin ('')
 */
function resolveApiBase() {
  try {
    const params = new URLSearchParams(window.location.search);
    const fromQuery = params.get('apiBase');
    if (fromQuery) {
      localStorage.setItem('apiBase', fromQuery);
      return fromQuery.replace(/\/$/, '');
    }
    const fromStorage = localStorage.getItem('apiBase');
    if (fromStorage) return fromStorage.replace(/\/$/, '');
    const fromEnv = import.meta?.env?.VITE_API_BASE_URL;
    if (fromEnv) return String(fromEnv).replace(/\/$/, '');
  } catch {}
  return '';
}

/**
 * Generic API request function
 * @param {string} endpoint
 * @param {object} options
 * @returns {Promise<any>}
 */
async function apiRequest(endpoint, options = {}) {
  const base = API_BASE_URL || '';
  const url = `${base}${endpoint}`;

  try {
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });
    
    if (!response.ok) {
      const text = await response.text().catch(() => '');
      throw new Error(`HTTP ${response.status} ${response.statusText} - ${url} - ${text?.slice(0,200)}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('API Request failed:', error);
    throw error;
  }
}

/**
 * Build query string from parameters
 * @param {object} params 
 * @returns {string}
 */
function buildQueryString(params) {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '') {
      searchParams.append(key, value);
    }
  });

  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : '';
}

// Helpers to extract common API response shapes
export function extractNewsList(response) {
  const data = response?.data ?? response;
  const candidates = [
    data?.news,
    data?.items,
    data?.results,
    data?.data?.news,
    data?.data?.items,
    data?.data?.results,
    response?.news,
    response?.items,
    response?.results,
  ];
  for (const c of candidates) {
    if (Array.isArray(c)) return c;
  }
  if (Array.isArray(data)) return data;
  return [];
}

export function extractCategoriesList(response) {
  const data = response?.data ?? response;
  const candidates = [data?.categories, data?.data?.categories, response?.categories];
  for (const c of candidates) {
    if (Array.isArray(c)) return c;
  }
  if (Array.isArray(data)) return data;
  return [];
}

export function extractAgenciesList(response) {
  const data = response?.data ?? response;
  const candidates = [data?.agencies, data?.sources, data?.data?.agencies, response?.agencies];
  for (const c of candidates) {
    if (Array.isArray(c)) return c;
  }
  if (Array.isArray(data)) return data;
  return [];
}

function parseTimestamp(input) {
  if (input == null) return Math.floor(Date.now() / 1000);
  if (typeof input === 'number') {
    if (input > 1e12) return Math.floor(input / 1000); // ms to s
    if (input < 1e10) return Math.floor(input); // seconds
    return Math.floor(input / 1000);
  }
  if (typeof input === 'string') {
    const n = Number(input);
    if (!Number.isNaN(n)) return parseTimestamp(n);
    const d = Date.parse(input);
    if (!Number.isNaN(d)) return Math.floor(d / 1000);
  }
  return Math.floor(Date.now() / 1000);
}

export function normalizeNewsItem(item) {
  const id = item?.id ?? item?._id ?? item?.uuid ?? item?.slug ?? item?.guid ?? (item?.link || item?.url) ?? Math.random().toString(36).slice(2);
  const title = item?.title ?? item?.name ?? item?.headline ?? '';
  const content = item?.content ?? item?.summary ?? item?.description ?? '';
  const image_url = item?.image_url ?? item?.imageUrl ?? item?.image ?? item?.thumbnail ?? item?.cover ?? null;
  const link = item?.link ?? item?.url ?? '#';
  const pubRaw = item?.pubDate ?? item?.published_at ?? item?.publishedAt ?? item?.created_at ?? item?.createdAt ?? item?.timestamp;
  const pubDate = parseTimestamp(pubRaw);

  const categoryRaw = item?.category ?? item?.category_obj ?? item?.categoryObject ?? item?.categoryName ?? item?.category_id;
  let category = { id: null, name: 'عمومی' };
  if (categoryRaw && typeof categoryRaw === 'object') {
    category = {
      id: categoryRaw.id ?? categoryRaw.category_id ?? null,
      name: categoryRaw.name ?? categoryRaw.title ?? 'عمومی'
    };
  } else if (typeof categoryRaw === 'string') {
    category = { id: null, name: categoryRaw };
  } else if (typeof categoryRaw === 'number') {
    category = { id: categoryRaw, name: 'عمومی' };
  }

  const agencyRaw = item?.agency ?? item?.source ?? item?.publisher;
  let agency = { id: null, name: 'منبع نامشخص', website: null, image_url: null };
  if (agencyRaw && typeof agencyRaw === 'object') {
    agency = {
      id: agencyRaw.id ?? null,
      name: agencyRaw.name ?? agencyRaw.title ?? 'منبع نامشخص',
      website: agencyRaw.website ?? agencyRaw.url ?? agencyRaw.homepage ?? null,
      image_url: agencyRaw.image_url ?? agencyRaw.imageUrl ?? agencyRaw.logo ?? null,
    };
  } else if (typeof agencyRaw === 'string') {
    agency = { id: null, name: agencyRaw, website: null, image_url: null };
  }

  return {
    id: String(id),
    title,
    content,
    image_url,
    pubDate,
    link,
    category,
    agency,
  };
}

/**
 * Get news with optional filtering and pagination
 * @param {object} params - Query parameters
 * @param {number} params.category_id - Filter by category id
 * @param {number} params.agency_id - Filter by agency id
 * @param {string} params.category - Filter by category name
 * @param {string} params.agency - Filter by agency name
 * @param {string} params.q - Search title/content
 * @param {number} params.limit - Limit results (max 200, default 50)
 * @param {number} params.offset - Offset for pagination (default 0)
 * @returns {Promise<object>}
 */
export async function getNews(params = {}) {
  const queryString = buildQueryString(params);
  return apiRequest(`/api/news${queryString}`);
}

/**
 * Get all categories
 * @returns {Promise<object>}
 */
export async function getCategories() {
  return apiRequest('/api/categories');
}

/**
 * Get all agencies
 * @returns {Promise<object>}
 */
export async function getAgencies() {
  return apiRequest('/api/agencies');
}

/**
 * Health check
 * @returns {Promise<object>}
 */
export async function healthCheck() {
  return apiRequest('/healthz');
}

/**
 * Get featured news (first few news items, typically for carousel)
 * @param {number} limit - Number of featured news items
 * @returns {Promise<object>}
 */
export async function getFeaturedNews(limit = 5) {
  return getNews({ limit });
}

/**
 * Format timestamp to Persian relative time
 * @param {number} timestamp - Unix timestamp
 * @returns {string}
 */
export function formatRelativeTime(timestamp) {
  const now = Math.floor(Date.now() / 1000);
  const delta = now - timestamp;
  const future = delta < 0;
  const diff = Math.abs(delta);

  const minute = 60;
  const hour = minute * 60;
  const day = hour * 24;
  const week = day * 7;

  if (diff < minute) {
    return future ? 'به‌زودی' : 'هم‌اکنون';
  } else if (diff < hour) {
    const minutes = Math.floor(diff / minute);
    return `${minutes} دقیقه ${future ? 'دیگر' : 'پیش'}`;
  } else if (diff < day) {
    const hours = Math.floor(diff / hour);
    return `${hours} ساعت ${future ? 'دیگر' : 'پیش'}`;
  } else if (diff < week) {
    const days = Math.floor(diff / day);
    return `${days} روز ${future ? 'دیگر' : 'پیش'}`;
  } else {
    const weeks = Math.floor(diff / week);
    return `${weeks} هفته ${future ? 'دیگر' : 'پیش'}`;
  }
}

/**
 * Default agency logo when image_url is null
 * @param {string} agencyName 
 * @returns {string}
 */
export function getDefaultAgencyLogo(agencyName) {
  // Generate a simple colored circle with agency initial
  const canvas = document.createElement('canvas');
  canvas.width = 40;
  canvas.height = 40;
  const ctx = canvas.getContext('2d');
  
  // Background circle
  ctx.fillStyle = '#1DBF98';
  ctx.beginPath();
  ctx.arc(20, 20, 20, 0, 2 * Math.PI);
  ctx.fill();
  
  // Text
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 16px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(agencyName.charAt(0), 20, 20);
  
  return canvas.toDataURL();
}
