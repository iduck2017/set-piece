import { Model } from "@/model/model";
import { Submodel } from ".";

export class EventProducer<E = any, M extends Model = Model> {
    readonly target: M;
    readonly path: string;
    constructor(target: M, path: string) {
        this.target = target;
        this.path = path;
    }
}

export class EventSubmodel<
    E extends Record<string, any> = Record<string, any>,
    M extends Model = Model
> extends Submodel {
    
}