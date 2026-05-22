# === Stage 1: Build the application from source ===
FROM maven:3.9.6-eclipse-temurin-21 AS build
WORKDIR /app

# Copy pom.xml and source code directly into the build environment
COPY pom.xml .
COPY src ./src

# Compile and package a fresh, clean production JAR file
RUN mvn clean package -DskipTests

# === Stage 2: Create the runtime production image ===
FROM eclipse-temurin:21-jdk
WORKDIR /app

# Copy the freshly compiled JAR from Stage 1 into this clean container
COPY --from=build /app/target/ChatApplicationBackend-0.0.1-SNAPSHOT.jar app.jar

EXPOSE 8080

# Shell format to dynamically read the cloud-assigned deployment port
CMD ["sh", "-c", "java -jar app.jar --server.port=${PORT:-8080}"]