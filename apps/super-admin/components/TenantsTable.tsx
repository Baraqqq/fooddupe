'use client';

import { useState } from 'react';
import { superAdminApi } from '@/lib/api';
import {
  PencilIcon,
  TrashIcon,
  EyeIcon,
  MagnifyingGlassIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';

interface Tenant {
  id: string;
  name: string;
  subdomain: string;
  email: string;
  phone: string;
  status: 'ACTIVE' | 'TRIAL' | 'SUSPENDED' | 'CANCELLED';
  plan: string;
  monthlyRevenue: number;
  totalOrders: number;
  createdAt: string;
  trialEndsAt?: string;
  owner: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

interface TenantsTableProps {
  tenants: Tenant[];
  onUpdate: (tenants: Tenant[]) => void;
}

export default function TenantsTable({ tenants, onUpdate }: TenantsTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [planFilter, setPlanFilter] = useState<string>('all');

  const filteredTenants = tenants.filter(tenant => {
    const matchesSearch = tenant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tenant.subdomain.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tenant.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || tenant.status === statusFilter;
    const matchesPlan = planFilter === 'all' || tenant.plan === planFilter;
    
    return matchesSearch && matchesStatus && matchesPlan;
  });

  const handleStatusChange = async (tenantId: string, newStatus: string) => {
    try {
      await superAdminApi.updateTenant(tenantId, { status: newStatus });
      
      const updatedTenants = tenants.map(tenant =>
        tenant.id === tenantId ? { ...tenant, status: newStatus as any } : tenant
      );
      onUpdate(updatedTenants);
    } catch (error) {
      console.error('Failed to update tenant status:', error);
      alert('Kon status niet wijzigen');
    }
  };

  const handleDeleteTenant = async (tenantId: string) => {
    if (!confirm('Weet je zeker dat je dit restaurant wilt verwijderen?')) {
      return;
    }

    try {
      await superAdminApi.deleteTenant(tenantId);
      const updatedTenants = tenants.filter(tenant => tenant.id !== tenantId);
      onUpdate(updatedTenants);
    } catch (error) {
      console.error('Failed to delete tenant:', error);
      alert('Kon restaurant niet verwijderen');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800';
      case 'TRIAL': return 'bg-yellow-100 text-yellow-800';
      case 'SUSPENDED': return 'bg-red-100 text-red-800';
      case 'CANCELLED': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'starter': return 'bg-blue-100 text-blue-800';
      case 'professional': return 'bg-purple-100 text-purple-800';
      case 'enterprise': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('nl-NL', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const getTrialDaysLeft = (trialEndsAt?: string) => {
    if (!trialEndsAt) return null;
    
    const now = new Date();
    const trialEnd = new Date(trialEndsAt);
    const diffTime = trialEnd.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays > 0 ? diffDays : 0;
  };

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Header & Filters */}
      <div className="p-6 border-b">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <h3 className="text-lg font-semibold text-gray-900">
            Restaurants ({filteredTenants.length})
          </h3>
          
          <div className="flex space-x-4">
            {/* Search */}
            <div className="relative">
              <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Zoek restaurants..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Alle statussen</option>
              <option value="ACTIVE">Actief</option>
              <option value="TRIAL">Trial</option>
              <option value="SUSPENDED">Opgeschort</option>
              <option value="CANCELLED">Geannuleerd</option>
            </select>
            
            {/* Plan Filter */}
            <select
              value={planFilter}
              onChange={(e) => setPlanFilter(e.target.value)}
              className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Alle plannen</option>
              <option value="starter">Starter</option>
              <option value="professional">Professional</option>
              <option value="enterprise">Enterprise</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Restaurant
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Plan
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Maand Omzet
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Orders
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Aangemaakt
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acties
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredTenants.map((tenant) => {
              const trialDaysLeft = getTrialDaysLeft(tenant.trialEndsAt);
              
              return (
                <tr key={tenant.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="flex items-center">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{tenant.name}</div>
                          <div className="text-sm text-gray-500">{tenant.subdomain}.fooddupe.nl</div>
                          <div className="text-sm text-gray-500">{tenant.owner.firstName} {tenant.owner.lastName}</div>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col space-y-1">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(tenant.status)}`}>
                        {tenant.status}
                      </span>
                      {tenant.status === 'TRIAL' && trialDaysLeft !== null && (
                        <span className="text-xs text-orange-600">
                          {trialDaysLeft} dagen over
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPlanColor(tenant.plan)}`}>
                      {tenant.plan}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    €{tenant.monthlyRevenue.toLocaleString('nl-NL', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {tenant.totalOrders.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(tenant.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    <button
                      onClick={() => window.open(`http://${tenant.subdomain}.localhost:3000`, '_blank')}
                      className="text-blue-600 hover:text-blue-900"
                      title="Bekijk website"
                    >
                      <EyeIcon className="w-4 h-4" />
                    </button>
                    
                    <select
                      value={tenant.status}
                      onChange={(e) => handleStatusChange(tenant.id, e.target.value)}
                      className="text-sm border rounded px-2 py-1 focus:ring-1 focus:ring-blue-500"
                      title="Wijzig status"
                    >
                      <option value="ACTIVE">Actief</option>
                      <option value="TRIAL">Trial</option>
                      <option value="SUSPENDED">Opgeschort</option>
                      <option value="CANCELLED">Geannuleerd</option>
                    </select>
                    
                    <button
                      onClick={() => handleDeleteTenant(tenant.id)}
                      className="text-red-600 hover:text-red-900"
                      title="Verwijder restaurant"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {filteredTenants.length === 0 && (
        <div className="p-6 text-center text-gray-500">
          <p>Geen restaurants gevonden</p>
        </div>
      )}
    </div>
  );
}