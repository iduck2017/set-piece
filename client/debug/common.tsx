import React from "react";
import { Model } from "@/model.bk";
import './index.css';
import { KeyOf, Func } from "@/type/base";
import { Validator } from "@/service/validator";

export function Link<
    M extends Model,
    K extends KeyOf<M>
>(props: {
    model: M,
    action: K,
}) {
    const { model, action } = props;
    
    const visible = Validator.preCheck(model, action);
    if (!visible) return null;

    const emit = () => {
        const method: any = model[action];
        if (typeof method === "function") {
            method.apply(model);
        }
    };

    return <div className="link" onClick={emit}>{action}</div>;
}