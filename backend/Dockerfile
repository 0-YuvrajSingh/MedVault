FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests

FROM eclipse-temurin:21-jre-alpine
RUN apk add --no-cache curl
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
ENV PORT=8080
EXPOSE ${PORT}
ENTRYPOINT java -Dserver.port=${PORT} -Dspring.profiles.active=${SPRING_PROFILES_ACTIVE:-prod} -jar app.jar
