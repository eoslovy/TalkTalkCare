import axios from 'axios';
import { Friend, AddFriendRequest, ApiResponse } from '../../types/friend';

export const friendApi = {
    // 친구 목록 조회
    getFriends: async (userId: number): Promise<ApiResponse<Friend[]>> => {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/friends/${userId}`, {
            withCredentials: true
        });
        return response.data;
    },

    // 친구 추가
    addFriend: async (request: AddFriendRequest): Promise<ApiResponse<void>> => {
        const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/friends/add-friend`, request, {
            withCredentials: true
        });
        return response.data;

    },



    // 친구 삭제
    removeFriend: async (userId: number, friendId: number): Promise<void> => {
        await axios.delete(`${process.env.REACT_APP_API_URL}/api/friends/${userId}/${friendId}`, {
            withCredentials: true
        });
    },




    // 친구 상태 조회
    getFriendStatus: async (friendId: number): Promise<ApiResponse<Friend>> => {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/friends/status/${friendId}`, {
            withCredentials: true
        });
        return response.data;
    }

};