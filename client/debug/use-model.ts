import { Model } from "@/model";
import { ChildOf, StateOf } from "@/type/model";
import { useEffect, useState } from "react";

export function useModel<N extends Model>(model: N): [
    StateOf<N>, 
    ChildOf<N>
] {
    const [ state, setState ] = useState<StateOf<N>>({ ...model.state });
    const [ child, setChild ] = useState<ChildOf<N>>(() => {
        if (model.child instanceof Array) {
            return [ ...model.child ];
        } else {
            return { ...model.child };
        }
    });

    useEffect(() => {
        return model.useState((target, data) => {
            setState({ ...data.next });
        });
    }, [ model ]);
    
    useEffect(() => {
        return model.useChild((target) => {
            setChild(target.flatChild);
        });
    }, [ model ]);

    return [ state, child ];
}