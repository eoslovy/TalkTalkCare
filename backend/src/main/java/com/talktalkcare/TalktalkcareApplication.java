package com.talktalkcare;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@EnableScheduling
@SpringBootApplication
public class TalktalkcareApplication {

    public static void main(String[] args) {
        SpringApplication.run(TalktalkcareApplication.class, args);
        
    }

}
