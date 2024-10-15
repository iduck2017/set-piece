import type { Model } from "../models";
import { BunnyModel } from "../models/bunny";
import { CastratableModel } from "../models/castratable";
import { TimerModel } from "../models/timer";

export function useIntf(model: Model): Record<string, () => void> {
    if (model instanceof BunnyModel) {
        return {
            reproduce: model.reproduce,
            suicide: model.suicide
        };
    }
    if (model instanceof CastratableModel) {
        return {
            castrate: model.castrate
        };
    }
    if (model instanceof TimerModel) {
        return {
            tick: model.tick.bind(model, 1)
        };
    }

    return {};
}