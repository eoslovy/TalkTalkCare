export interface Friend {
  userId: number;
  name: string;
  phone: string;
  s3Filename?: string;
  status: 'ONLINE' | 'OFFLINE';
  lastActiveTime: string;
  displayStatus: string;
}

export interface FriendStatusUpdate {
  userId: number;
  type: 'LOGIN' | 'LOGOUT';
  lastActiveTime: string;
  displayStatus: string;
}

export interface FriendListProps {
  userId: number;
  onClose: () => void;
  wsUrl?: string;
  apiUrl?: string;
}

export interface FriendItemProps {
  friend: Friend;
  onRemove?: () => void;
}

export interface AddFriendRequest {
  userId: number;
  name: string;
  phone: string;
}