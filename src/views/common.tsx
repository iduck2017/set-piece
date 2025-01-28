import React from "react";
import { Model } from "../model";
import { useModel } from "./hooks";
import { View } from ".";
import './index.scss';

export function Link<
    M extends Model,
    F extends (...args: any[]) => any
>(props: {
    model?: M,
    method?: F,
    args: Parameters<F>,
    thener?: (result: ReturnType<F>) => void,
}) {
    const { model, method, args, thener } = props;
    if (!model) return null;
    if (!method) return null;

    const result = Model.precheck(model, method, ...args);
    if (!result) return null;

    const emit = () => {
        const result = method.apply(model, args || []);
        if (thener) thener(result);
    }

    return (
        <div className="link" onClick={emit}>
            {method.name || 'function'}
        </div>
    )
}

export function State<M extends Model>(props: {
    model?: M
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
}) {
    const { model } = props;
    const { child } = useModel(model);
    if (!props.model || !child) return null;

    return Object.keys(child)
        .map((key) => (
            <View 
                model={Reflect.get(child, key)} 
                key={Reflect.get(child, key).uuid} 
                isFold 
            />
        ));

}