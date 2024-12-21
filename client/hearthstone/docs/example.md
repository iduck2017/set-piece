
# Generate Hearthstone Card

### You can refer to the following code to implement similar functionality


```typescript
/**
* filePath: ../client/hearthstone-extension-classic/minions/wisp.ts
*/

import { CustomDef, Def, FactoryService, Props } from "@/set-piece";
import { MinionDef, MinionModel } from "@/hearthstone/models/minion";

export type WispDef = MinionDef<
    CustomDef<{
        code: 'wisp-minion-card',
    }>
>

@MinionModel.useRule({
    combative: {
        health: 1,
        attack: 1,
        races: []
    },
    castable: {
        manaCost: 0
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
import { BuffAbusiveSergeantModel } from "../buffs/abusive-sergeant";

export type BattlecryAbusiveSergeantDef = FeatureDef<
    CustomDef<{
        code: 'abusive-sergeant-battlecry-feature',
    }>
>

@FactoryService.useProduct('abusive-sergeant-battlecry-feature')
export class BattlecryAbusiveSergeantModel extends BattlecryModel<BattlecryAbusiveSergeantDef> {
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
            BuffAbusiveSergeantModel
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

/**
 * @example 叫嚣的中士的效果，因为施加在其它随从上，因此被抽离成单独一个类，因为是正向的效果，所以前缀是buff
 * 注意：并非所有随从都需要抽出一个effect类
 */

export type BuffAbusiveSergeantDef = BuffDef<
    CustomDef<{
        code: 'abusive-sergeant-buff-feature',
    }>
>

@FactoryService.useProduct('abusive-sergeant-buff-feature')
export class BuffAbusiveSergeantModel extends BuffModel<BuffAbusiveSergeantDef> {
    constructor(props: Props<BuffAbusiveSergeantDef>) {
        const superProps = BuffModel.buffProps(props);
        super({
            ...superProps,
            paramDict: {
                name: 'Abusive Sergeant\'s Buff',
                desc: 'Give a minion +2 Attack this turn.',
                modAttack: 2,
                isDisposedOnRoundEnd: true
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
import { BuffBlessingOfKingsModel } from "../buffs/blessing-of-kings";

export type SpellBlessingOfKingsDef = SpellDef<
    CustomDef<{
        code: 'blessing-of-kings-spell-card',
    }>
>

@SpellModel.useRule({
    castable: {
        manaCost: 4
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
            BuffBlessingOfKingsModel
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

       