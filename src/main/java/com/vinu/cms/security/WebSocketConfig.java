package com.vinu.cms.security;


import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
@RequiredArgsConstructor
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {
    private final JwtChannelInterceptor jwtChannelInterceptor;

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        // 2. "/topic" naam ka ek simple in-memory broker (postman) enable karo.
        // Jo bhi messages "/topic" se shuru honge, wo sabhi subscribers ko broadcast ho jayenge.
        config.enableSimpleBroker("/topic");

        // 3. Agar client backend ke kisi Java method ko call karna chahta hai,
        // toh request ke aage "/app" lagana hoga (e.g., /app/hello).
        config.setApplicationDestinationPrefixes("/app");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // 4. Yeh wo public entry gate (/ws) hai jahan se React app connection shuru karega.
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns("*"); // CORS issues se bachne ke liye browser permissions set ki.
    }

    @Override
    public void configureClientInboundChannel(ChannelRegistration registration) {
        registration.interceptors(jwtChannelInterceptor);
    }

}


//Zaroorat Kyun Thi?
//Spring Boot ko by-default nahi pata hota ki hume WebSockets chalana hai. Wo sirf normal REST APIs (HTTP requests) samajhta hai. Hume server ko batana padta hai ki "Bhai, thodi jagah banao, hume ek aisi pipeline set karni hai jo hamesha khuli rahe."
//2. Idhar Kyun Likha?
//Isko humne Configuration Layer (@Configuration) mein likha hai. Spring Boot jab start hota hai, toh wo sabse pehle config files ko padhta hai taaki use pata chal sake ki pure application ka setup kaisa dikhega.
//3. Isse Kya Hoga?
//Server par ek naya endpoint /ws ban jayega. React app ab is address par aakar connect ho sakti hai.
//Server ke andar ek Message Broker (Postman/Router) khada ho jayega jo /topic wale saare messages ko sahi logo tak pahunchane ka kaam sambhalega.