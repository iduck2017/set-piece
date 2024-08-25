import { useEffect, useRef, useState } from "react";
import type { ModelDebuggerProps } from ".";
import { DebugRenderer } from "../renderers/debug";

export function useModel(props: ModelDebuggerProps) {
    const { target, app } = props;

    const [ state, setState ] = useState(target.state);
    const [ children, setChildren ] = useState(target.children);
    const render = useRef(new DebugRenderer(
        setState,
        setChildren,
        app
    ));
    
    useEffect(() => {
        render.current.active(target);
        return render.current.deactive.bind(render);
    }, []);

    return {
        state,
        children
    };
}