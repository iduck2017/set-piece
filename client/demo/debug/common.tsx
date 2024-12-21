import React from "react";
import './index.css';
import { ValidatorService } from "@/set-piece/services/validator";
import { useModel } from "./use-model";
import { Model } from "@/set-piece/types/model";
import { Base, Dict } from "@/set-piece/types/base";

export function State(props: {
    model: Model
}) {
    const { model } = props;
    const { stateDict } = useModel(model);

    return Object
        .entries(stateDict)
        .map(([ key, value ], index) => {
            if (typeof value === 'object') {
                return null;
            }
            return <div key={index}>{key}: {String(value)}</div>;
        });
}


export function Link<
    M extends Model,
    K extends Dict.Key<M>,
>(props: {
    model: M,
    action: K,
    args?: M[K] extends Base.Func ? Parameters<M[K]> : never,
    then?: M[K] extends Base.Func ? (result: ReturnType<M[K]>) => void : never
}) {
    const { model, action, args = [], then } = props;
    
    const visible = ValidatorService.preCheck(model, action, ...args);
    if (!visible) return null;

    const emit = () => {
        const method: any = model[action];
        if (typeof method === "function") {
            const result = method.apply(model, args);
            if (then) then(result);
        }
    };

    return <div className="link" onClick={emit}>{action}</div>;
}