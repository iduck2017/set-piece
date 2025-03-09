import { BaseHumanModel } from "./human"
import { Model } from "./model"
import { BaseOuterPartyModel, OuterPartyModel } from "./outer-party"
import { PetModel } from "./pet"


export class BaseModelThinkPolModel extends OuterPartyModel<{
    code: 'tinkpol'
    state: { alias: string }
    child: { dog?: PetModel }
    refer: { coworker: BaseModelThinkPolModel }
    event: { onWatch: BaseOuterPartyModel }
    parent: BaseOuterPartyModel,
    stateInner: {}
}> {
    constructor(props: Model.Props<BaseModelThinkPolModel>) {
        const superProps = OuterPartyModel.superProps(props);
        super({
            ...props,
            child: {
                ...superProps.child,
                daughter: { code: 'human' },
                ...props.child,
            },
            state: {
                name: 'Bob',
                alias: 'Bob',
                salary: 1000,
                ...superProps.state,
            },
        });
    }

    test() {
        this.state.age;
        this.state.alias;
        this.parent.child.daughter;
        this.eventEmitters.onWatch(this.child.daughter);
        this.eventEmitters.onWatch(this.parent)
    }

    
    @Model.useEvent((model) => model.event.onBorn)
    onBorn(target: BaseHumanModel, event: void) {
        console.log(target, event)
    }

    @Model.useEvent((model) => model.agent.event.onHello)
    onChildBorn(target: BaseHumanModel, to: BaseHumanModel) {
        console.log(target, to)
    }
}