FROM golang:1.26 AS build
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 go build -o /zalopay-adapter .

FROM gcr.io/distroless/static-debian12
COPY --from=build /zalopay-adapter /zalopay-adapter
EXPOSE 8088
ENTRYPOINT ["/zalopay-adapter"]
