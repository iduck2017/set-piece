import { IModel } from ".";
import { Factory } from "@/service/factory";
import { ChunkOf } from "@/type/model";
import { App } from "./app";
import { Bunny } from "./bunny";
import { Gender } from "@/type/common";
import { Pings, Pongs } from "./ping-pong";

@Factory.useProduct('demo')
export class Demo extends IModel<
    'demo',
    {
        count: number;
    },
    {
        bunny: Bunny;  
        pings: Pings;
        pongs: Pongs;
    },
    {}
> {
    declare parent: App;

    constructor(
        chunk: ChunkOf<Demo>,
        parent: App
    ) {
        super({
            ...chunk,
            child: {
                bunny: { 
                    code: 'bunny',
                    state: {
                        gender: Gender.Female
                    }
                },
                pings: { code: 'pings' },
                pongs: { code: 'pongs' },
                ...chunk.child
            },
            state: {
                count: 1,
                ...chunk.state
            }
        }, parent);
    }
     
}

