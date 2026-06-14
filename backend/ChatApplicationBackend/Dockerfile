# === Stage 1: Build the application from source ===
FROM maven:3.9.6-eclipse-temurin-21 AS build

WORKDIR /app

COPY pom.xml .
COPY src ./src

RUN mvn -B clean package -DskipTests

# === Stage 2: Runtime image ===
FROM eclipse-temurin:21-jdk

WORKDIR /app

COPY --from=build /app/target/ChatApplicationBackend-0.0.1-SNAPSHOT.jar app.jar

EXPOSE 8080

CMD ["sh", "-c", "java -jar app.jar --server.port=${PORT:-8080}"]

