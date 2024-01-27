import { Server as SocketIOServer } from "socket.io";
import http from 'http';

export const initSocketServer = (server:http.Server) =>{
     const io = new SocketIOServer(server);
     io.on("connection",(socket) =>{
        console.log("a user connected");
        //  Listen for notification even from frontend 
        socket.on("notification",(data) =>{
            // boradcast the notification data to all connected  client (admin dashboard) 
            io.emit("newNotification",data)
        });
        socket.on("disconnect",() => {
            console.log("a user diconnected")
        });
        
     });
}