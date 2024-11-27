import { Factory } from "@/service/factory";
import { IModel } from ".";
import { ChunkOf } from "@/type/model";
import { App } from "./app";

@Factory.useProduct('ing-soc')
export class IngSoc extends IModel<
    'ing-soc',
    {},
    {},
    {}
> {
    declare readonly parent: App;

    constructor(
        chunk: ChunkOf<IngSoc>,
        parent: App
    ) {
        super({
            ...chunk,
            state: {},
            child: {}
        }, parent);
        
    }    
}