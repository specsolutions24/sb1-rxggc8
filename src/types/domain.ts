export interface WhoisInfo {
  registrar: string;
  creationDate: string;
  expiryDate: string;
  nameservers: string[];
  registrant: {
    organization: string;
    country: string;
  };
}

export interface DNSRecord {
  type: string;
  value: string;
  ttl?: number;
}

export interface DNSRecords {
  a: DNSRecord[];
  aaaa: DNSRecord[];
  mx: DNSRecord[];
  ns: DNSRecord[];
}

export interface SubdomainInfo {
  name: string;
  ip?: string;
  status?: number;
  title?: string;
  isAlive: boolean;
  protocol: 'http' | 'https' | null;
  source: string;
}

export interface EmailInfo {
  address: string;
  source: string;
}

export interface SocialMediaInfo {
  platform: string;
  url: string;
  username: string;
}

export interface EmployeeInfo {
  name?: string;
  title?: string;
  email?: string;
  source: string;
}

export interface TechnologyInfo {
  name: string;
  category: string;
  version?: string;
}

export interface DomainInfo {
  whois: WhoisInfo;
  dns: DNSRecords;
  subdomains: SubdomainInfo[];
  emails: EmailInfo[];
  socialMedia: SocialMediaInfo[];
  employees: EmployeeInfo[];
  technologies: TechnologyInfo[];
  error?: string;
}