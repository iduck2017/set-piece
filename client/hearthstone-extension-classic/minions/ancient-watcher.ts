import { Props } from "@/set-piece";
import { FactoryService } from "@/set-piece/services/factory";
import { MinionDef, MinionModel } from "@/hearthstone/models/minion";
import { ClassNameType, ExpansionType, RarityType } from "@/hearthstone/services/database";

/**
 * Card: Ancient Watcher
 * Cost: 2
 * Attack: 4
 * Health: 5
 * Text: Can't attack.
 * Flavor: Why do its eyes seem to follow you as you walk by?
 */

export type AncientWatcherDef = MinionDef<{
    code: 'ancient-watcher-minion-card',
    childDict: {
        feature: AncientWatcherModel;
    }
}>

@MinionModel.useRule({
    combative: {
        health: 5,
        attack: 4,
        races: [],
    },
    castable: {
        manaCost: 2
    },
    card: {
        expansion: ExpansionType.Classic,
        rarity: RarityType.Rare,
        className: ClassNameType.Neutral
    }
})
@FactoryService.useProduct('ancient-watcher-minion-card')
export class AncientWatcherModel extends MinionModel<AncientWatcherDef> {
    constructor(props: Props<AncientWatcherDef>) {
        const superProps = MinionModel.minionProps(props);
        super({
            ...superProps,
            paramDict: {
                name: 'Ancient Watcher',
                desc: 'Can\'t attack.',
                flavor: 'Why do its eyes seem to follow you as you walk by?'
            },
            stateDict: {},
            childDict: {
                feature: { code: 'ancient-watcher-minion-card' },
                ...superProps.childDict
            }
        });
    }
} 