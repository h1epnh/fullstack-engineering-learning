package com.example.DDDSample.application.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.data.redis.RedisProperties;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import redis.clients.jedis.Jedis;

@RestController
public class RedisController {

    // ...
    @Autowired(required = false)
    private Jedis jedis;

    @GetMapping("/redis")
    public String redisExample() {
        if (jedis == null) {
            return "Redis is not configured";
        }

        jedis.set("key", "value");
        return jedis.get("key");
    }
}
