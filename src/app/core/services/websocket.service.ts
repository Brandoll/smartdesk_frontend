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

  // Use the same domain as apiUrl but replace http with ws
  private getWsUrl(endpoint: string): string {
    const baseUrl = environment.apiUrl.replace(/^http(s)?:\/\//, 'ws$1://').replace(/\/api$/, '');
    return `${baseUrl}${endpoint}`;
  }

  public connectNotifications(userId: string, tenantId: string, role: string) {
    if (this.notificationSocket) {
      this.notificationSocket.close();
    }
    
    const url = `${this.getWsUrl('/ws/notifications')}?userId=${userId}&tenantId=${tenantId}&role=${role}`;
    this.notificationSocket = new WebSocket(url);
    
    this.notificationSocket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this.notificationSubject.next(data);
      } catch (e) {
        console.error('Failed to parse notification websocket message', e);
      }
    };
    
    this.notificationSocket.onerror = (error) => {
      console.error('Notification WebSocket error:', error);
    };
    
    this.notificationSocket.onclose = () => {
      console.log('Notification WebSocket closed');
      // Optional: implement reconnect logic here
    };
  }

  public getNotifications(): Observable<WebSocketMessage> {
    return this.notificationSubject.asObservable();
  }

  public disconnectNotifications() {
    if (this.notificationSocket) {
      this.notificationSocket.close();
      this.notificationSocket = null;
    }
  }

  public connectChat(ticketId: string, tenantId: string) {
    if (this.chatSocket) {
      this.chatSocket.close();
    }
    
    const url = `${this.getWsUrl('/ws/chat')}?ticketId=${ticketId}&tenantId=${tenantId}`;
    this.chatSocket = new WebSocket(url);
    
    this.chatSocket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this.chatSubject.next(data);
      } catch (e) {
        console.error('Failed to parse chat websocket message', e);
      }
    };
  }

  public getChatMessages(): Observable<any> {
    return this.chatSubject.asObservable();
  }

  public disconnectChat() {
    if (this.chatSocket) {
      this.chatSocket.close();
      this.chatSocket = null;
    }
  }
}
