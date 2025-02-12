// UserListItem.tsx
import React from 'react';
import { Phone } from 'lucide-react';

interface UserListItemProps {
  name: string;
  image: string;
  status?: string;
  time?: string;
}

const UserListItem = ({ name, image, status, time }: UserListItemProps) => (
  <div 
    className="flex items-center w-full h-full p-2 each-friend-container"
  >
    {/* 왼쪽 컨테이너: 이미지와 이름 */}
    <div className="flex items-center">
      <img src={image} alt={name} className="w-10 h-10 rounded-full" />
      <div className="ml-3">
        <div className="font-medium">{name}</div>
        {status && time && (
          <div className="text-xs text-gray-500">{status} {time}</div>
        )}
      </div>
    </div>

    {/* 오른쪽 컨테이너: 전화 아이콘 */}
    <div className="phone-icon-container">
      <Phone size={32} className="text-gray-700" />
    </div>
  </div>
);

export default UserListItem;
