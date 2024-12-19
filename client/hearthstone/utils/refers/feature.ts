import { CardRefer } from "./card";
import { MinionDef, MinionModel } from "@/hearthstone/models/minion";
import { PureDef } from "@/set-piece";

export class FeatureRefer extends CardRefer {
    get minionCombatable() {
        return this.minion?.childDict.combatable;
    }

    get minion(): MinionModel<MinionDef<PureDef>> | undefined {
        return this.queryParent<MinionModel>(
            undefined,
            (model) => model instanceof MinionModel
        );
    }
}