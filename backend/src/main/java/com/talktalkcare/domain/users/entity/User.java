package com.talktalkcare.domain.users.entity;

import jakarta.persistence.*;
import org.antlr.v4.runtime.misc.NotNull;

import java.util.Date;

@Entity
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
    private Date birth;

    @NotNull
    private String phone;

    private Date loginedAt;

    @NotNull
    @Column(name="s3_filename")
    private String s3FileName;

}