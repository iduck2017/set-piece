import { Model } from "@/model/model";
import { EventModel } from "./event";

export class SubModel<M extends Model = Model> {
    public readonly target: M;

    public get eventModel() { return this.target.eventModel }
    public get stateModel() { return this.target.stateModel }
    public get decorModel() { return this.target.decorModel }

    constructor(target: M) {
        this.target = target;
    }
}