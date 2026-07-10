# Stage 1: Build the application using Maven
FROM maven:3.9.6-eclipse-temurin-21 AS build
COPY . .
RUN mvn clean package -DskipTests

# Stage 2: Run the application using JRE
FROM eclipse-temurin:21-jre
COPY --from=build /target/*.jar app.jar

# Render assigns a dynamic port, this line tells Spring Boot to listen to it
ENTRYPOINT ["sh", "-c", "java -Dserver.port=${PORT:-8080} -jar app.jar"]