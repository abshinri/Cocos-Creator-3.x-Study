/** 核心游戏逻辑脚本 */
import { _decorator, Component, Node, Label, Animation } from "cc";
const { ccclass, property } = _decorator;

@ccclass("Game")
export class Game extends Component {
  private playerMaxHp: number = 25; // 玩家最大生命值
  private playerMaxAp: number = 3; // 玩家最大行动值
  private playerMaxMp: number = 10; // 玩家最大法力值
  private playerAttack: number = 5; // 玩家攻击力
  private healMpCost: number = 8; // 恢复法术MP消耗量
  private healHp: number = 5; // 恢复法术恢复量
  private playerMpRecoverSpeed: number = 2; // 玩家MP恢复速度

  private enemyMaxHp: number = 20; // 敌人最大生命值
  private enemyAttack: number = 3; // 敌人攻击力

  private playerHp: number = 0; // 玩家当前生命值
  private playerAp: number = 0; // 玩家当前行动值
  private playerMp: number = 0; // 玩家当前法力值
  private enemyHp: number = 0; // 敌人当前生命值

  private roundType: number = 0; // 当前回合类型, 0: 玩家回合, 1: 敌人回合

  @property({ type: Animation })
  private bgAni: Animation = null; // 背景动画

  @property({ type: Node })
  private nextLevelBtn: Node = null; // 进入下一关按钮

  @property({ type: Node })
  private enemyAreaNode: Node = null; // 敌人区域节点
  @property({ type: Label })
  private enemyHpLabel: Label = null; // 敌人hp数值节点

  @property({ type: Label })
  private playerHpLabel: Label = null; // 玩家hp数值节点
  @property({ type: Label })
  private playerApLabel: Label = null; // 玩家ap数值节点
  @property({ type: Label })
  private playerMpLabel: Label = null; // 玩家mp数值节点

  /**
   * 初始化敌人
   */
  private initEnemy() {
    this.enemyHp = this.enemyMaxHp;
    this.updateEnemyHp(this.enemyHp);
    this.enemyAreaNode.active = true;
  }

  /**
   * 更新敌人的HP数值
   */
  private updateEnemyHp(hp: number) {
    // this.enemyHp的最大值不能超过this.enemyMaxHp, 最小值不能小于0
    if (hp > this.enemyMaxHp) {
      hp = this.enemyMaxHp;
    } else if (hp < 0) {
      hp = 0;
    }
    this.enemyHp = hp;
    this.enemyHpLabel.string = `${this.enemyHp}hp`;

    // 敌人死亡
    if (this.enemyHp == 0) {
      this.handleEnemyDead();
    }
  }

  /**
   * 控制敌人死亡的逻辑
   */

  private handleEnemyDead() {
    this.enemyAreaNode.active = false;
    this.nextLevelBtn.active = true;
    this.roundType = 0;
  }

  /**
   * 进入下一关
   */
  private nextLevel() {
    this.nextLevelBtn.active = false;
    // 清空动画
    this.enemyAreaNode.getComponent(Animation).stop();
    // 播放进场动画
    this.bgAni.play("interlude");
  }

  /**
   * 入场动画播放结束的回调
   */
  private handleBgAniFinished() {
    console.log("进入下一关");
    this.initEnemy();

    this.updatePlayerAp(this.playerMaxAp);
    this.roundType = 0;
  }

  /**
   * 控制敌人攻击的逻辑
   */
  private handleEnemyAttack() {
    this.enemyAreaNode.getComponent(Animation).play("attack");
    this.updatePlayerHp(this.playerHp - this.enemyAttack);
  }

  /**
   * 初始化玩家
   */
  private initPlayer() {
    this.playerHp = this.playerMaxHp;
    this.playerAp = this.playerMaxAp;
    this.playerMp = this.playerMaxMp;

    this.updatePlayerHp(this.playerHp);
    this.updatePlayerAp(this.playerAp);
    this.updatePlayerMp(this.playerMp);
  }
  /**
   * 更新玩家的HP数值
   * @param hp
   */
  private updatePlayerHp(hp: number) {
    // this.playerHp的最大值不能超过this.playerMaxHp, 最小值不能小于0
    if (hp > this.playerMaxHp) {
      hp = this.playerMaxHp;
    } else if (hp < 0) {
      hp = 0;
    }
    this.playerHp = hp;
    this.playerHpLabel.string = `${this.playerHp}`;
  }

  /**
   * 更新玩家的AP数值
   * @param ap
   */
  private updatePlayerAp(ap: number) {
    // this.playerAp的最大值不能超过this.playerMaxAp, 最小值不能小于0
    if (ap > this.playerMaxAp) {
      ap = this.playerMaxAp;
    } else if (ap < 0) {
      ap = 0;
    }
    this.playerAp = ap;
    this.playerApLabel.string = `${this.playerAp}`;
  }

  /**
   * 更新玩家的MP数值
   * @param mp
   */
  private updatePlayerMp(mp: number) {
    // this.playerMp的最大值不能超过this.playerMaxMp, 最小值不能小于0
    if (mp > this.playerMaxMp) {
      mp = this.playerMaxMp;
    } else if (mp < 0) {
      mp = 0;
    }

    this.playerMp = mp;
    this.playerMpLabel.string = `${this.playerMp}`;
  }

  /**
   * 玩家每次行动结束后, 都会执行的通用逻辑
   */
  private handlePlayerActionEnd() {
    this.updatePlayerAp(this.playerAp - 1);
    // 玩家行动值为0, 则结束玩家回合
    if (this.playerAp == 0) {
      this.handlePlayerRoundEnd();
    }
  }

  /**
   * 玩家回合结束
   */
  private handlePlayerRoundEnd() {
    // 检查是否可以结束回合, 必须是玩家回合, 并且玩家没有行动值
    if (this.roundType !== 0) return;
    if (this.playerAp > 0) return;
    // 恢复玩家行动值
    this.updatePlayerAp(this.playerMaxAp);
    // 恢复玩家MP
    this.updatePlayerMp(this.playerMp + this.playerMpRecoverSpeed);
    // 敌人回合
    this.roundType = 1;
    this.handleEnemyAttack();
  }

  /**
   * 玩家攻击
   */
  private handlePlayerAttack() {
    // 检查是否可以攻击, 必须是玩家回合, 并且玩家有行动值
    if (this.roundType !== 0) return;
    if (this.playerAp < 1) return;

    // 扣除敌人HP
    this.updateEnemyHp(this.enemyHp - this.playerAttack);
    this.enemyAreaNode.getComponent(Animation).play("hurt");

    this.handlePlayerActionEnd();
  }

  /**
   * 玩家使用治疗
   */
  private handlePlayerHeal() {
    // 检查是否可以治疗, 必须是玩家回合, 并且玩家有行动值, 并且玩家有MP
    if (this.roundType !== 0) return;
    if (this.playerAp < 1) return;
    if (this.playerMp < this.healMpCost) return;

    // 扣除玩家MP
    this.updatePlayerMp(this.playerMp - this.healMpCost);
    // 恢复玩家HP
    this.updatePlayerHp(this.playerHp + this.healHp);

    this.handlePlayerActionEnd();
  }

  start() {
    this.initEnemy();
    this.initPlayer();

    // 监听背景动画的结束事件
    this.bgAni.on(Animation.EventType.FINISHED, this.handleBgAniFinished, this);
    // 监听敌人动画的结束事件
    this.enemyAreaNode
      .getComponent(Animation)
      .on(Animation.EventType.FINISHED, () => {
        // 敌人攻击结束, 进入玩家回合
        this.roundType = 0;
      });
  }

  update(deltaTime: number) {}
}
