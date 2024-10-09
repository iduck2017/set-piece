/* eslint-disable max-len */
import React, { ReactNode, useEffect, useState } from "react";
import type { App } from "../app";
import type { Model } from "../models";
import "./index.css";
import { ModelType } from "../type/model";
import { Event as IEvent, EventDict, ModifyEventDict, UpdateEventDict } from "../utils/event";
import { ModelDef } from "../type/model-def";
import { ReactDict, React as IReact } from "../utils/react";
import { Base } from "../type";


export type ModelProps<M extends ModelDef> = {
    model: Model<M>,
    app: App
}

export type ModelState<M extends ModelDef> = {
    childList: ModelType.ChildList<M>,
    childDict: ModelType.ChildDict<M>,
    eventDict: EventDict<M>,
    updateEventDict: UpdateEventDict<M>,
    modifyEventDict: ModifyEventDict<M>,
    reactDict: ReactDict<M>,
    info: ModelDef.Info<M>
}

export type VisibleInfo = {
    model: boolean;
    api: boolean;
    info: boolean;
    child: boolean;
    event: boolean;
    react: boolean;
}

const FolderComp = (props: {
    title: keyof VisibleInfo;
    length: number;
    visibleDict: VisibleInfo,
    setVisibleDict: React.Dispatch<React.SetStateAction<VisibleInfo>>
    children?: ReactNode[];
}) => {
    const {
        title,
        length,
        visibleDict: visible,
        children,
        setVisibleDict: setVisible
    } = props;

    if (!length) return null;

    return <>
        <div className={`row ${visible[title] ? '' : 'fold'}`}>
            <div className="title key">{title}</div>
            <div className="value">({length})</div>
            <div 
                className="icon" 
                onClick={() => {
                    setVisible(prev => ({
                        ...prev,
                        [title]: !prev[title]
                    }));
                }}
            >
                {visible[title] ? '▴' : '▾'}
            </div>
        </div>
        {visible[title] && children}
    </>;
};

export function ModelComp<
    M extends ModelDef
>(props: ModelProps<M>) {
    const { model, app } = props;
    const [ state, setState ] = useState<ModelState<M>>(model._getState);
    const [ visible, setVisible ] = useState<VisibleInfo>({
        model: true,
        api: true,
        info: true,
        child: true,
        event: true,
        react: true
    });
    
    const formatValue = (value: Base.Value) => {
        if (typeof value === 'string') return `"${value}"`;
        return `(${value})`;
    };


    const [ activedChild, setActivedChild ] = useState<Model>();
    const [ activedEvent, setActivedEvent ] = useState<IEvent>();
    const [ activedReact, setActivedReact ] = useState<IReact>();

    useEffect(() => {
        if (!activedChild) return;
        const elem = document.getElementById(activedChild.id);
        if (elem) {
            elem.classList.add('actived');
            return () => elem.classList.remove('actived');
        }
    }, [ activedChild ]);

    useEffect(() => {
        if (!activedEvent) return;
        for (const reactId of activedEvent.reactIdList) {
            const elem = document.getElementById(reactId);
            if (elem) {
                elem.classList.add('actived');
            }
        }
        return () => {
            for (const reactId of activedEvent.reactIdList) {
                const elem = document.getElementById(reactId);
                if (elem) {
                    elem.classList.remove('actived');
                }
            }
        };
    }, [ activedEvent ]);

    useEffect(() => {
        if (!activedReact) return;
        for (const eventId of activedReact.eventIdList) {
            const elem = document.getElementById(eventId);
            if (elem) {
                elem.classList.add('actived');
            }
        }
        return () => {
            for (const eventId of activedReact.eventIdList) {
                const elem = document.getElementById(eventId);
                if (elem) {
                    elem.classList.remove('actived');
                }
            }
        };
    }, [ activedReact ]);

    useEffect(() => {
        setState(model._getState());
        return model._useState(setState);
    }, [ model ]);


    const {
        childDict,
        childList,
        eventDict,
        reactDict,
        info
    } = state;


    return (
        <div className="model">
            <div className="body" id={model.id}>
                <div 
                    className={`head ${visible.model ? '' : 'fold'}`}
                    onClick={() => {
                        setVisible(prev => ({
                            ...prev,
                            model: !visible.model
                        }));
                    }}
                >
                    {model.code}
                </div>
                <div className={`row ${visible.model ? '' : 'fold'}`}>
                    <div className="title key">id</div>
                    <div className="value">{formatValue(model.id)}</div>
                </div>
                {visible.model && <>
                    <FolderComp 
                        visibleDict={visible}
                        setVisibleDict={setVisible}
                        title="info"
                        length={Object.keys(info).length}
                    >
                        {Object.keys(info).map(key => (
                            <div className="row" key={key}>
                                <div className="key link">{key}</div>
                                <div className="value">{formatValue(info[key])}</div>
                            </div>
                        ))}
                    </FolderComp>
                    <FolderComp
                        visibleDict={visible}
                        setVisibleDict={setVisible}
                        title="api"
                        length={Object.keys(model.apiDict).length}
                    >
                        {Object.keys(model.apiDict).map(key => (
                            <div className="row" key={key}>
                                <div 
                                    className="key api"
                                    onClick={() => {
                                        model.apiDict[key].call(model);
                                    }}
                                >
                                    {key}
                                </div>
                            </div>
                        ))}
                    </FolderComp>
                    <FolderComp
                        visibleDict={visible}
                        setVisibleDict={setVisible}
                        title="child"
                        length={Object.keys(childDict).length + childList.length}
                    >
                        {childList.map((item, index) => (
                            <div 
                                className='row' 
                                key={index}
                            >
                                <div 
                                    className={`key link ${activedChild === item ? 'hover' : ''}`}
                                    onMouseEnter={() => setActivedChild(item)}
                                    onMouseLeave={() => setActivedChild(undefined)}
                                >
                                [{index}]
                                </div>
                            </div>
                        ))}
                        {Object.keys(childDict).map(key => (
                            <div 
                                className='row'
                                key={key}
                            > 
                                <div 
                                    className={`key link ${activedChild === childDict[key] ? 'hover' : ''}`}
                                    onMouseEnter={() => setActivedChild(childDict[key])}
                                    onMouseLeave={() => setActivedChild(undefined)}
                                >
                                    {key}
                                </div>
                            </div>
                        ))}
                    </FolderComp>
                    <FolderComp
                        visibleDict={visible}
                        setVisibleDict={setVisible}
                        title="event"
                        length={Object.keys(eventDict).length}
                    >
                        {Object.keys(eventDict).map(key => (
                            <div 
                                id={eventDict[key].id}
                                className="row" 
                                key={key}
                            >
                                <div 
                                    className={`key link ${activedEvent === eventDict[key] ? 'hover' : ''}`}
                                    onMouseEnter={() => setActivedEvent(eventDict[key])}
                                    onMouseLeave={() => setActivedEvent(undefined)}
                                >
                                    {key}
                                </div>
                                <div className="value">{formatValue(eventDict[key].id)}</div>
                            </div>
                        ))}
                    </FolderComp>
                    <FolderComp
                        visibleDict={visible}
                        setVisibleDict={setVisible}
                        title="react"
                        length={Object.keys(reactDict).length}
                    >
                        {Object.keys(reactDict).map(key => (
                            <div 
                                id={reactDict[key].id}
                                className="row" 
                                key={key}
                            >
                                <div 
                                    className={`key link ${activedReact === reactDict[key] ? 'hover' : ''}`}
                                    onMouseEnter={() => setActivedReact(reactDict[key])}
                                    onMouseLeave={() => setActivedReact(undefined)}
                                >
                                    {key}
                                </div>
                                <div className="value">{formatValue(reactDict[key].id)}</div>
                            </div>
                        ))}
                    </FolderComp>
                </>}
            </div>
            {visible.model && <div className="children">
                {childList.map(item => (
                    <ModelComp 
                        key={item.id}
                        model={item}
                        app={app}
                    />
                ))}
                {Object.values(childDict).map(item => (
                    <ModelComp 
                        key={item.id}
                        model={item}
                        app={app}
                    />
                ))}
            </div>}
        </div>
    );
}

