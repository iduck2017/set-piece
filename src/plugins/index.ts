import { Model } from "../model";
import { ChildPlugin } from "./child";
import { EventPlugin } from "./event";
import { ReferPlugin } from "./refer";
import { RoutePlugin } from "./route";
import { StatePlugin } from "./state";

export type Plugins<
    M extends Model,
    E extends Model.E,
    S extends Model.S,
    C extends Model.C,
    R extends Model.R,
> = Readonly<{
    route: RoutePlugin<M>
    event: EventPlugin<M, E>
    state: StatePlugin<M, S>
    child: ChildPlugin<M, C>
    refer: ReferPlugin<M, R>
}>

export class Plugin<M extends Model = Model> {
    public get utils() { return this.model.utils; }

    public readonly model: M;
    constructor(model: M) { this.model = model; }
}