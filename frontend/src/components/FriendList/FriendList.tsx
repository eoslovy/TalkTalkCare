import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useWebSocket } from '../../hooks/useWebSocket';
import { friendApi } from '../api/friendApi';
import { Friend, FriendStatusUpdate } from '../../types/friend';
import FriendItem from './FriendItem';
import AddFriendModal from './AddFriendModal';
import styles from './FriendList.module.css';

interface FriendListProps {
    userId: number;
}

const FriendList: React.FC<FriendListProps> = ({ userId }) => {
    const [friends, setFriends] = useState<Friend[]>([]);
    const [showAddFriend, setShowAddFriend] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const isInitialMount = useRef(true);

    const loadFriends = useCallback(async () => {
        if (!userId) return;
        
        try {
            const data = await friendApi.getFriends(userId);
            if (data.result?.msg === 'success') {
                setFriends(data.body);
                setError(null);
            }
        } catch (error) {
            setError('친구 목록을 불러오는데 실패했습니다.');
            console.error('친구 목록 로딩 실패:', error);
        } finally {
            setIsLoading(false);
        }
    }, [userId]);

    // 초기 로딩
    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
            loadFriends();
        }
    }, [userId, loadFriends]);

    // 웹소켓 메시지 핸들러
    const handleWebSocketMessage = useCallback((data: Friend | FriendStatusUpdate) => {
        if (!data) return;

        console.log('웹소켓 메시지 수신:', data);
        
        // 상태 업데이트 처리
        setFriends(prev => prev.map(friend => {
            if (friend.userId === data.userId) {
                // 전체 친구 정보가 포함된 경우
                if ('phone' in data) {
                    return data;
                }
                // 상태 정보만 포함된 경우
                return {
                    ...friend,
                    status: data.status,
                    lastActiveTime: data.lastActiveTime,
                    displayStatus: data.displayStatus
                };
            }
            return friend;
        }));
    }, []);

    // 웹소켓 연결
    useWebSocket(
        `${process.env.REACT_APP_WS_URL}/api/talktalkcare`,
        userId,
        handleWebSocketMessage
    );

    const handleAddFriend = async (request: { userId: number; phone: string; name: string }) => {
        try {
            const data = await friendApi.addFriend(request);
            if (data.result?.msg === 'success') {
                await loadFriends();
            }
        } catch (error) {
            console.error('친구 추가 실패:', error);
        }
    };

    const handleRemoveFriend = async (friendId: number) => {
        try {
            await friendApi.removeFriend(userId, friendId);
            await loadFriends();
        } catch (error) {
            console.error('친구 삭제 실패:', error);
        }
    };

    if (isLoading) return <div>로딩 중...</div>;
    if (error) return <div className={styles.error}>{error}</div>;

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h2>친구 목록</h2>
                <button 
                    onClick={() => setShowAddFriend(true)}
                    className={styles.addButton}
                >
                    친구 추가
                </button>
            </div>
            <div className={styles.friendList}>
                {friends.length === 0 ? (
                    <div className={styles.emptyState}>
                        아직 등록된 친구가 없습니다.
                    </div>
                ) : (
                    friends.map(friend => (
                        <FriendItem 
                            key={friend.userId}
                            friend={friend}
                            onRemove={() => handleRemoveFriend(friend.userId)}
                        />
                    ))
                )}
            </div>
            {showAddFriend && (
                <AddFriendModal 
                    userId={userId}
                    onClose={() => setShowAddFriend(false)}
                    onAdd={handleAddFriend}
                />
            )}
        </div>
    );
};

export default React.memo(FriendList);