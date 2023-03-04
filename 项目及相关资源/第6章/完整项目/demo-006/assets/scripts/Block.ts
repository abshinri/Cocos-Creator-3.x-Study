import { _decorator, Component, Node, resources, Texture2D, SpriteFrame, Sprite, Rect, Vec2, UITransform, director } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Block')
export class Block extends Component {

    public stIndex = new Vec2(0, 0); // 初始位置下标
    public nowIndex = new Vec2(0, 0); // 当前位置下标

    start() {
        this.node.on(Node.EventType.TOUCH_START, this.onBlockTouch, this);
    }

    onBlockTouch() {
        director.emit('click_pic', this.nowIndex);
    }

    init(texture, blockSide, index) {
        const sprite = this.getComponent(Sprite);
        const spriteFrame = new SpriteFrame();

        const uITransform = this.getComponent(UITransform);
        uITransform.setContentSize(blockSide, blockSide);

        spriteFrame.texture = texture;
        spriteFrame.rect = new Rect(index.x * blockSide, index.y * blockSide, blockSide, blockSide);
        sprite.spriteFrame = spriteFrame;

        this.nowIndex = index;
        this.stIndex = index;
    }
}