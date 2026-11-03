FROM golang:1.26 AS build
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 go build -o /notification-service .

FROM gcr.io/distroless/static-debian12
COPY --from=build /notification-service /notification-service
EXPOSE 8103
ENTRYPOINT ["/notification-service"]
