import { ModelRefer } from "../types/common";

function modelRefer(): Record<keyof ModelRefer, string[]> {
    return {
        updateDone: [],
        checkBefore: []
    };
}

export {
    modelRefer
};