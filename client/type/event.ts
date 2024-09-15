import type { Model } from "../models";
import { IModel } from "./model";

export namespace IEvent { 
    export type StateUpdateBefore<
        M extends IModel.Define,
        K extends keyof IModel.State<M> = keyof IModel.State<M>
    > = {
        // target: InstanceType<ModelReg[M[ModelKey.Code]]>,
        target: Model<M>,
        next: IModel.State<M>[K],
        prev: IModel.State<M>[K]
    }

    export type StateUpdateDone<
        M extends IModel.Define,
        K extends keyof IModel.State<M> = keyof IModel.State<M>
    > = {
        // target: InstanceType<ModelReg[M[ModelKey.Code]]>
        target: Model<M>,
        next: IModel.State<M>[K],
        prev: IModel.State<M>[K]
    }

    export type ChildUpdateDone<
        M extends IModel.Define,
    > = {
        // target: InstanceType<ModelReg[M[ModelKey.Code]]>
        target: Model<M>,
        list: IModel.ChildList<M>
        dict: IModel.ChildDict<M>
        children: Model[],
        child: Model,
    }
}