import { Validator } from "@/service/validator";
import { Base } from "@/type/base";
import { DictModel } from "./dict";
import { File } from "@/service/file";

type AppDef = {
    code: 'app',
    state: {
        version: string,
        count: number
    }
    parent: undefined,
}

export class AppModel extends DictModel<AppDef> {
    private static _singleton: Map<Function, boolean> = new Map();
    static useSingleton() {
        return function (Type: Base.Class) {
            AppModel._singleton.set(Type, false);
            const constructor = Type.constructor;
            Type.constructor = function (...args: any[]) {
                if (AppModel._singleton.get(Type)) {
                    throw new Error();
                }
                AppModel._singleton.set(Type, true);
                constructor(...args); 
            };
        };
    }

    private static _cur?: AppModel;
    static get cur(): AppModel {
        if (!AppModel._cur) {
            AppModel._cur = new AppModel();
        }
        return AppModel._cur;
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
            event: {},
            parent: undefined
        });
        window.app = this;
    }
    
    count() {
        this.rawState.count++;
    }

    // @Validator.useCondition(app => !app.child.game)
    // async start() {
    //     const chunk = await File.load<Game>('game');
    //     this._child.game = chunk;
    // }
    
    // @Validator.useCondition(app => !app.child.demo)
    // async test() {
    //     const chunk = await File.load<Demo>('demo');
    //     console.log(chunk);
    //     this._child.demo = chunk;
    // }

    // @Validator.useCondition(app => Boolean(app.child.game))
    // async save() {
    //     if (this.child.game) {
    //         await File.save<Game>(this.child.game);
    //     }
    // }

    // @Validator.useCondition(app => Boolean(app.child.demo || app.child.game))
    // quit() {
    //     if (this._child.demo) delete this._child.demo;
    //     if (this._child.game) delete this._child.game;
    //     App._singleton = new Map();
    // }
}