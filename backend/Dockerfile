# syntax=docker/dockerfile:1
# Multi-stage build for Spring Boot with Java 21
FROM maven:3.9-eclipse-temurin-21-alpine AS builder
WORKDIR /workspace/app

# Force Docker cache invalidation to recompile all Java source files and Flyway migrations
ARG CACHEBUST=force_rebuild_v7_otp_no_volunteer
RUN echo "Force clean compile: ${CACHEBUST}"

# Copy pom.xml and source code
COPY pom.xml .
COPY src src

# Package application without running tests during image build
RUN mvn clean package -DskipTests -Dmaven.test.skip=true

# Runtime stage
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=builder /workspace/app/target/app.jar app.jar
RUN mkdir -p /app/uploads
EXPOSE 8080
ENTRYPOINT ["java", "-Djava.security.egd=file:/dev/./urandom", "-jar", "app.jar"]
