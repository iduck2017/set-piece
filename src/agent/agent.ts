import { Model } from "../model";


export class Agent<M extends Model = Model> {
    
    public readonly target: M;

    public get agent() { return this.target.agent; }

    constructor(target: M) { this.target = target; }

}