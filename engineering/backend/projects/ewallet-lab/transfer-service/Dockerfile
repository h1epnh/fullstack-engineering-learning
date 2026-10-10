FROM eclipse-temurin:21-jre
WORKDIR /app
COPY build/libs/transfer-service-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8094
ENTRYPOINT ["java", "-jar", "app.jar"]
