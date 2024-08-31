import { useEffect, useRef, useState } from "react";
import type { ModelCompProps } from ".";
import { DebugRenderer } from "../renderers/debug";

export function useModel(props: ModelCompProps) {
    const { target, app } = props;

    const [ state, setState ] = useState(target.currentState);
    const [ children, setChildren ] = useState(target.children);
    const render = useRef<DebugRenderer>();
    
    useEffect(() => {
        render.current = new DebugRenderer(
            setState,
            setChildren,
            app
        );
        render.current.active(target);
        return () => {
            render.current?.destroy();
        };
    }, [ target ]);

    return {
        state,
        children
    };
}