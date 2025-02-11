package com.talktalkcare.domain.talktalkAI.entity;

import jakarta.persistence.*;
import lombok.*;
import org.antlr.v4.runtime.misc.NotNull;

import java.util.Date;

@Getter
@Setter
@Entity
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "user_talktalk_log")
public class TalkTalk {

    @Id
    @Column(name = "user_id", nullable = false)
    private Integer userId;

    @Column(name = "talk_summary", nullable = false)
    private String summary;
}