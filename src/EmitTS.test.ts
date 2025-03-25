import {describe, it, expect, vi} from "vitest"
import {EmitTS} from "."

type TestEvents = {
  test: string
  test1: string
  test2: string
  error: Error
  number: number
  object: {id: number; name: string}
}

describe("EmitTS", () => {
  it("should check if event has listeners", () => {
    const emitter = new EmitTS<TestEvents>()
    const callback = vi.fn()

    emitter.on("test", callback)
    expect(emitter.has("test")).toBe(true)
    expect(emitter.has("test1")).toBe(false)
  })

  it("should return event names", () => {
    const emitter = new EmitTS<TestEvents>()
    const callback = vi.fn()

    emitter.on("test1", callback)
    emitter.on("test2", callback)

    expect(emitter.eventNames).toEqual(["test1", "test2"])
  })

  it("should check if emitter is empty", () => {
    const emitter = new EmitTS<TestEvents>()
    expect(emitter.isEmpty()).toBe(true)

    const callback = vi.fn()
    emitter.on("test", callback)
    expect(emitter.isEmpty()).toBe(false)
  })

  describe("Subscribe", () => {
    it("should register and emit events", async () => {
      const emitter = new EmitTS<TestEvents>()
      const callback = vi.fn()

      emitter.on("test", callback)
      await emitter.emit("test", "data")

      expect(callback).toHaveBeenCalledWith("data")
    })

    it("should register and emit object", async () => {
      const emitter = new EmitTS<TestEvents>()
      const callback = vi.fn()

      emitter.on("test", callback)
      await emitter.emit("test", {id: 1, name: "test"})

      expect(callback).toHaveBeenCalledWith({id: 1, name: "test"})
    })

    it("should handle multiple listeners", async () => {
      const emitter = new EmitTS<TestEvents>()
      const callback1 = vi.fn()
      const callback2 = vi.fn()

      emitter.on("test", callback1)
      emitter.on("test", callback2)
      await emitter.emit("test", "data")

      expect(callback1).toHaveBeenCalledWith("data")
      expect(callback2).toHaveBeenCalledWith("data")
    })

    it("should handle once listeners", async () => {
      const emitter = new EmitTS<TestEvents>()
      const callback = vi.fn()

      emitter.once("test", callback)
      await emitter.emit("test", "first")
      await emitter.emit("test", "second")

      expect(callback).toHaveBeenCalledTimes(1)
      expect(callback).toHaveBeenCalledWith("first")
    })
  })

  describe("Unsubscribe", () => {
    it("should remove one listener of one event", async () => {
      const emitter = new EmitTS<TestEvents>()
      const callback = vi.fn()
      const callback1 = vi.fn()
      const callback2 = vi.fn()

      emitter.on("test", callback) // should be removed
      emitter.on("test", callback1) // should be called
      emitter.on("test1", callback2) // should be called

      emitter.off("test", callback)

      await emitter.emit("test", "data")
      await emitter.emit("test1", "data")

      expect(callback).not.toHaveBeenCalled()
      expect(callback1).toHaveBeenCalledWith("data")
      expect(callback2).toHaveBeenCalledWith("data")
    })

    it("should remove all listeners of one event", async () => {
      const emitter = new EmitTS<TestEvents>()
      const callback = vi.fn()
      const callback1 = vi.fn()
      const callback2 = vi.fn()

      emitter.on("test", callback) // should be removed
      emitter.on("test", callback1) // should be removed
      emitter.on("test1", callback2) // should be called

      emitter.off("test")

      await emitter.emit("test", "data")
      await emitter.emit("test1", "data")

      expect(callback).not.toHaveBeenCalled()
      expect(callback1).not.toHaveBeenCalled()
      expect(callback2).toHaveBeenCalledWith("data")
    })

    it("should remove all listeners", async () => {
      const emitter = new EmitTS<TestEvents>()
      const callback = vi.fn()
      const callback1 = vi.fn()
      const callback2 = vi.fn()

      emitter.on("test", callback)
      emitter.on("test1", callback1)
      emitter.on("test2", callback2)

      emitter.off()

      await emitter.emit("test", "data")
      await emitter.emit("test1", "data")
      await emitter.emit("test2", "data")

      expect(callback).not.toHaveBeenCalled()
      expect(callback1).not.toHaveBeenCalled()
      expect(callback2).not.toHaveBeenCalled()
    })

    it("should remove after once event called", async () => {
      const emitter = new EmitTS<TestEvents>()
      const callback = vi.fn()

      emitter.once("test", callback)

      await emitter.emit("test", "data")

      expect(callback).toHaveBeenCalledWith("data")

      expect(callback).toHaveBeenCalledTimes(1)

      expect(emitter.has("test")).toBe(false)
      expect(emitter.isEmpty()).toBe(true)
    })

    it("should remove only once event", async () => {
      const emitter = new EmitTS<TestEvents>()
      const callback = vi.fn()
      const callback1 = vi.fn()

      emitter.on("test", callback)
      emitter.once("test", callback1)

      await emitter.emit("test", "data")

      expect(callback).toHaveBeenCalledWith("data")
      expect(callback1).toHaveBeenCalledWith("data")

      expect(emitter.listenersCount("test")).toBe(1)
    })
  })

  describe("Priority-based execution", () => {
    it("should execute listeners in priority order", async () => {
      const emitter = new EmitTS<TestEvents>()
      const results: number[] = []

      emitter.on("test", () => results.push(1), 0)
      emitter.on("test", () => results.push(2), 2)
      emitter.on("test", () => results.push(3), 1)

      await emitter.emit("test", "data")

      expect(results).toEqual([2, 3, 1])
    })

    it("should maintain priority order with multiple emissions", async () => {
      const emitter = new EmitTS<TestEvents>()
      const results: number[] = []

      emitter.on("test", () => results.push(1), 0)
      emitter.on("test", () => results.push(2), 2)
      emitter.on("test", () => results.push(3), 1)

      await emitter.emit("test", "first")
      await emitter.emit("test", "second")

      expect(results).toEqual([2, 3, 1, 2, 3, 1])
    })
  })

  describe("Emission strategies", () => {
   it("should execute listeners in parallel by default", async () => {
      const emitter = new EmitTS<TestEvents>()
      const results: number[] = []
      const delays = [100, 50, 200]

      delays.forEach((delay, index) => {
        emitter.on("test", async () => {
          await new Promise((resolve) => setTimeout(resolve, delay))
          results.push(index)
        })
      })

      await emitter.emit("test", "data")

      expect(results).toEqual([1, 0, 2]) // Should complete in order of delay
    })

    it("should execute listeners sequentially when specified", async () => {
      const emitter = new EmitTS<TestEvents>()
      const results: number[] = []
      const delays = [100, 50, 200]

      delays.forEach((delay, index) => {
        emitter.on("test", async () => {
          await new Promise((resolve) => setTimeout(resolve, delay))
          results.push(index)
        })
      })

      await emitter.emit("test", "data", {strategy: "sequential"})

      expect(results).toEqual([0, 1, 2]) // Should complete in order of registration
    })
  })

  describe("Error handing", () => {
    it("should continue execution when one listener throws an error", async () => {
      const emitter = new EmitTS<TestEvents>()
      const callback1 = vi.fn().mockRejectedValue(new Error("Test error"))
      const callback2 = vi.fn()

      emitter.on("test", callback1)
      emitter.on("test", callback2)

      await emitter.emit("test", "data")

      expect(callback1).toHaveBeenCalledWith("data")
      expect(callback2).toHaveBeenCalledWith("data")
    })

    it("should handle async errors properly", async () => {
      const emitter = new EmitTS<TestEvents>()
      const callback1 = vi.fn().mockImplementation(async () => {
        throw new Error("Async error")
      })
      const callback2 = vi.fn()

      emitter.on("test", callback1)
      emitter.on("test", callback2)

      await emitter.emit("test", "data")

      expect(callback1).toHaveBeenCalledWith("data")
      expect(callback2).toHaveBeenCalledWith("data")
    })
  })

  describe("Edge cases", () => {
    it("should handle duplicate listeners", async () => {
      const emitter = new EmitTS<TestEvents>()
      const callback = vi.fn()

      emitter.on("test", callback)
      emitter.on("test", callback) // Duplicate registration

      await emitter.emit("test", "data")

      expect(callback).toHaveBeenCalledTimes(1)
    })

    it("should handle maxListeners warning", async () => {
      const consoleWarn = vi.spyOn(console, "warn").mockImplementation(() => {})
      const emitter = new EmitTS<TestEvents>({maxListeners: 2})

      emitter.on("test", () => {})
      emitter.on("test", () => {})
      emitter.on("test", () => {}) // Should trigger warning

      expect(consoleWarn).toHaveBeenCalledWith(expect.stringContaining("MaxListenersExceededWarning"))

      consoleWarn.mockRestore()
    })

    it("should handle different payload types", async () => {
      const emitter = new EmitTS<TestEvents>()
      const stringCallback = vi.fn()
      const numberCallback = vi.fn()
      const objectCallback = vi.fn()

      emitter.on("test", stringCallback)
      emitter.on("number", numberCallback)
      emitter.on("object", objectCallback)

      await emitter.emit("test", "string data")
      await emitter.emit("number", 42)
      await emitter.emit("object", {id: 1, name: "test"})

      expect(stringCallback).toHaveBeenCalledWith("string data")
      expect(numberCallback).toHaveBeenCalledWith(42)
      expect(objectCallback).toHaveBeenCalledWith({id: 1, name: "test"})
    })
  })

  describe("Promise-based API", () => {
    it("should resolve toPromise when event is emitted", async () => {
      const emitter = new EmitTS<TestEvents>()
      const promise = emitter.toPromise("test")

      setTimeout(() => emitter.emit("test", "data"), 50)

      const result = await promise
      expect(result).toBe("data")
    })

    it("should handle multiple toPromise calls", async () => {
      const emitter = new EmitTS<TestEvents>()
      const promise1 = emitter.toPromise("test")
      const promise2 = emitter.toPromise("test")

      setTimeout(() => emitter.emit("test", "data"), 50)

      const [result1, result2] = await Promise.all([promise1, promise2])
      expect(result1).toBe("data")
      expect(result2).toBe("data")
    })
  })

  describe("Debug logging", () => {
    it("should use custom logger when provided", async () => {
      const customLogger = vi.fn()
      const emitter = new EmitTS<TestEvents>({debug: true, logger: customLogger})

      emitter.on("test", () => {})
      await emitter.emit("test", "data")

      expect(customLogger).toHaveBeenCalled()
    })
  })
})
