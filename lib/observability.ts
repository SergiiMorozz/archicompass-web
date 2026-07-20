type EventContext = Record<string, boolean | number | string | null | undefined>;

function write(level: "error" | "info", event: string, context: EventContext = {}) {
  const payload = {
    event,
    level,
    timestamp: new Date().toISOString(),
    ...context,
  };

  if (level === "error") console.error(JSON.stringify(payload));
  else console.info(JSON.stringify(payload));
}

export function logInfo(event: string, context?: EventContext) {
  write("info", event, context);
}

export function logError(event: string, context?: EventContext) {
  write("error", event, context);
}
