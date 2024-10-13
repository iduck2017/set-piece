import type { Model } from "../models";
import { BunnyModel } from "../models/bunny";
import { TimerModel } from "../models/timer";

export function useIntf(model: Model): Record<string, () => void> {
    if (model instanceof BunnyModel) {
        return {
            spawnChild: model.reproduce,
            suicide: model.suicide
        };
    }
    if (model instanceof TimerModel) {
        return {
            tick: model.tick.bind(model, 1)
        };
    }

    return {};
}