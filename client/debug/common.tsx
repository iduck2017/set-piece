import React from "react";
import { Model } from "@/model";
import './index.css';
import { KeyOf } from "@/type/base";
import { Validator } from "@/service/validator";

export function Link<M extends Model>(props: {
    model: M,
    name: KeyOf<M>
}) {
    const { model, name } = props;
    
    const visible = Validator.preCheck(model, name);
    if (!visible) return null;

    const emit = () => {
        const method: any = model[name];
        if (typeof method === "function" && method.length === 0) {
            method.apply(model);
        }
    };

    return <div className="link" onClick={emit}>{name}</div>;
}