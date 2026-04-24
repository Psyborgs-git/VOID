import EventEmitter from 'eventemitter3';
import { VoidEvent, VoidEventType } from './events';

export class VoidEventBus {
  private emitter = new EventEmitter();

  emit<E extends VoidEvent>(event: E): void {
    this.emitter.emit(event.type, event);
  }

  on<T extends VoidEventType>(
    type: T,
    handler: (event: Extract<VoidEvent, { type: T }>) => void
  ): void {
    this.emitter.on(type, handler);
  }

  off<T extends VoidEventType>(
    type: T,
    handler: (event: Extract<VoidEvent, { type: T }>) => void
  ): void {
    this.emitter.off(type, handler);
  }
}

export const eventBus = new VoidEventBus();
