FROM golang:1.26 AS build
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 go build -o /visa-adapter .

FROM gcr.io/distroless/static-debian12
COPY --from=build /visa-adapter /visa-adapter
EXPOSE 8085
ENTRYPOINT ["/visa-adapter"]
