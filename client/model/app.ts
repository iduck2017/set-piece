import { Base } from "@/type/base";
import { Model } from ".";
import { Bunny, Gender } from "./bunny";
import { Game } from "./game";

export enum Version {
    Major,
    Minor,
    Patch,
}

export class App extends Model<{
    type: 'app';
    memoState: {
        version: [number, number, number];
        count: number;
    },
    tempState: {
        isInit: boolean;
    },
    childDict: {
        bunny?: Bunny;
        game?: Game;
    },
    parent: undefined
}> {
    private static _singleton: Map<Function, boolean> = new Map();
    static useSingleton() {
        return function (Type: Base.Class) {
            App._singleton.set(Type, false);
            const constructor = Type.constructor;
            Type.constructor = function (...args: any[]) {
                if (App._singleton.get(Type)) {
                    throw new Error('Only one instance of App can be created');
                }
                App._singleton.set(Type, true);
                constructor(...args); 
            };
        };
    }

    private static _main?: App;
    static get main(): App {
        if (!App._main) {
            App._main = new App();
        }
        return App._main;
    }

    constructor() {
        super({
            type: 'app',
            id: Date.now().toString(36),
            memoState: {
                version: [ 0, 1, 0 ],
                count: 0
            },
            tempState: {
                isInit: false
            },
            childDict: {},
            childList: {}
        }, undefined);
        window.app = this;
    }
    
    @Model.useValidator(model => !model._tempState.isInit)
    async init() {
        this._tempState.isInit = true;
        const raw = localStorage.getItem('game');
        if (raw) {
            const seq: Model.Seq<Game> = JSON.parse(raw);
            this._childDict.game = this._new<Game>(seq);
        } else {
            this._childDict.game = this._new<Game>({
                type: 'game'
            });
        }
        // const raw = localStorage.getItem('bunny');
        // if (raw) {
        //     const seq: Model.Seq<Bunny> = JSON.parse(raw);
        //     this._childDict.bunny = this._new<Bunny>(seq);
        // } else {
        //     this._childDict.bunny = this._new<Bunny>({
        //         type: 'bunny',
        //         memoState: {
        //             name: 'Tom',
        //             gender: Gender.Female
        //         }
        //     });
        // }
    }


    @Model.useValidator(model => model._tempState.isInit, true)
    count() {
        this._memoState.count ++;
    }

    @Model.useDebugger(true)
    @Model.useValidator(model => model._tempState.isInit, true)
    async save() {
        // const seq: Model.Seq<Bunny> | undefined = this.child.bunny?.seq;
        // if (seq) {
        //     localStorage.setItem('bunny', JSON.stringify(seq));
        // }
        const seq = this.child.game?.seq;
        if (seq) {
            localStorage.setItem('game', JSON.stringify(seq));
        }
        return this.child.bunny?.seq;
    }

    @Model.useValidator(model => model._tempState.isInit, true)
    quit() {
        delete this._childDict.game;
        this._tempState.isInit = false;
        App._singleton = new Map();
    }
}