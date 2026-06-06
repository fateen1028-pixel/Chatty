# === Stage 1: Build the application from source ===
FROM maven:3.9.6-eclipse-temurin-21 AS build

WORKDIR /app

# Copy pom.xml
COPY pom.xml .

# Copy source
COPY src ./src

# DEBUG: show actual filenames inside Linux container
RUN find /app/src/main/java/com/fateen/chatapplicationbackend/security -type f

# Compile and package
RUN mvn clean package -DskipTests

# === Stage 2: Runtime image ===
FROM eclipse-temurin:21-jdk

WORKDIR /app

COPY --from=build /app/target/ChatApplicationBackend-0.0.1-SNAPSHOT.jar app.jar

EXPOSE 8080

CMD ["sh", "-c", "java -jar app.jar --server.port=${PORT:-8080}"]