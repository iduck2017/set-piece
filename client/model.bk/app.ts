import { IModel } from ".";
import { Logger } from "@/service/logger";
import { Demo } from "./demo";
import { Validator } from "@/service/validator";
import { Class } from "@/type/base";
import { File } from "@/service/file";
import { Game } from "./game";

export class App extends IModel<
    'app',
    {
        version: string,
        count: number,
    },
    {
        demo?: Demo,
        game?: Game
    },
    {}
> {
    private static _singleton: Map<Function, boolean> = new Map();
    static useSingleton() {
        return function (Type: Class) {
            App._singleton.set(Type, false);
            const constructor = Type.constructor;
            Type.constructor = function (...args: any[]) {
                if (App._singleton.get(Type)) {
                    throw new Error();
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
            code: 'app',
            state: {
                version: '0.1.0',
                count: 0
            },
            child: {
            },
            event: {}
        }, undefined);
        window.app = this;
    }

    get state() {
        const result = super.state;
        return {
            ...result
        };
    }

    @Validator.useCondition(app => !app.child.game)
    async start() {
        const chunk = await File.load<Game>('game');
        this._child.game = chunk;
    }
    
    @Logger.useDebug(true)
    @Validator.useCondition(app => !app.child.demo)
    async test() {
        const chunk = await File.load<Demo>('demo');
        console.log(chunk);
        this._child.demo = chunk;
    }

    @Validator.useCondition(app => Boolean(app.child.game))
    async save() {
        if (this.child.game) {
            await File.save<Game>(this.child.game);
        }
    }

    @Validator.useCondition(app => Boolean(app.child.demo || app.child.game))
    quit() {
        if (this._child.demo) delete this._child.demo;
        if (this._child.game) delete this._child.game;
        App._singleton = new Map();
    }
}