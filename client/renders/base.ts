import { EventMap, EventId } from "../types/events";

export abstract class Renderer<
    E extends EventId
> {
    public abstract _handle: { [K in E]: EventMap<K> }; 
}