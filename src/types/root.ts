import type { App } from "../app";
import { ModelID } from ".";
import { DictChunk, IDictTemplate } from "./dict";

type RootTemplate = IDictTemplate<
    {
        id: ModelID.ROOT,
        rule: {
            name: string,
            difficulty: number,
        },
        state: {
            progress: number,
        },
        extra: {
            time: number,
        },
        parent: App
    }
>

type RootChunk = DictChunk<RootTemplate> & {
    version: string;
}

export {
    RootTemplate,
    RootChunk
};