import {
  _decorator,
  Component,
  Node,
  resources,
  Texture2D,
  Sprite,
  SpriteFrame,
  Vec2,
  director,
  UITransform,
  Rect,
  Vec3,
} from "cc";
const { ccclass, property } = _decorator;

@ccclass("Block")
export class Block extends Component {
  public startPosition = new Vec2(0, 0); // 过关位置(游戏开始前的位置)
  public nowPosition = new Vec2(0, 0); // 当前位置

  // 点击事件
  onNodeTouch() {
    director.emit("clickPicBlock", this.nowPosition);
  }

  // 初始化该砖块
  initBlock(texture, blockSideSize, position) {
    const sprite = this.getComponent(Sprite);
    const spriteFrame = new SpriteFrame();

    const _UITransform = this.getComponent(UITransform);
    _UITransform.setContentSize(blockSideSize, blockSideSize);

    spriteFrame.texture = texture; // 设置纹理
    spriteFrame.rect = new Rect(
      position.x * blockSideSize,
      position.y * blockSideSize,
      blockSideSize,
      blockSideSize
    ); // 设置纹理区域
    sprite.spriteFrame = spriteFrame;

    // 初始化排序信息
    this.startPosition = position;
    this.nowPosition = position;
  }
  start() {
    this.node.on(Node.EventType.TOUCH_START, this.onNodeTouch, this);
    // resources.load("pic_1/texture", Texture2D, (err, texture) => {
    //   if (err) {
    //     console.error(err);
    //     return;
    //   }
    //   const sprite = this.getComponent(Sprite);
    //   const spriteFrame = new SpriteFrame();
    //   spriteFrame.texture = texture;
    //   sprite.spriteFrame = spriteFrame;
    // });
  }

  update(deltaTime: number) {}
}
