import $ from 'jQuery';
import utils from './utils';

let drag = ( supperclass ) => class extends supperclass {
    constructor(){
      super();
      this.initDrag();
    }
    initDrag() {
        // 拖拽函数，记录拖拽到的位置，并把绝对位置改为mm单位
        this.widgetDiv.draggable({
            snap: ".center-box,.line-left,.line-top",
            snapMode: "inner",
            snapTolerance: 15,
            start: this._dragStart,
            drag: this._dragging,
            stop: this._dragStop,
            zIndex: 100
        });
    }
    _dragStart(e, ui) {
        var centerY = this.centerY,
            centerBox = this.centerBox;
        // 当拖拽的对象为标题或者副标题的时候才会有中间对齐辅助线
        if (utils.has(['titleDrag', 'subtitleDrag'], e.target.id)) {
            // 动态调整标题对齐框的大小，因为没法按中间线对齐，所以引入一个box
            utils.show(centerBox);
            utils.setCenter(centerBox, utils.getCssParseInt(centerY, 'left'), ui.helper.width());
        } else {
            utils.hide(centerBox);
        }
    }
    _dragging(e, ui) {
        var xx = this.xx,
            yy = this.yy,
            id = e.target.id,
            top = ui.offset.top,
            left = ui.offset.left,
            height = ui.helper.height(),
            width = ui.helper.width(),
            hasDrag = utils.has(['titleDrag', 'subtitleDrag'], id);
        // 如果是标题把鼠标十字线挪到中间位置
        xx = hasDrag ? top + Math.floor(height / 2) : top;
        yy = hasDrag ? left + Math.floor(width / 2) : left;
        // 移到paper范围时显示鼠标十字线
        if (this.paperRange(xx, yy)) {
            utils.show(this.lineXY);
            this.lineX.css('top', xx);
            this.lineY.css('left', yy);
        } else {
            this.lineXY.hide(); // 隐藏鼠标十字线
        }
    }
    _dragStop(event, ui) {
        var target = event.target,
            id = target.id,
            top = ui.offset.top,
            left = ui.offset.left,
            nextEle = $(target).next(),
            inputResize = target.find('.input-resize');
        //当停止在paper范围时执行
        if (this.paperRange(top, left)) {
            this.setPos(target, this._getPositionLT(top, left));
            if (utils.has(['imgDescI', 'diagDescI'], id)) {
                var wi = utils.getCssParseInt(inputResize, 'width');
                var he = utils.getCssParseInt(inputResize, 'height');
                this.setPosStyle(id, this._getPositionLT(top, left), 'width' + this.getMM(wi) + ';height:' + this.getMM(he));
            }
            // 拖拽停止之后画出参考线
            this._drawNextLine(nextEle, left, top);
        } else { // 如果停止的时候不在paper范围内，则隐藏参考线
            utils.hide(nextEle);
        }
        utils.hide(this.lineXY); // 隐藏鼠标十字线
    }
    uninitDrag() {
        this.widgetDiv.draggable('destroy');
    }
};

export default drag;
