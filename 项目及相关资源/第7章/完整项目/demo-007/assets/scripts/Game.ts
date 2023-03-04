import { _decorator, Component, Node, Label, Animation } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Game')
export class Game extends Component {
    private playerMaxHp: number = 25; // 玩家最大血量
    private playerMaxAp: number = 3; // 玩家最大行动点
    private playerMaxMp: number = 10; // 玩家法力值上限
    private playerAtk: number = 5; // 玩家攻击力
    private healMpCost: number = 8; // 恢复术法力消耗
    private healHp: number = 5; // 恢复术血量
    private incrMp: number = 2; // 法力恢复速度

    private enemyMaxHp: number = 25; // 敌人最大血量
    private enemyAtk: number = 3; // 敌人攻击力

    private playerHp: number = 0; // 玩家当前血量
    private playerAp: number = 0; // 玩家当前行动点
    private playerMp: number = 0; // 玩家当前法力值
    private enemyHp: number = 0; // 敌人当前血量

    private turnNum = 0; // 0：玩家回合，1：敌人回合

    @property({ type: Node })
    private enemyAreaNode: Node = null; // 绑定enemyArea节点
    @property({ type: Label })
    private enemyHpLabel: Label = null;  // 绑定enemy节点下的hp节点

    @property({ type: Label })
    private playerHpLabel: Label = null;  // 绑定player节点下的hp节点
    @property({ type: Label })
    private playerApLabel: Label = null;  // 绑定player节点下的ap节点
    @property({ type: Label })
    private playerMpLabel: Label = null;  // 绑定player节点下的mp节点

    @property({ type: Node })
    private nextBtnNode: Node = null; // 绑定nextBtn节点

    @property({ type: Animation })
    private bgAni: Animation = null; // 绑定bg节点

    start() {
        this.initEnemy();
        this.initPlayer();

        this.bgAni.on(Animation.EventType.FINISHED, this.bgAniFinish, this);

        let ani = this.enemyAreaNode.getComponent(Animation);
        ani.on(Animation.EventType.FINISHED, () => {
            this.turnNum = 0;
        }, this);
    }

    // 初始化敌人
    initEnemy() {
        this.updateEnemyHp(this.enemyMaxHp);
        this.enemyAreaNode.active = true;
    }

    // 更新敌人血量
    updateEnemyHp(hp) {
        this.enemyHp = hp;
        this.enemyHpLabel.string = `${this.enemyHp}hp`;
    }

    // 初始化玩家
    initPlayer() {
        this.updatePlayerHp(this.playerMaxHp);
        this.updatePlayerAp(this.playerMaxAp);
        this.updatePlayerMp(this.playerMaxMp);
    }

    // 更新玩家血量
    updatePlayerHp(hp) {
        this.playerHp = hp;
        this.playerHpLabel.string = `HP\n${this.playerHp}`;
    }

    // 更新玩家血量
    updatePlayerAp(ap) {
        this.playerAp = ap;
        this.playerApLabel.string = `AP\n${this.playerAp}`;
    }

    // 更新玩家血量
    updatePlayerMp(mp) {
        this.playerMp = mp;
        this.playerMpLabel.string = `MP\n${this.playerMp}`;
    }

    // 玩家发起攻击
    playerAttack() {
        if (this.turnNum = 0) return; // 不是自己的回合不能行动
        if (this.playerAp <= 0) return;

        this.playerAp -= 1; // 消耗一个行动点

        this.playerMp += this.incrMp; // 自然法力恢复
        if (this.playerMp > this.playerMaxMp) {
            this.playerMp = this.playerMaxMp;
        }

        // 播放敌人受伤动画
        let ani = this.enemyAreaNode.getComponent(Animation);
        ani.play('hurt');

        this.enemyHp -= this.playerAtk;
        if (this.enemyHp <= 0) {
            this.enemyDie();
            return;
        }

        this.updateEnemyHp(this.enemyHp);
        this.updatePlayerAp(this.playerAp);
        this.updatePlayerMp(this.playerMp);
        this.checkEnemyAction();
    }

    // 敌人死亡逻辑
    enemyDie() {
        this.enemyAreaNode.active = false;
        this.nextBtnNode.active = true;
    }

    // 玩家使用治疗
    playerHeal() {
        if (this.turnNum = 0) return; // 不是自己的回合不能行动
        if (this.playerAp <= 0 || this.playerMp < this.healMpCost) return;

        this.playerAp -= 1; // 消耗一个行动点

        this.playerMp -= this.healMpCost; // 消耗法力值

        this.playerHp += this.healHp; // 恢复治疗值
        // 越界检测
        if (this.playerHp > this.playerMaxHp) {
            this.playerHp = this.playerMaxHp;
        }
        this.updatePlayerHp(this.playerHp);
        this.updatePlayerAp(this.playerAp);
        this.updatePlayerMp(this.playerMp);
        this.checkEnemyAction();
    }

    // 回合轮换检测
    checkEnemyAction() {
        if (this.turnNum == 0 && this.playerAp <= 0) {
            this.turnNum = 1;
            this.enemyAttack(this.enemyAtk);
        }
    }

    // 敌人发起攻击
    enemyAttack(atk) {
        if (this.turnNum != 1) return; // 不是自己的回合不能行动
        this.playerHp -= atk;
        this.updatePlayerHp(this.playerHp);

        // 播放玩家攻击动画
        let ani = this.enemyAreaNode.getComponent(Animation);
        ani.play('attack');

        if (this.playerHp <= 0) {
            console.log('游戏结束');
            return;
        }

        this.updatePlayerAp(this.playerMaxAp);
    }

    // 进入下一个房间
    nextRoom() {
        console.log('进入下一个房间');
        let ani = this.enemyAreaNode.getComponent(Animation);
        ani.stop();
        this.bgAni.play('interlude');
        this.nextBtnNode.active = false;
    }

    // 过渡动画结束回调
    bgAniFinish() {
        this.initEnemy();
        this.turnNum = 0;
        this.updatePlayerAp(this.playerMaxAp);
    }
}