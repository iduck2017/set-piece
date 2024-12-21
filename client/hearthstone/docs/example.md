
# Generate Hearthstone Card

### You can refer to the following code to implement similar functionality


```typescript
/**
* filePath: ../client/hearthstone-extension-classic/minions/wisp.ts
*/

import { CustomDef, Def, FactoryService, Props } from "@/set-piece";
import { MinionDef, MinionModel } from "@/hearthstone/models/minion";
import { ClassNameType, RarityType } from "@/hearthstone/services/database";
import { ExpansionType } from "@/hearthstone/services/database";

export type WispDef = MinionDef<{
    code: 'wisp-minion-card',
}>

@MinionModel.useRule({
    combative: {
        health: 1,
        attack: 1,
        races: []
    },
    castable: {
        manaCost: 0
    },
    card: {
        expansion: ExpansionType.Classic,
        rarity: RarityType.Common,
        className: ClassNameType.Neutral
    }
})
@FactoryService.useProduct('wisp-minion-card') 
export class WispModel extends MinionModel<WispDef> {
    constructor(props: Props<WispDef>) {
        const superProps = MinionModel.minionProps(props);
        super({
            ...superProps,
            paramDict: {
                name: 'Wisp',
                desc: '',
                flavor: 'If you hit an Eredar Lord with enough Wisps, it will explode. But why?'
            },
            stateDict: {}
        });
    }
}
```

```typescript
/**
* filePath: ../client/hearthstone-extension-classic/battlecry/abusive-sergeant.ts
*/

import { CustomDef, Def, FactoryService, LifecycleService, Props } from "@/set-piece";
import { BattlecryModel } from "@/hearthstone/models/battlecry";
import { FeatureDef } from "@/hearthstone/models/feature";
import { TargetCollector } from "@/hearthstone/types/collector";
import { CardModel } from "@/hearthstone/models/card";
import { AbusiveSergeantBuffModel } from "../buffs/abusive-sergeant";

export type BattlecryAbusiveSergeantDef = FeatureDef<{
    code: 'abusive-sergeant-battlecry-feature',
}>

@FactoryService.useProduct('abusive-sergeant-battlecry-feature')
export class AbusiveSergeantBattlecryModel extends BattlecryModel<BattlecryAbusiveSergeantDef> {
    constructor(props: Props<BattlecryAbusiveSergeantDef>) {
        super({
            ...props,
            paramDict: {
                name: 'Abusive Sergeant\'s Battlecry',
                desc: 'Give a minion +2 Attack this turn.'
            },
            stateDict: {},
            childDict: {}
        });
    }

    protected handleBattlecry(
        target: CardModel,
        targetCollectorList: TargetCollector[]
    ): void {
        const targetCollector:
            TargetCollector<CardModel> | undefined = 
            targetCollectorList.find(
                item => item.uuid === this.uuid
            );
        const result = targetCollector?.result;
        if (!result) return;
        result.childDict.featureList.accessFeature<
            AbusiveSergeantBuffModel
        >('abusive-sergeant-buff-feature');
    }

    protected handleCollectorCheck(
        targetCollectorList: TargetCollector[]
    ) {
        const game = this.referDict.game;
        if (!game) return;
        const candidateList = game.queryMinionAndPlayerList({
            excludePlayer: true,
            excludeTarget: this.referDict.card
        });
        if (!candidateList.length) return;
        targetCollectorList.push({
            uuid: this.uuid,
            hint: 'Choose a minion.',
            candidateList,
        });
    }
}
```

```typescript
/**
* filePath: ../client/hearthstone-extension-classic/buffs/abusive-sergeant.ts
*/

import { FactoryService } from "@/set-piece/services/factory";
import { Props } from "@/set-piece/types/props";
import { CustomDef, Def } from "@/set-piece";
import { BuffDef } from "@/hearthstone/models/buff";
import { BuffModel } from "@/hearthstone/models/buff";

export type BuffAbusiveSergeantDef = BuffDef<{
    code: 'abusive-sergeant-buff-feature',
}>

@FactoryService.useProduct('abusive-sergeant-buff-feature')
export class AbusiveSergeantBuffModel extends BuffModel<BuffAbusiveSergeantDef> {
    constructor(props: Props<BuffAbusiveSergeantDef>) {
        const superProps = BuffModel.buffProps(props);
        super({
            ...superProps,
            paramDict: {
                name: 'Abusive Sergeant\'s Buff',
                desc: 'Give a minion +2 Attack this turn.',
                modAttack: 2,
                isDisposedOnTurnEnd: true
            },
            stateDict: {},
            childDict: {}
        });
    }
}


```

```typescript
/**
* filePath: ../client/hearthstone-extension-classic/spells/blessing-of-kings.ts
*/

import { CustomDef, Props } from "@/set-piece";
import { FactoryService } from "@/set-piece/services/factory";
import { SpellDef } from "@/hearthstone/models/spell";
import { SpellModel } from "@/hearthstone/models/spell";
import { TargetCollector } from "@/hearthstone/types/collector";
import { MinionModel } from "@/hearthstone/models/minion";
import { BlessingOfKingsBuffModel } from "../buffs/blessing-of-kings";
import { ClassNameType, ExpansionType, RarityType } from "@/hearthstone/services/database";

export type SpellBlessingOfKingsDef = SpellDef<{
    code: 'blessing-of-kings-spell-card',
}>

@SpellModel.useRule({
    castable: {
        manaCost: 4
    },
    card: {
        expansion: ExpansionType.Classic,
        rarity: RarityType.Common,
        className: ClassNameType.Paladin
    }
})
@FactoryService.useProduct('blessing-of-kings-spell-card')
export class BlessingOfKingsModel extends SpellModel<SpellBlessingOfKingsDef> {
    constructor(props: Props<SpellBlessingOfKingsDef>) {
        const superProps = SpellModel.spellProps(props);
        super({
            ...superProps,
            paramDict: {
                name: 'Blessing of Kings',
                desc: 'Give a minion +4/+4.',
                flavor: 'Given the number of kings who have been assassinated, are you sure you want their blessing?'
            },
            stateDict: {}
        });
    }

    cast(targetCollectorList: TargetCollector[]) {
        const target: MinionModel | undefined = targetCollectorList[0]?.result;
        if (!target) return;
        target.childDict.featureList.accessFeature<
            BlessingOfKingsBuffModel
        >('blessing-of-kings-buff-feature');
    }

    handleCollectorCheck(targetCollectorList: TargetCollector[]) {
        const game = this.referDict.game;
        if (!game) return;
        const candidateList = game.queryMinionAndPlayerList({
            excludePlayer: true,
        });
        if (!candidateList.length) return;
        targetCollectorList.push({
            uuid: this.uuid,
            hint: 'Choose a minion.',
            candidateList,
        });
    }
}
```

       