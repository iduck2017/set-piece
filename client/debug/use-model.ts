import { useEffect, useState } from "react";
import type { ModelCompProps } from ".";

export function useModel(props: ModelCompProps) {
    const { target } = props;

    const [ state, setState ] = useState(target.currentState);
    const [ children, setChildren ] = useState(target.children);
    
    useEffect(() => {
        target.stateSetterList.push(setState);
        target.childrenSetterList.push(setChildren);
        return () => {
            target.stateSetterList.splice(
                target.stateSetterList.indexOf(setState), 1
            );
            target.childrenSetterList.splice(
                target.childrenSetterList.indexOf(setChildren), 1
            );
        };
    }, [ target ]);

    return {
        state,
        children
    };
}