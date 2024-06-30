import { EventId, EventMethods } from "../types/events";

export abstract class Renderer<
    E extends EventId
> {
    public abstract hooks: { [K in E]: EventMethods[K] }; 
}