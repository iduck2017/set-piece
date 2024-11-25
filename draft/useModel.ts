import { Model } from "@/model";
import { useEffect, useState } from "react";

export function useModel<M extends Model>(model: M): [
    Model.State<M>, 
    Model.Child<M>
] {
    const [ state, setState ] = useState<Model.State<M>>(model.state);
    const [ child, setChild ] = useState<Model.Child<M>>(model.child);
    useEffect(() => {
        return model.useState(form => {
            setState(form.next);
        });
    }, [ model ]);
    useEffect(() => {
        return model.useChild(form => {
            setChild(form.next);
        });
    }, [ model ]);

    return [ state, child ];
}