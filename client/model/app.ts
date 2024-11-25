import { Base } from "@/type/base";
import { Node } from "./node";
import { Validator } from "@/service/validator";

export enum Version {
    Major,
    Minor,
    Patch,
}

type AppState = {
    version: string,
    count: number,
}
type AppEvent = {}
type AppChild = {}

export class App extends Node<
    'app',
    AppState,
    AppChild,
    AppEvent    
> {
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
            state: {
                version: '0.1.0',
                count: 0
            },
            child: {},
            event: {}
        });
        window.app = this;
    }

    private _isInited: boolean = false;
    get state() {
        const result = super.state;
        return {
            ...result,
            isInited: this._isInited
        };
    }
    
    @Validator.useCondition(node => !node.state.isInited)
    async init() {
        this._isInited = true;
    }

    @Validator.useCondition(node =>  node.state.isInited)
    count() {
        this.state.count ++;
    }

    @Validator.useCondition(node => node.state.isInited)
    quit() {
        this._isInited = false;
        App._singleton = new Map();
    }
}