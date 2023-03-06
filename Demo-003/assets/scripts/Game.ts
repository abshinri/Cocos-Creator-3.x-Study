import { _decorator, Component, Node, Label, director } from "cc";
const { ccclass, property } = _decorator;

@ccclass("Game")
export class Game extends Component {
  @property({ type: Node })
  private enemyAttackNode: Node = null!;

  private enemyAttackType = 0; // 0: 弓箭, 1: 流星锤, 2: 盾牌
  private timer = null;

  @property({ type: Label })
  private hintLabel: Label = null!; // 绑定屏幕上的Hint文本

  attack(event: any, customEventData: string) {
    console.log("attack-event", event); // 测试按钮的点击事件
    console.log("attack-customEventData", customEventData); // 测试按钮的点击事件

    if (!this.timer) {
      // 如果定时器不存在,则说明游戏还未开始,直接return
      return;
    }

    clearInterval(this.timer); // 清除定时器
    this.timer = null; // 将定时器置空

    // 对局结果
    let pkRes = 0; // 0: 平局, 1: 胜利, 2: 失败
    let attackType = event.target.name; // 获取点击的按钮的name,即0,1,2

    if (attackType == this.enemyAttackType) {
      // 平局
      pkRes = 0;
    } else if (attackType == 0 && this.enemyAttackType == 1) {
      // 胜利
      pkRes = 1;
    } else if (attackType == 1 && this.enemyAttackType == 2) {
      // 胜利
      pkRes = 1;
    } else if (attackType == 2 && this.enemyAttackType == 0) {
      // 胜利
      pkRes = 1;
    } else {
      // 失败
      pkRes = 2;
    }
    if (pkRes == 0) {
      this.hintLabel.string = "平局";
    } else if (pkRes == 1) {
      this.hintLabel.string = "胜利";
    } else {
      this.hintLabel.string = "失败";
    }
  }

  start() {
    this.timer = setInterval(() => {
      this.randomEnemyAttack();
    }, 100);
  }

  randomEnemyAttack() {
    // 取0~2随机数
    this.enemyAttackType = Math.floor(Math.random() * 3);

    let children = this.enemyAttackNode.children; // 获取enemyAttackNode的子节点,可以在编辑器中看到即0,1,2这三个图片构成的子节点
    children.forEach((child, index) => {
      child.active = false; // 先将所有子节点隐藏

      if (index == this.enemyAttackType) {
        child.active = true; // 将随机到的子节点显示
      }
    });
  }

  // 重启游戏
  reset() {
    // director.loadScene("Game"); // 也可直接重新加载游戏场景

    if (this.timer) {
      return;
    }
    this.hintLabel.string = "游戏开始";
    this.randomEnemyAttack();
    this.timer = setInterval(() => {
      this.randomEnemyAttack();
    }, 100);
  }
  update(deltaTime: number) {}
}
