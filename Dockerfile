
# Stage 1: Build Java backend + frontend
FROM maven:3.9-eclipse-temurin-17 AS build

WORKDIR /build/server

# Download dependencies
COPY server/pom.xml ./pom.xml
RUN mvn -B dependency:go-offline

# Copy Java source and frontend
COPY server/main ./main
COPY client /build/client

# Build executable JAR
RUN mvn -B -DskipTests package

# Stage 2: Run application
FROM eclipse-temurin:17-jre

WORKDIR /app

COPY --from=build \
    /build/server/target/clinic-management-system-1.0.0.jar \
    /app/clinic.jar

ENV PORT=8080

EXPOSE 8080

# Run without root privileges
USER 10001

ENTRYPOINT ["java", "-jar", "/app/clinic.jar"]
