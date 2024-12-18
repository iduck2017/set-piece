import { Model } from "@/set-piece";
import { MinionModel } from "../models/minion";

export function validateTarget(
    model: Model,
    options: {
        isMinion?: boolean;
        isMinionOnBoard?: boolean;
    },
    validator?: (model: Model) => boolean
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
            const result = Reflect.get(validatorDict, key);
            const isDeny = Reflect.get(options, key);
            if (isDeny === result) return false;
        }
    }
    if (validator && !validator(model)) return false;
    return true;
}