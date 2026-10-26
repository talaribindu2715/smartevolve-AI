# Stage 1: Build JAR with Maven & Eclipse Temurin JDK 21
FROM maven:3.9.6-eclipse-temurin-21 AS build
WORKDIR /app

# Strict memory controls for Maven & JVM in 512MB RAM container
# -Xmx256m: Max heap 256MB
# -XX:MaxMetaspaceSize=128m: Metaspace capped at 128MB
# -XX:ReservedCodeCacheSize=32m: JIT code cache capped at 32MB
# -Xss512k: Thread stack halved to 512KB
# -XX:+UseSerialGC: Minimal memory overhead garbage collector
# -Dmaven.wagon.http.pool=false: Disable connection pooling to save network buffer memory
ENV MAVEN_OPTS="-Xmx256m -XX:MaxMetaspaceSize=128m -XX:ReservedCodeCacheSize=32m -Xss512k -XX:+UseSerialGC -Dmaven.wagon.http.pool=false"

COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests -B

# Stage 2: Production JRE 21 Runtime (Optimized for 512MB RAM containers)
FROM eclipse-temurin:21-jre-jammy
WORKDIR /app
COPY --from=build /app/target/smartevolve-backend-1.0.0.jar app.jar

ENV PORT=8080
EXPOSE 8080

ENTRYPOINT ["java", "-Xmx256m", "-XX:MaxMetaspaceSize=128m", "-XX:ReservedCodeCacheSize=32m", "-Xss512k", "-XX:+UseSerialGC", "-Djava.security.egd=file:/dev/./urandom", "-jar", "app.jar"]

