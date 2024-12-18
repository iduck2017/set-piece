import { CombatableModel } from "@/hearthstone/models/combatable";
import { CardRefer } from "./card";
import { MinionDef, MinionModel } from "@/hearthstone/models/minion";
import { Def } from "@/set-piece";

export class FeatureRefer extends CardRefer {
    get combatable() {
        return this.queryParent(CombatableModel);
    }

    get minion(): MinionModel<MinionDef<Def.Pure>> | undefined {
        return this.queryParent<MinionModel>(
            undefined,
            (model) => model instanceof MinionModel
        );
    }
}