import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, X, Loader } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { User } from '../../../types';
import Avatar from '../Avatar';
import debounce from '../../../utils/debounce';
import { useStore } from '../../../store/useStore';

interface UserSelectProps {
  selectedUser: User | null;
  onUserSelect: (user: User | null) => void;
  optional?: boolean;
  onCancel?: () => void;
  className?: string;
}

function UserSelect({ selectedUser, onUserSelect, optional = false, onCancel, className = '' }: UserSelectProps) {
  const { t } = useTranslation();
  const { user: currentUser } = useStore();
  const [userSearch, setUserSearch] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<User[]>([]);

  // Only render for admin users
  if (!currentUser?.is_admin && !optional) {
    return null;
  }

  const searchUsers = debounce(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      setSearching(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .or(`full_name.ilike.%${query}%,email.ilike.%${query}%`)
        .limit(5);

      if (error) throw error;
      setSearchResults(data);
    } catch (error) {
      console.error('Error searching users:', error);
    } finally {
      setSearching(false);
    }
  }, 300);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setUserSearch(query);
    searchUsers(query);
  };

  const handleSelectUser = (user: User) => {
    onUserSelect(user);
    setUserSearch('');
    setSearchResults([]);
  };

  const handleRemoveUser = () => {
    onUserSelect(null);
  };

  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {t('common.seller')} {!optional && '*'}
      </label>
      {selectedUser ? (
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-3">
            <Avatar
              src={selectedUser.avatar_url}
              alt={selectedUser.full_name || 'Seller'}
              size="sm"
            />
            <div>
              <p className="text-sm font-medium text-gray-900">
                {selectedUser.full_name || 'Anonymous'}
              </p>
              <p className="text-sm text-gray-500">
                {selectedUser.email}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleRemoveUser}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      ) : (
        <div className="relative">
          <input
            type="text"
            value={userSearch}
            onChange={handleSearchChange}
            placeholder={t('common.searchUsers')}
            className="w-full px-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          {searching && (
            <Loader className="absolute right-3 top-2.5 h-5 w-5 text-blue-500 animate-spin" />
          )}
          {searchResults.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200">
              {searchResults.map((user) => (
                <button
                  key={user.id}
                  type="button"
                  onClick={() => handleSelectUser(user)}
                  className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 text-left"
                >
                  <Avatar
                    src={user.avatar_url}
                    alt={user.full_name || 'User'}
                    size="sm"
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {user.full_name || 'Anonymous'}
                    </p>
                    <p className="text-sm text-gray-500">
                      {user.email}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
      {onCancel && (
        <button
          type="button"
          onClick={onCancel}
          className="mt-2 w-full text-sm text-gray-600 hover:text-gray-900"
        >
          Cancel
        </button>
      )}
    </div>
  );
}

export default UserSelect;