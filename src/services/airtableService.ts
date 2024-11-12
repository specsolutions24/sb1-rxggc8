import Airtable from 'airtable';
import type { DomainInfo } from '../types/domain';

const AIRTABLE_API_KEY = import.meta.env.VITE_AIRTABLE_API_KEY;
const AIRTABLE_BASE_ID = import.meta.env.VITE_AIRTABLE_BASE_ID;

if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID) {
  throw new Error('Missing required Airtable configuration. Please check your .env file.');
}

const base = new Airtable({ apiKey: AIRTABLE_API_KEY }).base(AIRTABLE_BASE_ID);

const TABLES = {
  DOMAINS: 'Domains',
  DNS_RECORDS: 'DNS Records',
  SUBDOMAINS: 'Subdomains',
  EMAILS: 'Emails',
  EMPLOYEES: 'Employees',
  SOCIAL_MEDIA: 'Social Media',
  TECHNOLOGIES: 'Technologies',
  USERS: 'Users',
} as const;

function extractEmployeeNameFromEmail(email: string): string {
  const name = email.split('@')[0];
  return name.split(/[._-]/)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ');
}

export async function storeDomainInfo(domain: string, info: DomainInfo, userId: string): Promise<string> {
  try {
    const scanStartTime = new Date().toISOString();

    // Create main domain record
    const [domainRecord] = await base(TABLES.DOMAINS).create([
      {
        fields: {
          'DomainName': domain,
          'RegistrarName': info.whois.registrar,
          'CreatedDate': info.whois.creationDate,
          'ExpiryDate': info.whois.expiryDate,
          'RegistrantOrganization': info.whois.registrant.organization,
          'RegistrantCountry': info.whois.registrant.country,
          'LastScanned': scanStartTime,
          'CompletedAt': new Date().toISOString(),
          'UserId': [userId],
        },
      },
    ]);

    const domainId = domainRecord.getId();

    // Update user's Domains field with deduplication
    const userRecord = await base(TABLES.USERS).find(userId);
    const existingDomains = new Set((userRecord.fields['Domains'] as string[]) || []);
    existingDomains.add(domainId); // Using Set ensures no duplicates

    await base(TABLES.USERS).update([
      {
        id: userId,
        fields: {
          'Domains': Array.from(existingDomains)
        }
      }
    ]);

    // Store DNS records
    const dnsPromises = Object.entries(info.dns).flatMap(([type, records]) =>
      records.map(record =>
        base(TABLES.DNS_RECORDS).create([
          {
            fields: {
              'DomainId': [domainId],
              'RecordType': type.toUpperCase(),
              'Value': record.value,
              'TTL': record.ttl,
            },
          },
        ])
      )
    );

    // Store subdomains
    const subdomainPromises = info.subdomains.map(subdomain =>
      base(TABLES.SUBDOMAINS).create([
        {
          fields: {
            'DomainId': [domainId],
            'SubdomainName': subdomain.name,
            'IPAddress': subdomain.ip || '',
            'StatusCode': subdomain.status,
            'PageTitle': subdomain.title || '',
            'IsActive': subdomain.isAlive,
            'ProtocolType': subdomain.protocol || '',
            'DiscoverySource': subdomain.source,
          },
        },
      ])
    );

    // Store emails and create employee records
    const emailPromises = info.emails.map(async email => {
      // Create email record
      await base(TABLES.EMAILS).create([
        {
          fields: {
            'DomainId': [domainId],
            'EmailAddress': email.address,
            'DiscoverySource': email.source,
          },
        },
      ]);

      // Create employee record from email
      await base(TABLES.EMPLOYEES).create([
        {
          fields: {
            'DomainId': [domainId],
            'Name': extractEmployeeNameFromEmail(email.address),
            'EmailAddress': email.address,
          },
        },
      ]);
    });

    // Store social media
    const socialPromises = info.socialMedia.map(social =>
      base(TABLES.SOCIAL_MEDIA).create([
        {
          fields: {
            'DomainId': [domainId],
            'Platform': social.platform,
            'ProfileURL': social.url,
            'Username': social.username,
          },
        },
      ])
    );

    // Store technologies
    const techPromises = info.technologies.map(tech =>
      base(TABLES.TECHNOLOGIES).create([
        {
          fields: {
            'DomainId': [domainId],
            'TechnologyName': tech.name,
            'Category': tech.category,
            'Version': tech.version || '',
          },
        },
      ])
    );

    // Wait for all records to be created
    await Promise.all([
      ...dnsPromises,
      ...subdomainPromises,
      ...emailPromises,
      ...socialPromises,
      ...techPromises,
    ]);

    return domainId;
  } catch (error) {
    console.error('Failed to store domain information:', error);
    throw error;
  }
}