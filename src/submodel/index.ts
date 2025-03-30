import { Model } from "@/model/model";
import { EventModel } from "./event";

export class Submodel {
    public readonly target: Model;

    // public get event() { return this.target.event }

    constructor(target: Model) {
        this.target = target;
    }
}