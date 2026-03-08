import { Model } from "../model";
import { eventListenerRegistry } from "./listener";

export class Event {}

export function getEventHandlers(model: Model, event: Event) {
    let ancestor: Model | undefined = model;
    const result: Array<(target: Model, event: Event) => void> = [];
    while (ancestor) {
        const handlerRegistry = eventListenerRegistry.get(ancestor);
        const handlerKeysMap = handlerRegistry?.get(event.constructor);
        handlerKeysMap?.forEach((keys, model) => {
            keys.forEach(key => {
                const method = Reflect.get(model, key);
                if (method instanceof Function) {
                    result.push(method.bind(model));
                }
            });
        })
        ancestor = ancestor.parent;
    }
    // console.log('Get handlers', result)
    return result;
}

export function emitEventSync(target: Model, event: Event) {
    const handlers = getEventHandlers(target, event);
    handlers.forEach(handler => {
        handler(target, event);
    });
}

export async function emitEventAsync(target: Model, event: Event) {
    const handlers = getEventHandlers(target, event);
    for (const handler of handlers) {
        await handler(target, event);
    }
}