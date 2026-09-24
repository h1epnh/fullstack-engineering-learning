FROM golang:1.26 AS build
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 go build -o /mastercard-adapter .

FROM gcr.io/distroless/static-debian12
COPY --from=build /mastercard-adapter /mastercard-adapter
EXPOSE 8086
ENTRYPOINT ["/mastercard-adapter"]
