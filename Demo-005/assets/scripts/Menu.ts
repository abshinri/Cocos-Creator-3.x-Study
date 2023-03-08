import { _decorator, Component, Node, Director, find, Button } from "cc";
const { ccclass, property } = _decorator;

@ccclass("Menu")
export class Menu extends Component {
  startGame() {
    Director.instance.loadScene("Game");
  }

  start() {
    try {
      // 把节点层级当做资源路径寻找节点
      const startBtn = find("Canvas/BG/Button");
      console.log(startBtn);
      startBtn.on(Button.EventType.CLICK, this.startGame, this);
    } catch (error) {
      console.log(error);
    }
  }

  update(deltaTime: number) {}
}
