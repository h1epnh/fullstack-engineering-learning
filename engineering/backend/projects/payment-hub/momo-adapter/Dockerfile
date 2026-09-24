FROM golang:1.26 AS build
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 go build -o /momo-adapter .

FROM gcr.io/distroless/static-debian12
COPY --from=build /momo-adapter /momo-adapter
EXPOSE 8087
ENTRYPOINT ["/momo-adapter"]
