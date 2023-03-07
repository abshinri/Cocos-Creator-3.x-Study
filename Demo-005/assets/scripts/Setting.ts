import {
  _decorator,
  Component,
  Node,
  PhysicsSystem2D,
  EPhysics2DDrawFlags,
} from "cc";
const { ccclass, property } = _decorator;

@ccclass("Setting")
export class Setting extends Component {
  @property
  private isDebug: boolean = false;

  showDebug() {
    if (this.isDebug) {
      // 进行位运算,打开2d物理引擎的调试绘制功能
      // 文档无相关信息,教程只给了方法,没有给出参数的具体含义,只能自己去猜测了
      PhysicsSystem2D.instance.debugDrawFlags =
        EPhysics2DDrawFlags.Aabb |
        EPhysics2DDrawFlags.Pair |
        EPhysics2DDrawFlags.CenterOfMass |
        EPhysics2DDrawFlags.Joint |
        EPhysics2DDrawFlags.Shape;
      console.log(PhysicsSystem2D.instance.debugDrawFlags);
      // 打印结果为 31
    } else {
      PhysicsSystem2D.instance.debugDrawFlags = EPhysics2DDrawFlags.None;
      console.log(PhysicsSystem2D.instance.debugDrawFlags);
      // 打印结果为 0
    }
  }

  start() {
    this.showDebug();
  }

  update(deltaTime: number) {}
}
