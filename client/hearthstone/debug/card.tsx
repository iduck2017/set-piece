import React, { useContext } from "react";
import { ModelComp } from ".";
import { useModel } from "./use-model";
import { Link, State } from "./common";
import { CardModel } from "../models/card";
import { MinionModel } from "../models/minion";
import { GameContext } from "./use-context";
import { CombativeComp } from "./combative";

export function CardForm(props: {
    model: CardModel
}) {
    const model = useModel(props.model);
    const { 
        setTargetCollectorInfo,
        handleTargetCollect,
        isTargetCollectable,
        targetCollector
    } = useContext(GameContext);
    const enableSelect = isTargetCollectable(props.model);

    return <>
        {!targetCollector && 
            <Link 
                model={props.model} 
                action='willPlay' 
                then={(result) => {
                    if (!result) return;
                    setTargetCollectorInfo(result);
                }}
            />
        } 
        {enableSelect && 
            <div 
                className="link mark"
                onClick={() => handleTargetCollect(props.model)}    
            >
                select
            </div>
        }
        {!targetCollector && <Link model={props.model} action='pick' />}
        <State model={model.childDict.castable} />
    </>;
}

export function MinionComp(props: {
    model: MinionModel
}) {
    const model = useModel(props.model);
    
    return <ModelComp 
        model={props.model} 
        form={
            <>
                <Link model={props.model} action='recruit' />
                <CardForm model={props.model} />
            </>
        }
        menu={
            <>
                <CombativeComp model={model.childDict.combative} />
            </>
        }
    />;
}

export function CardComp(props: {
    model: CardModel
}) {
    if (props.model instanceof MinionModel) {
        return <MinionComp model={props.model} />;
    }

    return <ModelComp 
        model={props.model} 
        form={
            <>
                <CardForm model={props.model} />
            </>
        }    
    />;
}

