import axios from 'axios';
import type { DNSRecords, DNSRecord } from '../types/domain';

const createDefaultDNSRecords = (): DNSRecords => ({
  a: [],
  aaaa: [],
  mx: [],
  ns: []
});

export async function fetchDNSRecords(domain: string): Promise<DNSRecords> {
  try {
    const types = ['A', 'AAAA', 'MX', 'NS'];
    const requests = types.map(type => 
      axios.get('https://dns.google/resolve', {
        params: { name: domain, type }
      })
    );
    
    const responses = await Promise.all(requests);
    const records = createDefaultDNSRecords();
    
    responses.forEach((response, index) => {
      const type = types[index].toLowerCase() as keyof DNSRecords;
      if (response.data.Answer) {
        records[type] = response.data.Answer.map(record => ({
          type: types[index],
          value: String(record.data),
          ttl: Number(record.TTL)
        }));
      }
    });
    
    return records;
  } catch (error) {
    console.error('DNS lookup failed:', error);
    return createDefaultDNSRecords();
  }
}