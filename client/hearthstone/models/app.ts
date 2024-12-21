import { DataBaseService } from "../services/database";
import { FileService } from "../services/file";
import { GameModel } from "./game";
import { ValidatorService, FactoryService, NodeModel, Base, CustomDef } from "@/set-piece";

type AppDef = CustomDef<{
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

    @ValidatorService.useCondition(app => !app.childDict.game)
    async start() {
        const chunk = await FileService.loadChunk<GameModel>('game');
        this.childChunkDict.game = chunk;
    }

    @ValidatorService.useCondition(app => Boolean(app.childDict.game))
    async save() {
        if (!this.childDict.game) return;
        await FileService.saveChunk<GameModel>(this.childDict.game);
    }

    @ValidatorService.useCondition(app => Boolean(app.childDict.game))
    quit() {
        if (!this.childDict.game) return;
        delete this.childChunkDict.game;
        AppModel._singleton = new Map();
    }

    debug() {
        console.log(FactoryService.productDict);
        console.log(DataBaseService.cardProductInfo);
    }
}