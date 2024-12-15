import { Base } from "@/type/base";
import { DemoModel } from "./demo";
import { GameModel } from "./game";
import { NodeModel } from "./node";
import { Def } from "@/type/define";
import { Validator } from "@/service/validator";
import { File } from "@/service/file";

type AppDef = Def.Create<{
    code: 'app',
    stateDict: {
        readonly version: string,
        count: number
    },
    childDict: {
        demo?: DemoModel,
        game?: GameModel,
    },
    parent: undefined,
}>

export class AppModel extends NodeModel<AppDef> {
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
            stateDict: {
                version: '0.1.0',
                count: 0
            },
            paramDict: {},
            childDict: {},
            childList: [],
            parent: undefined
        });
        window.app = this;
    }
    
    count() {
        this.baseStateDict.count++;
    }

    @Validator.useCondition(app => !app.childDict.game)
    async start() {
        const chunk = await File.loadChunk<GameModel>('game');
        this.childChunkDict.game = chunk;
    }
    
    @Validator.useCondition(app => !app.childDict.demo)
    async test() {
        const chunk = await File.loadChunk<DemoModel>('demo');
        this.childChunkDict.demo = chunk;
    }

    @Validator.useCondition(app => Boolean(app.childDict.game || app.childDict.demo))
    async save() {
        if (this.childDict.demo) await File.saveChunk<DemoModel>(this.childDict.demo);
        if (this.childDict.game) await File.saveChunk<GameModel>(this.childDict.game);
    }

    @Validator.useCondition(app => Boolean(app.childDict.demo || app.childDict.game))
    quit() {
        if (this.childDict.demo) delete this.childChunkDict.demo;
        if (this.childDict.game) delete this.childChunkDict.game;
        AppModel._singleton = new Map();
    }
}