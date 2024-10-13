import { SpecModelDef } from "../configs/model-def";
import { ModelCode } from "../configs/model-code";
import { SpecModel } from "./specific";
import { ModelConfig } from "../configs/model";
import { BunnyModel, BunnyModelDef } from "./bunny";
import { StateUpdateBefore } from "../configs/event";
import { Random } from "../utils/random";

export type CastratedModelDef = SpecModelDef<{
    code: ModelCode.Castrated,
    info: {
        maxAgeBonus: number
    },
    reactDict: {
        ageUpdateBefore: StateUpdateBefore<BunnyModelDef, number>
    }
}>

export class CastratedModel extends SpecModel<CastratedModelDef> {
    private readonly _handleAgeUpdateBefore = (event: StateUpdateBefore<BunnyModelDef, number>) => {
        event.next += this.actualInfo.maxAgeBonus;
    };

    protected _reactDict = this._initReactDict({
        ageUpdateBefore: this._handleAgeUpdateBefore
    });

    constructor(config: ModelConfig<CastratedModelDef>) {
        super({
            ...config,
            info: {
                maxAgeBonus: config.info?.maxAgeBonus || Random.number(0, 25)
            },
            childDict: {}
        });
    }

    protected readonly _activate = () => {
        const parent = this.parent?.parent;
        if (parent instanceof BunnyModel) {
            parent.modifyEventDict.maxAge.bindReact(
                this._reactDict.ageUpdateBefore
            );
        }
    };
}
