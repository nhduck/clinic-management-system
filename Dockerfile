# Stage 1: Build Java application
FROM maven:3.9-eclipse-temurin-17 AS build

WORKDIR /build
COPY pom.xml ./
RUN mvn -B -q dependency:go-offline

COPY src ./src
RUN mvn -B -q -DskipTests package

# Stage 2: Run application
FROM eclipse-temurin:17-jre

WORKDIR /app

COPY --from=build \
    /build/target/clinic-management-system-1.0.0.jar \
    /app/clinic.jar

ENV PORT=8080

EXPOSE 8080

USER 10001

ENTRYPOINT ["java", "-jar", "/app/clinic.jar"]