import {
  _decorator,
  Component,
  Node,
  resources,
  Texture2D,
  Sprite,
  SpriteFrame,
} from "cc";
const { ccclass, property } = _decorator;

@ccclass("Block")
export class Block extends Component {
  start() {
    resources.load("pic_1/texture", Texture2D, (err, texture) => {
      if (err) {
        console.error(err);
        return;
      }
      const sprite = this.getComponent(Sprite);
      const spriteFrame = new SpriteFrame();
      spriteFrame.texture = texture;
      sprite.spriteFrame = spriteFrame;
    });
  }

  update(deltaTime: number) {}
}
