import { Client, IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

export interface LiveUser {
  sessionId: string;
  username: string;
  avatar: string;
  currentContentId?: string;
  cursorX: number;
  cursorY: number;
  connectedAt: string;
  lastActive: string;
}

export interface ChatMessage {
  id: string;
  sessionId: string;
  username: string;
  avatar: string;
  content: string;
  contentId: string;
  timestamp: string;
}

export interface CursorPosition {
  sessionId: string;
  username: string;
  avatar: string;
  x: number;
  y: number;
  timestamp?: string;
}

export interface CollaborationEvent {
  type: string;
  username: string;
  contentId: string;
  data?: string;
  timestamp: string;
}

export interface ContentSelection {
  id: string;
  sessionId: string;
  username: string;
  contentId: string;
  field: string;
  startIndex: number;
  endIndex: number;
  selectedText: string;
  timestamp: string;
}

export interface ContentReaction {
  id: string;
  sessionId: string;
  username: string;
  contentId: string;
  emoji: string;
  field: string;
  timestamp: string;
}

export interface ContentEdit {
  id: string;
  sessionId: string;
  username: string;
  contentId: string;
  field: string;
  oldValue: string;
  newValue: string;
  timestamp: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'review';
  title: string;
  message: string;
  contentId?: string;
  fromUser?: string;
  read: boolean;
  createdAt: string;
}

type EventHandler = (data: unknown) => void;

export class CollaborationService {
  private client: Client | null = null;
  private currentContentId: string | null = null;
  private sessionId: string;
  private username: string;
  private avatar: string;

  private handlers: Map<string, Set<EventHandler>> = new Map();
  private connected = false;

  constructor(username = 'Demo User', avatar = '') {
    this.sessionId = this.generateSessionId();
    this.username = username;
    this.avatar = avatar;
  }

  private generateSessionId(): string {
    return 'session-' + Math.random().toString(36).substring(2, 11);
  }

  connect(baseUrl: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.client = new Client({
        webSocketFactory: () => new SockJS(`${baseUrl}/ws`),
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
        onConnect: () => {
          this.connected = true;
          console.log('WebSocket connected');
          this.subscribeToPresence();
          resolve();
        },
        onStompError: (frame) => {
          console.error('STOMP error:', frame.headers['message']);
          reject(new Error(frame.headers['message']));
        },
        onDisconnect: () => {
          this.connected = false;
          console.log('WebSocket disconnected');
        },
      });

      this.client.activate();
    });
  }

  disconnect(): void {
    if (this.client) {
      this.client.deactivate();
      this.client = null;
      this.connected = false;
    }
  }

  private subscribeToPresence(): void {
    if (!this.client) return;

    this.client.subscribe('/topic/presence', (message: IMessage) => {
      const users = JSON.parse(message.body);
      this.emit('presence', users);
    });

    this.client.subscribe('/user/queue/history', (message: IMessage) => {
      const history = JSON.parse(message.body);
      this.emit('history', history);
    });
  }

  joinRoom(contentId: string): void {
    this.currentContentId = contentId;
    if (!this.client || !this.connected) return;

    this.client.publish({
      destination: `/app/join/${contentId}`,
      body: JSON.stringify({
        username: this.username,
        avatar: this.avatar,
        sessionId: this.sessionId
      })
    });

    this.client.subscribe(`/topic/room/${contentId}`, (message: IMessage) => {
      const event = JSON.parse(message.body) as CollaborationEvent;
      this.emit('roomEvent', event);
    });

    this.client.subscribe(`/topic/chat/${contentId}`, (message: IMessage) => {
      const chat = JSON.parse(message.body) as ChatMessage;
      this.emit('chat', chat);
    });

    this.client.subscribe(`/topic/cursor/${contentId}`, (message: IMessage) => {
      const cursor = JSON.parse(message.body) as CursorPosition;
      this.emit('cursor', cursor);
    });

    this.client.subscribe(`/topic/content/${contentId}`, (message: IMessage) => {
      const event = JSON.parse(message.body) as CollaborationEvent;
      this.emit('contentChange', event);
    });

    this.client.subscribe(`/topic/review/${contentId}`, (message: IMessage) => {
      this.emit('reviewChange', message.body);
    });

    this.client.subscribe(`/topic/selection/${contentId}`, (message: IMessage) => {
      try {
        const data = JSON.parse(message.body);
        this.emit('selection', data);
      } catch (e) {
        this.emit('selection', message.body);
      }
    });

    this.client.subscribe(`/topic/reaction/${contentId}`, (message: IMessage) => {
      try {
        const data = JSON.parse(message.body);
        this.emit('reaction', data);
      } catch (e) {
        this.emit('reaction', message.body);
      }
    });

    this.client.subscribe(`/topic/lock/${contentId}`, (message: IMessage) => {
      try {
        const data = JSON.parse(message.body);
        this.emit('lock', data);
      } catch (e) {
        this.emit('lock', message.body);
      }
    });

    this.client.subscribe(`/topic/edit/${contentId}`, (message: IMessage) => {
      try {
        const data = JSON.parse(message.body);
        this.emit('edit', data);
      } catch (e) {
        this.emit('edit', message.body);
      }
    });

    this.client.subscribe(`/user/queue/notifications`, (message: IMessage) => {
      try {
        const notification = JSON.parse(message.body);
        this.emit('notification', notification);
      } catch (e) {
        this.emit('notification', message.body);
      }
    });
  }

  sendChatMessage(message: string): void {
    if (!this.client || !this.connected || !this.currentContentId) return;

    this.client.publish({
      destination: `/app/chat/${this.currentContentId}`,
      body: JSON.stringify({ message })
    });
  }

  sendCursorPosition(x: number, y: number): void {
    if (!this.client || !this.connected || !this.currentContentId) return;

    this.client.publish({
      destination: `/app/cursor/${this.currentContentId}`,
      body: JSON.stringify({ x, y })
    });
  }

  on(event: string, handler: EventHandler): void {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, new Set());
    }
    this.handlers.get(event)!.add(handler);
  }

  off(event: string, handler: EventHandler): void {
    this.handlers.get(event)?.delete(handler);
  }

  private emit(event: string, data: unknown): void {
    this.handlers.get(event)?.forEach(handler => handler(data));
  }

  getSessionId(): string {
    return this.sessionId;
  }

  getConnectionStatus(): boolean {
    return this.connected;
  }

  getCurrentRoom(): string | null {
    return this.currentContentId;
  }

  sendSelection(field: string, startIndex: number, endIndex: number, selectedText: string): void {
    if (!this.client || !this.connected || !this.currentContentId) return;

    this.client.publish({
      destination: `/app/selection/${this.currentContentId}`,
      body: JSON.stringify({ field, startIndex, endIndex, selectedText })
    });
  }

  clearSelection(field: string): void {
    if (!this.client || !this.connected || !this.currentContentId) return;

    this.client.publish({
      destination: `/app/selection/${this.currentContentId}`,
      body: JSON.stringify({ field, selectedText: '' })
    });
  }

  addReaction(emoji: string, field = ''): void {
    if (!this.client || !this.connected || !this.currentContentId) return;

    this.client.publish({
      destination: `/app/reaction/${this.currentContentId}`,
      body: JSON.stringify({ emoji, action: 'add', field })
    });
  }

  removeReaction(emoji: string): void {
    if (!this.client || !this.connected || !this.currentContentId) return;

    this.client.publish({
      destination: `/app/reaction/${this.currentContentId}`,
      body: JSON.stringify({ emoji, action: 'remove' })
    });
  }

  lockField(field: string): boolean {
    if (!this.client || !this.connected || !this.currentContentId) return false;

    this.client.publish({
      destination: `/app/lock/${this.currentContentId}`,
      body: JSON.stringify({ field, action: 'lock' })
    });
    return true;
  }

  unlockField(field: string): void {
    if (!this.client || !this.connected || !this.currentContentId) return;

    this.client.publish({
      destination: `/app/lock/${this.currentContentId}`,
      body: JSON.stringify({ field, action: 'unlock' })
    });
  }

  sendEdit(field: string, oldValue: string, newValue: string): void {
    if (!this.client || !this.connected || !this.currentContentId) return;

    this.client.publish({
      destination: `/app/edit/${this.currentContentId}`,
      body: JSON.stringify({ field, oldValue, newValue })
    });
  }
}

export const collaborationService = new CollaborationService();
