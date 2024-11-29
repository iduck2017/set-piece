import { IModel } from ".";
import { Logger } from "@/service/logger";
import { Demo } from "./demo";
import { Validator } from "@/service/validator";
import { Class } from "@/type/base";
import { File } from "@/service/file";

export class App extends IModel<
    'app',
    {
        version: string,
        count: number,
    },
    {
        demo?: Demo
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
    
    @Logger.useDebug(true)
    @Validator.useCondition(app => !app.child.demo)
    async start() {
        const chunk = await File.load();
        this._child.demo = chunk;
    }

    @Validator.useCondition(app => Boolean(app.child.demo))
    async save() {
        const chunk = this._child.demo;
        if (chunk) {
            await File.save(chunk);
        }
    }

    @Validator.useCondition(app => Boolean(app.child.demo))
    quit() {
        delete this._child.demo;
        App._singleton = new Map();
    }
}