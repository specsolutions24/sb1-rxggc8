import type { TechnologyInfo } from '../types/domain';

interface TechnologySignature {
  name: string;
  category: string;
  patterns: {
    html?: RegExp[];
    scripts?: RegExp[];
    meta?: RegExp[];
    headers?: string[];
    cookies?: string[];
  };
  version?: {
    regex?: RegExp;
    headerName?: string;
    metaName?: string;
  };
}

const TECHNOLOGY_SIGNATURES: TechnologySignature[] = [
  // JavaScript Frameworks
  {
    name: 'React',
    category: 'JavaScript Framework',
    patterns: {
      html: [/react\.development\.js/, /react\.production\.min\.js/, /react-dom/, /_reactjs/],
      scripts: [/react@[\d.]+\/dist/, /react-dom@/],
      meta: [/<meta[^>]*\bdata-react/],
    },
    version: {
      regex: /react@([\d.]+)/,
    },
  },
  {
    name: 'Vue.js',
    category: 'JavaScript Framework',
    patterns: {
      html: [/vue\.js/, /vue\.min\.js/, /__vue__/],
      scripts: [/vue@[\d.]+/, /vue-router/, /vuex/],
      meta: [/<meta[^>]*\bdata-vue/],
    },
    version: {
      regex: /vue@([\d.]+)/,
    },
  },
  {
    name: 'Angular',
    category: 'JavaScript Framework',
    patterns: {
      html: [/angular\.js/, /angular\.min\.js/, /ng-app/, /ng-controller/],
      scripts: [/angular@[\d.]+/, /@angular\/core/],
      meta: [/<meta[^>]*\bang:app/],
    },
    version: {
      regex: /angular[@/-]([\d.]+)/,
    },
  },
  {
    name: 'Svelte',
    category: 'JavaScript Framework',
    patterns: {
      html: [/__SVELTE__/, /svelte-/],
      scripts: [/svelte@[\d.]+/, /svelte\/internal/],
    },
    version: {
      regex: /svelte@([\d.]+)/,
    },
  },
  // UI Libraries
  {
    name: 'Material-UI',
    category: 'UI Library',
    patterns: {
      html: [/MuiBox-root/, /MuiButton-root/, /MuiTypography/],
      scripts: [/@material-ui\/core/, /@mui\/material/],
    },
  },
  {
    name: 'Chakra UI',
    category: 'UI Library',
    patterns: {
      html: [/chakra-/, /css-\w{6,}/],
      scripts: [/@chakra-ui\/react/],
    },
  },
  {
    name: 'Tailwind CSS',
    category: 'CSS Framework',
    patterns: {
      html: [/tailwind\.css/, /tailwindcss/, /\.tailwind/, /[a-z0-9:]*-\[.+\]/],
      meta: [/<meta[^>]*tailwindcss/],
    },
  },
  // State Management
  {
    name: 'Redux',
    category: 'State Management',
    patterns: {
      scripts: [/redux@[\d.]+/, /react-redux/, /__REDUX__/],
    },
    version: {
      regex: /redux@([\d.]+)/,
    },
  },
  {
    name: 'MobX',
    category: 'State Management',
    patterns: {
      scripts: [/mobx@[\d.]+/, /mobx-react/],
    },
  },
  // Build Tools
  {
    name: 'Webpack',
    category: 'Build Tool',
    patterns: {
      html: [/webpack/, /__webpack_require__/],
      scripts: [/webpack\.bundle\.js/],
    },
  },
  {
    name: 'Vite',
    category: 'Build Tool',
    patterns: {
      scripts: [/@vite\/client/, /vite\/dist\/client/],
      meta: [/<meta[^>]*vite/],
    },
  },
  // Analytics and Marketing
  {
    name: 'Google Analytics',
    category: 'Analytics',
    patterns: {
      scripts: [/google-analytics\.com\/analytics\.js/, /ga\.js/, /gtag/, /googletagmanager/],
      html: [/google-analytics/, /GoogleAnalyticsObject/, /gtag/],
    },
  },
  {
    name: 'HubSpot',
    category: 'Marketing',
    patterns: {
      scripts: [/js\.hs-scripts\.com/, /js\.hsforms\.net/],
      html: [/hs-script-loader/],
    },
  },
  {
    name: 'Segment',
    category: 'Analytics',
    patterns: {
      scripts: [/cdn\.segment\.com\/analytics\.js/],
      html: [/analytics\.segment\.com/],
    },
  },
  // Infrastructure
  {
    name: 'Cloudflare',
    category: 'CDN',
    patterns: {
      headers: ['cf-ray', 'cf-cache-status', 'cf-connecting-ip'],
      cookies: ['__cfduid', '__cf_bm'],
    },
  },
  {
    name: 'Fastly',
    category: 'CDN',
    patterns: {
      headers: ['fastly-restarts', 'x-served-by', 'x-cache-hits'],
    },
  },
  {
    name: 'Akamai',
    category: 'CDN',
    patterns: {
      headers: ['x-akamai-transformed', 'akamai-origin-hop'],
      cookies: ['akacd_', 'akavpau_'],
    },
  },
  // Web Servers
  {
    name: 'nginx',
    category: 'Web Server',
    patterns: {
      headers: ['server', 'x-nginx-cache'],
    },
    version: {
      headerName: 'server',
    },
  },
  {
    name: 'Apache',
    category: 'Web Server',
    patterns: {
      headers: ['server'],
    },
    version: {
      headerName: 'server',
    },
  },
  // Security
  {
    name: 'reCAPTCHA',
    category: 'Security',
    patterns: {
      scripts: [/www\.google\.com\/recaptcha/, /recaptcha\.net\/recaptcha/],
      html: [/g-recaptcha/, /grecaptcha/],
    },
  },
  {
    name: 'Stripe',
    category: 'Payment',
    patterns: {
      scripts: [/js\.stripe\.com/, /stripe-js/],
      html: [/data-stripe/, /stripe-button/],
    },
  },
  // CMS
  {
    name: 'WordPress',
    category: 'CMS',
    patterns: {
      html: [/wp-content/, /wp-includes/, /wp-json/],
      meta: [/<meta[^>]*"generator"[^>]*WordPress/i],
      scripts: [/wp-embed\.min\.js/],
    },
    version: {
      regex: /WordPress ([\d.]+)/,
    },
  },
  {
    name: 'Drupal',
    category: 'CMS',
    patterns: {
      html: [/drupal\.org/, /drupal\.settings/],
      meta: [/<meta[^>]*"generator"[^>]*Drupal/i],
    },
    version: {
      regex: /Drupal ([\d.]+)/,
    },
  },
  // E-commerce
  {
    name: 'Shopify',
    category: 'E-commerce',
    patterns: {
      html: [/cdn\.shopify\.com/, /shopify\.com\/checkout/],
      scripts: [/shopify\.theme/],
      meta: [/<meta[^>]*"shopify-checkout-api-token"/],
    },
  },
  {
    name: 'WooCommerce',
    category: 'E-commerce',
    patterns: {
      html: [/woocommerce/, /wc-api/, /wc_add_to_cart/],
      scripts: [/woocommerce\.min\.js/, /wc-add-to-cart/],
      meta: [/<meta[^>]*"generator"[^>]*WooCommerce/i],
    },
  },
  // Monitoring
  {
    name: 'Sentry',
    category: 'Error Monitoring',
    patterns: {
      scripts: [/browser\.sentry-cdn\.com/, /sentry\.io/],
      html: [/data-sentry/, /sentry-trace/],
    },
  },
  {
    name: 'New Relic',
    category: 'Performance Monitoring',
    patterns: {
      scripts: [/newrelic\.com\/nr-/, /new-relic/],
      headers: ['newrelic'],
    },
  },
  // Additional JavaScript Frameworks
  {
    name: 'Next.js',
    category: 'JavaScript Framework',
    patterns: {
      html: [/__NEXT_DATA__/, /_next\/static/],
      scripts: [/next\/dist\//, /_buildManifest\.js/],
      meta: [/<meta[^>]*next-head/],
    },
  },
  {
    name: 'Nuxt.js',
    category: 'JavaScript Framework',
    patterns: {
      html: [/__NUXT__/, /_nuxt\//, /nuxt-link/],
      scripts: [/nuxt\.js/, /_nuxt\/runtime\./],
    },
  },
  {
    name: 'Remix',
    category: 'JavaScript Framework',
    patterns: {
      html: [/data-remix-run/, /remix-run/],
      scripts: [/@remix-run\//, /remix\.config/],
    },
  },
  {
    name: 'Astro',
    category: 'JavaScript Framework',
    patterns: {
      html: [/astro-island/, /astro-static/],
      scripts: [/@astrojs\//, /astro\.config/],
    },
  },
  // Additional UI Libraries
  {
    name: 'Ant Design',
    category: 'UI Library',
    patterns: {
      html: [/ant-/, /antd-/],
      scripts: [/@ant-design\//, /antd(@|\/)/],
    },
  },
  {
    name: 'Mantine',
    category: 'UI Library',
    patterns: {
      html: [/mantine-/, /\bmantine\b/],
      scripts: [/@mantine\/core/, /@mantine\/hooks/],
    },
  },
  {
    name: 'Radix UI',
    category: 'UI Library',
    patterns: {
      html: [/radix-/, /\bradix\b/],
      scripts: [/@radix-ui\//, /radix-ui/],
    },
  },
  {
    name: 'shadcn/ui',
    category: 'UI Library',
    patterns: {
      html: [/\bcn\b/, /shadcn/],
      scripts: [/@shadcn\/ui/],
    },
  },
  // Additional CSS Frameworks
  {
    name: 'Bootstrap',
    category: 'CSS Framework',
    patterns: {
      html: [/bootstrap\.css/, /bootstrap\.min\.css/, /\bbootstrap\b/],
      scripts: [/bootstrap\.bundle\.js/, /bootstrap\.min\.js/],
    },
    version: {
      regex: /bootstrap@([\d.]+)/,
    },
  },
  {
    name: 'Bulma',
    category: 'CSS Framework',
    patterns: {
      html: [/bulma\.css/, /bulma\.min\.css/, /\bbulma\b/],
      meta: [/<meta[^>]*bulma/],
    },
  },
  // Additional CMS
  {
    name: 'Ghost',
    category: 'CMS',
    patterns: {
      html: [/ghost-/, /ghost\.io/],
      scripts: [/ghost\.min\.js/],
      meta: [/<meta[^>]*"generator"[^>]*Ghost/i],
    },
  },
  {
    name: 'Strapi',
    category: 'CMS',
    patterns: {
      html: [/strapi-/, /strapi\.io/],
      scripts: [/@strapi\//, /strapi-sdk/],
    },
  },
  {
    name: 'Contentful',
    category: 'CMS',
    patterns: {
      scripts: [/contentful\.com\//, /ctfassets\.net/],
      html: [/contentful/, /ctfassets/],
    },
  },
  // Additional State Management
  {
    name: 'Zustand',
    category: 'State Management',
    patterns: {
      scripts: [/zustand(@|\/)/, /create-zustand/],
    },
  },
  {
    name: 'Jotai',
    category: 'State Management',
    patterns: {
      scripts: [/jotai(@|\/)/, /create-jotai/],
    },
  },
  {
    name: 'XState',
    category: 'State Management',
    patterns: {
      scripts: [/@xstate\//, /xstate\.js/],
    },
  },
  // Additional Testing Frameworks
  {
    name: 'Jest',
    category: 'Testing',
    patterns: {
      scripts: [/jest-runtime/, /jest\.config/],
    },
  },
  {
    name: 'Vitest',
    category: 'Testing',
    patterns: {
      scripts: [/vitest\.config/, /@vitest\//],
    },
  },
  {
    name: 'Cypress',
    category: 'Testing',
    patterns: {
      scripts: [/cypress\.config/, /@cypress\//],
    },
  },
  // Additional Build Tools
  {
    name: 'Turbopack',
    category: 'Build Tool',
    patterns: {
      html: [/turbopack/, /__turbopack__/],
      scripts: [/@vercel\/turbopack/, /turbopack\.config/],
    },
  },
  {
    name: 'Rollup',
    category: 'Build Tool',
    patterns: {
      scripts: [/rollup\.config/, /@rollup\//],
    },
  },
  // Additional E-commerce
  {
    name: 'Magento',
    category: 'E-commerce',
    patterns: {
      html: [/magento/, /mage-/],
      scripts: [/magento\.js/, /mage\/cookies/],
      meta: [/<meta[^>]*"generator"[^>]*Magento/i],
    },
  },
  {
    name: 'BigCommerce',
    category: 'E-commerce',
    patterns: {
      html: [/bigcommerce/, /bc-/],
      scripts: [/bigcommerce\.com/, /bcapp/],
    },
  },
  // Additional Analytics
  {
    name: 'Mixpanel',
    category: 'Analytics',
    patterns: {
      scripts: [/mixpanel\.js/, /mixpanel-/],
      html: [/mixpanel\.init/, /mixpanel\.track/],
    },
  },
  {
    name: 'Amplitude',
    category: 'Analytics',
    patterns: {
      scripts: [/amplitude\.com\//, /amplitude\.min\.js/],
      html: [/amplitude\.getInstance/, /amplitude\.track/],
    },
  },
  // Additional Security Tools
  {
    name: 'Auth0',
    category: 'Security',
    patterns: {
      scripts: [/auth0\.js/, /auth0\.com/],
      html: [/auth0-/, /auth0\./],
    },
  },
  {
    name: 'Okta',
    category: 'Security',
    patterns: {
      scripts: [/okta\.js/, /okta\.com/],
      html: [/okta-/, /oktaauth/],
    },
  }
];

async function fetchWithTimeout(url: string, timeout = 10000): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(
      `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
      {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        },
      }
    );
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

function extractVersion(tech: TechnologySignature, html: string, headers: Headers): string | undefined {
  if (!tech.version) return undefined;

  if (tech.version.headerName) {
    const headerValue = headers.get(tech.version.headerName.toLowerCase());
    if (headerValue) {
      return headerValue.split('/')[1] || headerValue;
    }
  }

  if (tech.version.regex) {
    const match = html.match(tech.version.regex);
    if (match && match[1]) {
      return match[1];
    }
  }

  if (tech.version.metaName) {
    const metaMatch = html.match(new RegExp(`<meta[^>]*name=["']${tech.version.metaName}["'][^>]*content=["']([^"']+)["']`, 'i'));
    if (metaMatch && metaMatch[1]) {
      return metaMatch[1];
    }
  }

  return undefined;
}

export async function detectTechnologies(domain: string): Promise<TechnologyInfo[]> {
  const technologies = new Map<string, TechnologyInfo>();
  const urls = [`https://${domain}`, `https://www.${domain}`];

  for (const url of urls) {
    try {
      const response = await fetchWithTimeout(url);
      const html = await response.text();
      
      // Get all script sources
      const scriptSources = Array.from(html.matchAll(/<script[^>]*src=["']([^"']+)["'][^>]*>/gi))
        .map(match => match[1]);

      // Get all meta tags
      const metaTags = Array.from(html.matchAll(/<meta[^>]+>/gi))
        .map(match => match[0]);

      // Get cookies
      const cookies = response.headers.get('set-cookie')?.split(',') || [];

      // Check each technology signature
      for (const tech of TECHNOLOGY_SIGNATURES) {
        let found = false;

        // Check HTML patterns
        if (tech.patterns.html && !found) {
          found = tech.patterns.html.some(pattern => pattern.test(html));
        }

        // Check script patterns
        if (tech.patterns.scripts && !found) {
          found = tech.patterns.scripts.some(pattern => 
            scriptSources.some(src => pattern.test(src))
          );
        }

        // Check meta patterns
        if (tech.patterns.meta && !found) {
          found = tech.patterns.meta.some(pattern => 
            metaTags.some(meta => pattern.test(meta))
          );
        }

        // Check headers
        if (tech.patterns.headers && !found) {
          found = tech.patterns.headers.some(header => 
            response.headers.has(header.toLowerCase())
          );
        }

        // Check cookies
        if (tech.patterns.cookies && !found) {
          found = tech.patterns.cookies.some(cookie => 
            cookies.some(c => c.toLowerCase().includes(cookie.toLowerCase()))
          );
        }

        if (found) {
          const version = extractVersion(tech, html, response.headers);
          technologies.set(tech.name, {
            name: tech.name,
            category: tech.category,
            version: version?.trim(),
          });
        }
      }

      // If we found technologies, no need to check www subdomain
      if (technologies.size > 0) {
        break;
      }
    } catch (error) {
      console.error(`Failed to detect technologies for ${url}:`, error);
      continue;
    }
  }

  return Array.from(technologies.values());
}