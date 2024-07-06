// import { VoidData } from "../types/base";
// import { PureDictConfig } from "../types/dict";
// import { PureListConfig } from "../types/list";
// import { BaseModel } from "../types/model";
// import { ModelId } from "../types/registry";
// import { ModelConsumer } from "../utils/model-consumer";
// import { DictModel } from "./dict";
// import { ListModel } from "./list";

// export class PureListModel<
//     C extends BaseModel
// > extends ListModel<
//     ModelId.LIST,
//     VoidData,
//     VoidData,
//     VoidData,
//     VoidData,
//     VoidData,
//     BaseModel,
//     C
// > {
//     public consumer;

//     constructor(config: PureListConfig<C>) {
//         super({
//             ...config,
//             modelId: ModelId.LIST,
//             rule: {},
//             info: {},
//             stat: {},
//             provider: {},
//             consumer: {},
//             children: config.children
//         });
//         this.consumer = new ModelConsumer({}, {});
//     }

// }

// export class PureDictModel<
//     C extends Record<string, BaseModel>
// > extends DictModel<
//     ModelId.DICT,
//     VoidData,
//     VoidData,
//     VoidData,
//     VoidData,
//     VoidData,
//     BaseModel,
//     C
// > {
//     public consumer = new ModelConsumer({});

//     constructor(config: PureDictConfig<C>) {
//         super({
//             ...config,
//             modelId: ModelId.DICT,
//             rule: {},
//             info: {},
//             stat: {},
//             provider: {},
//             consumer: {},
//             children: config.children
//         });
//         this.consumer = new ModelConsumer({}, {});
//     }
// }