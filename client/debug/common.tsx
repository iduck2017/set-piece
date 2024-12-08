import React from "react";
import './index.css';
import { KeyOf } from "@/type/base";
import { Validator } from "@/service/validator";
import { NodeModel } from "@/model/node";

export function Link<
    M extends NodeModel,
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