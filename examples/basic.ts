import { EmitTS } from "../src"

// Define event types
type AppEvents = {
  greet: string
  data: number
  "one-time": string
  goodbye: string
  hello: {name: string}
}

// Create a new EmitTS instance with type safety
const emitter = new EmitTS<AppEvents>()

// Example 1: Basic event handling
console.log("Example 1: Basic event handling")

emitter.on("greet", (name) => {
  console.log(`Hello, ${name}!`)
})

emitter.emit("greet", "John")

// Example 2: Object event
console.log("\nExample 2: Object event")
emitter.on("hello", (message) => {
  console.log(`Hello, ${message.name}!`)
})
emitter.emit("hello", {name: "John"})

// Example 3: Multiple listeners
console.log("\nExample 3: Multiple listeners")
emitter.on("data", (value) => {
  console.log(`Listener 1 received: ${value}`)
})
emitter.on("data", (value) => {
  console.log(`Listener 2 received: ${value}`)
})
emitter.emit("data", 42)

// Example 4: Once listener
console.log("\nExample 4: Once listener")
emitter.once("one-time", (message) => {
  console.log(`One-time event: ${message}`)
})
emitter.emit("one-time", "First time")
emitter.emit("one-time", "Second time (should not be received)")

// Example 5: Remove listener
console.log("\nExample 5: Remove listener")
const goodbyeHandler = (name: string) => {
  console.log(`Goodbye, ${name}!`)
}
emitter.on("goodbye", goodbyeHandler)
emitter.emit("goodbye", "Alice")
emitter.off("goodbye", goodbyeHandler)
emitter.emit("goodbye", "Bob") // Should not be received

// Example 6: Event names and empty check
console.log("\nExample 6: Event names and empty check")
console.log("Active events:", emitter.eventNames)
console.log("Is emitter empty?", emitter.isEmpty())

// Example 7: Priority-based execution
console.log("\nExample 6: Priority-based execution")
emitter.on("data", () => console.log("Default priority"), 0)
emitter.on("data", () => console.log("High priority"), 100)
emitter.emit("data", 123)

// Example 8: Sequential execution
console.log("\nExample 8: Sequential execution")
emitter.on("data", async (value) => {
  await new Promise((resolve) => setTimeout(resolve, 100))
  console.log("First (sequential)")
})
emitter.on("data", async (value) => {
  await new Promise((resolve) => setTimeout(resolve, 50))
  console.log("Second (sequential)")
})
emitter.emit("data", 456, {strategy: "sequential"})
