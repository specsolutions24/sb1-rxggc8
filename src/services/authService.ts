import Airtable from 'airtable';
import { toast } from 'react-hot-toast';

const base = new Airtable({ apiKey: import.meta.env.VITE_AIRTABLE_API_KEY }).base(import.meta.env.VITE_AIRTABLE_BASE_ID);

export interface User {
  id: string;
  email: string;
  name: string;
  lastLogin: string;
}

export interface UserScan {
  id: string;
  domainName: string;
  scanStarted: string;
  scanEnded: string;
  registrar: string;
  organization: string;
}

export async function loginUser(email: string, password: string): Promise<User | null> {
  try {
    const records = await base('Users')
      .select({
        filterByFormula: `{Email} = '${email}'`,
        maxRecords: 1
      })
      .firstPage();

    if (records.length === 0) {
      toast.error('User not found');
      return null;
    }

    const user = records[0];
    if (user.fields['Password'] !== password) {
      toast.error('Invalid password');
      return null;
    }

    await base('Users').update([
      {
        id: user.id,
        fields: {
          'LastLogin': new Date().toISOString()
        }
      }
    ]);

    return {
      id: user.id,
      email: user.fields['Email'] as string,
      name: user.fields['Name'] as string,
      lastLogin: new Date().toISOString()
    };
  } catch (error) {
    console.error('Login failed:', error);
    toast.error('Login failed');
    return null;
  }
}

export async function registerUser(email: string, password: string, name: string): Promise<User | null> {
  try {
    const existingUsers = await base('Users')
      .select({
        filterByFormula: `{Email} = '${email}'`,
        maxRecords: 1
      })
      .firstPage();

    if (existingUsers.length > 0) {
      toast.error('User already exists');
      return null;
    }

    const records = await base('Users').create([
      {
        fields: {
          'Email': email,
          'Password': password,
          'Name': name,
          'LastLogin': new Date().toISOString()
        }
      }
    ]);

    const user = records[0];
    return {
      id: user.id,
      email: user.fields['Email'] as string,
      name: user.fields['Name'] as string,
      lastLogin: user.fields['LastLogin'] as string
    };
  } catch (error) {
    console.error('Registration failed:', error);
    toast.error('Registration failed');
    return null;
  }
}

export async function getUserScans(userId: string): Promise<UserScan[]> {
  try {
    // First, get the user's record to get their associated domains
    const userRecord = await base('Users').find(userId);
    
    if (!userRecord || !userRecord.fields['Domains']) {
      return [];
    }

    // Get all domains associated with the user
    const domainIds = userRecord.fields['Domains'] as string[];
    
    if (domainIds.length === 0) {
      return [];
    }

    // Create a formula to fetch all domains by their IDs
    const formula = `OR(${domainIds.map(id => `RECORD_ID()='${id}'`).join(',')})`;

    const records = await base('Domains')
      .select({
        filterByFormula: formula,
        sort: [{ field: 'LastScanned', direction: 'desc' }],
        maxRecords: 20
      })
      .firstPage();

    return records.map(record => ({
      id: record.id,
      domainName: record.fields['DomainName'] as string,
      scanStarted: record.fields['LastScanned'] as string,
      scanEnded: record.fields['CompletedAt'] as string || record.fields['LastScanned'] as string,
      registrar: record.fields['RegistrarName'] as string,
      organization: record.fields['RegistrantOrganization'] as string
    }));
  } catch (error) {
    console.error('Failed to fetch user scans:', error);
    toast.error('Failed to fetch recent scans');
    return [];
  }
}

export async function deleteScan(scanId: string): Promise<boolean> {
  try {
    // First, remove the domain reference from the user's record
    const domainRecord = await base('Domains').find(scanId);
    if (domainRecord.fields['UserId']) {
      const userId = (domainRecord.fields['UserId'] as string[])[0];
      const userRecord = await base('Users').find(userId);
      
      const domains = (userRecord.fields['Domains'] as string[] || [])
        .filter(id => id !== scanId);

      await base('Users').update([{
        id: userId,
        fields: {
          'Domains': domains
        }
      }]);
    }

    // Delete the main domain record
    await base('Domains').destroy([scanId]);

    // Delete related records from other tables
    const tables = ['DNS Records', 'Subdomains', 'Emails', 'Employees', 'Social Media', 'Technologies'];
    
    for (const table of tables) {
      const relatedRecords = await base(table)
        .select({
          filterByFormula: `{DomainId} = '${scanId}'`
        })
        .firstPage();

      if (relatedRecords.length > 0) {
        await base(table).destroy(relatedRecords.map(record => record.id));
      }
    }

    toast.success('Scan deleted successfully');
    return true;
  } catch (error) {
    console.error('Failed to delete scan:', error);
    toast.error('Failed to delete scan');
    return false;
  }
}