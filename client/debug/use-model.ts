import { Model, NodeModel } from "@/model/node";
import { useEffect, useState } from "react";

export function useModel<N extends NodeModel>(model: N): [
    Model.State<N>, 
    Model.Child<N>
] {
    const [ state, setState ] = useState<Model.State<N>>({ ...model.state });
    const [ child, setChild ] = useState<Model.Child<N>>(() => {
        if (model.child instanceof Array) {
            return [ ...model.child ];
        } else {
            return { ...model.child };
        }
    });

    useEffect(() => {
        return model.useState((target) => {
            setState({ ...target.state });
        });
    }, [ model ]);
    
    useEffect(() => {
        return model.useChild((target) => {
            if (target.child instanceof Array) {
                setChild([ ...target.child ]);
            } else {
                setChild({ ...target.child });
            }
        });
    }, [ model ]);

    return [ state, child ];
}