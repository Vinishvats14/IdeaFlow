package com.vinu.cms.security;

import com.vinu.cms.security.jwt.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class JwtChannelInterceptor implements ChannelInterceptor {

    //. Zaroorat Kyun Thi?
    //Tumhara standard Spring Security (jo HTTP filters use karta hai) sirf REST APIs ko secure karta hai. Lekin WebSocket ek alag protocol hai! Jab browser pehli baar connect hota hai, toh normal HTTP filters kaam karte hain, par uske baad connection jab open ho jata hai, toh standard filters fail ho jaate hain. Hume ek aisa Security Guard chahiye tha jo WebSocket ke har message (STOMP frame) par nazar rakhe aur check kare ki banda valid hai ya nahi.
    //2. Idhar Kyun Likha?
    //Isko humne WebSocket ke Inbound Channel (aane waale raaste) par fit kiya hai. Iska matlab, client (React) se koi bhi message jab backend ke broker ke paas jaane ki koshish karega, toh use pehle is interceptor ke gate se guzarna hi padega.
    //3. Isse Kya Hoga?
    //Security: Koi bhi anonymous ya hacker bina valid JWT token ke WebSocket par connect nahi ho payega.
    //Identity Mapping: Jaise hi token validate hota hai, hum accessor.setUser(authentication) karte hain. Is line se Spring ko pata chal jaata hai ki "Achha, is live connection ke peeche Rahul baitha hai!" Ab agar Rahul ko koi message bhejna hai, toh server sahi connection dhoondh sakta hai.
    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        //public Message<?> preSend(Message<?> message, MessageChannel channel)
        //Meaning of this line: Yeh ChannelInterceptor ka ek key function hai. Iska matlab hai: "Message ke send hone se pehle (preSend), is message ko aur iske raaste (channel) ko check karo." Message<?> ka matlab hai ki message ke andar kisi bhi tarah ka data ho sakta hai.
        //Isse kya hoga: Client ka message message-broker tak pahunchne se pehle hi block ho jayega agar hum is function ke andar validation fail kar dete hain.
        // 1. Har aane waale message ke headers (meta-data) ko read karo.
        StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);
//accessor
//Kya hai: Yeh StompHeaderAccessor ka ek object (variable) hai.
//Kyun use hota hai: WebSocket message ke do hisse hote hain—Payload (main message) aur Headers (meta data jaise token, command type). accessor ek chashma/tool hai jisse hum message ke andar chupe Headers ko read aur write kar sakte hain.
//Interview Line: "Accessor se hum incoming STOMP message ke headers (jaise Authorization Token) ko easily read aur modify kar sakte hain."
        // 2. Hum sirf tab checking karenge jab client pehli baar CONNECT ho raha ho.
        if (accessor != null && StompCommand.CONNECT.equals(accessor.getCommand())) {

            // 3. Headers mein se "Authorization" ki value nikalo (e.g., "Bearer eyJhbGci...")
            String authHeader = accessor.getFirstNativeHeader("Authorization");

            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                String token = authHeader.substring(7); // "Bearer " hata kar sirf actual token nikala.

                // 4. Apne purane JwtService se token ko validate karwaya.
                String username = jwtService.extractUsername(token);
                if (username != null) {
                    UserDetails userDetails = userDetailsService.loadUserByUsername(username);

                    if (jwtService.isTokenValid(token, userDetails)) {
                        // 5. Spring Security ka ek Identity Card (Authentication Object) banaya.
                        UsernamePasswordAuthenticationToken authentication =
                                new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());

                        // 6. CRUCIAL STEP: Yeh Identity Card is specific WebSocket connection session ke sath chipka diya.
                        // Ab Spring ko pata hai ki is live wire/pipe ke doosri taraf kaun sa user baitha hai.
                        accessor.setUser(authentication);
                    }
                }
            }
        }
        return message; // Message ko aage jaane do.
    }
}


//. Observer / Pub-Sub (Publish-Subscribe) Pattern
//Kahan use hua: WebSocket STOMP Messaging mein (/topic/author/123).
//Kyun use hua: Jab Publisher (Author) naya article daltha hai, toh use nahi pata ki kitne log use sunn rahe hain. Wo bas ek topic par message "Publish" kar deta hai. Saare Followers (Subscribers/Observers) jo us topic par "Listen" kar rahe hote hain, unhe message mil jata hai.
//Interview Line: "Sir, notification broadcast karne ke liye humne Pub-Sub pattern use kiya hai, jo Observer pattern ka hi ek distributed version hai."
//        2. Interceptor Pattern (Chain of Responsibility)
//Kahan use hua: JwtChannelInterceptor class mein.
//Kyun use hua: Jab bhi koi request ya message system ke andar aate hain, toh hum use main controller tak pahunchne se pehle "Intercept" (raaste mein pakad) lete hain security checking ke liye.
//Interview Line: "WebSocket connections ko secure karne ke liye humne Interceptor pattern lagaya hai jo STOMP CONNECT frame ko target karke JWT validate karta hai."
//        3. Cache-Aside Pattern (Lazy Loading)
//Kahan use hua: Redis Caching mein (@Cacheable aur @CacheEvict).
//Kyun use hua: Application pehle Redis Cache mein data dhoondhti hai. Agar mil gaya (Cache Hit), toh wahi se de deti hai. Agar nahi mila (Cache Miss), toh Database se lake Cache mein daal deti hai. Update hone par cache clear (Evict) kar deti hai.
//Interview Line: "Read-heavy endpoints par humne Cache-Aside pattern use kiya hai to reduce DB overhead."
//        4. DTO (Data Transfer Object) Pattern
//Kahan use hua: ArticleResponse.fromEntity() method mein.
//Kyun use hua: Database ki actual Article Entity ke andar sensitive/internal fields hote hain (jaise internal IDs, passwords, deleted flags). Direct entity frontend ko bhejna bad security hai. Isliye hum ek dedicated ArticleResponse object banate hain.
//Interview Line: "Database schema ko API contract se decouple rakhne ke liye DTO pattern ka use kiya hai."
//        5. Template Pattern
//Kahan use hua: SimpMessagingTemplate mein (Jaise JdbcTemplate ya RestTemplate hota hai).
//Kyun use hua: Spring framework low-level networking ya code boilerplate ko chhupa deta hai aur hume ek clean interface deta hai. Hum bas convertAndSend() call karte hain, baki ka complex low-level networking Spring ka Template sambhal leta hai.
//Interview Line: "Messaging boilerplate code ko clean rakhne ke liye Spring ke SimpMessagingTemplate ka use hua hai."
//        6. Dependency Injection (DI) / Inversion of Control (IoC)
//Kahan use hua: @Service, @Component, @RequiredArgsConstructor (Spring Core).
//Kyun use hua: Object creation ki zimmedari humne Spring ko de di hai (new ArticleService() hum manually nahi karte). Spring khud zarurat ke hisab se dependencies inject kar deta hai.