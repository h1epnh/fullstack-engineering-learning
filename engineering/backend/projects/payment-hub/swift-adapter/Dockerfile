FROM golang:1.26 AS build
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 go build -o /swift-adapter .

FROM gcr.io/distroless/static-debian12
COPY --from=build /swift-adapter /swift-adapter
EXPOSE 8082
ENTRYPOINT ["/swift-adapter"]
