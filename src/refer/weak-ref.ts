import { Model } from "../model";
import { runTrx } from "../transaction/use-trx";
import { weakRefContext, WeakRefMap } from "./use-weak-ref";

export const weakRefChecklist: Model[] = [];

export function addWeakRef(target: Model) {
    runTrx(() => {
        // console.log('Add weak ref', target);
        weakRefChecklist.push(target);
    });
}

export function checkWeakRefs() {
    // console.log('Check weak refs', weakRefChecklist);
    weakRefChecklist.forEach(target => {
        const refsMap: WeakRefMap = weakRefContext.get(target) ?? new Map();
        refsMap.forEach((refs, key) => {
            refs.forEach(ref => {
                if (ref.root === target.root) return
                Reflect.set(ref, key, undefined);
            });
        })
    })
    weakRefChecklist.length = 0;
}