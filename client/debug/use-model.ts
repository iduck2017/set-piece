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
        return model.useState(detail => {
            setState({ ...detail.next });
        });
    }, [ model ]);
    
    useEffect(() => {
        return model.useChild(detail => {
            console.log(detail.next, detail.next instanceof Array);
            setChild(
                detail.next instanceof Array?
                    [ ...detail.next ] : 
                    { ...detail.next }
            );
        });
    }, [ model ]);

    return [ state, child ];
}