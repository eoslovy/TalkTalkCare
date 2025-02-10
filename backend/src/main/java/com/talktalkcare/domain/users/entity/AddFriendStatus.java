package com.talktalkcare.domain.users.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@NoArgsConstructor
@Table(name = "add_friends_status")
public class AddFriendStatus {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    private Integer receiverId;

    private Integer senderId;

    private String status;

    public AddFriendStatus(Integer receiverId, Integer senderId, String status) {
        this.receiverId = receiverId;
        this.senderId = senderId;
        this.status = status;
    }
}
