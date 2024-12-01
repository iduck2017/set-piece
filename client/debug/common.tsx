import React from "react";
import { Model } from "@/model";
import './index.css';
import { KeyOf, Func } from "@/type/base";
import { Validator } from "@/service/validator";

export function Link<
    M extends Model,
    K extends KeyOf<M>
>(props: {
    model: M,
    name: K,
}) {
    const { model, name } = props;
    
    const visible = Validator.preCheck(model, name);
    if (!visible) return null;

    const emit = () => {
        const method: any = model[name];
        if (typeof method === "function") {
            method.apply(model);
        }
    };

    return <div className="link" onClick={emit}>{name}</div>;
}