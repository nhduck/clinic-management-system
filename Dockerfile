# Maven and Java are only needed inside Docker.
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /build
COPY pom.xml ./
RUN mvn -B -q dependency:go-offline
COPY src ./src
RUN mvn -B -q -DskipTests package

FROM eclipse-temurin:17-jre
WORKDIR /app
RUN useradd --system --uid 10001 --create-home clinic
COPY --from=build /build/target/clinic-management-system-1.0.0.jar /app/clinic.jar
USER clinic
EXPOSE 8080
ENV PORT=8080
ENTRYPOINT ["java", "-jar", "/app/clinic.jar"]
