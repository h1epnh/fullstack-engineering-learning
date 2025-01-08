package com.finx.email_processor.api.filter;

import java.util.Set;
import lombok.NonNull;
import lombok.extern.log4j.Log4j2;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.util.AntPathMatcher;
import org.springframework.web.server.ServerWebExchange;
import org.springframework.web.server.WebFilter;
import org.springframework.web.server.WebFilterChain;
import reactor.core.publisher.Mono;

@Component
@Log4j2
public class RequestIdWebFilter implements WebFilter {

    private final Set<String> ignoredPaths;

    private final AntPathMatcher pathMatcher = new AntPathMatcher();

    public RequestIdWebFilter(@Value("${spring.webflux.base-path}") String contextPath) {
        ignoredPaths = Set.of("/prometheus/**", "/actuator/**", contextPath.concat("/docs/**"));
    }

    @Override
    public Mono<Void> filter(
            @NonNull ServerWebExchange serverWebExchange, @NonNull WebFilterChain webFilterChain) {
        if (isSignatureIgnored(serverWebExchange)) {
            log.debug("Ignored filter endpoint {}", serverWebExchange.getRequest().getPath().toString());
            return webFilterChain.filter(serverWebExchange);
        }

        return webFilterChain.filter(serverWebExchange);
    }

    private boolean isSignatureIgnored(ServerWebExchange exchange) {
        return ignoredPaths.stream()
                .map(path -> isPathIgnored(exchange, path))
                .reduce(Boolean::logicalOr)
                .orElse(false);
    }

    private boolean isPathIgnored(ServerWebExchange exchange, String ignoredPath) {
        return pathMatcher.match(ignoredPath, exchange.getRequest().getPath().toString());
    }
}
