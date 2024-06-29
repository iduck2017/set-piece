import { ModelId } from "../types/registry";
import { RootChunk } from "../types/root";
import { modelRefer } from "./refer";

export const rootChunk: RootChunk = {
    modelId: ModelId.ROOT,
    referId: '',
    rule: {
        name: '',
        difficulty: 0
    },
    state: {
        progress: 0
    },
    emitters: modelRefer(),
    handlers: modelRefer(),
    children: {},
    version: ''
};