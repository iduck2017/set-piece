import type { BunnyModel } from "../models/bunny";
import type { RootModel } from "../models/root";
import type { TimerModel } from "../models/timer";

/** 模型注册表 */
export enum ModelCode {
    Root = 'root',
    Timer = 'timer',
    Bunny = 'bunny',
}

/** 数据到模型 */
export type ModelReg = {
    root: typeof RootModel,
    timer: typeof TimerModel,
    bunny: typeof BunnyModel,
};

