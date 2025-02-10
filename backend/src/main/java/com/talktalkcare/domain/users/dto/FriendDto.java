package com.talktalkcare.domain.users.dto;

import com.talktalkcare.domain.users.entity.User;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Duration;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class FriendDto {
    private Integer userId;
    private String name;
    private String s3Filename;
    private String phone;
    private String status;  // "ONLINE" or "OFFLINE"
    private LocalDateTime lastActiveTime;
    private String displayStatus;

    public static FriendDto from(Integer userId, String name, String s3Filename, String phone,
                                 boolean isOnline, LocalDateTime lastActiveTime) {
        String status = isOnline ? "ONLINE" : "OFFLINE";
        String displayStatus = createDisplayStatus(lastActiveTime, isOnline);
        return new FriendDto(
                userId,
                name,
                s3Filename,
                phone,
                status,
                lastActiveTime,
                displayStatus
        );
    }

    public static FriendDto fromUser(User user, boolean isOnline, LocalDateTime lastActiveTime) {
        String status = isOnline ? "ONLINE" : "OFFLINE";
        String displayStatus = createDisplayStatus(lastActiveTime, isOnline);
        return new FriendDto(
                user.getUserId(),
                user.getName(),
                user.getS3FileName(),
                user.getPhone(),
                status,
                lastActiveTime,
                displayStatus
        );
    }

    private static String createDisplayStatus(LocalDateTime lastActiveTime, boolean isOnline) {
        if(isOnline) {
            return "온라인";
        }

        if (lastActiveTime == null) {
            return "오프라인";
        }

        LocalDateTime now = LocalDateTime.now();
        Duration duration = Duration.between(lastActiveTime, now);

        if (duration.isNegative()) {
            return "온라인";
        }

        long minutes = duration.toMinutes();
        if (minutes < 1) {
            return "방금 전";
        } else if (minutes < 60) {
            return minutes + "분 전";
        }

        long hours = duration.toHours();
        if (hours < 24) {
            return hours + "시간 전";
        }

        return duration.toDays() + "일 전";
    }

    // 상태 업데이트 메서드
    public void updateStatus(boolean isOnline, LocalDateTime lastActiveTime) {
        this.status = isOnline ? "ONLINE" : "OFFLINE";
        this.lastActiveTime = lastActiveTime;
        this.displayStatus = createDisplayStatus(lastActiveTime, isOnline);
    }

    // 프로필 이미지 업데이트 메서드
    public void updateProfileImage(String s3Filename) {
        this.s3Filename = s3Filename;
    }
}