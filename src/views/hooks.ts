import React, { useEffect, useState } from "react";
import { Model } from "../model";

export function useModel<M extends Model>(model?: M): {
    state?: M['state'], 
    child?: M['child'],
    refresh: () => void
} {
    const [ state, setState ] = useState<M['state'] | undefined>(model?.state);
    const [ child, setChild ] = useState<M['child'] | undefined>(model?.child);

    useEffect(() => {
        refresh();
        return model?.addObserver((event) => {
            setState(event.target.state);
            setChild(event.target.child);
        })
    }, [ model ]);

    const refresh = () => {
        setState(model?.state);
        setChild(model?.child);
    };

    return { state, child: child, refresh };
}