import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
    stages: [
        { duration: '10s', target: 5 }, 
        { duration: '30s', target: 10 },   
        { duration: '10s', target: 0 },   
    ],
};

export function setup() {
    let loginUrl = 'http://localhost:8080/api/auth/login'; 
    let loginPayload = JSON.stringify({
        email: 'admin@cms.local',      
        password: 'Admin@1234' 
    });
    let params = { headers: { 'Content-Type': 'application/json' } };
    let res = http.post(loginUrl, loginPayload, params);
    
    let responseJson = JSON.parse(res.body);
    let token = responseJson.data.accessToken; 
    return { token: token };
}

export default function(data) {
    if (!data.token) return;

    let url = 'http://localhost:8080/api/articles';
    let authToken = `Bearer ${data.token}`;

    // UNIQUE SLUG ERROR SE BACHNE KE LIYE DYNAMIC TITLE
    // Har request par ek unique random number jud jayega
    let uniqueId = Math.floor(Math.random() * 1000000);

    let payload = JSON.stringify({
        title: `Load Testing with K6 - ${uniqueId}`, // <-- Dynamic Title
        content: 'This is a sample article for load testing.',
        categoryId: 1,
        tagIds: [1],
        status: 'PUBLISHED',
        visibility: 'PUBLIC'
    });

    let params = {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': authToken,
        },
    };

    let res = http.post(url, payload, params);

    // Backend 200 ya 201 kuch bhi de toh error log nahi hoga
    if (res.status !== 200 && res.status !== 201) {
        console.log(`Failed! Status: ${res.status} | Body: ${res.body}`);
    }

    check(res, {
        'status is 200 or 201': (r) => r.status === 200 || r.status === 201,
        'transaction time < 500ms': (r) => r.timings.duration < 500,
    });

    sleep(1);
}