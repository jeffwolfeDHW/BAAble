/**
 * AgreementsPage - Displays all agreements in a searchable, filterable table
 * Shows agreement details with type, counterparty, dates, version, and signature status
 */

import React, { useState, useMemo } from 'react';
import { Search, Filter, History, CheckCircle, Clock } from 'lucide-react';
import Badge from '@/components/ui/Badge';
import { useAgreements } from '@/context/AgreementContext';
import {
  getAgreementTypeLabel,
  getAgreementTypeColor,
  formatDate,
} from '@/utils/agreement-helpers';
import { Agreement } from '@/types/index';

interface AgreementsPageProps {
  onSelectAgreement: (agreement: Agreement) => void;
}

const AgreementsPage: React.FC<AgreementsPageProps> = ({ onSelectAgreement }) => {
  const { agreements } = useAgreements();
  const [searchQuery, setSearchQuery] = useState('');

  // Filter agreements based on search
  const filteredAgreements = useMemo(() => {
    if (!searchQuery.trim()) {
      return agreements;
    }

    const query = searchQuery.toLowerCase();
    return agreements.filter(
      (agreement) =>
        agreement.name.toLowerCase().includes(query) ||
        agreement.counterparty.toLowerCase().includes(query) ||
        getAgreementTypeLabel(agreement.type).toLowerCase().includes(query)
    );
  }, [agreements, searchQuery]);

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">All Agreements</h1>

        {/* Search and Filter Row */}
        <div className="flex gap-3 flex-wrap">
          <div className="flex-1 min-w-64 relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search agreements..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2 text-gray-700 font-medium">
            <Filter className="w-4 h-4" />
            Filter
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                Agreement Name
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Type</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                Counterparty
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                Effective Date
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Version</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                Signature
              </th>
              <th className="px-6 py-3 text-center text-sm font-semibold text-gray-900">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredAgreements.length > 0 ? (
              filteredAgreements.map((agreement) => {
                const typeColor = getAgreementTypeColor(agreement.type);
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
                    <td className="px-6 py-4 text-sm text-gray-700">{agreement.counterparty}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {formatDate(agreement.effectiveDate)}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex items-center gap-1 bg-gray-100 px-2.5 py-1 rounded w-fit">
                        <History className="w-4 h-4 text-gray-600" />
                        <span className="text-gray-700 font-medium">{agreement.currentVersion}</span>
                      </div>
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
                    <td className="px-6 py-4 text-sm text-center">
                      <button
                        onClick={() => onSelectAgreement(agreement)}
                        className="text-indigo-600 hover:text-indigo-700 font-medium hover:underline"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                  No agreements found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      {filteredAgreements.length > 0 && (
        <div className="px-6 py-4 border-t border-gray-200 text-sm text-gray-600">
          Showing {filteredAgreements.length} of {agreements.length} agreements
        </div>
      )}
    </div>
  );
};

export default AgreementsPage;
