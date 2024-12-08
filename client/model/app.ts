import { Validator } from "@/service/validator";
import { Base } from "@/type/base";
import { DictModel } from "./dict";
import { File } from "@/service/file";
import { DemoModel } from "./demo";
import { GameModel } from "./game";

type AppDef = {
    code: 'app',
    state: {
        version: string,
        count: number
    },
    child: {
        demo?: DemoModel
        game?: GameModel
    },
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

    private static _core?: AppModel;
    static get core(): AppModel {
        if (!AppModel._core) {
            AppModel._core = new AppModel();
        }
        return AppModel._core;
    }

    constructor() {
        super({
            code: 'app',
            state: {
                version: '0.1.0',
                count: 0
            },
            child: {},
            event: {},
            parent: undefined
        });
        window.app = this;
    }
    
    count() {
        this.rawState.count++;
    }

    @Validator.useCondition(app => !app.child.game)
    async start() {
        const chunk = await File.load<GameModel>('game');
        this.rawChild.game = chunk;
    }
    
    @Validator.useCondition(app => !app.child.demo)
    async test() {
        const chunk = await File.load<DemoModel>('demo');
        this.rawChild.demo = chunk;
    }

    @Validator.useCondition(app => Boolean(app.child.game || app.child.demo))
    async save() {
        if (this.child.demo) await File.save<DemoModel>(this.child.demo);
        if (this.child.game) await File.save<GameModel>(this.child.game);
    }

    @Validator.useCondition(app => Boolean(app.child.demo || app.child.game))
    quit() {
        if (this.rawChild.demo) delete this.rawChild.demo;
        if (this.rawChild.game) delete this.rawChild.game;
        AppModel._singleton = new Map();
    }
}