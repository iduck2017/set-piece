import { useEffect, useRef, useState } from "react";
import type { ModelDebuggerProps } from ".";
import { DebugRenderer } from "../renderers/debug";

export function useModel(props: ModelDebuggerProps) {
    const { target, app } = props;

    const [ state, setState ] = useState(target.currentState);
    const [ children, setChildren ] = useState(target.currentChildren);
    const render = useRef<DebugRenderer>();
    
    useEffect(() => {
        render.current = new DebugRenderer(
            setState,
            setChildren,
            app
        );
        render.current.active(target);
        return render.current.destroy.bind(render);
    }, [ target ]);

    return {
        state,
        children
    };
}