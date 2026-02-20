/**
 * TeamPage - Team member management with full CRUD operations
 * Add, edit, delete, and filter team members by role
 */

import React, { useState, useCallback } from 'react';
import { Shield, Users, Edit, Trash2, Save, X, UserPlus, Filter } from 'lucide-react';
import { useTeam } from '@/context/TeamContext';
import Badge from '@/components/ui/Badge';
import { TeamMember, UserRole } from '@/types/index';

interface EditingMember {
  id: string | number;
  name: string;
  email: string;
  role: UserRole;
}

interface NewMemberForm {
  name: string;
  email: string;
  role: UserRole;
}

const TeamPage: React.FC = () => {
  const { teamMembers, addTeamMember, removeTeamMember, updateTeamMember, isLoading } = useTeam();

  // Form and UI state
  const [showAddForm, setShowAddForm] = useState(false);
  const [newMember, setNewMember] = useState<NewMemberForm>({
    name: '',
    email: '',
    role: 'internal',
  });
  const [editingMember, setEditingMember] = useState<EditingMember | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | number | null>(null);
  const [roleFilter, setRoleFilter] = useState<'all' | UserRole>('all');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Filter members by role
  const filteredMembers =
    roleFilter === 'all'
      ? teamMembers
      : teamMembers.filter((member) => member.role === roleFilter);

  // Separate filtered members by role
  const internalMembers = filteredMembers.filter((member) => member.role !== 'external-counsel');
  const externalCounsel = filteredMembers.filter((member) => member.role === 'external-counsel');

  // Get avatar color based on role
  const getAvatarColor = (role: UserRole): string => {
    switch (role) {
      case 'admin':
        return 'bg-purple-600';
      case 'internal':
        return 'bg-blue-600';
      case 'external-counsel':
        return 'bg-pink-600';
      default:
        return 'bg-gray-600';
    }
  };

  // Get role badge color
  const getRoleBadgeVariant = (role: UserRole): 'purple' | 'blue' | 'pink' | 'gray' => {
    switch (role) {
      case 'admin':
        return 'purple';
      case 'internal':
        return 'blue';
      case 'external-counsel':
        return 'pink';
      default:
        return 'gray';
    }
  };

  // Get role display label
  const getRoleLabel = (role: UserRole): string => {
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

  // Handle add member
  const handleAddMember = useCallback(async () => {
    if (!newMember.name.trim() || !newMember.email.trim()) {
      alert('Please fill in all fields');
      return;
    }

    try {
      setIsSubmitting(true);
      await addTeamMember({
        name: newMember.name,
        email: newMember.email,
        role: newMember.role,
        status: 'active',
      });
      setNewMember({ name: '', email: '', role: 'internal' });
      setShowAddForm(false);
    } catch (error) {
      console.error('Error adding team member:', error);
      alert('Failed to add team member. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }, [newMember, addTeamMember]);

  // Handle update member
  const handleUpdateMember = useCallback(async () => {
    if (!editingMember) return;
    if (!editingMember.name.trim() || !editingMember.email.trim()) {
      alert('Please fill in all fields');
      return;
    }

    try {
      setIsSubmitting(true);
      await updateTeamMember(editingMember.id, {
        name: editingMember.name,
        email: editingMember.email,
        role: editingMember.role,
      });
      setEditingMember(null);
    } catch (error) {
      console.error('Error updating team member:', error);
      alert('Failed to update team member. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }, [editingMember, updateTeamMember]);

  // Handle delete member
  const handleDeleteMember = useCallback(
    async (id: string | number) => {
      if (deleteConfirm !== id) {
        setDeleteConfirm(id);
        return;
      }

      try {
        setIsDeleting(true);
        await removeTeamMember(id);
        setDeleteConfirm(null);
      } catch (error) {
        console.error('Error deleting team member:', error);
        alert('Failed to delete team member. Please try again.');
      } finally {
        setIsDeleting(false);
      }
    },
    [deleteConfirm, removeTeamMember]
  );

  const MemberRow: React.FC<{ member: TeamMember }> = ({ member }) => {
    const isEditing = editingMember?.id === member.id;
    const initial = (isEditing ? editingMember.name : member.name).charAt(0).toUpperCase();

    if (isEditing && editingMember) {
      return (
        <div className="p-4 bg-indigo-50 border border-indigo-300 rounded-lg">
          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <input
                type="text"
                value={editingMember.name}
                onChange={(e) =>
                  setEditingMember({ ...editingMember, name: e.target.value })
                }
                placeholder="Name"
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                disabled={isSubmitting}
              />
              <input
                type="email"
                value={editingMember.email}
                onChange={(e) =>
                  setEditingMember({ ...editingMember, email: e.target.value })
                }
                placeholder="Email"
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                disabled={isSubmitting}
              />
              <select
                value={editingMember.role}
                onChange={(e) =>
                  setEditingMember({ ...editingMember, role: e.target.value as UserRole })
                }
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                disabled={isSubmitting}
              >
                <option value="admin">Admin</option>
                <option value="internal">Internal User</option>
                <option value="external-counsel">External Counsel</option>
              </select>
              <div className="flex gap-2">
                <button
                  onClick={handleUpdateMember}
                  disabled={isSubmitting}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white rounded-lg py-2 font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Save
                </button>
                <button
                  onClick={() => setEditingMember(null)}
                  disabled={isSubmitting}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-900 rounded-lg py-2 font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
        <div className="flex items-center gap-4 flex-1">
          <div className={`${getAvatarColor(member.role)} w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold text-lg flex-shrink-0`}>
            {initial}
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-gray-900">{member.name}</p>
            <p className="text-sm text-gray-600">{member.email}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 ml-4 flex-shrink-0">
          <Badge variant={getRoleBadgeVariant(member.role)} size="sm">
            {getRoleLabel(member.role)}
          </Badge>
          <div className="flex gap-2">
            <button
              onClick={() =>
                setEditingMember({
                  id: member.id,
                  name: member.name,
                  email: member.email,
                  role: member.role,
                })
              }
              disabled={isLoading}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
              title="Edit member"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleDeleteMember(member.id)}
              disabled={isDeleting && deleteConfirm === member.id}
              className={`p-2 rounded-lg transition-colors ${
                deleteConfirm === member.id
                  ? 'bg-red-100 text-red-700 hover:bg-red-200'
                  : 'text-red-600 hover:bg-red-50'
              } disabled:opacity-50`}
              title={
                deleteConfirm === member.id
                  ? 'Click again to confirm delete'
                  : 'Delete member'
              }
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
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
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium disabled:opacity-50"
        >
          <UserPlus className="w-5 h-5" />
          Add Member
        </button>
      </div>

      {/* Add Member Form */}
      {showAddForm && (
        <div className="p-4 bg-blue-50 border border-blue-300 rounded-lg">
          <h3 className="font-semibold text-gray-900 mb-3">Add New Team Member</h3>
          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <input
                type="text"
                value={newMember.name}
                onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                placeholder="Full Name"
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                disabled={isSubmitting}
              />
              <input
                type="email"
                value={newMember.email}
                onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                placeholder="Email Address"
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                disabled={isSubmitting}
              />
              <select
                value={newMember.role}
                onChange={(e) =>
                  setNewMember({ ...newMember, role: e.target.value as UserRole })
                }
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                disabled={isSubmitting}
              >
                <option value="admin">Admin</option>
                <option value="internal">Internal User</option>
                <option value="external-counsel">External Counsel</option>
              </select>
              <div className="flex gap-2">
                <button
                  onClick={handleAddMember}
                  disabled={isSubmitting}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg py-2 font-medium transition-colors disabled:opacity-50"
                >
                  Add
                </button>
                <button
                  onClick={() => {
                    setShowAddForm(false);
                    setNewMember({ name: '', email: '', role: 'internal' });
                  }}
                  disabled={isSubmitting}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-900 rounded-lg py-2 font-medium transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Role Filter */}
      <div className="flex items-center gap-3">
        <Filter className="w-4 h-4 text-gray-600" />
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value as 'all' | UserRole)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
          disabled={isLoading}
        >
          <option value="all">All Roles</option>
          <option value="admin">Admin</option>
          <option value="internal">Internal User</option>
          <option value="external-counsel">External Counsel</option>
        </select>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-8">
          <div className="inline-block">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
          <p className="text-gray-600 mt-2">Loading team members...</p>
        </div>
      )}

      {/* Internal Team Section */}
      {!isLoading && internalMembers.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Shield className="w-6 h-6 text-indigo-600" />
            <h2 className="text-xl font-bold text-gray-900">
              Internal Team ({internalMembers.length})
            </h2>
          </div>
          <div className="space-y-3">
            {internalMembers.map((member) => (
              <MemberRow key={member.id} member={member} />
            ))}
          </div>
        </div>
      )}

      {/* External Counsel Section */}
      {!isLoading && externalCounsel.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Users className="w-6 h-6 text-indigo-600" />
            <h2 className="text-xl font-bold text-gray-900">
              External Counsel ({externalCounsel.length})
            </h2>
          </div>
          <div className="space-y-3">
            {externalCounsel.map((member) => (
              <MemberRow key={member.id} member={member} />
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && filteredMembers.length === 0 && (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <Users className="w-12 h-12 mx-auto mb-3 opacity-30 text-gray-400" />
          <p className="text-gray-600">No team members found</p>
          <p className="text-gray-400 text-sm mt-2">
            {roleFilter !== 'all'
              ? 'Try selecting a different role'
              : 'Add your first team member to get started'}
          </p>
        </div>
      )}

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
            <p className="font-semibold text-pink-900">External Counsel</p>
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
