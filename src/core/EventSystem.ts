export type EventType = 
  | 'object:select'
  | 'object:deselect'
  | 'object:hover'
  | 'object:unhover'
  | 'object:transform'
  | 'object:add'
  | 'object:remove'
  | 'object:drag:start'
  | 'object:drag:update'
  | 'object:drag:end'
  | 'tool:change'
  | 'camera:change'
  | 'scene:update'
  | 'physics:body:add'
  | 'physics:body:remove'
  | 'physics:step'
  | 'trajectory:start'
  | 'trajectory:update'
  | 'trajectory:end';

export interface EventData {
  'object:select': { objectIds: string[] };
  'object:deselect': { objectIds: string[] };
  'object:hover': { objectId: string };
  'object:unhover': { objectId: string };
  'object:transform': { objectId: string; transform: any };
  'object:add': { objectId: string };
  'object:remove': { objectId: string };
  'object:drag:start': { objectId: string; startPosition: any };
  'object:drag:update': { objectId: string; position: any; delta: any };
  'object:drag:end': { objectId: string; startPosition: any; endPosition: any; delta: any };
  'tool:change': { oldTool: string; newTool: string };
  'camera:change': { position?: number[]; target?: number[]; zoom?: number };
  'scene:update': { timestamp: number };
  'physics:body:add': { physicsBodyId: string; sceneObjectId: string };
  'physics:body:remove': { physicsBodyId: string; sceneObjectId: string };
  'physics:step': { deltaTime: number };
  'trajectory:start': { trajectoryId: string; objectId: string };
  'trajectory:update': { trajectoryId: string; progress: number };
  'trajectory:end': { trajectoryId: string; objectId: string };
}

export type EventCallback<T extends EventType> = (data: EventData[T]) => void;

export class EventSystem {
  private listeners: Map<EventType, Set<EventCallback<any>>> = new Map();
  private isEnabled = true;

  public on<T extends EventType>(
    eventType: T,
    callback: EventCallback<T>
  ): () => void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }
    
    const callbacks = this.listeners.get(eventType)!;
    callbacks.add(callback);

    // 返回取消监听的函数
    return () => {
      callbacks.delete(callback);
      if (callbacks.size === 0) {
        this.listeners.delete(eventType);
      }
    };
  }

  public off<T extends EventType>(
    eventType: T,
    callback: EventCallback<T>
  ): void {
    const callbacks = this.listeners.get(eventType);
    if (callbacks) {
      callbacks.delete(callback);
      if (callbacks.size === 0) {
        this.listeners.delete(eventType);
      }
    }
  }

  public emit<T extends EventType>(
    eventType: T,
    data: EventData[T]
  ): void {
    if (!this.isEnabled) return;

    const callbacks = this.listeners.get(eventType);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in event callback for ${eventType}:`, error);
        }
      });
    }
  }

  public once<T extends EventType>(
    eventType: T,
    callback: EventCallback<T>
  ): void {
    const wrappedCallback = (data: EventData[T]) => {
      callback(data);
      this.off(eventType, wrappedCallback);
    };
    
    this.on(eventType, wrappedCallback);
  }

  public removeAllListeners(eventType?: EventType): void {
    if (eventType) {
      this.listeners.delete(eventType);
    } else {
      this.listeners.clear();
    }
  }

  public hasListeners(eventType: EventType): boolean {
    const callbacks = this.listeners.get(eventType);
    return callbacks ? callbacks.size > 0 : false;
  }

  public getListenerCount(eventType: EventType): number {
    const callbacks = this.listeners.get(eventType);
    return callbacks ? callbacks.size : 0;
  }

  public enable(): void {
    this.isEnabled = true;
  }

  public disable(): void {
    this.isEnabled = false;
  }

  public isEventSystemEnabled(): boolean {
    return this.isEnabled;
  }

  public dispose(): void {
    this.listeners.clear();
    this.isEnabled = false;
  }
} 