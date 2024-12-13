import React, { ReactNode } from "react";
import './index.css';
import { Link, State } from "./common";
import { Model } from "@/type/model";

export function ModelComp(props: {
    model: Model,
    menu?: ReactNode | ReactNode[],
    form?: ReactNode | ReactNode[]
}) {
    const { model, form, menu } = props;

    return <div className="tree">
        <div className="form">
            <div className="title">{model.constructor.name}</div>
            <div>code: {model.code}</div>
            <div>uuid: {model.uuid}</div>
            <Link model={model} action="debug" />
            {form}
            <State model={model} />
        </div>
        <div className="menu">{menu}</div>
    </div>;
}