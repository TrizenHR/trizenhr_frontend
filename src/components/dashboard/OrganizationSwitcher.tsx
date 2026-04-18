import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { organizationApi } from '@/lib/api';
import { Organization, UserRole } from '@/lib/types';

export function OrganizationSwitcher() {
  const { user, selectedOrganizationId, setSelectedOrganizationId } = useAuth();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchOrgs = async () => {
      if (user?.role === UserRole.SUPER_ADMIN) {
        setLoading(true);
        try {
          const orgs = await organizationApi.getAll();
          setOrganizations(orgs);
        } catch (error) {
          console.error('Failed to fetch organizations:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchOrgs();
  }, [user]);

  if (!user || user.role !== UserRole.SUPER_ADMIN) {
    return null;
  }

  return (
    <div className="flex max-w-[min(16rem,calc(100vw-12rem))] min-w-0 items-center">
      <div className="relative w-full">
        <select
          value={selectedOrganizationId || ''}
          onChange={(e) => setSelectedOrganizationId(e.target.value || null)}
          className="w-full appearance-none rounded border border-gray-300 bg-white py-2 pl-3 pr-8 text-sm leading-tight text-gray-700 focus:border-blue-500 focus:bg-white focus:outline-none"
          disabled={loading}
        >
          <option value="">Global View (All Organizations)</option>
          {organizations.map((org) => (
            <option key={org._id} value={org._id}>
              {org.name}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
          <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
            <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
          </svg>
        </div>
      </div>
      {selectedOrganizationId && (
        <span className="text-xs text-blue-600 font-medium bg-blue-50 px-2 py-1 rounded">
          Viewing as Organization Admin
        </span>
      )}
    </div>
  );
}
