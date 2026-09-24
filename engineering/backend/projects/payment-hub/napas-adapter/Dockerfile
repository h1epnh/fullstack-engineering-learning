FROM golang:1.26 AS build
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 go build -o /napas-adapter .

FROM gcr.io/distroless/static-debian12
COPY --from=build /napas-adapter /napas-adapter
EXPOSE 8081
ENTRYPOINT ["/napas-adapter"]
