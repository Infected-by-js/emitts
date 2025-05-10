import type {EventMap} from "./types"

/**
 * Inserts an item into an array in descending order based on a numeric key.
 *
 * @template T
 * @param array The array to insert into
 * @param item The item to insert
 * @param getKey A function to get the sorting key
 */
export function insertSorted<T>(array: T[], item: T, getKey: (item: T) => number): void {
  let i = 0
  const key = getKey(item)
  while (i < array.length && getKey(array[i]) >= key) {
    i++
  }
  array.splice(i, 0, item)
}

/**
 * Removes the first item from the array that matches the predicate.
 *
 * @template T
 * @param array The array to remove from
 * @param match Predicate function to find the item
 */
export function removeFromArray<T>(array: T[], match: (item: T) => boolean): void {
  const index = array.findIndex(match)
  if (index !== -1) array.splice(index, 1)
}

type LogParams<Events extends EventMap> = {
  event?: keyof Events
  data?: unknown
  message?: string
}

/**
 * Default debug logger for the EmitTS.
 */
export function log<Events extends EventMap>(operation: string, params: LogParams<Events>): void {
  const stackTrace = getStackTrace()
  const eventName = params.event ? String(params.event) : ""

  const logParts: (string | unknown)[] = [
    `[EmitTS]`,
    `${operation.toUpperCase()} ${eventName ? `${eventName}` : ""}`,
    "\n",
  ]

  if (params.data) logParts.push("DATA ", params.data)
  if (params.message) logParts.push("MESSAGE ", params.message)

  logParts.push(`CAPTURED ${stackTrace.full}`)

  console.log(...logParts)
}

function getStackTrace(): {full: string; file: string} {
  const error = new Error()
  const stackLines = error.stack?.split("\n") || []

  const callerLine =
    stackLines
      .find((line, index) => {
        if (index < 2) return false
        // A little hardcoded, but it's ok ¯\_(ツ)_/¯
        return !line.includes("helpers") && !line.includes("EmitTS") && !line.includes("EventSubscription")
      })
      ?.trim() ||
    stackLines[2]?.trim() ||
    ""

  const match = callerLine.match(/(?:at\s+.*\s+\()?([^()]+?:\d+:\d+)[)]?$/)
  if (!match) return {full: callerLine, file: callerLine}

  const pathWithLine = match[1]

  const fileMatch = pathWithLine.match(/([^/\\]+\.[^/\\]+:\d+:\d+)$/)
  if (!fileMatch) return {full: callerLine, file: pathWithLine}

  return {full: callerLine, file: fileMatch[1]}
}
