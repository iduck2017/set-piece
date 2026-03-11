import { Model } from "../model";
import { getHandlers, listenerContext } from "./listener";
import { listenerRegistry } from "./use-listener";

export abstract class Event {}

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

export type EventHandler<T extends Model, E extends Event> = (target: T, event: E) => void;
