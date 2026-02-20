/**
 * TeamPage - Team member management page
 * Displays internal team members and external counsel with role-based access control
 */

import React, { useState } from 'react';
import { Shield, Users, Edit3, Plus } from 'lucide-react';
import { useTeam } from '@/context/TeamContext';
import Badge from '@/components/ui/Badge';

interface EditingMember {
  id: number;
  role: string;
}

const TeamPage: React.FC = () => {
  const { teamMembers } = useTeam();
  const [editingMember, setEditingMember] = useState<EditingMember | null>(null);

  // Separate members by role
  const internalMembers = teamMembers.filter((member) => member.role !== 'external-counsel');
  const externalCounsel = teamMembers.filter((member) => member.role === 'external-counsel');

  /**
   * Get avatar color based on role
   */
  const getAvatarColor = (role: string): string => {
    switch (role) {
      case 'admin':
        return 'bg-purple-600';
      case 'internal':
        return 'bg-blue-600';
      default:
        return 'bg-purple-600';
    }
  };

  /**
   * Get role badge color
   */
  const getRoleBadgeVariant = (role: string): 'purple' | 'blue' => {
    return role === 'admin' ? 'purple' : 'blue';
  };

  /**
   * Get role display label
   */
  const getRoleLabel = (role: string): string => {
    switch (role) {
      case 'admin':
        return 'Admin';
      case 'internal':
        return 'Internal User';
      case 'external-counsel':
        return 'External Counsel';
      default:
        return role;
    }
  };

  /**
   * Render member card component
   */
  const MemberCard: React.FC<{
    name: string;
    email: string;
    role: string;
    memberId: number;
    isPurpleTheme?: boolean;
  }> = ({ name, email, role, memberId, isPurpleTheme = false }) => {
    const initial = name.charAt(0).toUpperCase();
    const bgColor = isPurpleTheme ? 'bg-purple-600' : getAvatarColor(role);
    const badgeVariant = isPurpleTheme ? 'purple' : getRoleBadgeVariant(role);
    const badgeLabel = isPurpleTheme ? 'External Counsel' : getRoleLabel(role);

    return (
      <div key={memberId} className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
        <div className="flex items-center gap-4">
          <div className={`${bgColor} w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold text-lg`}>
            {initial}
          </div>
          <div>
            <p className="font-semibold text-gray-900">{name}</p>
            <p className="text-sm text-gray-600">{email}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant={badgeVariant} size="sm">
            {badgeLabel}
          </Badge>
          <button
            onClick={() => setEditingMember({ id: memberId, role })}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label={`Edit ${name}`}
          >
            <Edit3 className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Team Members</h1>
          <p className="text-gray-600 mt-2">Manage team access and permissions</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium">
          <Plus className="w-5 h-5" />
          Add Member
        </button>
      </div>

      {/* Internal Team Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Shield className="w-6 h-6 text-indigo-600" />
          <h2 className="text-xl font-bold text-gray-900">Internal Team</h2>
        </div>
        <div className="space-y-3">
          {internalMembers.map((member) => (
            <MemberCard
              key={member.id}
              name={member.name}
              email={member.email}
              role={member.role}
              memberId={member.id}
              isPurpleTheme={false}
            />
          ))}
        </div>
      </div>

      {/* External Counsel Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Users className="w-6 h-6 text-indigo-600" />
          <h2 className="text-xl font-bold text-gray-900">External Counsel</h2>
        </div>
        <div className="space-y-3">
          {externalCounsel.map((member) => (
            <MemberCard
              key={member.id}
              name={member.name}
              email={member.email}
              role={member.role}
              memberId={member.id}
              isPurpleTheme={true}
            />
          ))}
        </div>
      </div>

      {/* Role Permissions Info Box */}
      <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-6">
        <h3 className="font-bold text-gray-900 mb-4">Role Permissions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className="font-semibold text-purple-900">Admin</p>
            <ul className="text-sm text-gray-700 mt-2 space-y-1">
              <li>• Full system access</li>
              <li>• Manage team members</li>
              <li>• View all agreements</li>
              <li>• Configure compliance settings</li>
            </ul>
          </div>
          <div>
            <p className="font-semibold text-blue-900">Internal User</p>
            <ul className="text-sm text-gray-700 mt-2 space-y-1">
              <li>• View agreements</li>
              <li>• Create new agreements</li>
              <li>• Upload documents</li>
              <li>• View compliance reports</li>
            </ul>
          </div>
          <div>
            <p className="font-semibold text-purple-900">External Counsel</p>
            <ul className="text-sm text-gray-700 mt-2 space-y-1">
              <li>• View assigned agreements</li>
              <li>• Add review comments</li>
              <li>• Download documents</li>
              <li>• No admin access</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamPage;
