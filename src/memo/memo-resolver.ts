import { depManager } from "../dep/dep-manager";
import { Field } from "../utils/field-registry";
import { memoDelegator } from "./memo-delegator";
import { memoManager } from "./memo-manager";

class MemoResolver {
    public resolve(dep: Field) {
        const deps = [dep];

        // Get memoFields
        const memoFields: Field[] = [];
        for (const dep of deps) {
            const subMemoFields = memoManager.query(dep);
            subMemoFields.forEach(memoField => {
                if (memoFields.includes(memoField)) return;
                memoFields.push(memoField);
                if (deps.includes(memoField)) return;
                deps.push(memoField);
            })
        }

        // Clear relations
        memoFields.forEach(memoField => {
            const deps = depManager.query(memoField)
            memoManager.unbind(memoField);
            deps.forEach((dep: Field) => {
                depManager.unbind(dep, memoField);
            })
        })

        // Clear memo storage
        memoFields.forEach(memoField => {
            memoDelegator.clear(memoField);
        })
        // Reset memo values
        memoFields.forEach(memoField => {
            const [model, key] = memoField;
            const memo = Reflect.get(model, key);
            memoDelegator.update(memoField, memo);
        })
    }
}

export const memoResolver = new MemoResolver()