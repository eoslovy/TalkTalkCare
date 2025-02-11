package com.talktalkcare.infrastructure.repository;

import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Repository;

import java.time.Duration;


@Repository
public class RedisRepository {

    private final RedisTemplate<String, Object> redisTemplate;

    public RedisRepository(RedisTemplate<String, Object> redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    public void save(String key, Object data) {
        redisTemplate.opsForValue().set(key,data);
    }

    public void save(String key, Object data, long timeoutInMinutes) {
        redisTemplate.opsForValue().set(key, data, Duration.ofMinutes(timeoutInMinutes));
    }

    public Object find(String redisKey) {
        return redisTemplate.opsForValue().get(redisKey);
    }

    public void delete(String redisKey) {
        redisTemplate.delete(redisKey);
    }

}