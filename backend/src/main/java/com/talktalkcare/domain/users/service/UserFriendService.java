package com.talktalkcare.domain.users.service;

import com.talktalkcare.domain.users.converter.AddFriendStatusConverter;
import com.talktalkcare.domain.users.dto.AddFriendReq;
import com.talktalkcare.domain.users.dto.AddFriendStatusDto;
import com.talktalkcare.domain.users.dto.DeleteFriendReq;
import com.talktalkcare.domain.users.dto.FriendDto;
import com.talktalkcare.domain.users.entity.AddFriendStatus;
import com.talktalkcare.domain.users.entity.User;
import com.talktalkcare.domain.users.entity.UserFriend;
import com.talktalkcare.domain.users.error.UserErrorCode;
import com.talktalkcare.domain.users.exception.UserException;
import com.talktalkcare.domain.users.repository.AddFriendStatusRepository;
import com.talktalkcare.domain.users.repository.UserFriendRepository;
import com.talktalkcare.domain.users.repository.UserRepository;
import com.talktalkcare.infrastructure.repository.RedisRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class UserFriendService {

    private final RedisRepository redisRepository;
    private final UserRepository userRepository;
    private final UserFriendRepository userFriendRepository;
    private final AddFriendStatusRepository addFriendStatusRepository;

    private static final String USER_STATUS_PREFIX = "user:status:";
    private static final String USER_LAST_ACTIVE_PREFIX = "user:lastActive:";

    public void setUserOnline(Integer userId) {
        redisRepository.save(USER_STATUS_PREFIX + userId, "ONLINE");
        updateLastActiveTime(userId);
    }

    public void setUserOffline(Integer userId) {
        redisRepository.save(USER_STATUS_PREFIX + userId, "OFFLINE");
        updateLastActiveTime(userId);
    }

    @Transactional(readOnly = true)
    public boolean isUserOnline(Integer userId) {
        Object status = redisRepository.find(USER_STATUS_PREFIX + userId);
        return "ONLINE".equals(status);
    }

    public void updateLastActiveTime(Integer userId) {
        redisRepository.save(
                USER_LAST_ACTIVE_PREFIX + userId,
                LocalDateTime.now().toString(),
                24
        );
    }

    @Transactional(readOnly = true)
    public LocalDateTime getLastActiveTime(Integer userId) {
        String time = (String) redisRepository.find(USER_LAST_ACTIVE_PREFIX + userId);
        return time != null ? LocalDateTime.parse(time) : null;
    }

    @Transactional(readOnly = true)
    public List<FriendDto> getFriendsStatus(Integer userId) {
        List<FriendDto> friendsStatus = new ArrayList<>();
        List<Integer> friendIds = userFriendRepository.findFriendIdsByUserId(userId);

        for (Integer friendId : friendIds) {
            userRepository.findById(friendId).ifPresent(friend -> {
                boolean isOnline = isUserOnline(friendId);
                LocalDateTime lastActiveTime = getLastActiveTime(friendId);

                FriendDto friendDto = FriendDto.from(
                        friendId,
                        friend.getName(),
                        friend.getS3FileName(),
                        friend.getPhone(),
                        isOnline,
                        lastActiveTime
                );

                friendsStatus.add(friendDto);
            });
        }

        return friendsStatus;
    }

    @Transactional(readOnly = true)
    public FriendDto getFriendStatus(Integer friendId) {
        return userRepository.findById(friendId)
                .map(friend -> FriendDto.from(
                        friendId,
                        friend.getName(),
                        friend.getS3FileName(),
                        friend.getPhone(),
                        isUserOnline(friendId),
                        getLastActiveTime(friendId)
                ))
                .orElse(null);
    }

    // 모든 사용자의 상태 정보 초기화 (서버 재시작시 사용)
    public void resetAllUserStatus() {
        String pattern = USER_STATUS_PREFIX + "*";
        for(String key : redisRepository.keys(pattern)) {
            redisRepository.delete(key);
        }
    }

    @Transactional(readOnly = true)
    public List<Integer> getFriendIds(Integer userId) {
        return userFriendRepository.findFriendIdsByUserId(userId);
    }

    public void addFriendRequsetSend(AddFriendStatusDto addFriendStatusDto) {
        AddFriendStatus addFriendStatus = AddFriendStatusConverter.toEntity(addFriendStatusDto);
        addFriendStatusRepository.save(addFriendStatus);
    }

    public void rejectFriendRequsetSend(AddFriendStatusDto addFriendStatusDto) {
        AddFriendStatus addFriendStatus = addFriendStatusRepository.findByReceiverId(addFriendStatusDto.getReceiverId());
        addFriendStatusRepository.delete(addFriendStatus);
    }

    @Transactional(readOnly = true)
    public List<AddFriendStatusDto> getReceiveFriendRequests(Integer userId) {
        return addFriendStatusRepository.findAddRequestsByReceiverId(userId);
    }

    @Transactional(readOnly = true)
    public List<AddFriendStatusDto> getSendAddFriendRequests(Integer userId) {
        return addFriendStatusRepository.findAddRequestsBySenderId(userId);
    }

    public void addFriend(AddFriendReq addFriendReq) {
        User Friend = userRepository.findByPhone(addFriendReq.getPhone())
                .orElseThrow(() -> new UserException(UserErrorCode.USER_NOT_FOUND));

        userFriendRepository.save(new UserFriend(
                addFriendReq.getUserId(),
                Friend.getUserId(),
                addFriendReq.getName()));
    }

    public void removeFriend(DeleteFriendReq deleteFriendReq) {
        userFriendRepository.deleteByUserIdAndFriendId(deleteFriendReq.getUserId(), deleteFriendReq.getFriendId());
    }
}