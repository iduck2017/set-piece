# 创建随从

你是一位炉石传说的开发者，请遵从如下规则生成一个随从类，
随从的属性、效果、描述和风味描述已经在提示词中给出


1. 你需要遵循如下规范命名规范

    + 卡牌 minion- hero- weapon-
    + 特性 battlecry- deathwisp- feature-
    + 效果 buff- debuff-，如果你不确定这个效果是增益还是减益，使用effect-

2. 你需要注意的一些开发方式

    + 不要在代码中出现中文，使用英文书写
    + 你需要将我的提示词以块注释的方式添加在卡牌文件上，翻译为英文
    + 你只能修改 hearthstone-extension-classic下的文件，禁止修改其它目录下的文件
    + 你需要根据前缀选择合适的文件夹，禁止新建文件夹
    + 不要臆想对象的属性，不确定的代码注释后输出
    + 在创建Def时，禁止定义模型的parent属性

3. 一些接口用法：

    + MinionModel.useRule的第二个参数决定了该卡牌是否为衍生物
    + GameModel.queryTargetList用来获取目标队列
    + DataBase.cardProductInfo用来随机选择卡牌

4. 参考代码，你可以根据代码中注释的提示选择合适的片段模仿

```typescript

/**
 * @example 小精灵，随从，没有特殊效果
 */
import { CustomDef, Def, Factory, Props } from "@/set-piece";
import { MinionDef, MinionModel } from "@/hearthstone/models/minion";

export type WispDef = MinionDef<
    CustomDef<{
        code: 'minion-wisp',
    }>
>

@MinionModel.useRule({
    manaCost: 0,
    health: 1,
    attack: 1,
    races: []
})
@Factory.useProduct('minion-wisp') 
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

/**
 * @example 叫嚣的中士的战吼，被单独抽离成一个类
 */
import { CustomDef, Def, Factory, Lifecycle, Props } from "@/set-piece";
import { BattlecryModel } from "@/hearthstone/models/battlecry";
import { FeatureDef } from "@/hearthstone/models/feature";
import { TargetCollector } from "@/hearthstone/types/collector";
import { CardModel } from "@/hearthstone/models/card";
import { BuffAbusiveSergeantModel } from "../buffs/buff-abusive-sergeant";

export type BattlecryAbusiveSergeantDef = FeatureDef<
    CustomDef<{
        code: 'battlecry-abusive-sergeant',
    }>
>

@Factory.useProduct('battlecry-abusive-sergeant')
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
        >('buff-abusive-sergeant');
    }

    protected handleTargetCheck(
        targetCollectorList: TargetCollector[]
    ) {
        const game = this.referDict.game;
        if (!game) return;
        const candidateList = game.queryTargetList({
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

/**
 * @example 叫嚣的中士的效果，因为施加在其它随从上，因此被抽离成单独一个类，因为是正向的效果，所以前缀是buff，注意：并非所有随从都需要抽出一个effect类
 */
import { Factory } from "@/set-piece/services/factory";
import { Props } from "@/set-piece/types/props";
import { CustomDef, Def } from "@/set-piece";
import { BuffDef } from "@/hearthstone/models/buff";
import { BuffModel } from "@/hearthstone/models/buff";

export type BuffAbusiveSergeantDef = BuffDef<
    CustomDef<{
        code: 'buff-abusive-sergeant',
    }>
>

@Factory.useProduct('buff-abusive-sergeant')
export class BuffAbusiveSergeantModel extends BuffModel<BuffAbusiveSergeantDef> {
    constructor(props: Props<BuffAbusiveSergeantDef>) {
        const buffProps = BuffModel.buffProps(props);
        super({
            ...buffProps,
            paramDict: {
                name: 'Abusive Sergeant\'s Buff',
                desc: 'Give a minion +2 Attack this turn.',
                modAttack: 2,
                modHealth: 0,
                shouldDisposedOnRoundEnd: true
            },
            stateDict: {},
            childDict: {}
        });
    }
}

/**
 * @example 王者祝福，法术
 */
import { CustomDef, Props } from "@/set-piece";
import { Factory } from "@/set-piece/services/factory";
import { SpellDef } from "@/hearthstone/models/spell";
import { SpellModel } from "@/hearthstone/models/spell";
import { TargetCollector } from "@/hearthstone/types/collector";
import { MinionModel } from "@/hearthstone/models/minion";
import { BuffBlessingOfKingsModel } from "../buffs/buff-blessing-of-kings";

export type SpellBlessingOfKingsDef = SpellDef<
    CustomDef<{
        code: 'spell-blessing-of-kings',
    }>
>

@SpellModel.useRule({
    manaCost: 4
})
@Factory.useProduct('spell-blessing-of-kings')
export class SpellBlessingOfKingsModel extends SpellModel<SpellBlessingOfKingsDef> {
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
        >('buff-blessing-of-kings');
    }

    handleCollectorCheck(targetCollectorList: TargetCollector[]) {
        const game = this.referDict.game;
        if (!game) return;
        const candidateList = game.queryTargetList({
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

