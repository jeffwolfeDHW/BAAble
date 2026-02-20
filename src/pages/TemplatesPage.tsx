/**
 * TemplatesPage - Template selection with CRUD for custom templates
 * Built-in templates and custom template management
 */

import React, { useState, useCallback } from 'react';
import { FileText, Plus, Trash2, Save, X } from 'lucide-react';
import Badge from '@/components/ui/Badge';
import { DEFAULT_TEMPLATES, ComplianceTermsTemplate } from '@/lib/api/templates';

interface TemplateCardProps {
  title: string;
  description: string;
  terms: ComplianceTermsTemplate;
  isCustom?: boolean;
  onUse?: () => void;
  onDelete?: () => void;
  theme: {
    bgGradient: string;
    iconBg: string;
    buttonGradient: string;
    border: string;
  };
}

interface NewCustomTemplate {
  name: string;
  breachNotificationHours: number;
  auditRights: boolean;
  subcontractorApproval: boolean;
  dataRetentionYears: number;
  terminationNoticeDays: number;
}

const TemplatesPage: React.FC<{
  onUseTemplate?: (terms: ComplianceTermsTemplate) => void;
}> = ({ onUseTemplate }) => {
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [customTemplates, setCustomTemplates] = useState<
    Array<{ name: string; terms: ComplianceTermsTemplate }>
  >([]);
  const [newTemplate, setNewTemplate] = useState<NewCustomTemplate>({
    name: '',
    breachNotificationHours: 24,
    auditRights: true,
    subcontractorApproval: true,
    dataRetentionYears: 7,
    terminationNoticeDays: 30,
  });
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const defaultTemplateThemes = [
    {
      bgGradient: 'from-indigo-50 to-white',
      iconBg: 'bg-indigo-600',
      buttonGradient: 'from-indigo-600 to-purple-600',
      border: 'border-indigo-200 hover:border-indigo-400',
    },
    {
      bgGradient: 'from-green-50 to-white',
      iconBg: 'bg-green-600',
      buttonGradient: 'from-green-600 to-emerald-600',
      border: 'border-green-200 hover:border-green-400',
    },
    {
      bgGradient: 'from-purple-50 to-white',
      iconBg: 'bg-purple-600',
      buttonGradient: 'from-purple-600 to-pink-600',
      border: 'border-purple-200 hover:border-purple-400',
    },
  ];

  const customTemplateThemes = [
    {
      bgGradient: 'from-orange-50 to-white',
      iconBg: 'bg-orange-600',
      buttonGradient: 'from-orange-600 to-red-600',
      border: 'border-orange-200 hover:border-orange-400',
    },
    {
      bgGradient: 'from-cyan-50 to-white',
      iconBg: 'bg-cyan-600',
      buttonGradient: 'from-cyan-600 to-blue-600',
      border: 'border-cyan-200 hover:border-cyan-400',
    },
  ];

  const handleAddCustomTemplate = useCallback(() => {
    if (!newTemplate.name.trim()) {
      alert('Please enter a template name');
      return;
    }

    const template: ComplianceTermsTemplate = {
      breach_notification_hours: newTemplate.breachNotificationHours,
      audit_rights: newTemplate.auditRights,
      subcontractor_approval: newTemplate.subcontractorApproval,
      data_retention_years: newTemplate.dataRetentionYears,
      termination_notice_days: newTemplate.terminationNoticeDays,
    };

    setCustomTemplates([
      ...customTemplates,
      {
        name: newTemplate.name,
        terms: template,
      },
    ]);

    setNewTemplate({
      name: '',
      breachNotificationHours: 24,
      auditRights: true,
      subcontractorApproval: true,
      dataRetentionYears: 7,
      terminationNoticeDays: 30,
    });
    setShowCustomForm(false);
  }, [newTemplate, customTemplates]);

  const handleDeleteCustomTemplate = useCallback(
    (name: string) => {
      if (deleteConfirm !== name) {
        setDeleteConfirm(name);
        return;
      }
      setCustomTemplates(customTemplates.filter((t) => t.name !== name));
      setDeleteConfirm(null);
    },
    [customTemplates, deleteConfirm]
  );

  const TemplateCard: React.FC<TemplateCardProps> = ({
    title,
    description,
    terms,
    isCustom,
    onUse,
    onDelete,
    theme,
  }) => (
    <div
      className={`bg-gradient-to-br ${theme.bgGradient} border-2 ${theme.border} rounded-xl p-6 hover:shadow-lg transition-all duration-200 flex flex-col h-full`}
    >
      {/* Icon Container */}
      <div className={`${theme.iconBg} w-14 h-14 rounded-lg flex items-center justify-center mb-4`}>
        <FileText className="w-8 h-8 text-white" />
      </div>

      {/* Title and Description */}
      <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
      <p className="text-gray-700 text-sm mb-4 flex-grow">{description}</p>

      {/* Terms Display */}
      <div className="mb-6 space-y-2 text-sm text-gray-700">
        <div className="flex justify-between">
          <span>Breach Notification:</span>
          <span className="font-semibold">{terms.breach_notification_hours}h</span>
        </div>
        <div className="flex justify-between">
          <span>Data Retention:</span>
          <span className="font-semibold">{terms.data_retention_years} years</span>
        </div>
        <div className="flex justify-between">
          <span>Termination Notice:</span>
          <span className="font-semibold">{terms.termination_notice_days} days</span>
        </div>
        <div className="flex justify-between">
          <span>Audit Rights:</span>
          <Badge variant={terms.audit_rights ? 'green' : 'gray'} size="xs">
            {terms.audit_rights ? 'Included' : 'Not included'}
          </Badge>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex gap-2">
        {onUse && (
          <button
            onClick={onUse}
            className={`flex-1 bg-gradient-to-r ${theme.buttonGradient} text-white font-semibold py-2 rounded-lg hover:shadow-lg transition-all duration-200`}
          >
            Use Template
          </button>
        )}
        {onDelete && (
          <button
            onClick={onDelete}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">BAA Templates</h1>
        <p className="text-gray-600 mt-2">Select a template to quickly create a new agreement with pre-configured compliance terms</p>
      </div>

      {/* Default Templates Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold text-gray-900">Built-in Templates</h2>
          <Badge variant="blue" size="sm">
            {DEFAULT_TEMPLATES.length}
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {DEFAULT_TEMPLATES.map((template, index) => (
            <TemplateCard
              key={template.name}
              title={template.name}
              description={template.description}
              terms={template.terms}
              onUse={() => onUseTemplate?.(template.terms)}
              theme={defaultTemplateThemes[index]}
            />
          ))}
        </div>
      </div>

      {/* Custom Templates Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-gray-900">Custom Templates</h2>
            <Badge variant="purple" size="sm">
              {customTemplates.length}
            </Badge>
          </div>
          <button
            onClick={() => setShowCustomForm(!showCustomForm)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
          >
            <Plus className="w-4 h-4" />
            Create Custom Template
          </button>
        </div>

        {/* Create Custom Template Form */}
        {showCustomForm && (
          <div className="p-6 bg-blue-50 border border-blue-300 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-4">Create Custom Compliance Template</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  value={newTemplate.name}
                  onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
                  placeholder="Template Name"
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={newTemplate.auditRights}
                    onChange={(e) =>
                      setNewTemplate({ ...newTemplate, auditRights: e.target.checked })
                    }
                    className="rounded"
                  />
                  <span className="text-gray-700">Include Audit Rights</span>
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Breach Notification (hours)
                  </label>
                  <input
                    type="number"
                    value={newTemplate.breachNotificationHours}
                    onChange={(e) =>
                      setNewTemplate({
                        ...newTemplate,
                        breachNotificationHours: parseInt(e.target.value),
                      })
                    }
                    min="1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Data Retention (years)
                  </label>
                  <input
                    type="number"
                    value={newTemplate.dataRetentionYears}
                    onChange={(e) =>
                      setNewTemplate({
                        ...newTemplate,
                        dataRetentionYears: parseInt(e.target.value),
                      })
                    }
                    min="1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Termination Notice (days)
                  </label>
                  <input
                    type="number"
                    value={newTemplate.terminationNoticeDays}
                    onChange={(e) =>
                      setNewTemplate({
                        ...newTemplate,
                        terminationNoticeDays: parseInt(e.target.value),
                      })
                    }
                    min="1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={newTemplate.subcontractorApproval}
                  onChange={(e) =>
                    setNewTemplate({
                      ...newTemplate,
                      subcontractorApproval: e.target.checked,
                    })
                  }
                  className="rounded"
                />
                <span className="text-gray-700">Require Subcontractor Approval</span>
              </label>

              <div className="flex gap-2 pt-4">
                <button
                  onClick={handleAddCustomTemplate}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium"
                >
                  <Save className="w-4 h-4" />
                  Save Template
                </button>
                <button
                  onClick={() => setShowCustomForm(false)}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-900 rounded-lg transition-colors font-medium"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Custom Templates Grid */}
        {customTemplates.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {customTemplates.map((template, index) => (
              <TemplateCard
                key={template.name}
                title={template.name}
                description="Custom compliance terms template"
                terms={template.terms}
                isCustom
                onUse={() => onUseTemplate?.(template.terms)}
                onDelete={() => handleDeleteCustomTemplate(template.name)}
                theme={customTemplateThemes[index % customTemplateThemes.length]}
              />
            ))}
          </div>
        )}

        {/* Empty Custom Templates State */}
        {customTemplates.length === 0 && !showCustomForm && (
          <div className="text-center py-8 text-gray-500">
            <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>No custom templates yet</p>
            <p className="text-sm text-gray-400 mt-1">Create your first custom template to standardize compliance terms across your organization</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TemplatesPage;
