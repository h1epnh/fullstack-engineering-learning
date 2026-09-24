FROM golang:1.26 AS build
WORKDIR /app
COPY go.mod ./
COPY . .
RUN CGO_ENABLED=0 go build -o /mock-bank-gateway .

FROM gcr.io/distroless/static-debian12
COPY --from=build /mock-bank-gateway /mock-bank-gateway
EXPOSE 8093
ENTRYPOINT ["/mock-bank-gateway"]
