import { Value } from "@/types";
import { BaseModel } from ".";
import { DecorProviders } from "./state";
import { EventProducers } from "./event";

export class AgentPlugin<
    C extends Record<string, BaseModel> | BaseModel[],
    S extends Record<string, Value>,
    E extends Record<string, any>
> {
    child: C extends any[] ? C[number] : C;
    decor: DecorProviders<S>;
    event: EventProducers<S, C, E>;
    
    
}