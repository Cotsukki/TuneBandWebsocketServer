# TuneBandWebsocketServer
Websocket server used to broadcast messaging keys for our Thesis Project Entitled T.U.N.E. Band: A Smart Wearable Device Bridging  Communication Gaps in Individuals with  Autism Spectrum Disorder

# Introduction
This document provides an overview of a WebSocket server implemented in Node.js. The server can handle both secure (HTTPS/WSS) and non-secure (HTTP/WS) connections. It is designed to facilitate real-time communication between clients and can broadcast messages, handle both text and binary data, and log events and errors to a Firebase database.

#  Server Components
1. Secure and Non-Secure Servers: The server is capable of handling secure WebSocket connections through HTTPS as well as non-secure connections through HTTP. This flexibility allows clients to connect based on their security requirements.
   
2. WebSocket Handling: Utilizes the `ws` library to manage WebSocket connections. The server can broadcast messages to all clients, except the sender, to enable a multi-user interactive environment.

3. Firebase Integration: The server uses Firebase for storing logs related to messages, disconnects, and errors. This allows for real-time monitoring and analytics of the server's operations.

4. Message Handling: The server can process and broadcast both text and binary messages. Text messages are normalized (trimmed and converted to uppercase) before being broadcast.

# Setup and Configuration
- Dependencies: Node.js, `ws`, `firebase-admin`, and `https` modules are required.
- Firebase Setup: You must set up Firebase and provide your own Firebase service account JSON file for authentication.
- SSL/TLS Certificates: For secure connections, SSL/TLS certificates (`cert.pem` and `key.pem`) must be available at specified locations.

# Running the Server
To start the server, run the script. It will listen on:
- Port 8080 for secure WebSocket connections (WSS).
- Port 8081 for non-secure WebSocket connections (WS).

Ensure that the correct ports are open and not blocked by any firewalls.

# Usage
Clients can connect to the server using WebSocket clients that support either secure or non-secure connections. Upon connecting, clients can send text or binary messages, which the server will broadcast to other connected clients. The server logs all messages, disconnections, and errors to Firebase, providing a comprehensive view of its activity.

# Logging and Monitoring
- Messages: All messages are logged in Firebase under the `messages` reference.
- Disconnects: Client disconnections are logged under the `disconnects` reference.
- Errors: Any errors encountered are logged under the `errors` reference.

This WebSocket server is designed to be robust, secure, and easy to integrate with various client applications, making it suitable for real-time data exchange and interactive applications.
