import type { DomainInfo } from '../types/domain';
import { fetchWhoisInfo } from './whoisService';
import { fetchDNSRecords } from './dnsService';
import { fetchSubdomains } from './subdomainService';
import { fetchEmailAddresses } from './emailService';
import { fetchSocialMedia } from './socialMediaService';
import { detectTechnologies } from './technologyService';

export async function getDomainInfo(domain: string): Promise<DomainInfo> {
  try {
    const [whois, dns, subdomains, emails, socialMedia, technologies] = await Promise.all([
      fetchWhoisInfo(domain),
      fetchDNSRecords(domain),
      fetchSubdomains(domain),
      fetchEmailAddresses(domain),
      fetchSocialMedia(domain),
      detectTechnologies(domain)
    ]);

    return {
      whois,
      dns,
      subdomains,
      emails,
      socialMedia,
      employees: [],
      technologies
    };
  } catch (error) {
    console.error('Error fetching domain information:', error);
    return {
      whois: {
        registrar: '',
        creationDate: '',
        expiryDate: '',
        nameservers: [],
        registrant: {
          organization: '',
          country: ''
        }
      },
      dns: {
        a: [],
        aaaa: [],
        mx: [],
        ns: []
      },
      subdomains: [],
      emails: [],
      socialMedia: [],
      employees: [],
      technologies: [],
      error: 'Failed to fetch domain information'
    };
  }
}