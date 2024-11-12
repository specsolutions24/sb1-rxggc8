import React from 'react';
import { Globe, Mail, Users, Share2, Building2, Cpu, Calendar, User, Server, Link2 } from 'lucide-react';
import type { DomainInfo } from '../types/domain';

interface DomainDetailsProps {
  domainInfo: DomainInfo;
}

export function DomainDetails({ domainInfo }: DomainDetailsProps) {
  const { whois, dns, subdomains, emails, socialMedia, employees, technologies } = domainInfo;

  const SectionHeader = ({ icon: Icon, title }: { icon: React.ElementType, title: string }) => (
    <div className="p-4 bg-slate-800/50 rounded-t-lg border-b border-slate-700/50 flex items-center gap-2">
      <Icon className="w-5 h-5 text-sky-400" />
      <h2 className="text-xl font-semibold text-white">{title}</h2>
    </div>
  );

  // Extract employee names from email addresses
  const employeeNames = emails.map(email => {
    const name = email.address.split('@')[0];
    return {
      name: name.charAt(0).toUpperCase() + name.slice(1),
      source: email.source
    };
  });

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Domain Information */}
      <section className="bg-slate-800/30 rounded-lg shadow-lg overflow-hidden transform hover:shadow-xl transition-shadow duration-300 ring-1 ring-slate-700/50">
        <SectionHeader icon={Globe} title="Domain Information" />
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium mb-4 text-white">WHOIS Information</h3>
              <dl className="space-y-3">
                <InfoItem icon={Building2} label="Registrar" value={whois.registrar} />
                <InfoItem icon={Calendar} label="Creation Date" value={whois.creationDate} />
                <InfoItem icon={Calendar} label="Expiry Date" value={whois.expiryDate} />
                <InfoItem icon={User} label="Organization" value={whois.registrant.organization} />
              </dl>
            </div>
            <div>
              <h3 className="text-lg font-medium mb-4 text-white">DNS Records</h3>
              <div className="space-y-4">
                {Object.entries(dns).map(([recordType, records]) => (
                  <div key={recordType} className="bg-slate-800/50 rounded-lg p-3">
                    <dt className="text-sm font-medium text-sky-400 mb-2 capitalize">{recordType} Records</dt>
                    {records.map((record, index) => (
                      <dd key={index} className="text-sm text-slate-300 ml-4">
                        {record.value}
                      </dd>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Email Addresses */}
      <section className="bg-slate-800/30 rounded-lg shadow-lg overflow-hidden transform hover:shadow-xl transition-shadow duration-300 ring-1 ring-slate-700/50">
        <SectionHeader icon={Mail} title="Email Addresses" />
        <div className="p-6">
          {emails.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {emails.map((email, index) => (
                <div key={index} className="p-4 bg-slate-800/50 rounded-lg hover:bg-slate-700/50 transition-colors duration-300">
                  <p className="font-medium text-white">{email.address}</p>
                  <p className="text-sm text-slate-400">Source: {email.source}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-400">No email addresses found</p>
          )}
        </div>
      </section>

      {/* Employee Information */}
      <section className="bg-slate-800/30 rounded-lg shadow-lg overflow-hidden transform hover:shadow-xl transition-shadow duration-300 ring-1 ring-slate-700/50">
        <SectionHeader icon={Users} title="Employee Information" />
        <div className="p-6">
          {employeeNames.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {employeeNames.map((employee, index) => (
                <div key={index} className="p-4 bg-slate-800/50 rounded-lg hover:bg-slate-700/50 transition-colors duration-300">
                  <p className="font-medium text-white">{employee.name}</p>
                  <p className="text-sm text-slate-400">Source: {employee.source}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-400">No employee information found</p>
          )}
        </div>
      </section>

      {/* Social Media Presence */}
      <section className="bg-slate-800/30 rounded-lg shadow-lg overflow-hidden transform hover:shadow-xl transition-shadow duration-300 ring-1 ring-slate-700/50">
        <SectionHeader icon={Share2} title="Social Media Presence" />
        <div className="p-6">
          {socialMedia.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {socialMedia.map((profile, index) => (
                <div key={index} className="p-4 bg-slate-800/50 rounded-lg hover:bg-slate-700/50 transition-colors duration-300">
                  <p className="font-medium text-white capitalize mb-1">{profile.platform}</p>
                  <a 
                    href={profile.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sky-400 hover:text-sky-300 hover:underline flex items-center gap-1"
                  >
                    <Link2 className="w-4 h-4" />
                    @{profile.username}
                  </a>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-400">No social media profiles found</p>
          )}
        </div>
      </section>

      {/* Subdomains */}
      <section className="bg-slate-800/30 rounded-lg shadow-lg overflow-hidden transform hover:shadow-xl transition-shadow duration-300 ring-1 ring-slate-700/50">
        <SectionHeader icon={Server} title={`Subdomains (${subdomains.length})`} />
        <div className="p-6">
          {subdomains.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {subdomains.map((subdomain, index) => (
                <div key={index} className="p-4 bg-slate-800/50 rounded-lg hover:bg-slate-700/50 transition-colors duration-300">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`w-2 h-2 rounded-full ${subdomain.isAlive ? 'bg-emerald-500' : 'bg-red-500'}`} />
                    <h3 className="font-medium text-sm break-all text-white">{subdomain.name}</h3>
                  </div>
                  <div className="text-xs space-y-1 text-slate-300">
                    {subdomain.protocol && <p>Protocol: {subdomain.protocol.toUpperCase()}</p>}
                    {subdomain.status && <p>Status: {subdomain.status}</p>}
                    {subdomain.ip && <p>IP: {subdomain.ip}</p>}
                    {subdomain.title && <p>Title: {subdomain.title}</p>}
                    <p className="text-slate-400">Source: {subdomain.source}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-400">No subdomains found</p>
          )}
        </div>
      </section>

      {/* Technologies */}
      <section className="bg-slate-800/30 rounded-lg shadow-lg overflow-hidden transform hover:shadow-xl transition-shadow duration-300 ring-1 ring-slate-700/50">
        <SectionHeader icon={Cpu} title="Technologies Used" />
        <div className="p-6">
          {technologies.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {technologies.map((tech, index) => (
                <div key={index} className="p-4 bg-slate-800/50 rounded-lg hover:bg-slate-700/50 transition-colors duration-300">
                  <p className="font-medium text-white">{tech.name}</p>
                  <p className="text-sm text-slate-400">{tech.category}</p>
                  {tech.version && (
                    <p className="text-xs text-slate-500 mt-1">Version: {tech.version}</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-400">No technology information found</p>
          )}
        </div>
      </section>
    </div>
  );
}

function InfoItem({ icon: Icon, label, value }: { icon: React.ElementType, label: string, value?: string }) {
  return (
    <div className="flex items-start gap-2">
      <Icon className="w-4 h-4 text-sky-400 mt-1" />
      <div>
        <dt className="text-sm text-slate-400">{label}</dt>
        <dd className="font-medium text-white">{value || 'N/A'}</dd>
      </div>
    </div>
  );
}