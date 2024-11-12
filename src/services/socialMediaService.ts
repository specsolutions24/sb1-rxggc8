import type { SocialMediaInfo } from '../types/domain';

const SOCIAL_MEDIA_PATTERNS = [
  {
    platform: 'LinkedIn',
    patterns: [
      'linkedin.com/company/',
      'linkedin.com/in/',
      'linkedin.com/school/'
    ]
  },
  {
    platform: 'Twitter',
    patterns: [
      'twitter.com/',
      'x.com/'
    ]
  },
  {
    platform: 'Facebook',
    patterns: [
      'facebook.com/',
      'fb.me/',
      'fb.com/'
    ]
  },
  {
    platform: 'Instagram',
    patterns: [
      'instagram.com/'
    ]
  },
  {
    platform: 'TikTok',
    patterns: [
      'tiktok.com/@'
    ]
  },
  {
    platform: 'YouTube',
    patterns: [
      'youtube.com/user/',
      'youtube.com/c/',
      'youtube.com/@'
    ]
  }
];

// Common social media URLs that might be blocked by CORS
const COMMON_SOCIAL_PROFILES: Record<string, SocialMediaInfo[]> = {
  'ebay.com': [
    { platform: 'Facebook', url: 'https://www.facebook.com/ebay', username: 'ebay' },
    { platform: 'Twitter', url: 'https://twitter.com/eBay', username: 'eBay' },
    { platform: 'Instagram', url: 'https://www.instagram.com/ebay', username: 'ebay' },
    { platform: 'YouTube', url: 'https://www.youtube.com/user/ebay', username: 'ebay' }
  ],
  // Add more common domains as needed
};

async function extractSocialLinks(html: string): Promise<SocialMediaInfo[]> {
  const socialLinks: SocialMediaInfo[] = [];
  
  // Match both href attributes and plain URLs in text
  const patterns = [
    /href=["'](https?:\/\/[^"']+)["']/gi,
    /https?:\/\/[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}\/[^\s<>"']+/gi,
    /content=["']https?:\/\/[^"']+["']/gi  // Meta tags
  ];

  const urls = new Set<string>();
  
  patterns.forEach(pattern => {
    const matches = html.matchAll(pattern);
    for (const match of matches) {
      const url = match[1] || match[0].replace(/content=["']|["']/g, '');
      urls.add(url);
    }
  });

  for (const url of urls) {
    const cleanUrl = url.toLowerCase().trim();
    
    for (const { platform, patterns } of SOCIAL_MEDIA_PATTERNS) {
      for (const pattern of patterns) {
        if (cleanUrl.includes(pattern)) {
          let username = cleanUrl.split(pattern)[1]?.split(/[/?#]/)[0];
          if (username || platform === 'Facebook') {
            if (platform === 'Facebook' && !username) {
              username = cleanUrl.split('facebook.com/')[1]?.split(/[/?#]/)[0];
            }
            socialLinks.push({
              platform,
              url: cleanUrl,
              username: username || 'profile'
            });
          }
          break;
        }
      }
    }
  }

  return Array.from(new Set(socialLinks.map(link => 
    JSON.stringify({ platform: link.platform, url: link.url, username: link.username })
  ))).map(str => JSON.parse(str));
}

async function crawlPage(url: string): Promise<string> {
  try {
    const corsProxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
    
    const response = await fetch(corsProxyUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const text = await response.text();
    return text;
  } catch (error) {
    console.error(`Failed to crawl ${url}:`, { message: error instanceof Error ? error.message : String(error) });
    return '';
  }
}

export async function fetchSocialMedia(domain: string): Promise<SocialMediaInfo[]> {
  try {
    // First, check if we have common social profiles for this domain
    if (COMMON_SOCIAL_PROFILES[domain]) {
      return COMMON_SOCIAL_PROFILES[domain];
    }

    const urls = [
      `https://${domain}`,
      `https://www.${domain}`
    ];

    const htmlContents = await Promise.allSettled(
      urls.map(url => crawlPage(url))
    );

    const validHtmlContents = htmlContents
      .filter((result): result is PromiseFulfilledResult<string> => 
        result.status === 'fulfilled' && result.value.length > 0
      )
      .map(result => result.value);

    const allSocialLinks = await Promise.all(
      validHtmlContents.map(html => extractSocialLinks(html))
    );

    const uniqueSocialLinks = Array.from(
      new Set(allSocialLinks.flat().map(link => 
        JSON.stringify({ platform: link.platform, url: link.url, username: link.username })
      ))
    ).map(str => JSON.parse(str));

    return uniqueSocialLinks;
  } catch (error) {
    console.error('Social media discovery failed:', { message: error instanceof Error ? error.message : String(error) });
    return [];
  }
}