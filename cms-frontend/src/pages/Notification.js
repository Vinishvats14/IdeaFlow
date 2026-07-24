const client = new Client({
    brokerURL: 'ws://localhost:8080/ws',
    connectHeaders: {
        Authorization: `Bearer ${myJwtToken}` // Guard ko dikhane ke liye token yahan bheja
    },
    onConnect: () => {
        console.log("Connected to WebSocket Securely!");

        // Maan lo is user ne Author ID 123 ko follow kiya hua hai
        // Toh jaise hi Author 123 naya post dalega, yeh function trigger ho jayega
        client.subscribe('/topic/author/123', (message) => {
            alert("New Notification: " + message.body); // Screen par alert ya toast dikhao
        });
    }
});
client.activate();