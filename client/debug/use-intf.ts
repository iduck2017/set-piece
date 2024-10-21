import type { Model } from "../model";
import { CastratableModel } from "../model/castratable";
import { TimerModel } from "../model/timer";

export function useIntf(model: Model): Record<string, () => void> {
    if (model instanceof CastratableModel) {
        return {
            castrate: model.castrate
        };
    }
    if (model instanceof TimerModel) {
        return {
            tick: model.updateTime.bind(model, 1)
        };
    }

    return {};
}