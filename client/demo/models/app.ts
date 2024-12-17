import { Def, Base, NodeModel, Validator, Factory } from "@/set-piece";
import { DemoModel } from "./demo";
import { File } from "../services/file";

type AppDef = Def.Create<{
    code: 'app',
    stateDict: {
        readonly version: string,
        count: number
    },
    childDict: {
        demo?: DemoModel,
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

    @Validator.useCondition(app => !app.childDict.demo)
    async start() {
        const chunk = await File.loadChunk<DemoModel>('demo');
        this.childChunkDict.demo = chunk;
    }
    
    @Validator.useCondition(app => Boolean(app.childDict.demo))
    async save() {
        if (this.childDict.demo) {
            await File.saveChunk<DemoModel>(this.childDict.demo);
        }
    }

    @Validator.useCondition(app => Boolean(app.childDict.demo))
    quit() {
        if (this.childDict.demo) delete this.childChunkDict.demo;
        AppModel._singleton = new Map();
    }

    checkFactory() {
        console.log(Factory.productDict);
        console.log(Factory.productMap);
    }
}