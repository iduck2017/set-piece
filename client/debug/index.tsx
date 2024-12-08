import React, { ReactNode } from "react";
import './index.css';
import { useModel } from "./use-model";
import { Link } from "./common";
import { NodeModel } from "@/model/node";

export function StateForm(props: {
    model: NodeModel
}) {
    const { model } = props;
    const [ state ] = useModel(model);

    return Object
        .entries(state)
        .map(([ key, value ], index) => (
            <div key={index}>{key}: {value}</div>
        ));
}

export function ModelComp(props: {
    model: NodeModel,
    menu?: ReactNode | ReactNode[],
    form?: ReactNode | ReactNode[]
}) {
    const { model, form, menu } = props;
    const [ state ] = useModel(model);

    return <div className="tree">
        <div className="form">
            <div className="title">{model.constructor.name}</div>
            <div>code: {model.code}</div>
            <div>uuid: {model.uuid}</div>
            <Link model={model} action="debug" />
            {form}
            {Object
                .entries(state)
                .map(([ key, value ], index) => (
                    <div key={index}>{key}: {value}</div>
                ))}
        </div>
        <div className="menu">
            {menu}
        </div>
    </div>;
}