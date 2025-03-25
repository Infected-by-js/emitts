import {EmitTS} from "../src"

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
emitter.on("greet", (name) => console.log(`[greet] On: Hello, ${name}!`))

console.log("[greet] Emit greet event")
emitter.emit("greet", "John")

// Example 2: Object event
console.log("\nExample 2: Object event")

emitter.on("hello", (message) => {
  console.log(JSON.stringify(message))
  console.log(`[hello] On: Hello, ${message.name}!`)
})

console.log("[hello] Emit hello event")
emitter.emit("hello", {name: "John"})

// Example 3: Multiple listeners
console.log("\nExample 3: Multiple listeners")
emitter.on("data", (value) => console.log(`[data] On: Listener 1 received: ${value}`))
emitter.on("data", (value) => console.log(`[data] On: Listener 2 received: ${value}`))

console.log("[data] Emit data event")
emitter.emit("data", 42)
emitter.off("data") 

// Example 4: Once listener
console.log("\nExample 4: Once listener")
emitter.once("one-time", (message) => console.log(`[one-time] On: One-time event: ${message}`))

console.log("[one-time] Emit one-time event")
emitter.emit("one-time", "First time")
console.log("[one-time] Emit one-time event again")
emitter.emit("one-time", "Second time (should not be received)")
emitter.off("one-time")

// Example 5: Remove listener
console.log("\nExample 5: Remove listener")
const goodbyeHandler = (name: string) => console.log(`[goodbye] On: Goodbye, ${name}!`)
emitter.on("goodbye", goodbyeHandler)

console.log("[goodbye] Emit goodbye event")
emitter.emit("goodbye", "Alice")

console.log("[goodbye] Remove goodbye event")
emitter.off("goodbye", goodbyeHandler)

console.log("[goodbye] Emit goodbye event again")
emitter.emit("goodbye", "Bob") // Should not be received

// Example 6: Event names and empty check
console.log("\nExample 6: Event names and empty check")
console.log("[eventNames] Active events:", emitter.eventNames)
console.log("[isEmpty] Is emitter empty?", emitter.isEmpty())

// Example 7: Priority-based execution
console.log("\nExample 7: Priority-based execution")
emitter.on("data", () => console.log("[data] Default priority"), 0)
emitter.on("data", () => console.log("[data] High priority"), 100)

console.log("[data] Emit data event")
emitter.emit("data", 123)
emitter.off("data")

// Example 8: Sequential execution
console.log("\nExample 8: Sequential execution")
emitter.on("data", async () => {
  await new Promise((resolve) => setTimeout(resolve, 100))
  console.log("[data] On: First (sequential)")
})

emitter.on("data", async () => {
  await new Promise((resolve) => setTimeout(resolve, 50))
  console.log("[data] On: Second (sequential)")
})

console.log("[data] Emit data event")
emitter.emit("data", 456, {strategy: "sequential"})
emitter.off("data")

// Example 9: Using toPromise
console.log("\nExample 9: Using toPromise")
const promise = emitter.toPromise("data")
console.log("[data] Emit data event")
emitter.emit("data", 789)
promise.then(value => console.log("[data] Promise resolved with value:", value))