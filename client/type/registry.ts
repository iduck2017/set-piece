import type { BunnyModel } from "../models/bunny";
import type { ForagerModel } from "../models/forager";
import type { RootModel } from "../models/root";
import type { TimerModel } from "../models/time";

/** 模型注册表 */
export enum ModelCode {
    Root = 'root',
    Time = 'time', 
    Bunny = 'bunny',
    Forager = 'forager'
}

/** 数据到模型 */
export type ModelReg = {
    root: typeof RootModel,
    time: typeof TimerModel,
    bunny: typeof BunnyModel,
    forager: typeof ForagerModel
};
