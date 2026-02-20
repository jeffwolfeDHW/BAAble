/**
 * DashboardPage - Main dashboard showing key metrics, recent activity, and expiring agreements
 * Real CRUD-ready dashboard with action buttons and data-driven content
 */

import React, { useState, useMemo } from 'react';
import {
  FileText,
  CheckCircle,
  AlertTriangle,
  Users,
  Bell,
  History,
  ChevronDown,
  ChevronUp,
  Plus,
  TrendingUp,
  Clock,
  Zap,
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
  daysUntilDate,
} from '@/utils/agreement-helpers';
import { Agreement, TabId } from '@/types/index';

interface DashboardPageProps {
  onSelectAgreement: (agreement: Agreement) => void;
  onNewAgreement?: () => void;
  onNavigate?: (tab: TabId) => void;
}

const DashboardPage: React.FC<DashboardPageProps> = ({
  onSelectAgreement,
  onNewAgreement,
  onNavigate,
}) => {
  const { agreements, isLoading } = useAgreements();
  const { teamMembers } = useTeam();
  const { issues, criticalCount, warningCount, hasIssues } = useComplianceAnalysis(agreements);
  const [showComplianceDetails, setShowComplianceDetails] = useState(false);

  // Calculate stats
  const draftCount = agreements.filter((a) => a.status === 'draft').length;
  const activeAgreements = agreements.filter((a) => a.status === 'active').length;
  const totalIssues = criticalCount + warningCount;
  const teamMemberCount = teamMembers.filter((m) => m.status === 'active').length;

  // Get last 5 recent agreements (sorted by upload date)
  const recentAgreements = useMemo(() => {
    return [...agreements]
      .sort((a, b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime())
      .slice(0, 5);
  }, [agreements]);

  // Get agreements expiring within 90 days
  const expiringAgreements = useMemo(() => {
    const now = new Date();
    const ninetyDaysFromNow = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);

    return agreements
      .filter((a) => {
        const expDate = new Date(a.expirationDate);
        return expDate > now && expDate <= ninetyDaysFromNow;
      })
      .sort((a, b) => new Date(a.expirationDate).getTime() - new Date(b.expirationDate).getTime())
      .slice(0, 5);
  }, [agreements]);

  return (
    <div className="space-y-6">
      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Agreements"
          value={agreements.length}
          icon={FileText}
          colorClass="bg-indigo-500"
          isLoading={isLoading}
        />
        <StatCard
          title="Active BAAs"
          value={activeAgreements}
          icon={CheckCircle}
          colorClass="bg-green-500"
          isLoading={isLoading}
        />
        <StatCard
          title="Drafts"
          value={draftCount}
          icon={TrendingUp}
          colorClass="bg-blue-500"
          isLoading={isLoading}
        />
        <StatCard
          title="Compliance Issues"
          value={totalIssues}
          icon={AlertTriangle}
          colorClass={totalIssues > 0 ? 'bg-orange-500' : 'bg-gray-500'}
          isLoading={isLoading}
        />
      </div>

      {/* Quick Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {onNewAgreement && (
          <button
            onClick={onNewAgreement}
            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg p-4 flex items-center gap-3 transition-colors shadow hover:shadow-lg"
          >
            <Plus className="w-5 h-5" />
            <div className="text-left">
              <p className="font-semibold">New Agreement</p>
              <p className="text-sm text-indigo-100">Create and upload a new BAA</p>
            </div>
          </button>
        )}
        {onNavigate && (
          <button
            onClick={() => onNavigate('compliance')}
            className="bg-purple-600 hover:bg-purple-700 text-white rounded-lg p-4 flex items-center gap-3 transition-colors shadow hover:shadow-lg"
          >
            <Zap className="w-5 h-5" />
            <div className="text-left">
              <p className="font-semibold">Run Compliance Check</p>
              <p className="text-sm text-purple-100">View detailed analysis</p>
            </div>
          </button>
        )}
      </div>

      {/* Compliance Alerts Section */}
      {hasIssues && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Bell className="w-6 h-6 text-orange-500" />
              <h2 className="text-lg font-bold text-gray-900">Compliance Alerts</h2>
              <Badge variant="orange" size="sm">
                {criticalCount + warningCount}
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

          {/* Issues List - Show first 3 */}
          <div className="space-y-3">
            {issues.slice(0, 3).map((issue, index) => {
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
            {issues.length > 3 && (
              <p className="text-sm text-gray-600 text-center py-2">
                And {issues.length - 3} more issues. View all in Compliance tab.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Expiring Soon Section */}
      {expiringAgreements.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3 mb-4">
            <Clock className="w-6 h-6 text-yellow-600" />
            <h2 className="text-lg font-bold text-gray-900">Expiring Soon (90 days)</h2>
            <Badge variant="yellow" size="sm">
              {expiringAgreements.length}
            </Badge>
          </div>

          <div className="space-y-3">
            {expiringAgreements.map((agreement) => {
              const daysLeft = daysUntilDate(agreement.expirationDate);
              const isUrgent = daysLeft <= 30;

              return (
                <div
                  key={agreement.id}
                  onClick={() => onSelectAgreement(agreement)}
                  className={`p-4 border rounded-lg transition-all cursor-pointer ${
                    isUrgent
                      ? 'border-red-200 bg-red-50 hover:border-red-300 hover:shadow-md'
                      : 'border-gray-200 hover:border-yellow-300 hover:shadow-md'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{agreement.name}</p>
                      <p className="text-sm text-gray-600">{agreement.counterparty}</p>
                    </div>
                    <div className="text-right ml-4">
                      <Badge
                        variant={isUrgent ? 'red' : 'yellow'}
                        size="sm"
                        className="mb-1 inline-block"
                      >
                        {daysLeft} days
                      </Badge>
                      <p className="text-xs text-gray-500">
                        Expires: {formatDate(agreement.expirationDate)}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Recent Agreements Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Recent Activity</h2>

        {recentAgreements.length > 0 ? (
          <div className="space-y-3">
            {recentAgreements.map((agreement) => {
              const typeColor = getAgreementTypeColor(agreement.type);
              const isExecuted = agreement.signatureStatus === 'fully-executed';
              const hasAlerts = issues.some((issue) =>
                issue.affectedAgreements.includes(agreement.name)
              );

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
                        {/* Type Badge */}
                        <Badge variant={typeColor as any} size="sm">
                          {getAgreementTypeLabel(agreement.type)}
                        </Badge>

                        {/* Status Badge */}
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

                        {/* Signature Status */}
                        {!isExecuted && (
                          <div className="flex items-center gap-1 bg-yellow-100 px-2.5 py-1 rounded text-xs text-yellow-700 font-medium">
                            <Clock className="w-3 h-3" />
                            Pending Signature
                          </div>
                        )}

                        {/* Alerts indicator */}
                        {hasAlerts && (
                          <div className="flex items-center gap-1 bg-red-100 px-2.5 py-1 rounded text-xs text-red-700 font-medium">
                            <AlertTriangle className="w-3 h-3" />
                            Alert
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex-shrink-0 text-right">
                      <p className="text-xs text-gray-500">
                        Added: {formatDate(agreement.uploadDate)}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>No agreements yet</p>
            {onNewAgreement && (
              <button
                onClick={onNewAgreement}
                className="mt-3 text-indigo-600 hover:text-indigo-700 font-medium"
              >
                Create your first agreement
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
