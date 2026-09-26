# Multi-stage build: compile with Maven, run with just a slim JRE.
# Works the same way on Render, Railway, Fly.io, or any Docker-based host.

FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml .
# Downloads dependencies in their own layer so they're cached between builds
# unless pom.xml itself changes - makes repeat deploys much faster.
RUN mvn -B dependency:go-offline
COPY src ./src
RUN mvn -B clean package -DskipTests

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar

# Render (and most hosts) tell the container which port to listen on via $PORT.
# application.properties already reads this (server.port=${PORT:8080}).
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
