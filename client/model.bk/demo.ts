import { IModel } from ".";
import { Factory } from "@/service/factory";
import { ChunkOf } from "@/type/define";
import { App } from "./app";
import { Bunny } from "./bunny";
import { Gender } from "@/type/common";
import { Pings } from "./ping";
import { Pongs } from "./pong";
import { Lifecycle } from "@/service/lifecycle";

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
    private static _main?: Demo;
    static get main(): Demo {
        if (!Demo._main) {
            console.error('DemoUninited');
            throw new Error();
        }
        return Demo._main;
    }

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

    @Lifecycle.useLoader()
    private _onLoad() {
        Demo._main = this;
    }

    @Lifecycle.useUnloader()
    private _onUnload() {
        delete Demo._main;
    }
}

