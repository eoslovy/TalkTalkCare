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
  status: 'ONLINE' | 'OFFLINE';
  lastActiveTime: string;
  displayStatus: string;
}

export interface AddFriendRequest {
  userId: number;
  phone: string;
  name: string;
}

export interface ApiResponse<T> {
  result: {
    msg: string;
  };
  body: T;
} 