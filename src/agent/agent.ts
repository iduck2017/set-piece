import { Model } from "../model";


export class Agent<M extends Model = Model> {
    
    public get agent() { return this.target.agent; }

    public readonly target: M;

    constructor(target: M) { 
        this.target = target; 
    }

}