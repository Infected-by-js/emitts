/**
 * Function type for debug logging in the EmitTS.
 * Used to log subscription and emission events.
 */
export type DebugLog = (message: string, data?: unknown) => void

/**
 * Base type representing a map of event names to their payload types.
 * EmitTS implementations can extend this with specific event definitions.
 */
export type EventMap = Record<string | symbol, unknown>

/**
 * Function returned from subscription methods that, when called,
 * will unsubscribe the listener.
 */
export type CleanUpFn = () => void

/**
 * Type for event callback functions.
 * @template T The event payload type
 */
export type EventCallback<T> = (data: T) => void | Promise<void>

/**
 * Available strategies for event emission.
 * - "parallel": All listeners execute concurrently (default)
 * - "sequential": Listeners execute one after another in priority order
 */
export type EmitStrategy = "parallel" | "sequential"

/**
 * Configuration options for event emission.
 */
export type EmitOptions = {
  /**
   * Strategy for event emission: "parallel" (default) or "sequential"
   */
  strategy?: EmitStrategy
}

/**
 * Type for subscriber with priority.
 * @template T The event payload type
 */
export type SubscriberWithPriority<T> = {
  callback: EventCallback<T>
  priority: number
}

/**
 * Interface for event subscription management.
 * @template T The event payload type
 */
export interface IEventSubscription<T> {
  type: string
  subscribers: SubscriberWithPriority<T>[]
  isEmpty: boolean
  subscriberCount: number
  addSubscriber(callback: EventCallback<T>, priority?: number): CleanUpFn
  removeSubscriber(callback: EventCallback<T>): void
  clear(): void
}

/**
 * Interface defining the public API of an event emitter.
 * @template Events A map of event names to their corresponding payload types
 */
export interface IEmitTS<Events extends EventMap = EventMap> {
  /**
   * Returns the number of listeners for the given event.
   */
  listenersCount(event: keyof Events): number

  /**
   * Returns a list of all currently registered event names.
   */
  eventNames: (keyof Events)[]

  /**
   * Checks whether the emitter has listeners for the given event.
   */
  has(event: keyof Events): boolean

  /**
   * Checks whether the emitter has no listeners at all.
   */
  isEmpty(): boolean

  /**
   * Removes all listeners for all events.
   */
  clear(): void

  /**
   * Registers a listener for the specified event.
   */
  on<E extends keyof Events>(event: E, callback: EventCallback<Events[E]>, priority?: number): CleanUpFn

  /**
   * Registers a one-time listener that automatically unsubscribes after the first emit.
   */
  once<E extends keyof Events>(event: E, callback: EventCallback<Events[E]>, priority?: number): void

  /**
   * Removes a specific listener or all listeners for a given event.
   */
  off<E extends keyof Events>(event?: E, callback?: EventCallback<Events[E]>): void

  /**
   * Emits an event with the provided data.
   */
  emit<E extends keyof Events>(event: E, data: Events[E], options?: EmitOptions): Promise<void>

  /**
   * Returns a promise that resolves when the given event is emitted.
   */
  toPromise<E extends keyof Events>(event: E): Promise<Events[E]>
}
