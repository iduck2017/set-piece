import React from "react";
import { ModelComp } from ".";
import { useModel } from "./use-model";
import { Link, State } from "./common";
import { useContext } from "./use-context";
import { CardModel } from "../models/card";
import { MinionModel } from "../models/minion";

export function MinionComp(props: {
    model: MinionModel
}) {
    const model = useModel(props.model);
    const combatable = useModel(model.childDict.combatable);
    const { 
        setTargetCollectorInfo,
        handleTargetCollect,
        isTargetCollectable,
        targetCollector
    } = useContext();
    combatable;
    const enableSelect = isTargetCollectable(props.model);

    return <ModelComp 
        model={props.model} 
        form={
            <>
                {!targetCollector && <Link
                    model={model.childDict.combatable}
                    action='willAttack'
                    then={(result) => {
                        if (result) setTargetCollectorInfo(result);
                    }}
                />}
                {!targetCollector && <Link 
                    model={props.model} 
                    action='willPlay' 
                    then={(result) => {
                        if (!result) return;
                        setTargetCollectorInfo(result);
                    }}
                />}
                {!targetCollector && <Link model={props.model} action='pick' />}
                {enableSelect && <div 
                    className="link mark"
                    onClick={() => handleTargetCollect(props.model)}    
                >select</div>}
                <State model={model.childDict.combatable} />
            </>
        }
    />;
}

export function CardComp(props: {
    model: CardModel
}) {
    const model = useModel(props.model);
    const { 
        handleTargetCollect, 
        isTargetCollectable,
        setTargetCollectorInfo,
        targetCollector
    } = useContext();

    const enableSelect = isTargetCollectable(props.model);

    if (props.model instanceof MinionModel) {
        return <MinionComp model={props.model} />;
    }

    return <ModelComp 
        model={props.model} 
        form={
            <>
                {!targetCollector && <Link 
                    model={props.model} 
                    action='willPlay' 
                    then={(result) => {
                        if (!result) return;
                        setTargetCollectorInfo(result);
                    }}
                />}
                {!targetCollector && <Link model={props.model} action='pick' />}
                {enableSelect && <div 
                    className="link mark"
                    onClick={() => handleTargetCollect(props.model)}    
                >select</div>}
                <State model={model.childDict.castable} />
            </>
        }    
    />;
}

