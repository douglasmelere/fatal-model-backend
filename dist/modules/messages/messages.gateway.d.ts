import { OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { MessagesService } from './messages.service';
import { SendMessageDto } from './dto';
export declare class MessagesGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    private jwtService;
    private messagesService;
    server: Server;
    private logger;
    private userSockets;
    private socketUsers;
    constructor(jwtService: JwtService, messagesService: MessagesService);
    afterInit(server: Server): void;
    handleConnection(client: Socket): void;
    handleDisconnect(client: Socket): void;
    handleSendMessage(client: Socket, data: SendMessageDto): Promise<{
        success: boolean;
        message: import("../../database/entities").MessageEntity;
        error?: undefined;
    } | {
        error: any;
        success?: undefined;
        message?: undefined;
    }>;
    handleMarkRead(client: Socket, data: {
        conversation_id: string;
        message_ids?: string[];
    }): Promise<{
        success: boolean;
        updated: number;
        error?: undefined;
    } | {
        error: any;
        success?: undefined;
        updated?: undefined;
    }>;
    handleJoinConversation(client: Socket, data: {
        conversation_id: string;
    }): Promise<{
        success: boolean;
        conversation_id: string;
        error?: undefined;
    } | {
        error: any;
        success?: undefined;
        conversation_id?: undefined;
    }>;
    handleLeaveConversation(client: Socket, data: {
        conversation_id: string;
    }): {
        success: boolean;
        conversation_id: string;
    };
    emitToConversation(conversationId: string, event: string, data: any): void;
    emitToUser(userId: string, event: string, data: any): void;
}
