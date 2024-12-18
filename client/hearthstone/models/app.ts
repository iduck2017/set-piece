import { DataBase } from "../services/database";
import { File } from "../services/file";
import { GameModel } from "./game";
import { Validator, Def, Factory, NodeModel, Base } from "@/set-piece";

type AppDef = Def.Create<{
    code: 'app',
    stateDict: {
        readonly version: string,
    },
    childDict: {
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
                version: '0.1.0'
            },
            paramDict: {},
            childDict: {},
            childList: [],
            parent: undefined
        });
    }

    @Validator.useCondition(app => !app.childDict.game)
    async start() {
        console.log('start');
        const chunk = await File.loadChunk<GameModel>('game');
        this.childChunkDict.game = chunk;
    }

    @Validator.useCondition(app => Boolean(app.childDict.game))
    async save() {
        if (this.childDict.game) {
            await File.saveChunk<GameModel>(this.childDict.game);
        }
    }

    @Validator.useCondition(app => Boolean(app.childDict.game))
    quit() {
        if (this.childDict.game) delete this.childChunkDict.game;
        AppModel._singleton = new Map();
    }

    debug() {
        console.log(Factory.productDict);
        console.log(DataBase.cardProductInfo);
    }
}