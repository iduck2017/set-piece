import { Model } from "@/model";
import { Agent } from ".";
import { ModelStatus } from "@/types/model";

export class RouteAgent<
    P extends Model = Model,
    M extends Model = Model
> extends Agent<M> {
    public current: Readonly<{
        parent?: P;
        path?: string;
    }>
    
    constructor(target: M) {
        super(target);
        this.current = {};
    }

    public bind(parent: P | undefined, path: string | number) {
        this.current = {
            parent,
            path: isNaN(Number(path)) ? String(path) : String(0)
        }
    }

    public unbind() {
        this.current = {};
    }

}