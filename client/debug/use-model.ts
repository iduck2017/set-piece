import { Model } from "@/model";
import { ChildOf, StateOf } from "@/type/model";
import { useEffect, useState } from "react";

export function useModel<N extends Model>(model: N): [
    StateOf<N>, 
    ChildOf<N>
] {
    const [ state, setState ] = useState<StateOf<N>>({ ...model.state });
    const [ child, setChild ] = useState<ChildOf<N>>({ ...model.child });

    useEffect(() => {
        return model.useState(target => {
            console.log(target);
            setState({ ...target.state });
        });
    }, [ model ]);
    
    useEffect(() => {
        return model.useChild(target => {
            setChild({ ...target.child });
        });
    }, [ model ]);

    return [ state, child ];
}