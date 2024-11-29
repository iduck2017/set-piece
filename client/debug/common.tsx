import React from "react";
import { Model } from "@/model";
import './index.css';
import { KeyOf, Method } from "@/type/base";
import { Validator } from "@/service/validator";

export function Link<
    M extends Model,
    K extends KeyOf<M>
>(props: {
    model: M,
    name: K,
    args?: M[K] extends Method ? Parameters<M[K]> : undefined
}) {
    const { model, name, args = [] } = props;
    
    const visible = Validator.preCheck(model, name, ...args);
    if (!visible) return null;

    const emit = () => {
        const method: any = model[name];
        if (typeof method === "function") {
            method.apply(model, args);
        }
    };

    return <div className="link" onClick={emit}>{name}</div>;
}