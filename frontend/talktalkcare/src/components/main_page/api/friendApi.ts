import axios from 'axios';
import { Friend } from '../friends.ts';

const API_BASE_URL = process.env.REACT_APP_API_URL;

export const friendApi = {
    // 친구 추가 - 로그인한 사용자 ID와 친구 정보 전송
    addFriend: async (userId: number, phone: string, name: string) => {
        const response = await axios.post(
            `${API_BASE_URL}/api/friends/add-friend`, 
            { 
                userId,  // 로그인한 현재 사용자 ID
                phone,   // 친구 전화번호
                name     // 저장할 친구 이름
            }, 
            { withCredentials: true }
        );
        return response.data;
    },

    // 친구 삭제
    removeFriend: async (userId: number, friendId: number) => {
        await axios.delete(`${API_BASE_URL}/api/friends/${userId}/${friendId}`, {
            withCredentials: true
        });
    },

    // 친구 상태 조회
    getFriendStatus: async (friendId: number) => {
        const response = await axios.get(`${API_BASE_URL}/api/friends/status/${friendId}`, {
            withCredentials: true
        });
        return response.data;
    },
    
    getFriends: async (userId: number) => {
        const response = await axios.get(`${API_BASE_URL}/api/friends/${userId}`, {
            withCredentials: true
        });
        return response.data;
    },
};