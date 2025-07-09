import { Model } from "../model";

export class Util<M extends Model = Model> {
    public get utils() { return this.model.utils; }

    public readonly model: M;
    constructor(model: M) { this.model = model; }
}