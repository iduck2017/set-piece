import { Model } from "../model";
import { getHandlers } from "./listener";

export class Event {}

export function emitEventSync(target: Model, event: Event) {
    const handlers = getHandlers(target, event);
    handlers.forEach(handler => {
        handler(target, event);
    });
}

export async function emitEventAsync(target: Model, event: Event) {
    const handlers = getHandlers(target, event);
    for (const handler of handlers) {
        await handler(target, event);
    }
}