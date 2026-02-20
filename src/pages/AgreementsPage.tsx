/**
 * AgreementsPage - Displays all agreements in a searchable, filterable table
 * Full CRUD operations with filters, sort, delete, and edit capabilities
 */

import React, { useState, useMemo, useCallback } from 'react';
import {
  Search,
  Filter,
  History,
  CheckCircle,
  Clock,
  Trash2,
  Edit,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';
import Badge from '@/components/ui/Badge';
import { useAgreements } from '@/context/AgreementContext';
import {
  getAgreementTypeLabel,
  getAgreementTypeColor,
  getAgreementStatusColor,
  formatDate,
  formatDateTime,
} from '@/utils/agreement-helpers';
import { Agreement, AgreementType, AgreementStatus, SignatureStatus } from '@/types/index';

interface AgreementsPageProps {
  onSelectAgreement: (agreement: Agreement) => void;
  onEditAgreement?: (agreement: Agreement) => void;
}

type SortField = 'name' | 'counterparty' | 'effectiveDate' | 'expirationDate';
type SortDirection = 'asc' | 'desc';

const AgreementsPage: React.FC<AgreementsPageProps> = ({
  onSelectAgreement,
  onEditAgreement,
}) => {
  const { agreements, removeAgreement, isLoading } = useAgreements();

  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | AgreementType>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | AgreementStatus>('all');
  const [signatureFilter, setSignatureFilter] = useState<'all' | SignatureStatus>('all');

  // Sort state
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  // Delete confirmation state
  const [deleteConfirm, setDeleteConfirm] = useState<string | number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Filter and sort agreements
  const filteredAndSortedAgreements = useMemo(() => {
    let result = [...agreements];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (agreement) =>
          agreement.name.toLowerCase().includes(query) ||
          agreement.counterparty.toLowerCase().includes(query) ||
          getAgreementTypeLabel(agreement.type).toLowerCase().includes(query)
      );
    }

    // Apply type filter
    if (typeFilter !== 'all') {
      result = result.filter((agreement) => agreement.type === typeFilter);
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      result = result.filter((agreement) => agreement.status === statusFilter);
    }

    // Apply signature status filter
    if (signatureFilter !== 'all') {
      result = result.filter((agreement) => agreement.signatureStatus === signatureFilter);
    }

    // Apply sorting
    result.sort((a, b) => {
      let aVal: any;
      let bVal: any;

      switch (sortField) {
        case 'name':
          aVal = a.name.toLowerCase();
          bVal = b.name.toLowerCase();
          break;
        case 'counterparty':
          aVal = a.counterparty.toLowerCase();
          bVal = b.counterparty.toLowerCase();
          break;
        case 'effectiveDate':
          aVal = new Date(a.effectiveDate).getTime();
          bVal = new Date(b.effectiveDate).getTime();
          break;
        case 'expirationDate':
          aVal = new Date(a.expirationDate).getTime();
          bVal = new Date(b.expirationDate).getTime();
          break;
        default:
          aVal = a.name;
          bVal = b.name;
      }

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [agreements, searchQuery, typeFilter, statusFilter, signatureFilter, sortField, sortDirection]);

  const handleSort = useCallback((field: SortField) => {
    setSortField(field);
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortDirection('asc');
    }
  }, [sortField, sortDirection]);

  const handleDelete = useCallback(
    async (id: string | number) => {
      if (deleteConfirm !== id) {
        setDeleteConfirm(id);
        return;
      }

      try {
        setIsDeleting(true);
        await removeAgreement(id);
        setDeleteConfirm(null);
      } catch (error) {
        console.error('Error deleting agreement:', error);
        alert('Failed to delete agreement. Please try again.');
      } finally {
        setIsDeleting(false);
      }
    },
    [deleteConfirm, removeAgreement]
  );

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return <ChevronDown className="w-4 h-4 text-gray-400" />;
    return sortDirection === 'asc' ? (
      <ChevronUp className="w-4 h-4 text-indigo-600" />
    ) : (
      <ChevronDown className="w-4 h-4 text-indigo-600" />
    );
  };

  const SortHeader: React.FC<{ field: SortField; label: string }> = ({ field, label }) => (
    <button
      onClick={() => handleSort(field)}
      className="flex items-center gap-2 hover:text-indigo-600 transition-colors text-left"
    >
      {label}
      {getSortIcon(field)}
    </button>
  );

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">All Agreements</h1>

        {/* Search and Filter Row */}
        <div className="space-y-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search agreements by name, counterparty..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              disabled={isLoading}
            />
          </div>

          {/* Filter Controls */}
          <div className="flex gap-3 flex-wrap">
            {/* Type Filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-600" />
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as 'all' | AgreementType)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                disabled={isLoading}
              >
                <option value="all">All Types</option>
                <option value="covered-entity">Covered Entity</option>
                <option value="business-associate">Business Associate</option>
                <option value="subcontractor">Subcontractor</option>
              </select>
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'all' | AgreementStatus)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
              disabled={isLoading}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="draft">Draft</option>
              <option value="expired">Expired</option>
            </select>

            {/* Signature Status Filter */}
            <select
              value={signatureFilter}
              onChange={(e) => setSignatureFilter(e.target.value as 'all' | SignatureStatus)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
              disabled={isLoading}
            >
              <option value="all">All Signature Status</option>
              <option value="fully-executed">Fully Executed</option>
              <option value="pending">Pending</option>
              <option value="unsigned">Unsigned</option>
            </select>

            {/* Reset Filters Button */}
            {(typeFilter !== 'all' ||
              statusFilter !== 'all' ||
              signatureFilter !== 'all' ||
              searchQuery) && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setTypeFilter('all');
                  setStatusFilter('all');
                  setSignatureFilter('all');
                }}
                className="px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                disabled={isLoading}
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="p-12 text-center">
          <div className="inline-block">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
          <p className="text-gray-600 mt-2">Loading agreements...</p>
        </div>
      )}

      {/* Table */}
      {!isLoading && (
        <>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    <SortHeader field="name" label="Agreement Name" />
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    <SortHeader field="counterparty" label="Counterparty" />
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    <SortHeader field="effectiveDate" label="Effective Date" />
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    <SortHeader field="expirationDate" label="Expires" />
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Signature
                  </th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-gray-900">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredAndSortedAgreements.length > 0 ? (
                  filteredAndSortedAgreements.map((agreement) => {
                    const typeColor = getAgreementTypeColor(agreement.type);
                    const statusColor = getAgreementStatusColor(agreement.status);
                    const isExecuted = agreement.signatureStatus === 'fully-executed';

                    return (
                      <tr
                        key={agreement.id}
                        className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                          {agreement.name}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <Badge variant={typeColor as any} size="sm">
                            {getAgreementTypeLabel(agreement.type)}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">
                          {agreement.counterparty}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">
                          {formatDate(agreement.effectiveDate)}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">
                          {formatDate(agreement.expirationDate)}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <Badge
                            variant={
                              agreement.status === 'active'
                                ? 'green'
                                : agreement.status === 'draft'
                                  ? 'gray'
                                  : 'red'
                            }
                            size="sm"
                          >
                            {agreement.status.charAt(0).toUpperCase() + agreement.status.slice(1)}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <div
                            className={`flex items-center gap-2 ${
                              isExecuted ? 'text-green-700' : 'text-yellow-700'
                            }`}
                          >
                            {isExecuted ? (
                              <>
                                <CheckCircle className="w-4 h-4" />
                                <span>Executed</span>
                              </>
                            ) : (
                              <>
                                <Clock className="w-4 h-4" />
                                <span>Pending</span>
                              </>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => onSelectAgreement(agreement)}
                              className="p-1 text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                              title="View details"
                            >
                              <History className="w-4 h-4" />
                            </button>
                            {onEditAgreement && (
                              <button
                                onClick={() => onEditAgreement(agreement)}
                                className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                title="Edit agreement"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              onClick={() => handleDelete(agreement.id)}
                              disabled={isDeleting && deleteConfirm === agreement.id}
                              className={`p-1 rounded transition-colors ${
                                deleteConfirm === agreement.id
                                  ? 'bg-red-100 text-red-700 hover:bg-red-200'
                                  : 'text-red-600 hover:bg-red-50'
                              }`}
                              title={
                                deleteConfirm === agreement.id
                                  ? 'Click again to confirm delete'
                                  : 'Delete agreement'
                              }
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center">
                      <p className="text-gray-500 text-lg mb-2">No agreements found</p>
                      <p className="text-gray-400 text-sm">
                        {searchQuery || typeFilter !== 'all' || statusFilter !== 'all'
                          ? 'Try adjusting your filters or search query'
                          : 'Create your first agreement to get started'}
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          {filteredAndSortedAgreements.length > 0 && (
            <div className="px-6 py-4 border-t border-gray-200 text-sm text-gray-600">
              Showing {filteredAndSortedAgreements.length} of {agreements.length} agreements
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AgreementsPage;
