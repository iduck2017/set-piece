import { Model } from "@/set-piece";
import { MinionModel } from "../models/minion";

export function validateTarget(
    model: Model,
    options: {
        isMinion?: boolean;
        isMinionOnBoard?: boolean;
    }
) {
    const validatorDict = {
        isMinion: (model: Model) =>  model instanceof MinionModel,
        isMinionOnBoard: (model: Model) => {
            model instanceof MinionModel && 
            model.refer.board;
        }
    };
    for (const key in options) {
        if (Reflect.has(options, key)) {
            const validator = Reflect.get(validatorDict, key);
            const isDeny = Reflect.get(options, key);
            if (isDeny) return !validator(model);
            return validator(model);
        }
    }
    return false;
}