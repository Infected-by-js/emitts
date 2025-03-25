import {describe, it, expect, vi} from "vitest"
import {insertSorted, removeFromArray, log} from "./helpers"

describe("Helper functions", () => {
  describe("insertSorted", () => {
    it("should insert items in descending order", () => {
      const array: {value: number; id: number}[] = []

      insertSorted(array, {value: 2, id: 1}, (item) => item.value)
      insertSorted(array, {value: 5, id: 2}, (item) => item.value)
      insertSorted(array, {value: 3, id: 3}, (item) => item.value)
      insertSorted(array, {value: 1, id: 4}, (item) => item.value)
      insertSorted(array, {value: 4, id: 5}, (item) => item.value)

      expect(array.map((item) => item.value)).toEqual([5, 4, 3, 2, 1])
    })

    it("should handle duplicate priority values", () => {
      const array: {value: number; id: number}[] = []

      insertSorted(array, {value: 2, id: 1}, (item) => item.value)
      insertSorted(array, {value: 2, id: 2}, (item) => item.value)
      insertSorted(array, {value: 2, id: 3}, (item) => item.value)

      expect(array.map((item) => item.id)).toEqual([1, 2, 3])
    })

    it("should handle empty array", () => {
      const array: number[] = []
      insertSorted(array, 1, (item) => item)
      expect(array).toEqual([1])
    })

    it("should handle negative values", () => {
      const array: number[] = []

      insertSorted(array, -2, (item) => item)
      insertSorted(array, -5, (item) => item)
      insertSorted(array, -3, (item) => item)
      insertSorted(array, -1, (item) => item)
      insertSorted(array, -4, (item) => item)

      expect(array).toEqual([-1, -2, -3, -4, -5])
    })

    it("should handle mixed positive and negative values", () => {
      const array: number[] = []

      insertSorted(array, -2, (item) => item)
      insertSorted(array, 5, (item) => item)
      insertSorted(array, 0, (item) => item)
      insertSorted(array, -1, (item) => item)
      insertSorted(array, 4, (item) => item)

      expect(array).toEqual([5, 4, 0, -1, -2])
    })
  })

  describe("removeFromArray", () => {
    it("should remove first matching item", () => {
      const array = [1, 2, 3, 2, 4]
      removeFromArray(array, (item) => item === 2)
      expect(array).toEqual([1, 3, 2, 4])
    })

    it("should handle no match", () => {
      const array = [1, 2, 3]
      removeFromArray(array, (item) => item === 4)
      expect(array).toEqual([1, 2, 3])
    })

    it("should handle empty array", () => {
      const array: number[] = []
      removeFromArray(array, (item) => item === 1)
      expect(array).toEqual([])
    })

    it("should remove object by reference", () => {
      const obj1 = {id: 1}
      const obj2 = {id: 1}
      const obj3 = {id: 2}
      const array = [obj1, obj2, obj3]

      removeFromArray(array, (item) => item === obj1)
      expect(array).toEqual([obj2, obj3])
    })

    it("should remove object by value comparison", () => {
      const array = [
        {id: 1, value: "a"},
        {id: 2, value: "b"},
        {id: 3, value: "c"},
      ]

      removeFromArray(array, (item) => item.id === 2)
      expect(array).toEqual([
        {id: 1, value: "a"},
        {id: 3, value: "c"},
      ])
    })

    it("should handle array with undefined values", () => {
      const array = [1, undefined, 2, undefined, 3]
      removeFromArray(array, (item) => item === undefined)
      expect(array).toEqual([1, 2, undefined, 3])
    })
  })

  describe("log", () => {
    it("should log message with event data", () => {
      const consoleLog = vi.spyOn(console, "log").mockImplementation(() => {})

      log("test", {event: "testEvent", data: "testData"})

      expect(consoleLog).toHaveBeenCalled()
      expect(consoleLog.mock.calls[0]).toContain("[EmitTS]")
      expect(consoleLog.mock.calls[0]).toContain("TEST testEvent")
      expect(consoleLog.mock.calls[0]).toContain("testData")

      consoleLog.mockRestore()
    })

    it("should include stack trace", () => {
      const consoleLog = vi.spyOn(console, "log").mockImplementation(() => {})

      log("test", {})

      const args = consoleLog.mock.calls[0]
      expect(args.some((arg) => arg.includes("CAPTURED at"))).toBe(true)

      consoleLog.mockRestore()
    })
  })
})
