package com.talktalkcare.domain.users.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.talktalkcare.domain.call.dto.CallInvitationDto;
import com.talktalkcare.domain.users.dto.FriendDto;
import com.talktalkcare.domain.users.entity.Friend;
import com.talktalkcare.domain.users.entity.User;
import com.talktalkcare.domain.users.repository.FriendRepository;
import com.talktalkcare.domain.users.repository.UserRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;


@Component
@RequiredArgsConstructor
@Slf4j
public class UserStatusWebSocketHandler extends TextWebSocketHandler {

    private final FriendService friendService;
    private final ObjectMapper objectMapper;

    // static으로 선언된 sessions map
    private static final Map<Integer, WebSocketSession> sessions = new ConcurrentHashMap<>();

    // 상태 확인을 위한 static 메서드
    public static boolean isUserConnected(Integer userId) {
        return sessions.containsKey(userId);
    }

    public static WebSocketSession getUserSession(Integer userId) {
        return sessions.get(userId);
    }

    public static Map<Integer, WebSocketSession> getAllSessions() {
        return Collections.unmodifiableMap(sessions);
    }

    private final FriendRepository friendRepository;
    private final UserRepository userRepository;

    @PostConstruct
    public void init() {
        objectMapper.registerModule(new JavaTimeModule());
        objectMapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
    }

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        Integer userId = extractUserId(session);
        if (userId != null) {
            try {
                sessions.put(userId, session);
                log.info("WebSocket 연결 성공 - userId: {}", userId);

                // 이 사용자를 친구로 등록한 모든 사용자에게 온라인 상태 알림
                notifyFriendsStatusChange(userId, true);

                // 이 사용자에게 모든 친구의 현재 상태 전송
                sendFriendsStatus(userId, session);
            } catch (Exception e) {
                log.error("WebSocket 연결 중 오류 발생 - userId: {}", userId, e);
                if (session.isOpen()) {
                    session.close(CloseStatus.SERVER_ERROR);
                }
                sessions.remove(userId);
            }
        }
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
        try {
            Integer userId = extractUserId(session);
            if (userId != null) {
                sessions.remove(userId);
                log.info("WebSocket 연결 종료 - userId: {}, status: {}", userId, status);

                // 접속 종료된 사용자의 친구들에게 오프라인 상태 알림
                notifyFriendsStatusChange(userId, false);
            }
        } catch (Exception e) {
            log.error("WebSocket 연결 종료 중 오류 발생", e);
        }
    }

    private void notifyFriendsStatusChange(Integer userId, boolean isOnline) {
        try {
            // 이 사용자를 친구로 등록한 모든 사용자 찾기
            List<Integer> usersWhoAddedMe = friendRepository.findUserIdsByFriendId(userId);
            if (usersWhoAddedMe != null) {
                for (Integer friendId : usersWhoAddedMe) {
                    WebSocketSession friendSession = sessions.get(friendId);
                    if (friendSession != null && friendSession.isOpen()) {
                        // 각 사용자별로 저장된 친구 이름으로 상태 업데이트
                        Friend friendRelation = friendRepository.findAllByUserId(friendId)
                                .stream()
                                .filter(f -> f.getFriendId().equals(userId))
                                .findFirst()
                                .orElse(null);

                        if (friendRelation != null) {
                            FriendDto updatedStatus = FriendDto.from(
                                    userId,
                                    friendRelation.getFriendName(),  // 저장된 친구 이름 사용
                                    userRepository.findById(userId).map(User::getS3FileName).orElse(null),
                                    userRepository.findById(userId).map(User::getPhone).orElse(null),
                                    isOnline,
                                    LocalDateTime.now()
                            );

                            friendSession.sendMessage(new TextMessage(objectMapper.writeValueAsString(
                                    Collections.singletonList(updatedStatus)
                            )));
                        }
                    }
                }
            }
        } catch (Exception e) {
            log.error("친구 상태 변경 알림 실패 - userId: {}", userId, e);
        }
    }

    private void sendFriendsStatus(Integer userId, WebSocketSession session) throws IOException {
        List<FriendDto> friendsStatus = friendService.getFriendsStatus(userId);
        if (friendsStatus != null) {
            // 각 친구의 실제 현재 상태 확인
            friendsStatus = friendsStatus.stream()
                    .filter(friend -> friend != null)
                    .map(friend -> {
                        boolean isOnline = friendService.isUserOnline(friend.getUserId());  // sessions.containsKey 대신 Redis 상태 확인
                        if (isOnline) {
                            friend.updateStatus(true, LocalDateTime.now());
                        }
                        return friend;
                    })
                    .collect(Collectors.toList());

            if (session.isOpen()) {
                session.sendMessage(new TextMessage(objectMapper.writeValueAsString(friendsStatus)));
            }
        }
    }

    private Integer extractUserId(WebSocketSession session) {
        try {
            String query = session.getUri().getQuery();
            return Integer.valueOf(query.split("=")[1]);
        } catch (Exception e) {
            log.error("userId 추출 중 에러 발생", e);
            return null;
        }
    }

    public void sendNotification(User receiver, CallInvitationDto invitation) {
        WebSocketSession session = sessions.get(receiver.getUserId());
        try {
            String payload = objectMapper.writeValueAsString(invitation);
            session.sendMessage(new TextMessage(payload));
        } catch (Exception e) {

        }

    }
}