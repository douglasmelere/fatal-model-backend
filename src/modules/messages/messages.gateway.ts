import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, UseGuards } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { MessagesService } from './messages.service';
import { SendMessageDto } from './dto';

@WebSocketGateway({
  namespace: '/messages',
  cors: {
    origin: '*',
    credentials: true,
  },
})
export class MessagesGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;
  private logger: Logger = new Logger('MessagesGateway');
  private userSockets: Map<string, string> = new Map(); // userId -> socketId
  private socketUsers: Map<string, string> = new Map(); // socketId -> userId

  constructor(
    private jwtService: JwtService,
    private messagesService: MessagesService,
  ) {}

  afterInit(server: Server) {
    this.logger.log('Messages WebSocket server initialized');
  }

  handleConnection(@ConnectedSocket() client: Socket) {
    const token =
      client.handshake.auth?.token ||
      client.handshake.headers?.authorization?.replace('Bearer ', '') ||
      client.handshake.query?.token;

    this.logger.debug('Connection attempt:', {
      hasAuthToken: !!client.handshake.auth?.token,
      hasHeaderAuth: !!client.handshake.headers?.authorization,
      hasQueryToken: !!client.handshake.query?.token,
      tokenLength: token?.length || 0,
    });

    if (!token) {
      this.logger.warn('Client connected without token - disconnecting');
      client.emit('error', { message: 'Authentication required' });
      client.disconnect();
      return;
    }

    try {
      const payload = this.jwtService.verify(token);
      const userId = payload.sub;

      if (!userId) {
        this.logger.warn('Token verified but no userId found in payload');
        client.emit('error', { message: 'Invalid token: missing user ID' });
        client.disconnect();
        return;
      }

      this.userSockets.set(userId, client.id);
      this.socketUsers.set(client.id, userId);
      client.join(`user_${userId}`);

      this.logger.log(`User ${userId} connected to messages with socket ${client.id}`);
      
      // Confirmar conexão para o cliente
      client.emit('connected', { userId, socketId: client.id });
    } catch (error) {
      this.logger.error('Invalid token:', {
        error: error.message,
        name: error.name,
        tokenPreview: token?.substring(0, 20) + '...',
      });
      client.emit('error', { 
        message: 'Authentication failed',
        error: error.message 
      });
      client.disconnect();
    }
  }

  handleDisconnect(@ConnectedSocket() client: Socket) {
    const userId = this.socketUsers.get(client.id);
    if (userId) {
      this.userSockets.delete(userId);
      this.socketUsers.delete(client.id);
      this.logger.log(`User ${userId} disconnected from messages`);
    }
  }

  /**
   * Envia uma mensagem via WebSocket
   */
  @SubscribeMessage('send_message')
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: SendMessageDto,
  ) {
    const userId = this.socketUsers.get(client.id);
    if (!userId) {
      return { error: 'Unauthorized' };
    }

    try {
      // Criar mensagem no banco
      const message = await this.messagesService.sendMessage(userId, data);

      // Buscar conversa para obter participantes
      const conversation = await this.messagesService.getConversation(
        userId,
        data.conversation_id,
      );

      // Enviar mensagem para ambos participantes via WebSocket
      const recipientId =
        conversation.client_id === userId
          ? conversation.escort_id
          : conversation.client_id;

      // Emitir para o remetente (confirmação)
      this.server.to(`user_${userId}`).emit('message_sent', {
        message,
        conversation_id: data.conversation_id,
      });

      // Emitir para o destinatário (nova mensagem)
      this.server.to(`user_${recipientId}`).emit('new_message', {
        message,
        conversation_id: data.conversation_id,
      });

      // Emitir atualização de conversa para ambos
      this.server.to(`user_${userId}`).emit('conversation_updated', {
        conversation_id: data.conversation_id,
      });

      this.server.to(`user_${recipientId}`).emit('conversation_updated', {
        conversation_id: data.conversation_id,
      });

      return { success: true, message };
    } catch (error) {
      this.logger.error('Error sending message:', error.message);
      return { error: error.message || 'Failed to send message' };
    }
  }

  /**
   * Marca mensagens como lidas
   */
  @SubscribeMessage('mark_read')
  async handleMarkRead(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversation_id: string; message_ids?: string[] },
  ) {
    const userId = this.socketUsers.get(client.id);
    if (!userId) {
      return { error: 'Unauthorized' };
    }

    try {
      const result = await this.messagesService.markMessagesAsRead(userId, {
        conversation_id: data.conversation_id,
        message_ids: data.message_ids,
      });

      // Notificar o outro participante que mensagens foram lidas
      const conversation = await this.messagesService.getConversation(
        userId,
        data.conversation_id,
      );

      const recipientId =
        conversation.client_id === userId
          ? conversation.escort_id
          : conversation.client_id;

      this.server.to(`user_${recipientId}`).emit('messages_read', {
        conversation_id: data.conversation_id,
        read_by: userId,
      });

      return { success: true, updated: result.updated };
    } catch (error) {
      this.logger.error('Error marking messages as read:', error.message);
      return { error: error.message || 'Failed to mark messages as read' };
    }
  }

  /**
   * Entra em uma sala de conversa para receber atualizações
   */
  @SubscribeMessage('join_conversation')
  async handleJoinConversation(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversation_id: string },
  ) {
    const userId = this.socketUsers.get(client.id);
    if (!userId) {
      return { error: 'Unauthorized' };
    }

    try {
      // Verificar permissão
      await this.messagesService.getConversation(userId, data.conversation_id);

      // Entrar na sala da conversa
      client.join(`conversation_${data.conversation_id}`);
      client.join(`user_${userId}`);

      return { success: true, conversation_id: data.conversation_id };
    } catch (error) {
      this.logger.error('Error joining conversation:', error.message);
      return { error: error.message || 'Failed to join conversation' };
    }
  }

  /**
   * Sai de uma sala de conversa
   */
  @SubscribeMessage('leave_conversation')
  handleLeaveConversation(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversation_id: string },
  ) {
    client.leave(`conversation_${data.conversation_id}`);
    return { success: true, conversation_id: data.conversation_id };
  }

  /**
   * Método auxiliar para emitir mensagem para uma conversa
   */
  emitToConversation(conversationId: string, event: string, data: any) {
    this.server.to(`conversation_${conversationId}`).emit(event, data);
  }

  /**
   * Método auxiliar para emitir para um usuário específico
   */
  emitToUser(userId: string, event: string, data: any) {
    this.server.to(`user_${userId}`).emit(event, data);
  }
}

