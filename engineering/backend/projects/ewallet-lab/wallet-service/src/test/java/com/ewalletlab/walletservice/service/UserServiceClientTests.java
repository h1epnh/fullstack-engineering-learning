package com.ewalletlab.walletservice.service;

import com.sun.net.httpserver.HttpServer;
import io.micrometer.core.instrument.simple.SimpleMeterRegistry;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

/** Issue #55 — the 3 outcomes against a real (stub) HTTP server: found / 404 / unavailable (5xx, timeout, refused). */
class UserServiceClientTests {

    private HttpServer server;

    @AfterEach
    void stop() {
        if (server != null) server.stop(0);
    }

    private UserServiceClient start(int status, String body, long delayMs) throws Exception {
        server = HttpServer.create(new InetSocketAddress("127.0.0.1", 0), 0);
        server.createContext("/users", ex -> {
            try { Thread.sleep(delayMs); } catch (InterruptedException ignored) { }
            byte[] b = body.getBytes(StandardCharsets.UTF_8);
            ex.getResponseHeaders().add("Content-Type", "application/json");
            ex.sendResponseHeaders(status, b.length == 0 ? -1 : b.length);
            if (b.length > 0) ex.getResponseBody().write(b);
            ex.close();
        });
        server.start();
        return new UserServiceClient("http://127.0.0.1:" + server.getAddress().getPort(), 300, 300, new SimpleMeterRegistry());
    }

    @Test
    @DisplayName("found: trả user kèm kycTier")
    void found() throws Exception {
        UUID id = UUID.randomUUID();
        UserServiceClient c = start(200, "{\"id\":\"" + id + "\",\"kycTier\":\"VERIFIED\"}", 0);
        Optional<UserServiceClient.UserResponse> r = c.findUser(id);
        assertEquals("VERIFIED", r.orElseThrow().kycTier());
    }

    @Test
    @DisplayName("404: Optional.empty() (không ném lỗi)")
    void notFound() throws Exception {
        assertTrue(start(404, "", 0).findUser(UUID.randomUUID()).isEmpty());
    }

    @Test
    @DisplayName("5xx: KycUnavailableException")
    void serverError() throws Exception {
        assertThrows(KycUnavailableException.class, () -> start(500, "", 0).findUser(UUID.randomUUID()));
    }

    @Test
    @DisplayName("timeout đọc: KycUnavailableException, không treo")
    void readTimeout() throws Exception {
        UserServiceClient c = start(200, "{}", 2000);
        long t0 = System.currentTimeMillis();
        assertThrows(KycUnavailableException.class, () -> c.findUser(UUID.randomUUID()));
        assertTrue(System.currentTimeMillis() - t0 < 1500);
    }

    @Test
    @DisplayName("kết nối bị từ chối: KycUnavailableException")
    void connectionRefused() {
        UserServiceClient c = new UserServiceClient("http://127.0.0.1:1", 300, 300, new SimpleMeterRegistry());
        assertThrows(KycUnavailableException.class, () -> c.findUser(UUID.randomUUID()));
    }
}
