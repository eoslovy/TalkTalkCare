package com.talktalkcare.domain.users.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.talktalkcare.domain.users.dto.FriendDto;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
@RequiredArgsConstructor
public class UserStatusWebSocketHandler extends TextWebSocketHandler {

    private final FriendService friendService;
    private final ObjectMapper objectMapper;
    private final Map<Integer, WebSocketSession> sessions = new ConcurrentHashMap<>();

    @Override
    public void afterConnectionEstablished(WebSocketSession session) {
        Integer userId = extractUserId(session);
        sessions.put(userId, session);
        friendService.setUserOnline(userId);
        broadcastStatusChange(userId, true);
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        Integer userId = extractUserId(session);
        List<FriendDto> friendsStatus = friendService.getFriendsStatus(userId);
        session.sendMessage(new TextMessage(objectMapper.writeValueAsString(friendsStatus)));
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
        Integer userId = extractUserId(session);
        sessions.remove(userId);
        friendService.setUserOffline(userId);
        broadcastStatusChange(userId, false);
    }

    private void broadcastStatusChange(Integer userId, boolean isOnline) {
        List<Integer> friendIds = friendService.getFriendIds(userId);
        for (Integer friendId : friendIds) {
            WebSocketSession friendSession = sessions.get(friendId);
            if (friendSession != null && friendSession.isOpen()) {
                try {
                    FriendDto statusUpdate = friendService.getFriendStatus(userId);
                    friendSession.sendMessage(new TextMessage(objectMapper.writeValueAsString(statusUpdate)));
                } catch (Exception e) {
                    // 로그 처리
                }
            }
        }
    }

    private Integer extractUserId(WebSocketSession session) {
        String query = session.getUri().getQuery();
        return Integer.parseInt(query.split("=")[1]);
    }
}