import { CustomDef, FactoryService, Model, NodeModel, Props, ValidatorService } from "@/set-piece";
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

@FactoryService.useProduct('board')
export class BoardModel extends NodeModel<BoardDef> {

    constructor(props: Props<BoardDef>) {
        const game = props.parent.parent;
        super({
            childList: [],
            ...props,
            childDict: {},
            stateDict: {},
            paramDict: {},
            eventInfo: {
                onMinionSummon: [ game.eventEmitterDict.onMinionSummon ],
                onMinionDispose: [ game.eventEmitterDict.onMinionDispose ]
            }
        });
    }
    
    summonMinion<T extends MinionModel>(chunk: Model.Chunk<T>) {
        const target = this.appendChild(chunk);
        if (!target) return;
        this.eventDict.onMinionSummon(target);
        return target;
    }


    @ValidatorService.useCondition(model => Boolean(model.childList.length))
    disposeMinion(target?: MinionModel) {
        target = target ?? this.childList[0];
        const chunk = this.removeChild(target);
        const player = this.parent;
        const graveyard = player.childDict.graveyard;
        if (!chunk) return;
        graveyard.accessCard(chunk);
        this.eventDict.onMinionDispose(target);
        return chunk;
    }

}