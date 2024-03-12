import React, { useState, useEffect, ChangeEvent } from 'react';
import './app.css';

interface User {
  first_name: string;
  last_name: string;
}

interface Group {
  id: number;
  name: string;
  closed: boolean;
  avatar_color?: string;
  members_count: number;
  friends?: User[];
}

interface Filter {
  privacy: 'all' | 'open' | 'closed';
  avatarColor: 'any' | 'red' | 'green' | 'yellow' | 'blue' | 'purple' | 'white' | 'orange';
  hasFriends: boolean;
  selectedGroupId: number | null;
}

const App: React.FC = () => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [filter, setFilter] = useState<Filter>({
    privacy: 'all',
    avatarColor: 'any',
    hasFriends: false,
    selectedGroupId: null,
  });

  useEffect(() => {
    setTimeout(() => {
      fetch('./groups.json')
        .then((response) => response.json())
        .then((data: Group[]) => setGroups(data || []))
        .catch((error) => console.error('Error fetching data:', error));
    }, 1000);
  }, []);

  const handleFilterChange = (event: ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value, type } = event.target;
    let checked: boolean | null = null;
  
    if (type === 'checkbox') {
      const checkboxInput = event.target as HTMLInputElement;
      checked = checkboxInput.checked;
    }
  
    setFilter((prevFilter) => ({
      ...prevFilter,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };
   
  const handleFriendListClick = (groupId: number) => {
    setFilter((prevFilter) => ({
      ...prevFilter,
      selectedGroupId: groupId === prevFilter.selectedGroupId ? null : groupId,
    }));
  };

  const filteredGroups = groups.filter((group) => {
    const isPrivacyMatch =
      filter.privacy === 'all' || (filter.privacy === 'closed' && group.closed) || (filter.privacy === 'open' && !group.closed);

    const isColorMatch = filter.avatarColor === 'any' || filter.avatarColor === group.avatar_color;

    const hasFriends = group.friends && group.friends.length > 0;
    const isFriendsMatch = !filter.hasFriends || (filter.hasFriends && hasFriends);

    return isPrivacyMatch && isColorMatch && isFriendsMatch;
  });

  return (
    <div className="App">
      <h1>Список групп</h1>
      <div className="filters">
        <label>
          Тип приватности:
          <select name="privacy" value={filter.privacy} onChange={handleFilterChange}>
            <option value="all">Все</option>
            <option value="open">Открытые</option>
            <option value="closed">Закрытые</option>
          </select>
        </label>
        <label>
          Цвет аватарки:
          <select name="avatarColor" value={filter.avatarColor} onChange={handleFilterChange}>
            <option value="any">Любой</option>
            <option value="red">Красный</option>
            <option value="green">Зелёный</option>
            <option value="yellow">Жёлтый</option>
            <option value="blue">Синий</option>
            <option value="purple">Фиолетовый</option>
            <option value="white">Белый</option>
            <option value="orange">Оранжевый</option>
          </select>
        </label>
        <label>
          Только с друзьями:
          <input type="checkbox" name="hasFriends" checked={filter.hasFriends} onChange={handleFilterChange} />
        </label>
      </div>
      <div className="groups-list">
        {filteredGroups.map((group) => (
          <div key={group.id} className="group-card">
            {group.avatar_color && (
              <div className="avatar" style={{ backgroundColor: group.avatar_color }}>
                {group.avatar_color && <span>{group.avatar_color[0].toUpperCase()}</span>}
              </div>
            )}
            <div className="group-details">
              <h2>{group.name}</h2>
              {group.closed !== undefined && <p>{group.closed ? 'Закрытая' : 'Открытая'}</p>}
              {group.members_count !== undefined && <p>Подписчиков: {group.members_count}</p>}
              {group.friends && (
                <div className="friends">
                  <p onClick={() => handleFriendListClick(group.id)}>Друзей в группе: {group.friends.length}</p>
                  {filter.selectedGroupId === group.id && (
                    <ul>
                      {group.friends.map((friend) => (
                        <li key={`${friend.first_name}_${friend.last_name}`}>
                          {`${friend.first_name} ${friend.last_name}`}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default App;
