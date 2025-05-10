# EmitTS 🚀

[![TypeScript](https://badges.frapsoft.com/typescript/code/typescript.svg?v=101)](https://github.com/ellerbrock/typescript-badges/)

A type-safe event emitter for TypeScript with priority-based listeners, sequential/parallel execution strategies, and memory leak detection. Provides full type inference for event names and payloads without type casting.

## Features ✨

- 🎯 **Fully Type-Safe**: Complete TypeScript support with strict type checking
- ⚡ **High Performance**: Optimized for both small and large-scale applications
- 🎮 **Priority Control**: Execute listeners in order of importance
- 🔄 **Flexible Execution**: Choose between parallel or sequential execution
- 🐛 **Debug Support**: Built-in debugging capabilities
- 🛡️ **Memory Safe**: Memory leak detection with maxListeners warning
- 🔄 **Promise-based API**: Use promises for asynchronous operations
- 🔄 **Zero Dependencies**: No external dependencies

## Installation 📦

```bash
npm install emitts
```

## Quick Start 🚀

```typescript
import {EmitTS} from "emitts"

// Define your events
type AppEvents = {
  greet: string
  data: number
  userJoined: {id: number; name: string}
}

// Create type-safe emitter
const emitter = new EmitTS<AppEvents>()

// TypeScript will infer correct types
emitter.on("greet", (name) => {
  console.log(`Hello, ${name}!`)
})

emitter.on("userJoined", (user) => {
  console.log(`User ${user.name} joined`)
})

// Priority-based listeners
emitter.on("data", () => console.log("Second"), 0)
emitter.on("data", () => console.log("First"), 100)

// Sequential execution
await emitter.emit("data", 42, {strategy: "sequential"})
```

## Advanced Usage 🔥

### Priority-based Execution

```typescript
emitter.on("dataUpdated", (data) => console.log("Second listener"), 1)

emitter.on("dataUpdated", (data) => console.log("First listener"), 2) // Higher priority

await emitter.emit("dataUpdated", {newValue: "test"})
// Output:
// First listener
// Second listener
```

### Sequential vs Parallel Execution

```typescript
// Sequential execution (one after another)
await emitter.emit("dataUpdated", data, {strategy: "sequential"})

// Parallel execution (default)
await emitter.emit("dataUpdated", data, {strategy: "parallel"})
```

### One-time Listeners

```typescript
// Automatically removes listener after first execution
emitter.once("userLoggedIn", (data) => console.log("This will run only once"))
```

### Promise-based Usage

```typescript
// Wait for the next event
const data = await emitter.toPromise("dataUpdated")
console.log("Got data:", data)
```

### Debug Mode

```typescript
const emitter = new EmitTS<MyEvents>({
  debug: true,
  logger: (operation, data) => {
    console.log(`[DEBUG] ${operation}:`, data)
  },
})
```

## API Reference 📚

### `EmitTS<Events>`

#### Constructor Options

```typescript
interface EmitTSOptions {
  debug?: boolean // Enable debug logging
  logger?: DebugLog // Custom debug logger
  maxListeners?: number // Max listeners warning threshold (default: 10)
}
```

#### Methods

| Method           | Description                        | Type                                                                                        |
| ---------------- | ---------------------------------- | ------------------------------------------------------------------------------------------- |
| `on`             | Subscribe to an event              | `(event: keyof Events, callback: EventCallback<Events[K]>, priority?: number) => CleanUpFn` |
| `once`           | Subscribe to an event once         | `(event: keyof Events, callback: EventCallback<Events[K]>, priority?: number) => void`      |
| `off`            | Unsubscribe from an event          | `(event?: keyof Events, callback?: EventCallback<Events[K]>) => void`                       |
| `emit`           | Emit an event                      | `(event: keyof Events, data: Events[K], options?: EmitOptions) => Promise<void>`            |
| `toPromise`      | Convert next event to promise      | `(event: keyof Events) => Promise<Events[K]>`                                               |
| `has`            | Check if event has listeners       | `(event: keyof Events) => boolean`                                                          |
| `isEmpty`        | Check if emitter has any listeners | `() => boolean`                                                                             |
| `listenersCount` | Get number of listeners            | `(event: keyof Events) => number`                                                           |
| `clear`          | Remove all listeners               | `() => void`                                                                                |

### Types

```typescript
type EventCallback<T> = (data: T) => void | Promise<void>

type EmitOptions = {
  strategy?: "parallel" | "sequential"
}

type CleanUpFn = () => void
```

## Best Practices 💡

1. **Type Safety**

   ```typescript
   // Define event types for type safety
   interface MyEvents {
     event1: string
     event2: number
   }
   const emitter = new EmitTS<MyEvents>()
   ```

2. **Memory Management**

   ```typescript
   // Always clean up listeners
   const cleanup = emitter.on("event", handler)
   // Later...
   cleanup()
   ```

3. **Error Handling**

   ```typescript
   try {
     await emitter.emit("event", data)
   } catch (error) {
     console.error("Error in event handlers:", error)
   }
   ```

4. **Priority Usage**
   ```typescript
   // Use priorities for critical handlers
   emitter.on("critical", handler, 100) // High priority
   emitter.on("normal", handler, 0) // Normal priority
   ```

## Troubleshooting 🔧

### Common Issues and Solutions

1. **TypeScript Errors**

   ```typescript
   // ❌ Error: Type 'string' is not assignable to type 'number'
   emitter.emit("data", "42") // Wrong type

   // ✅ Correct usage
   emitter.emit("data", 42) // Correct type
   ```

2. **Memory Leaks**

   ```typescript
   // ❌ Potential memory leak
   emitter.on("event", handler) // No cleanup

   // ✅ Proper cleanup
   const cleanup = emitter.on("event", handler)
   // When done:
   cleanup()
   ```

3. **Async Handler Issues**

   ```typescript
   // ❌ Missing await
   emitter.emit("event", data) // Might not wait for handlers

   // ✅ Proper async handling
   await emitter.emit("event", data) // Waits for all handlers
   ```

## Contributing 🤝

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT
