import { Injectable, inject } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface WebSocketMessage {
  type: string;
  [key: string]: any;
}

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {
  private notificationSocket: WebSocket | null = null;
  private chatSocket: WebSocket | null = null;
  
  private notificationSubject = new Subject<WebSocketMessage>();
  private chatSubject = new Subject<any>();

  private notifReconnectAttempts = 0;
  private chatReconnectAttempts = 0;
  private readonly MAX_RECONNECT = 5;

  private lastNotifParams: { userId: string; tenantId: string; role: string } | null = null;
  private lastChatParams: { ticketId: string; tenantId: string } | null = null;

  private getWsUrl(endpoint: string): string {
    try {
      const url = new URL(environment.apiUrl);
      const protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
      const path = url.pathname.endsWith('/') ? url.pathname.slice(0, -1) : url.pathname;
      return `${protocol}//${url.host}${path}${endpoint}`;
    } catch (e) {
      const baseUrl = environment.apiUrl.replace(/^http(s)?:\/\//, 'ws$1://');
      return `${baseUrl}${endpoint}`;
    }
  }

  public connectNotifications(userId: string, tenantId: string, role: string) {
    if (this.notificationSocket) {
      this.notificationSocket.close();
    }
    
    this.lastNotifParams = { userId, tenantId, role };
    const url = `${this.getWsUrl('/ws/notifications')}?userId=${userId}&tenantId=${tenantId}&role=${role}`;
    const socket = new WebSocket(url);
    this.notificationSocket = socket;
    
    socket.onopen = () => {
      console.log('Notification WebSocket connected');
      this.notifReconnectAttempts = 0;
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this.notificationSubject.next(data);
      } catch (e) {
        console.error('Failed to parse notification websocket message', e);
      }
    };
    
    socket.onerror = (error) => {
      console.error('Notification WebSocket error:', error);
    };
    
    socket.onclose = () => {
      if (this.notificationSocket !== socket) return;
      this.notificationSocket = null;
      console.log('Notification WebSocket closed');
      this.reconnectNotifications();
    };
  }

  private reconnectNotifications() {
    if (!this.lastNotifParams || this.notifReconnectAttempts >= this.MAX_RECONNECT) return;
    this.notifReconnectAttempts++;
    const delay = Math.min(1000 * Math.pow(2, this.notifReconnectAttempts), 30000);
    console.log(`Reconnecting notifications in ${delay}ms (attempt ${this.notifReconnectAttempts})`);
    setTimeout(() => {
      if (this.lastNotifParams) {
        this.connectNotifications(
          this.lastNotifParams.userId,
          this.lastNotifParams.tenantId,
          this.lastNotifParams.role
        );
      }
    }, delay);
  }

  public getNotifications(): Observable<WebSocketMessage> {
    return this.notificationSubject.asObservable();
  }

  public disconnectNotifications() {
    this.lastNotifParams = null;
    if (this.notificationSocket) {
      this.notificationSocket.close();
      this.notificationSocket = null;
    }
  }

  public connectChat(ticketId: string, tenantId: string) {
    if (this.chatSocket) {
      this.chatSocket.close();
    }
    
    this.lastChatParams = { ticketId, tenantId };
    const url = `${this.getWsUrl('/ws/chat')}?ticketId=${ticketId}&tenantId=${tenantId}`;
    const socket = new WebSocket(url);
    this.chatSocket = socket;
    
    socket.onopen = () => {
      console.log('Chat WebSocket connected');
      this.chatReconnectAttempts = 0;
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this.chatSubject.next(data);
      } catch (e) {
        console.error('Failed to parse chat websocket message', e);
      }
    };

    socket.onerror = (error) => {
      console.error('Chat WebSocket error:', error);
    };

    socket.onclose = () => {
      if (this.chatSocket !== socket) return;
      this.chatSocket = null;
      console.log('Chat WebSocket closed');
      this.reconnectChat();
    };
  }

  private reconnectChat() {
    if (!this.lastChatParams || this.chatReconnectAttempts >= this.MAX_RECONNECT) return;
    this.chatReconnectAttempts++;
    const delay = Math.min(1000 * Math.pow(2, this.chatReconnectAttempts), 30000);
    console.log(`Reconnecting chat in ${delay}ms (attempt ${this.chatReconnectAttempts})`);
    setTimeout(() => {
      if (this.lastChatParams) {
        this.connectChat(this.lastChatParams.ticketId, this.lastChatParams.tenantId);
      }
    }, delay);
  }

  public getChatMessages(): Observable<any> {
    return this.chatSubject.asObservable();
  }

  public disconnectChat() {
    this.lastChatParams = null;
    if (this.chatSocket) {
      this.chatSocket.close();
      this.chatSocket = null;
    }
  }
}
