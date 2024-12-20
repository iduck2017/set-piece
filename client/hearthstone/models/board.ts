import { CustomDef, Factory, Model, NodeModel, Props, Validator } from "@/set-piece";
import { PlayerModel } from "./player";
import { MinionModel } from "./minion";

type BoardDef = CustomDef<{
    code: 'board',
    stateDict: {},
    paramDict: {},
    childList: MinionModel[],
    eventDict: {
        onMinionSummon: [MinionModel];
        onMinionRemove: [MinionModel];
        onMinionDispose: [MinionModel];
    },
    parent: PlayerModel
}>

@Factory.useProduct('board')
export class BoardModel extends NodeModel<BoardDef> {
    constructor(props: Props<BoardDef>) {
        super({
            childList: [],
            ...props,
            childDict: {},
            stateDict: {},
            paramDict: {}
        });
    }
    
    summonMinion<T extends MinionModel>(chunk: Model.Chunk<T>) {
        const target = this.appendChild(chunk);
        if (!target) return;
        this.eventDict.onMinionSummon(target);
        return target;
    }

    @Validator.useCondition(model => Boolean(model.childList.length))
    removeMinion(target?: MinionModel) {
        target = target ?? this.childList[0];
        const chunk = this.removeChild(target);
        if (!chunk) return;
        this.eventDict.onMinionRemove(target);
        return chunk;
    }

    @Validator.useCondition(model => Boolean(model.childList.length))
    disposeMinion(target: MinionModel) {
        target = target ?? this.childList[0];
        const chunk = this.removeMinion(target);
        const player = this.parent;
        const graveyard = player.childDict.graveyard;
        if (!chunk) return;
        graveyard.accessCard(chunk);
        this.eventDict.onMinionDispose(target);
        return chunk;
    }

    
}