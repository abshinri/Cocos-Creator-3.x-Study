import { _decorator, Component, Node, CCInteger, Label } from "cc";
const { ccclass, property } = _decorator;

@ccclass("Game")
export class Game extends Component {
  // 私有属性,但是编辑器无法读取
  job: string = "法师";
  // 这样定义的属性,编辑器可以读取
  @property({ type: CCInteger })
  hp: number = 100;

  @property({ type: Label })
  label: Label = null;

  start() {
    console.log("Game start");
    this.label.string = "Init by Game.ts";
  }

  update(deltaTime: number) {}
}
