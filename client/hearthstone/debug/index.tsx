import React, { ReactNode, useState } from "react";
import './index.css';
import { Link, State } from "./common";
import { Model } from "@/set-piece";

export function ModelComp(props: {
    model: Model,
    menu?: ReactNode | ReactNode[],
    form?: ReactNode | ReactNode[],
    options?: {
        isFold?: boolean,
        isList?: boolean
    }
}) {
    const { model, form, menu, options } = props;

    const [ isFold, setIsFold ] = useState(options?.isFold);

    return <div className={`tree ${options?.isList ? 'list' : ''}`}>
        <div className="form">
            <div 
                className="title" 
                onClick={() => setIsFold(!isFold)}
            >
                {model.constructor.name}
            </div>
            <div>code: {model.code}</div>
            <div>uuid: {model.uuid}</div>
            <Link model={model} action="debug" />
            {!isFold && form}
            {!isFold && <State model={model} />}
        </div>
        {!isFold && <div className="menu">{menu}</div>}
    </div>;
}