import axios from 'axios';
import type { EmailInfo } from '../types/domain';

export async function fetchEmailAddresses(domain: string): Promise<EmailInfo[]> {
  try {
    const apiKey = import.meta.env.VITE_HUNTER_API_KEY;
    if (!apiKey) {
      throw new Error('Hunter.io API key not found');
    }

    const response = await axios.get('https://api.hunter.io/v2/domain-search', {
      params: {
        domain,
        api_key: apiKey
      }
    });

    if (!response.data?.data?.emails) {
      return [];
    }

    return response.data.data.emails.map((email: any) => ({
      address: email.value,
      source: email.sources?.[0]?.domain || 'Hunter.io'
    }));
  } catch (error) {
    console.error('Email discovery failed:', error);
    return [];
  }
}