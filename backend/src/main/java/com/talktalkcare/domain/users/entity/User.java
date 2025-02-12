package com.talktalkcare.domain.users.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.util.Date;

@Entity
@Getter
@Setter
@NoArgsConstructor
@Table(name="users")
public class User {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int userId;

    @NotNull
    private String loginId;

    @NotNull
    private String password;

    private String token;

    @NotNull
    private String name;

    @NotNull
    private LocalDate birth;

    @NotNull
    private String phone;

    private Date loginedAt;

    @NotNull
    @Column(name="s3_filename")
    private String s3FileName;

    public User(String loginId, String password, String name, LocalDate birth, String phone) {
        this.loginId = loginId;
        this.password = password;
        this.name = name;
        this.birth = birth;
        this.phone = phone;
    }

}