import { KeyOf, ValueOf } from "..";
import { ModelDef } from "./define";

// 模型序列化对象
export type ModelBundle<D extends ModelDef> = Readonly<{
    id: string;
    code: ModelDef.Code<D>,
    info: ModelDef.Info<D>,
    childList: ModelBundle.ChildList<D>,   
    childDict: ModelBundle.ChildDict<D>,
}>

export namespace ModelBundle {
    export type ChildList<D extends ModelDef> = Array<
        ModelBundle<ValueOf<ModelDef.ChildList<D>>>
    >
    export type ChildDict<D extends ModelDef> = {
        [K in KeyOf<ModelDef.ChildDict<D>>]: 
            ModelBundle<ModelDef.ChildDict<D>[K]>
    }
}