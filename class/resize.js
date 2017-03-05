import $ from 'jQuery';
import utils form './utils';

let resize = ( supperclass ) => class extends supperclass {
    constructor(){
        super();
        this.initResize();    
    }
    initHRResize() {
        var xx = this.xx;
        var yy = this.yy;
        // 自定义分割线大小
        this.hr.resizable({
            handles: 'e',
            minHeight: 1,
            resize: function(event, ui) {
                utils.show(this.lineXY);
                this.lineX.css('top', +ui.size.height + xx);
                this.lineY.css('left', +ui.size.width + yy);
            },
            stop: function() {
                utils.hide(this.lineXY);
            }
        });
    }
    _resizing(event, ui) {
        var target = event.target,
            size = ui.size,
            offset = $(target).offset();
        utils.show(this.lineXY);
        this.lineX.css('top', +size.height + offset.top);
        this.lineY.css('left', +size.width + offset.left);
    }
    _resizeStop(event, ui) {
        var target = event.target,
            id = target.id,
            offset = $(target).offset(),
            left = offset.left,
            top = offset.top,
            width = ui.size.width,
            height = ui.size.height;
        utils.hide(this.lineXY);
        this.setPosStyle(id, this._getPositionLT(top, left), 'width:' + this.getMM(width) + ';height:' + this.getMM(height));
    }
    initResize() {
        // 自定义文本输入框大小
        this.inputResize.resizable({
            resize: this._resizing,
            stop: this._resizeStop
        });
    }
    uninitResize() {
        this.inputResize.resizable('destroy');
        this.hr.resizable('destroy');
    }
};

export default resize;
