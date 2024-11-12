import type { SubdomainInfo } from '../types/domain';

interface SubdomainValidationResult {
  name: string;
  status?: number;
  title?: string;
  ip?: string;
  isAlive: boolean;
  protocol: 'http' | 'https' | null;
}

async function validateSubdomain(subdomain: string): Promise<SubdomainValidationResult> {
  const result: SubdomainValidationResult = {
    name: subdomain,
    isAlive: false,
    protocol: null
  };

  const protocols = ['https', 'http'];
  
  for (const protocol of protocols) {
    try {
      const corsProxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(`${protocol}://${subdomain}`)}`;
      
      const response = await fetch(corsProxyUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5'
        }
      });

      result.status = response.status;
      result.protocol = protocol;
      result.isAlive = response.ok;

      // Try to extract title if it's HTML
      const contentType = response.headers.get('content-type');
      if (contentType?.includes('text/html')) {
        const text = await response.text();
        const titleMatch = text.match(/<title[^>]*>([^<]+)<\/title>/i);
        if (titleMatch) {
          result.title = titleMatch[1].trim();
        }
      }

      // If we got a successful response, no need to try HTTP
      if (response.ok) break;
    } catch (error) {
      continue;
    }
  }

  // Try to resolve IP address
  try {
    const dnsResponse = await fetch(`https://dns.google/resolve?name=${subdomain}&type=A`);
    const dnsData = await dnsResponse.json();
    if (dnsData.Answer && dnsData.Answer[0]) {
      result.ip = dnsData.Answer[0].data;
    }
  } catch (error) {
    console.error(`Failed to resolve IP for ${subdomain}:`, error);
  }

  return result;
}

async function getCertificateTransparencySubdomains(domain: string): Promise<string[]> {
  try {
    // Use a more reliable API endpoint with proper JSON response
    const response = await fetch(`https://api.allorigins.win/raw?url=${encodeURIComponent(`https://api.certspotter.com/v1/issuances?domain=${domain}&include_subdomains=true&expand=dns_names`)}`, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Certificate transparency lookup failed: ${response.status}`);
    }

    const text = await response.text();
    let data;
    
    try {
      data = JSON.parse(text);
    } catch (e) {
      console.error('Failed to parse certificate transparency response:', e);
      return [];
    }

    const subdomains = new Set<string>();
    
    if (Array.isArray(data)) {
      data.forEach((cert: any) => {
        if (cert && Array.isArray(cert.dns_names)) {
          cert.dns_names.forEach((name: string) => {
            const cleanName = name.trim().toLowerCase();
            if (cleanName.endsWith(domain) && cleanName !== domain) {
              subdomains.add(cleanName);
            }
          });
        }
      });
    }

    return Array.from(subdomains);
  } catch (error) {
    console.error('Certificate transparency lookup failed:', { message: error instanceof Error ? error.message : String(error) });
    return [];
  }
}

async function getDNSdumpsterSubdomains(domain: string): Promise<string[]> {
  try {
    const corsProxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(`https://api.hackertarget.com/hostsearch/?q=${domain}`)}`;
    
    const response = await fetch(corsProxyUrl, {
      headers: {
        'Accept': 'text/plain',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    
    if (!response.ok) {
      throw new Error(`DNSdumpster lookup failed: ${response.status}`);
    }

    const text = await response.text();
    const subdomains = new Set<string>();
    
    if (text && !text.includes('error')) {
      text.split('\n').forEach(line => {
        const [hostname] = line.split(',');
        if (hostname && hostname.endsWith(domain) && hostname !== domain) {
          subdomains.add(hostname.toLowerCase());
        }
      });
    }

    return Array.from(subdomains);
  } catch (error) {
    console.error('DNSdumpster lookup failed:', { message: error instanceof Error ? error.message : String(error) });
    return [];
  }
}

export async function fetchSubdomains(domain: string): Promise<SubdomainInfo[]> {
  try {
    const [certTransparencyDomains, dnsDumpsterDomains] = await Promise.allSettled([
      getCertificateTransparencySubdomains(domain),
      getDNSdumpsterSubdomains(domain)
    ]);

    const allSubdomains = new Set<string>();
    
    if (certTransparencyDomains.status === 'fulfilled') {
      certTransparencyDomains.value.forEach(domain => allSubdomains.add(domain));
    }
    
    if (dnsDumpsterDomains.status === 'fulfilled') {
      dnsDumpsterDomains.value.forEach(domain => allSubdomains.add(domain));
    }

    // Validate subdomains in parallel with a concurrency limit
    const CONCURRENCY_LIMIT = 5;
    const subdomains = Array.from(allSubdomains);
    const validatedSubdomains: SubdomainInfo[] = [];

    for (let i = 0; i < subdomains.length; i += CONCURRENCY_LIMIT) {
      const batch = subdomains.slice(i, i + CONCURRENCY_LIMIT);
      const results = await Promise.allSettled(batch.map(validateSubdomain));

      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          const validation = result.value;
          // Only include subdomains with status code 200
          if (validation.status === 200) {
            validatedSubdomains.push({
              name: validation.name,
              ip: validation.ip,
              status: validation.status,
              title: validation.title,
              isAlive: validation.isAlive,
              protocol: validation.protocol,
              source: certTransparencyDomains.status === 'fulfilled' && 
                     certTransparencyDomains.value.includes(validation.name)
                       ? 'Certificate Transparency'
                       : 'DNSdumpster'
            });
          }
        }
      });
    }

    return validatedSubdomains;
  } catch (error) {
    console.error('Subdomain discovery failed:', { message: error instanceof Error ? error.message : String(error) });
    return [];
  }
}