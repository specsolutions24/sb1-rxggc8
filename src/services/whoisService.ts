import type { WhoisInfo } from '../types/domain';

function parseXMLResponse(xmlText: string) {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlText, "text/xml");
  
  const getValue = (tagName: string): string => {
    const element = xmlDoc.getElementsByTagName(tagName)[0];
    return element ? element.textContent || '' : '';
  };

  const getNameservers = (): string[] => {
    const nameServers = xmlDoc.getElementsByTagName('nameServer');
    return Array.from(nameServers).map(ns => ns.textContent || '').filter(Boolean);
  };

  return {
    registrarName: getValue('registrarName'),
    createdDate: getValue('createdDate'),
    expiresDate: getValue('expiresDate'),
    registrant: {
      organization: getValue('registrantOrganization'),
      country: getValue('registrantCountry')
    },
    nameServers: getNameservers()
  };
}

export async function fetchWhoisInfo(domain: string): Promise<WhoisInfo> {
  try {
    const apiKey = import.meta.env.VITE_WHOIS_API_KEY;
    if (!apiKey) {
      throw new Error('WHOIS API key not found');
    }

    const response = await fetch(`https://www.whoisxmlapi.com/whoisserver/WhoisService?apiKey=${apiKey}&domainName=${domain}&outputFormat=XML`);
    
    if (!response.ok) {
      throw new Error(`WHOIS API request failed: ${response.status}`);
    }

    const xmlText = await response.text();
    const data = parseXMLResponse(xmlText);
    
    return {
      registrar: data.registrarName || '',
      creationDate: data.createdDate || '',
      expiryDate: data.expiresDate || '',
      nameservers: data.nameServers,
      registrant: {
        organization: data.registrant.organization || '',
        country: data.registrant.country || ''
      }
    };
  } catch (error) {
    console.error('WHOIS lookup failed:', { message: error instanceof Error ? error.message : String(error) });
    return {
      registrar: '',
      creationDate: '',
      expiryDate: '',
      nameservers: [],
      registrant: {
        organization: '',
        country: ''
      }
    };
  }
}