package com.example.DDDSample.application.configuration;

import org.springframework.context.annotation.Configuration;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.RedisConnectionFailureException;
import org.springframework.data.redis.connection.jedis.JedisConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;
import redis.clients.jedis.Jedis;
import redis.clients.jedis.JedisPool;
import redis.clients.jedis.JedisPoolConfig;


@Configuration
public class JedisConfig {
    @Value("${spring.data.redis.connection.host}")
    private String host;

    @Value("${spring.data.redis.connection.port}")
    private int port;

    @Value("${spring.data.redis.connection.password}")
    private String password;

    @Value("${spring.data.redis.connection.database}")
    private int database;

    @Bean
    public JedisPool jedisPool() {
        JedisPoolConfig poolConfig = new JedisPoolConfig();
        poolConfig.setJmxEnabled(false);  // Disable JMX
        poolConfig.setMaxTotal(10);
        poolConfig.setMaxIdle(5);
        poolConfig.setMinIdle(1);
        try {
            return new JedisPool(poolConfig, host, port, 2000, password, database);
        } catch (Exception e) {
            System.err.println("Could not establish Redis connection: " + e.getMessage());
            return null;
        }
    }

//    @Bean
//    public Jedis jedis(JedisPool jedisPool) {
//        if (jedisPool != null) {
//            try {
//                return jedisPool.getResource();
//            } catch (Exception e) {
//                System.err.println("Could not get Jedis resource: " + e.getMessage());
//            }
//        }
//        return null;  // Return null if JedisPool is null or resource fetching fails
//    }
//
//    @Bean
//    public RedisTemplate<String, Object> redisTemplate(JedisPool jedisPool) {
//        RedisTemplate<String, Object> template = new RedisTemplate<>();
//        try {
//            if (jedisPool != null) {
//                JedisConnectionFactory jedisConnectionFactory = new JedisConnectionFactory();
//                jedisConnectionFactory.setHostName(host);
//                jedisConnectionFactory.setPort(port);
//                jedisConnectionFactory.setPassword(password);
//                jedisConnectionFactory.setDatabase(database);
//                template.setConnectionFactory(jedisConnectionFactory);
//            }
//        } catch (RedisConnectionFailureException e) {
//            System.err.println("Could not configure RedisTemplate: " + e.getMessage());
//        }
//        return template;
//    }
}
