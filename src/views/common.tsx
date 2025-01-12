import React from "react";
import { ValidateService } from "../services/validate";
import { KeyOf } from "../types";
import { Model } from "../model";
import { useModel } from "./hooks";
import { View } from ".";
import './index.scss';

export function Link<
    M extends Record<string, any>,
    K extends KeyOf<M>,
    F extends M[K] & ((...args: any[]) => any)
>(props: {
    model?: M,
    action: K,
    args?: Parameters<F>,
    then?: (result: ReturnType<F>) => void,
}) {
    const { model, action, args, then } = props;
    if (!model) return null;

    const visible = ValidateService.precheck(model, action, ...args || []);
    if (!visible) return null;

    const emit = () => {
        const method = model[action];
        if (typeof method !== 'function') return;
        const result = method.apply(model, args || []);
        if (then) then(result);
    }

    return <div className="link" onClick={emit}>{action}</div>;
}

export function State<M extends Model>(props: {
    model?: M
    ignore?: Partial<Record<KeyOf<M['state']>, boolean>>
}) {
    const { model } = props;
    const { state } = useModel(model);
    if (!props.model || !state) return null;

    return Object.keys(state).map((key) => {
        const value = Reflect.get(state, key);
        if (typeof value === 'object') return null;
        return (
            <div key={key}>
                {key}: {String(value)}
            </div>
        );
    });
}

export function Child<M extends Model>(props: {
    model?: M,
    ignore?: Partial<Record<KeyOf<M['child']>, boolean>>
}) {
    const { model } = props;
    const { child } = useModel(model);
    if (!props.model || !child) return null;

    return Object.keys(child)
        .filter((key) => !props.ignore?.[key])
        .map((key) => (
            <View 
                model={child[key]} 
                key={child[key].uuid} 
                isFold 
            />
        ));

}