/**
 * CompliancePage - Compliance analysis and reporting
 * Shows overall compliance score, per-agreement scores, and detailed recommendations
 */

import React, { useMemo, useState } from 'react';
import { Shield, CheckCircle, AlertTriangle, Download, TrendingUp } from 'lucide-react';
import Badge from '@/components/ui/Badge';
import { useAgreements } from '@/context/AgreementContext';
import { useComplianceAnalysis } from '@/hooks/useComplianceAnalysis';
import {
  calculateOverallComplianceScore,
  calculateAgreementComplianceScore,
} from '@/utils/compliance';
import { formatDateTime } from '@/utils/agreement-helpers';

const CompliancePage: React.FC = () => {
  const { agreements, isLoading } = useAgreements();
  const { issues, hasIssues } = useComplianceAnalysis(agreements);
  const [lastChecked] = useState(new Date().toISOString());

  // Calculate overall and per-agreement compliance scores
  const overallScore = useMemo(() => calculateOverallComplianceScore(agreements), [agreements]);

  const agreementScores = useMemo(() => {
    return agreements
      .map((agreement) => ({
        name: agreement.name,
        counterparty: agreement.counterparty,
        score: calculateAgreementComplianceScore(agreement),
        type: agreement.type,
      }))
      .sort((a, b) => a.score - b.score);
  }, [agreements]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-100';
    if (score >= 60) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  const getScoreBadgeVariant = (score: number): 'green' | 'yellow' | 'red' => {
    if (score >= 80) return 'green';
    if (score >= 60) return 'yellow';
    return 'red';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center gap-3 mb-4">
          <Shield className="w-8 h-8 text-indigo-600" />
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900">Compliance Analysis</h1>
            <p className="text-gray-600 text-sm mt-1">
              Last checked: {formatDateTime(lastChecked)}
            </p>
          </div>
        </div>
        <p className="text-gray-600">
          Automated compliance checks on your BAAs and related agreements with HIPAA requirements
        </p>
      </div>

      {/* Overall Compliance Score */}
      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-200 rounded-lg shadow p-8">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-gray-600 text-lg mb-2">Overall Compliance Score</p>
            <div className="flex items-baseline gap-2">
              <span className={`text-6xl font-bold ${getScoreColor(overallScore)}`}>
                {overallScore}
              </span>
              <span className="text-gray-600 text-xl">/100</span>
            </div>
            <p className="text-gray-700 mt-3">
              Based on {agreements.length} agreement{agreements.length !== 1 ? 's' : ''} analyzed
            </p>
          </div>
          <div className="text-right">
            <TrendingUp className={`w-12 h-12 ${getScoreColor(overallScore)}`} />
            <p className="text-sm text-gray-600 mt-2">
              {overallScore >= 80
                ? 'Good standing'
                : overallScore >= 60
                  ? 'Needs attention'
                  : 'Critical review needed'}
            </p>
          </div>
        </div>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <div className="inline-block">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
          <p className="text-gray-600 mt-2">Analyzing agreements...</p>
        </div>
      )}

      {/* Success State or Issues */}
      {!isLoading && !hasIssues && (
        <div className="bg-green-50 border border-green-200 rounded-lg shadow p-12 text-center">
          <div className="inline-block p-4 bg-green-100 rounded-full mb-4">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-green-900 mb-2">No Compliance Issues Detected</h2>
          <p className="text-green-700">
            All agreements are in compliance with HIPAA requirements based on current analysis.
          </p>
        </div>
      )}

      {/* Issues List */}
      {!isLoading && hasIssues && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Compliance Issues</h2>
              <p className="text-sm text-gray-600 mt-1">Found {issues.length} issue(s)</p>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium">
              <Download className="w-4 h-4" />
              Export Report
            </button>
          </div>

          {issues.map((issue, index) => {
            const isCritical = issue.type === 'critical';
            const bgColor = isCritical ? 'bg-red-50' : 'bg-yellow-50';
            const borderColor = isCritical ? 'border-red-200' : 'border-yellow-200';
            const iconColor = isCritical ? 'text-red-600' : 'text-yellow-600';
            const badgeVariant = isCritical ? 'red' : 'yellow';

            return (
              <div key={index} className={`${bgColor} border ${borderColor} rounded-lg shadow p-6`}>
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

      {/* Per-Agreement Compliance Scores */}
      {!isLoading && agreements.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Agreement Compliance Scores</h2>

          <div className="space-y-3">
            {agreementScores.map((agreement) => (
              <div
                key={agreement.name}
                className={`${getScoreBgColor(agreement.score)} border rounded-lg p-4`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{agreement.name}</p>
                    <p className="text-sm text-gray-600">{agreement.counterparty}</p>
                  </div>

                  <div className="flex items-center gap-3">
                    <Badge variant={getScoreBadgeVariant(agreement.score)} size="sm">
                      {agreement.type}
                    </Badge>
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-full rounded-full ${
                          agreement.score >= 80
                            ? 'bg-green-600'
                            : agreement.score >= 60
                              ? 'bg-yellow-600'
                              : 'bg-red-600'
                        }`}
                        style={{ width: `${agreement.score}%` }}
                      ></div>
                    </div>
                    <span className={`font-bold text-lg w-12 text-right ${getScoreColor(agreement.score)}`}>
                      {agreement.score}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && agreements.length === 0 && (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <Shield className="w-12 h-12 mx-auto mb-3 opacity-30 text-gray-400" />
          <p className="text-gray-600">No agreements to analyze yet</p>
          <p className="text-gray-400 text-sm">Create your first agreement to get started with compliance analysis</p>
        </div>
      )}
    </div>
  );
};

export default CompliancePage;
