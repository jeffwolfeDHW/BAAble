/**
 * TemplatesPage - BAA template selection page
 * Displays available agreement templates for quick setup
 */

import React from 'react';
import { FileText } from 'lucide-react';

interface TemplateCard {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  theme: {
    bgGradient: string;
    iconBg: string;
    buttonGradient: string;
    border: string;
  };
}

const TemplatesPage: React.FC = () => {
  const templates: TemplateCard[] = [
    {
      id: 'covered-entity',
      title: 'Covered Entity Template',
      description: 'Use this template when your organization is a covered entity engaging a business associate to handle PHI (Protected Health Information).',
      icon: <FileText className="w-8 h-8 text-indigo-600" />,
      theme: {
        bgGradient: 'from-indigo-50 to-white',
        iconBg: 'bg-indigo-600',
        buttonGradient: 'from-indigo-600 to-purple-600',
        border: 'border-indigo-200 hover:border-indigo-400',
      },
    },
    {
      id: 'business-associate',
      title: 'Business Associate Template',
      description: 'Use this template when your organization is acting as a business associate and needs to sign a BAA with a covered entity.',
      icon: <FileText className="w-8 h-8 text-green-600" />,
      theme: {
        bgGradient: 'from-green-50 to-white',
        iconBg: 'bg-green-600',
        buttonGradient: 'from-green-600 to-emerald-600',
        border: 'border-green-200 hover:border-green-400',
      },
    },
    {
      id: 'subcontractor',
      title: 'Subcontractor Template',
      description: 'Use this template for subcontracting arrangements where you need to ensure HIPAA compliance obligations flow through your organization.',
      icon: <FileText className="w-8 h-8 text-purple-600" />,
      theme: {
        bgGradient: 'from-purple-50 to-white',
        iconBg: 'bg-purple-600',
        buttonGradient: 'from-purple-600 to-pink-600',
        border: 'border-purple-200 hover:border-purple-400',
      },
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">BAA Templates</h1>
        <p className="text-gray-600 mt-2">Select a template to quickly create a new agreement</p>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {templates.map((template) => (
          <div
            key={template.id}
            className={`bg-gradient-to-br ${template.theme.bgGradient} border-2 ${template.theme.border} rounded-xl p-6 hover:shadow-lg transition-all duration-200 flex flex-col h-full`}
          >
            {/* Icon Container */}
            <div className={`${template.theme.iconBg} w-14 h-14 rounded-lg flex items-center justify-center mb-4`}>
              {React.cloneElement(template.icon as React.ReactElement, {
                className: 'w-8 h-8 text-white',
              })}
            </div>

            {/* Title and Description */}
            <h3 className="text-xl font-bold text-gray-900 mb-3">{template.title}</h3>
            <p className="text-gray-700 text-sm mb-6 flex-grow">{template.description}</p>

            {/* Button */}
            <button
              className={`w-full bg-gradient-to-r ${template.theme.buttonGradient} text-white font-semibold py-3 rounded-lg hover:shadow-lg transition-all duration-200`}
            >
              Use Template
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TemplatesPage;
