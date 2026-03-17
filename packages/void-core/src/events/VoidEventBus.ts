import EventEmitter from 'eventemitter3'
import { VoidEvent } from './events'

/**
 * VoidEventBus - typed event bus for inter-module communication
 *
 * All modules communicate through this event bus instead of direct imports.
 * This maintains hexagonal architecture boundaries.
 */
export class VoidEventBus {
  private emitter: EventEmitter

  constructor() {
    this.emitter = new EventEmitter()
  }

  /**
   * Emit an event
   * @param event The event to emit
   */
  emit(event: VoidEvent): void {
    this.emitter.emit(event.type, event)
  }

  /**
   * Subscribe to an event type
   * @param eventType The event type to listen for
   * @param handler The handler function
   * @returns Unsubscribe function
   */
  on<T extends VoidEvent['type']>(
    eventType: T,
    handler: (event: Extract<VoidEvent, { type: T }>) => void
  ): () => void {
    this.emitter.on(eventType, handler)
    return () => this.emitter.off(eventType, handler)
  }

  /**
   * Subscribe to an event type (one-time)
   * @param eventType The event type to listen for
   * @param handler The handler function
   * @returns Unsubscribe function
   */
  once<T extends VoidEvent['type']>(
    eventType: T,
    handler: (event: Extract<VoidEvent, { type: T }>) => void
  ): () => void {
    this.emitter.once(eventType, handler)
    return () => this.emitter.off(eventType, handler)
  }

  /**
   * Unsubscribe from an event type
   * @param eventType The event type
   * @param handler The handler function to remove
   */
  off<T extends VoidEvent['type']>(
    eventType: T,
    handler: (event: Extract<VoidEvent, { type: T }>) => void
  ): void {
    this.emitter.off(eventType, handler)
  }

  /**
   * Remove all listeners for an event type
   * @param eventType Optional event type (if not provided, removes all listeners)
   */
  removeAllListeners(eventType?: VoidEvent['type']): void {
    if (eventType) {
      this.emitter.removeAllListeners(eventType)
    } else {
      this.emitter.removeAllListeners()
    }
  }

  /**
   * Get the number of listeners for an event type
   * @param eventType The event type
   * @returns Number of listeners
   */
  listenerCount(eventType: VoidEvent['type']): number {
    return this.emitter.listenerCount(eventType)
  }
}

/**
 * Global event bus instance (singleton)
 */
export const eventBus = new VoidEventBus()
