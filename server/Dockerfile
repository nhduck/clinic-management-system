FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /build/server
COPY server/pom.xml ./pom.xml
RUN mvn -B dependency:go-offline
COPY server/ ./
RUN mvn -B -DskipTests package

FROM eclipse-temurin:17-jre
WORKDIR /app
COPY --from=build /build/server/target/clinic-management-system-1.0.0.jar /app/clinic.jar
ENV PORT=8080
USER 10001
ENTRYPOINT ["java", "-jar", "/app/clinic.jar"]
