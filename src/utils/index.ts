import { Model } from "../model";
import { ChildUtil } from "./child";
import { EventUtil } from "./event";
import { ReferUtil } from "./refer";
import { RouteUtil } from "./route";
import { StateUtil } from "./state";

export type Utils<
    M extends Model,
    E extends Model.E,
    S extends Model.S,
    C extends Model.C,
    R extends Model.R,
> = Readonly<{
    route: RouteUtil<M>
    event: EventUtil<M, E>
    state: StateUtil<M, S>
    child: ChildUtil<M, C>
    refer: ReferUtil<M, R>
}>

export class Util<M extends Model = Model> {
    public get utils() { return this.model.utils; }

    public readonly model: M;
    constructor(model: M) { this.model = model; }
}