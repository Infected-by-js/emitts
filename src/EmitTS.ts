import {log, insertSorted, removeFromArray} from "./helpers"

import type {
  CleanUpFn,
  DebugLog,
  EmitOptions,
  EventCallback,
  EventMap,
  IEmitTS,
  IEventSubscription,
  SubscriberWithPriority,
} from "./types"

/**
 * A type-safe event emitter with priority-based event handling.
 *
 * Features:
 * - Priority-based listeners (higher numbers execute first)
 * - Sequential or parallel execution strategies
 * - Debugging capabilities with custom loggers
 * - Memory leak detection with maxListeners warning
 *
 * @template Events A map of event names to their payload types
 */
export class EmitTS<Events extends EventMap = EventMap> implements IEmitTS<Events> {
  private subscriptions: Map<keyof Events, EventSubscription<unknown>>
  private maxListeners: number
  private logger: DebugLog

  /**
   * Creates a new event emitter instance.
   *
   * @param options Configuration options
   * @param options.debug Whether to enable debug logging (defaults to false)
   * @param options.logger Custom debug logger (defaults to internal logger)
   * @param options.maxListeners Maximum listeners per event before warning (defaults to 10)
   */
  constructor(options: {debug?: boolean; logger?: DebugLog; maxListeners?: number} = {}) {
    this.logger = options.debug ? options.logger || log : () => {}
    this.subscriptions = new Map()
    this.maxListeners = options.maxListeners ?? 10
  }

  /**
   * Checks whether the emitter has listeners for the given event.
   * @param event Event name
   * @returns `true` if any listeners are registered
   */
  has(event: keyof Events): boolean {
    return this.subscriptions.has(event)
  }

  /**
   * Returns the number of listeners for the given event.
   * @param event Event name
   * @returns The number of listeners
   */
  listenersCount(event: keyof Events): number {
    return this.subscriptions.get(event)?.subscriberCount ?? 0
  }

  /**
   * Returns a list of all currently registered event names.
   */
  get eventNames(): (keyof Events)[] {
    return Array.from(this.subscriptions.keys())
  }

  /**
   * Checks whether the emitter has no listeners at all.
   */
  isEmpty(): boolean {
    return this.subscriptions.size === 0
  }

  /**
   * Removes all listeners for all events.
   */
  clear(): void {
    this.logger("clear", {message: `CLEARING ${this.subscriptions.size} EVENT TYPES`})

    this.subscriptions.forEach((subscription) => subscription.clear())
    this.subscriptions.clear()
  }

  /**
   * Implementation of on() method that creates and manages subscriptions.
   * Handles initial subscription setup and debug logging.
   */
  on<E extends keyof Events>(event: E, callback: EventCallback<Events[E]>, priority = 0): CleanUpFn {
    if (!this.subscriptions.has(event)) {
      this.subscriptions.set(event, new EventSubscription(String(event), this.maxListeners))
    }

    const subscription = this.subscriptions.get(event)!
    const off = subscription.addSubscriber(callback, priority)

    this.logger("subscribe", {event, message: `PRIORITY ${priority}`})

    return () => {
      this.logger("unsubscribe", {event})
      off()
      if (subscription.isEmpty) this.subscriptions.delete(event)
    }
  }

  /**
   * Implementation of once() that creates a self-removing listener.
   */
  once<E extends keyof Events>(event: E, callback: EventCallback<Events[E]>, priority = 0): void {
    this.logger("subscribe:once", {event})

    let off: null | (() => void) = this.on(
      event,
      async (data) => {
        this.logger("unsubscribe:once", {event})
        await callback(data)
        off?.()
        off = null
      },
      priority,
    )
  }

  /**
   * Implementation of off() that handles both specific and all-event unsubscription.
   * Cleans up empty subscription objects to prevent memory leaks.
   */
  off<E extends keyof Events>(event?: E, callback?: EventCallback<Events[E]>): void {
    if (!event || !this.subscriptions.has(event)) {
      this.clear()
      return
    }

    const subscription = this.subscriptions.get(event)!

    if (callback) {
      this.logger("unsubscribe", {event})
      subscription.removeSubscriber(callback)
    } else {
      this.logger("unsubscribe_all", {
        event,
        message: `REMOVING ${subscription.subscriberCount} SUBSCRIBERS`,
      })
      subscription.clear()
    }

    if (subscription.isEmpty) this.subscriptions.delete(event)
  }

  /**
   * Implementation of emit() that supports both parallel (default) and sequential execution.
   * Handles error boundaries to prevent one subscriber from breaking others.
   */
  async emit<E extends keyof Events>(
    event: E,
    data: Events[E],
    options: EmitOptions = {strategy: "parallel"},
  ): Promise<void> {
    const subscription = this.subscriptions.get(event)

    if (!subscription) {
      this.logger("emit", {event, message: `!!! NO EVENTS "${String(event)}" FOUND !!!`})
      return
    }

    this.logger("emit", {event, data, message: `STRATEGY: ${options.strategy}`})

    if (options.strategy === "sequential") {
      for (const {callback} of subscription.subscribers) {
        try {
          await callback(data)
        } catch (err) {
          console.error(`[EmitTS] Error in listener for event "${String(event)}":`, err)
        }
      }
    } else {
      const results: Promise<void>[] = []

      for (const {callback} of subscription.subscribers) {
        try {
          const result = callback(data)
          if (result instanceof Promise) results.push(result)
        } catch (err) {
          console.error(`[EmitTS] Error in listener for event "${String(event)}":`, err)
        }
      }

      try {
        await Promise.all(results)
      } catch (err) {
        console.error(`[EmitTS] Error in listener for event "${String(event)}":`, err)
      }
    }
  }

  /**
   * Returns a promise that resolves when the given event is emitted.
   *
   * @param event Event name
   * @returns Promise that resolves with the event payload
   */
  toPromise<E extends keyof Events>(event: E): Promise<Events[E]> {
    return new Promise((resolve) => this.once(event, resolve))
  }
}

/**
 * Internal class that manages subscribers for a single event type.
 * Handles priority sorting, duplicate detection, and memory leak warnings.
 *
 * @template T The event payload type
 */
class EventSubscription<T = unknown> implements IEventSubscription<T> {
  public type: string
  public subscribers: SubscriberWithPriority<T>[]
  private maxListeners: number

  constructor(type: string, maxListeners: number) {
    this.type = type
    this.maxListeners = maxListeners
    this.subscribers = []
  }

  get isEmpty(): boolean {
    return this.subscribers.length === 0
  }

  get subscriberCount(): number {
    return this.subscribers.length
  }

  /**
   * Adds a new subscriber with specified priority.
   * Handles duplicate detection and maxListeners warnings.
   * Orders subscribers by priority (highest first).
   */
  addSubscriber(callback: EventCallback<T>, priority = 0): CleanUpFn {
    if (this.subscribers.some((s) => s.callback === callback)) {
      console.warn(`[EmitTS] Duplicate listener detected for "${this.type}". Used the already existing one.`)
      return () => this.removeSubscriber(callback)
    }

    if (this.subscribers.length >= this.maxListeners) {
      console.warn(
        `[EmitTS] MaxListenersExceededWarning: Possible memory leak detected. ` +
          `More than ${this.maxListeners} listeners for event "${this.type}".`,
      )
    }

    const subscriber: SubscriberWithPriority<T> = {callback, priority}
    insertSorted(this.subscribers, subscriber, (s) => s.priority)

    return () => this.removeSubscriber(callback)
  }

  removeSubscriber(callback: EventCallback<T>): void {
    removeFromArray(this.subscribers, (s) => s.callback === callback)
  }

  clear(): void {
    this.subscribers = []
  }
}
