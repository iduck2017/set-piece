import React from "react";
import './index.css';
import { Validator } from "@/service/validator";
import { useModel } from "./use-model";
import { Model } from "@/type/model";
import { Base, Dict } from "@/type/base";

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
    args?: Base.List
}) {
    const { model, action, args = [] } = props;
    
    const visible = Validator.preCheck(model, action, ...args);
    if (!visible) return null;

    const emit = () => {
        const method: any = model[action];
        if (typeof method === "function") {
            method.apply(model, args);
        }
    };

    return <div className="link" onClick={emit}>{action}</div>;
}