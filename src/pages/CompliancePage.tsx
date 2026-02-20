/**
 * CompliancePage - Displays compliance analysis results
 * Shows compliance issues with detailed recommendations and affected agreements
 */

import React from 'react';
import { Shield, CheckCircle, AlertTriangle } from 'lucide-react';
import Badge from '@/components/ui/Badge';
import { useAgreements } from '@/context/AgreementContext';
import { useComplianceAnalysis } from '@/hooks/useComplianceAnalysis';

const CompliancePage: React.FC = () => {
  const { agreements } = useAgreements();
  const { issues, hasIssues } = useComplianceAnalysis(agreements);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center gap-3 mb-2">
          <Shield className="w-8 h-8 text-indigo-600" />
          <h1 className="text-3xl font-bold text-gray-900">Compliance Analysis</h1>
        </div>
        <p className="text-gray-600 text-lg">
          Automated compliance checks on your BAAs and related agreements
        </p>
      </div>

      {/* Success State or Issues */}
      {!hasIssues ? (
        <div className="bg-green-50 border border-green-200 rounded-lg shadow p-12 text-center">
          <div className="inline-block p-4 bg-green-100 rounded-full mb-4">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-green-900 mb-2">No Compliance Issues Detected</h2>
          <p className="text-green-700">
            All agreements are in compliance with HIPAA requirements based on current analysis.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {issues.map((issue, index) => {
            const isCritical = issue.type === 'critical';
            const bgColor = isCritical ? 'bg-red-50' : 'bg-yellow-50';
            const borderColor = isCritical ? 'border-red-200' : 'border-yellow-200';
            const iconColor = isCritical ? 'text-red-600' : 'text-yellow-600';
            const badgeVariant = isCritical ? 'red' : 'yellow';

            return (
              <div
                key={index}
                className={`${bgColor} border ${borderColor} rounded-lg shadow p-6`}
              >
                {/* Main Content */}
                <div className="flex items-start gap-4">
                  <AlertTriangle className={`w-8 h-8 mt-0.5 flex-shrink-0 ${iconColor}`} />

                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-xl font-bold text-gray-900">{issue.category}</h3>
                      <Badge variant={badgeVariant}>{issue.type.toUpperCase()}</Badge>
                    </div>

                    <p className="text-gray-700 mb-4">{issue.description}</p>

                    {/* Details Card */}
                    <div className="bg-white rounded-lg p-4 border border-gray-200 space-y-4">
                      {/* Recommendation */}
                      <div>
                        <p className="font-semibold text-gray-900 mb-2">Recommendation:</p>
                        <p className="text-gray-700">{issue.recommendation}</p>
                      </div>

                      {/* Affected Agreements */}
                      <div>
                        <p className="font-semibold text-gray-900 mb-2">Affected Agreements:</p>
                        <div className="flex flex-wrap gap-2">
                          {issue.affectedAgreements.map((agreementName, i) => (
                            <Badge key={i} variant="blue" size="sm">
                              {agreementName}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CompliancePage;
