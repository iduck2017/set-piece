import React, { ReactNode } from "react";
import './index.css';
import { Model } from "@/model";

export function ModelComp(props: {
    model: Model,
    children?: ReactNode[] | ReactNode
}) {
    const { model } = props;
    return <div className="form">
        <div className="title">{model.type}</div>
        <div>id: {model.id}</div>
        {props.children}
        <div className="link" onClick={() => model.debug()}>debug</div>
    </div>;
}