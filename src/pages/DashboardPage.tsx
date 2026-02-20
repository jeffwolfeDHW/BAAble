/**
 * DashboardPage - Main dashboard showing key metrics and recent agreements
 * Displays stats cards, compliance alerts, and recent agreements overview
 */

import React, { useState } from 'react';
import {
  FileText,
  CheckCircle,
  AlertTriangle,
  Users,
  Bell,
  History,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import StatCard from '@/components/ui/StatCard';
import Badge from '@/components/ui/Badge';
import { useAgreements } from '@/context/AgreementContext';
import { useTeam } from '@/context/TeamContext';
import { useComplianceAnalysis } from '@/hooks/useComplianceAnalysis';
import {
  getAgreementTypeLabel,
  getAgreementTypeColor,
  formatDate,
  getSignatureStatusColor,
} from '@/utils/agreement-helpers';
import { Agreement } from '@/types/index';

interface DashboardPageProps {
  onSelectAgreement: (agreement: Agreement) => void;
}

const DashboardPage: React.FC<DashboardPageProps> = ({ onSelectAgreement }) => {
  const { agreements } = useAgreements();
  const { teamMembers } = useTeam();
  const { issues, criticalCount, warningCount, hasIssues } = useComplianceAnalysis(agreements);
  const [showComplianceDetails, setShowComplianceDetails] = useState(false);

  // Calculate stats
  const totalAgreements = agreements.length;
  const activeAgreements = agreements.filter((a) => a.status === 'active').length;
  const totalIssues = criticalCount + warningCount;
  const teamMemberCount = teamMembers.filter((m) => m.status === 'active').length;

  // Get first 3 recent agreements
  const recentAgreements = agreements.slice(0, 3);

  return (
    <div className="space-y-6">
      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Agreements"
          value={totalAgreements}
          icon={FileText}
          colorClass="bg-indigo-500"
        />
        <StatCard
          title="Active BAAs"
          value={activeAgreements}
          icon={CheckCircle}
          colorClass="bg-green-500"
        />
        <StatCard
          title="Compliance Issues"
          value={totalIssues}
          icon={AlertTriangle}
          colorClass="bg-orange-500"
        />
        <StatCard
          title="Team Members"
          value={teamMemberCount}
          icon={Users}
          colorClass="bg-purple-500"
        />
      </div>

      {/* Compliance Alerts Section */}
      {hasIssues && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Bell className="w-6 h-6 text-orange-500" />
              <h2 className="text-lg font-bold text-gray-900">Compliance Alerts</h2>
              <Badge variant="orange" size="sm">
                {totalIssues}
              </Badge>
            </div>
            <button
              onClick={() => setShowComplianceDetails(!showComplianceDetails)}
              className="text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
            >
              {showComplianceDetails ? (
                <>
                  Hide Details
                  <ChevronUp className="w-4 h-4" />
                </>
              ) : (
                <>
                  Show Details
                  <ChevronDown className="w-4 h-4" />
                </>
              )}
            </button>
          </div>

          {/* Issues List */}
          <div className="space-y-3">
            {issues.map((issue, index) => {
              const isWarning = issue.type === 'warning';
              const bgColor = isWarning ? 'bg-yellow-50 border-yellow-200' : 'bg-red-50 border-red-200';
              const iconColor = isWarning ? 'text-yellow-600' : 'text-red-600';
              const badgeVariant = isWarning ? 'yellow' : 'red';

              return (
                <div key={index} className={`${bgColor} border rounded-lg p-4`}>
                  <div className="flex items-start gap-3 mb-2">
                    <AlertTriangle className={`w-5 h-5 mt-0.5 flex-shrink-0 ${iconColor}`} />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900">{issue.category}</p>
                      <p className="text-sm text-gray-700 mt-1">{issue.description}</p>
                    </div>
                    <Badge variant={badgeVariant} size="sm">
                      {issue.type.toUpperCase()}
                    </Badge>
                  </div>

                  {/* Details when expanded */}
                  {showComplianceDetails && (
                    <div className="mt-3 ml-8 bg-white rounded p-3 border border-gray-200">
                      <p className="text-sm font-medium text-gray-900 mb-2">Recommendation:</p>
                      <p className="text-sm text-gray-700 mb-3">{issue.recommendation}</p>
                      <p className="text-sm font-medium text-gray-900 mb-2">Affected Agreements:</p>
                      <div className="flex flex-wrap gap-2">
                        {issue.affectedAgreements.map((agreementName, i) => (
                          <Badge key={i} variant="blue" size="sm">
                            {agreementName}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Recent Agreements Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Recent Agreements</h2>

        <div className="space-y-3">
          {recentAgreements.map((agreement) => {
            const hasAlerts = issues.some((issue) =>
              issue.affectedAgreements.includes(agreement.name)
            );
            const typeColor = getAgreementTypeColor(agreement.type);
            const signatureColor = getSignatureStatusColor(agreement.signatureStatus);

            return (
              <div
                key={agreement.id}
                onClick={() => onSelectAgreement(agreement)}
                className="p-4 border rounded-lg hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer"
              >
                <div className="flex items-start gap-3">
                  <FileText className="w-5 h-5 text-gray-500 mt-1 flex-shrink-0" />

                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900">{agreement.name}</p>
                    <p className="text-sm text-gray-600">{agreement.counterparty}</p>

                    <div className="flex flex-wrap gap-2 mt-2">
                      {/* Version Badge */}
                      <div className="flex items-center gap-1 bg-gray-100 px-2.5 py-1 rounded text-xs text-gray-700 font-medium">
                        <History className="w-3 h-3" />
                        v{agreement.currentVersion}
                      </div>

                      {/* Signature Status */}
                      <div
                        className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium ${
                          agreement.signatureStatus === 'fully-executed'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}
                      >
                        <CheckCircle className="w-3 h-3" />
                        {agreement.signatureStatus === 'fully-executed' ? 'Executed' : 'Pending'}
                      </div>

                      {/* Alerts indicator */}
                      {hasAlerts && (
                        <div className="flex items-center gap-1 bg-red-100 px-2.5 py-1 rounded text-xs text-red-700 font-medium">
                          <Bell className="w-3 h-3" />
                          Alert
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex-shrink-0 text-right">
                    <Badge variant={typeColor as any} size="sm">
                      {getAgreementTypeLabel(agreement.type)}
                    </Badge>
                    <p className="text-xs text-gray-500 mt-2">
                      Effective: {formatDate(agreement.effectiveDate)}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
