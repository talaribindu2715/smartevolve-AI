# Stage 1: Build JAR with Maven & Eclipse Temurin JDK 21
FROM maven:3.9.6-eclipse-temurin-21 AS build
WORKDIR /app

# Cap Maven heap to 384MB to prevent Render free-tier 512MB OOM (Exit code 137)
ENV MAVEN_OPTS="-Xmx384m -XX:+UseSerialGC"

COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests -B

# Stage 2: Production JRE 21 Runtime (Optimized for 512MB RAM containers)
FROM eclipse-temurin:21-jre-jammy
WORKDIR /app
COPY --from=build /app/target/smartevolve-backend-1.0.0.jar app.jar

ENV PORT=8080
EXPOSE 8080

ENTRYPOINT ["java", "-Xmx384m", "-XX:+UseSerialGC", "-Djava.security.egd=file:/dev/./urandom", "-jar", "app.jar"]
