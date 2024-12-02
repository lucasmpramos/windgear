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
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const handleRemoveUser = () => {
    onUserSelect(null);
  };

  const handleUserSelect = (user: User) => {
    onUserSelect(user);
    setIsSearchOpen(false);
  };

  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {t('common.seller')}{!optional && ' *'}
      </label>
      {selectedUser ? (
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center">
            <UserAvatar user={selectedUser} className="h-10 w-10 mr-3" />
            <div>
              <div className="text-sm font-medium text-gray-900">{selectedUser.name}</div>
              <div className="text-sm text-gray-500">{selectedUser.email}</div>
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
        <div>
          <button
            type="button"
            onClick={() => setIsSearchOpen(true)}
            className="w-full text-left p-3 border border-gray-300 rounded-lg text-sm text-gray-500 hover:border-gray-400"
          >
            {t('common.select_seller')}
          </button>
          {isSearchOpen && (
            <div className="mt-2">
              <UserSearchInput
                value={userSearch}
                onChange={(value) => setUserSearch(value)}
                onSelect={handleUserSelect}
                currentUser={currentUser}
                excludedUsers={[]}
              />
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