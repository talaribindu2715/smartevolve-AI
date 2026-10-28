# Stage 1: Build JAR with Maven & Eclipse Temurin JDK 21
FROM maven:3.9.6-eclipse-temurin-21 AS build
WORKDIR /app

# Ample memory for Maven build environment on Render (Render builders provide 2GB-4GB RAM)
ENV MAVEN_OPTS="-Xmx1536m -XX:MaxMetaspaceSize=512m -Dmaven.wagon.http.pool=false"

# Cache dependencies in a separate Docker layer to accelerate builds
COPY pom.xml .
RUN mvn dependency:resolve -B

# Copy application source and build production artifact (skipping tests and test dependencies)
COPY src ./src
RUN mvn package -Dmaven.test.skip=true -B

# Stage 2: Production JRE 21 Runtime (Optimized for 512MB RAM containers on Render free tier)
FROM eclipse-temurin:21-jre-jammy
WORKDIR /app
COPY --from=build /app/target/smartevolve-backend-1.0.0.jar app.jar

ENV PORT=8080
EXPOSE 8080

ENTRYPOINT ["java", "-Xmx256m", "-XX:MaxMetaspaceSize=128m", "-XX:ReservedCodeCacheSize=32m", "-Xss512k", "-XX:+UseSerialGC", "-Djava.security.egd=file:/dev/./urandom", "-jar", "app.jar"]

