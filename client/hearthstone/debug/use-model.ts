import { Model } from "@/set-piece/types/model";
import { useEffect, useState } from "react";

export function useModel<N extends Model>(model?: N): {
    stateDict: Model.StateDict<N>, 
    childDict: Model.ChildDict<N>,
    childList: Model.ChildList<N>,
    refresh: () => void
} {
    const [ stateDict, setStateDict ] = useState<Model.StateDict<N>>({ ...model?.stateDict });
    const [ childDict, setChildDict ] = useState<Model.ChildDict<N>>({ ...model?.childDict });
    const [ childList, setChildList ] = useState<Model.ChildList<N>>([ ...model?.childList || [] ]);

    useEffect(() => {
        if (model) {
            refresh();
            const unuseState = model.useState((target) => setStateDict({ ...target.stateDict }));
            const unuseChild = model.useChild((target) => {
                setChildDict({ ...target.childDict });
                setChildList([ ...target.childList ]);
            });
            return () => {
                unuseState();
                unuseChild();
            };
        }
    }, [ model ]);

    const refresh = () => {
        setStateDict({ ...model?.stateDict });
        setChildDict({ ...model?.childDict });
        setChildList([ ...model?.childList || [] ]);
    };

    return {
        stateDict,
        childDict,
        childList,
        refresh
    };
}