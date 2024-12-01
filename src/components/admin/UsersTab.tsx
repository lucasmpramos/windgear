import React, { useState } from 'react';
import { User } from '../../types';
import { Loader, Shield, Mail, MapPin, Clock, Pencil, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import Avatar from '../Avatar';
import EditUserModal from '../EditUserModal';
import { supabase } from '../../lib/supabase';
import { supabaseAdmin } from '../../lib/supabase-admin';
import toast from 'react-hot-toast';

interface UsersTabProps {
  users: User[];
  setUsers: (users: User[]) => void;
  loading: boolean;
  currentUserId: string;
}

function UsersTab({ users, setUsers, loading, currentUserId }: UsersTabProps) {
  const [deleting, setDeleting] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const handleDeleteUser = async (userId: string) => {
    if (userId === currentUserId) return;

    const confirmed = window.confirm('Are you sure you want to delete this user? This action cannot be undone.');
    if (!confirmed) return;

    try {
      setDeleting(userId);
      
      // Delete user's products first
      const { error: productsError } = await supabase
        .from('products')
        .delete()
        .eq('seller_id', userId);

      if (productsError) throw productsError;

      // Delete user profile
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);

      if (profileError) throw profileError;

      // Delete auth user using admin client
      const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId);

      if (authError) throw authError;

      setUsers(prev => prev.filter(u => u.id !== userId));
      toast.success('User deleted successfully');
    } catch (error: any) {
      console.error('Error deleting user:', error);
      toast.error(error.message || 'Failed to delete user');
    } finally {
      setDeleting(null);
    }
  };

  const handleUserUpdate = (updatedUser: User) => {
    setUsers(prev => prev.map(u => 
      u.id === updatedUser.id ? updatedUser : u
    ));
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader className="h-8 w-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contact
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Location
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Last Login
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="h-10 w-10 flex-shrink-0">
                      <Avatar
                        src={user.avatar_url}
                        alt={user.full_name || 'User'}
                        size="md"
                      />
                    </div>
                    <div className="ml-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-900">
                          {user.full_name || 'Anonymous'}
                        </span>
                        {user.is_admin && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                            <Shield className="h-3 w-3" />
                            Admin
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-500">
                        Joined {new Date(user.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2 text-sm text-gray-900">
                    <Mail className="h-4 w-4 text-gray-400" />
                    {user.email}
                  </div>
                  {user.whatsapp && (
                    <div className="text-sm text-gray-500">
                      WhatsApp: {user.whatsapp}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {user.location ? (
                    <div className="flex items-center gap-2 text-sm text-gray-900">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      {user.location}
                    </div>
                  ) : (
                    <span className="text-sm text-gray-500">Not specified</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {user.last_sign_in_at ? (
                    <div className="flex items-center gap-2 text-sm text-gray-900">
                      <Clock className="h-4 w-4 text-gray-400" />
                      {formatDistanceToNow(new Date(user.last_sign_in_at), { addSuffix: true })}
                    </div>
                  ) : (
                    <span className="text-sm text-gray-500">Never</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`
                    inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium
                    ${user.is_admin ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'}
                  `}>
                    <Shield className="h-4 w-4" />
                    {user.is_admin ? 'Admin' : 'User'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setEditingUser(user)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      <Pencil className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDeleteUser(user.id)}
                      disabled={deleting === user.id || user.id === currentUserId}
                      className="text-red-600 hover:text-red-900 disabled:opacity-50"
                      title={user.id === currentUserId ? "You cannot delete your own account" : "Delete user"}
                    >
                      {deleting === user.id ? (
                        <Loader className="h-5 w-5 animate-spin" />
                      ) : (
                        <Trash2 className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit User Modal */}
      {editingUser && (
        <EditUserModal
          isOpen={!!editingUser}
          onClose={() => setEditingUser(null)}
          user={editingUser}
          onUserUpdate={handleUserUpdate}
        />
      )}
    </>
  );
}

export default UsersTab;