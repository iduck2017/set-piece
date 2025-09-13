import { Model } from "../model";
import { Props } from "../types/model";
import { ChildUtil } from "./child";
import { EventUtil } from "./event";
import { ReferUtil } from "./refer";
import { RouteUtil } from "./route";
import { StateUtil } from "./state";

export type Utils<
    M extends Model = Model,
    E extends Props.E = Props.E,
    S extends Props.S = Props.S,
    C extends Props.C = Props.C,
    R extends Props.R = Props.R,
    P extends Props.P = Props.P,
> = Readonly<{
    route: RouteUtil<M, P>
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