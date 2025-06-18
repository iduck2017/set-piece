import { Model } from "../model";

export class Agent<M extends Model = Model> {
    public get agent() { return this.model.agent; }

    public readonly model: M;
    constructor(model: M) { this.model = model; }
}