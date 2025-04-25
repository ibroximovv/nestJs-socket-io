import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Socket, Server } from "socket.io";

@WebSocketGateway()
export class ChatGateway {
    @WebSocketServer()
    server: Server;
    private users = new Map();

    handleDisconnect(client: Socket) {
        let userId;
        this.users.forEach((x, y) => {
            if (x == client.id) {
                userId = y
                console.log(userId);
            }
        })
        console.log(this.users);
        this.users.delete(userId)
    }

    handleConnection(client: Socket) {
        console.log(client.id, 'connected');
    }

    @SubscribeMessage('register')
    handleRegister(@MessageBody() data: any, @ConnectedSocket() client: Socket) {
        const userId = data.userId;
        const socketId = client.id;
        this.users.set(userId, socketId);
        console.log(this.users);
        
    }

    @SubscribeMessage('private')
    privateChat(@MessageBody() data: any, @ConnectedSocket() client: Socket) {
        const userId = data.userId;
        const socketId = this.users.get(userId)
        this.server.to(socketId).emit('new', data)
    }

    @SubscribeMessage('join')
    joinGr(@MessageBody() data: any, @ConnectedSocket() client: Socket) {
        client.join(data.group)
    }

    @SubscribeMessage('to-group')
    toGroup(@MessageBody() data: any, @ConnectedSocket() client: Socket) {
        this.server.to(data.group).emit('new', data)
    }
}