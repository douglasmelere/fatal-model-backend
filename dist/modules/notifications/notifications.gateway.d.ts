import { OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
export declare class NotificationsGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    private jwtService;
    server: Server;
    private logger;
    private userSockets;
    constructor(jwtService: JwtService);
    afterInit(server: Server): void;
    handleConnection(client: Socket): void;
    handleDisconnect(client: Socket): void;
    handleNotification(client: Socket, data: any): {
        status: string;
    };
    sendNotificationToUser(userId: string, notification: any): void;
    sendNotificationToUsers(userIds: string[], notification: any): void;
    broadcastNotification(notification: any): void;
}
