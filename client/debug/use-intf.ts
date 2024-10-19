import type { Model } from "../model";
import { BunnyModel } from "../model/bunny";
import { CastratableModel } from "../model/castratable";
import { TimerModel } from "../model/timer";

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