import { Factory } from "@/service/factory";
import { Lifecycle } from "@/service/lifecycle";
import { AppModel } from "./app";
import { NodeModel } from "./node";
import { Def } from "@/type/define";
import { Props } from "@/type/props";

type GameDef = Def.Merge<{
    code: 'game',
    parent: AppModel,
}>

@Factory.useProduct('game')
export class GameModel extends NodeModel<GameDef> {
    private static _core?: GameModel;
    static get core(): GameModel {
        if (!GameModel._core) {
            console.error('[game-uninited]');
            throw new Error();
        }
        return GameModel._core;
    }

    constructor(props: Props<GameDef>) {
        super({
            ...props,
            childDict: {},
            stateDict: {},
            paramDict: {}
        });
    }
   
    @Lifecycle.useLoader()
    private _register() {
        GameModel._core = this;
    }

    @Lifecycle.useUnloader()
    private _unregister() {
        delete GameModel._core;
    }
}