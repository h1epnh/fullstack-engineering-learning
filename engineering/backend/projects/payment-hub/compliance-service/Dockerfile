FROM golang:1.26 AS build
WORKDIR /app
COPY go.mod ./
COPY . .
RUN CGO_ENABLED=0 go build -o /compliance-service .

FROM gcr.io/distroless/static-debian12
COPY --from=build /compliance-service /compliance-service
EXPOSE 8083
ENTRYPOINT ["/compliance-service"]
