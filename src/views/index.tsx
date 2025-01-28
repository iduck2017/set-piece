import React, { useState, ReactNode } from "react";
import { Model } from "../model";
import { Child, Link } from "./common";
import { State } from "./common";
import './index.scss';

export function View<M extends Model>(props: {
    model?: M,
    child?: ReactNode | ReactNode[],
    state?: ReactNode | ReactNode[],
    isFold?: boolean
}) {
    const { model, state, child } = props;
    const [ isFold, setIsFold ] = useState(props.isFold);
    
    if (!model) return null;

    let name = model.constructor.name;

    return <div className="model">
        <div className={`state ${isFold ? 'fold' : ''}`}>
            <div className="title" onClick={() => setIsFold(!isFold)}>
                {name}
            </div>
            <div>uuid: {model.uuid}</div>
            <Link model={model} method={model.debug} args={[]} />
            {!isFold && (state ?? <State model={model} />)}
        </div>
        {!isFold && <div className="child">
            {child ?? <Child model={model} />}
        </div>}
    </div>;
}