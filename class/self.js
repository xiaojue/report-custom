/**
 * Created by che on 2017/2/24.
 * Reconstruction by xiaojue on 2017/3/4
 */
import $ from 'jQuery';
import _ from 'underscore';

import config from './config';
import base from './base';
import resize from './resize';
import drag from './drag';

import utils from './utils';

class reportCustomApplication extends drag(resize(base(config))) {
    constructor(options) {
        super(options);
        super.bindEvent();
        this.calLi();
    }
    setPos(ele, style, prefix) {
        var id = ele.id;
        this.posObj[id] = {
            id: id,
            outerHTML: utils.delStyle(ele.outerHTML),
            style: '#' + id + '{' + style + (prefix || '') + '}'
        };
    }
    setPosStyle(id, style) {
        this.posObj[id].style = '#' + id + '{' + style + '}';
    }
    getMM(num) {
        return num / this.mmToPx + 'mm';
    }
    _getPositionLT(top, left) {
        return 'position:absolute;left:' + this.getMM(left - 260) + ';top:' + this.getMM(top - 40);
    }
    _drawNextLine(nextEle, left, top) {
        var pap = this.pap,
            height = utils.getCssParseInt(pap, 'height'),
            width = utils.getCssParseInt(pap, 'width'),
            nextEleLineLeft = nextEle.find('.line-left'),
            nextEleLineTop = nextEle.find('.line-top');
        utils.show(nextEle);
        nextEleLineLeft.css({
            top: 40,
            left: left,
            height: height,
            width: width - left + 260 + 'px'
        });
        nextEleLineTop.css({
            left: 260,
            top: top,
            width: width,
            height: height - top + 40 + 'px'
        });
    }
    titledblclick(e) {
        var target = e.target;
        utils.toggle(utils.toggle(target).next('.input'));
    }
    inputdblclick(e) {
            var target = e.target;
            var input = $(target).parent('.input');
            var prev = input.prev();
            prev.html($(target).val());
            prev.css('font-size', $(target).css('font-size'));
            utils.toggle(input);
            utils.toggle(prev);
        }
        // 点击增加和减小按钮时，控制字体变化
    changeFontSize(e) {
            var target = e.target;
            var input = $(target).parent('.input').find('input');
            var afontSize = utils.getCssParseInt(input, 'font-size');
            afontSize = target.className === 'glyphicon glyphicon-plus-sign' ? afontSize + 1 : afontSize - 1;
            input.css('font-size', afontSize + 'px');
        }
        // 生成分割线
    makehr(e) {
        this.widgetUl.append('<li><div class="hr ' + e.target.id + '"></div></li>');
        this.initDrag();
        this.initHRResize();
    }
    setPapWH(w, h) {
            var mmToPx = this.mmToPx;
            this.pap.css({
                width: w * mmToPx + 'px',
                height: h * mmToPx + 'px'
            });
        }
        // 切换纸张
    changepaper(e) {
            var txt = this.txt;
            var cus = this.cus;
            var id = e.target.id;
            var target = $(e.target);
            var setpapCss = {
                'a4': [210, 297],
                'b5': [176, 250],
                '16k': [184, 260]
            };
            txt.text(target.text());
            if (setpapCss[id]) {
                var wh = setpapCss[id];
                this.setPapWH(wh[0], wh[1]);
                utils.hide(cus);
            }
            if (id === 'cur') {
                utils.show(cus);
            }
            this.calLi();
        }
        // 自定义纸张
    cusGo() {
        var width = +this.paperCusw.val();
        var height = +this.paperCush.val();
        if (width && height) { // 当宽高不为0时，才执行
            this.setPapWH(width, height);
            this.calLi();
        }
    }
    toHtml() {
        var posObj = this.posObj;
        var htmlCon = _.map(posObj, 'outerHTML').join('');
        var hid = this.hid;
        var hrs = this.hrs;
        var hrsHtml = '';
        hid.append(htmlCon).find('span').remove('.input'); // 移除class为input的元素
        htmlCon = hid.html();
        // 把分割线写入到html中
        for (var i = 0; i < hrs.length; i++) {
            var item = hrs[i];
            if (item.offsetLeft > 260 && item.offsetTop > 40) {
                hrsHtml += '<div style="' + this._getPositionLT(item.offsetLeft, item.offsetTop) + 'width: ' + this.getMM(item.clientWidth) + ';border-top: ' + this.getMM(item.clientTop) + ' solid #0f0f0f"></div>';
            }
        }
        htmlCon = htmlCon + hrsHtml;
        var htmlStyle = '<style>' + _.map(posObj, 'style').join('') + '</style>';
        utils.show(this.showHtmlCls);
        this.showHtmlId.text(htmlStyle + htmlCon);
        utils.hide(this.mainCon);
        this.body.addClass('back-c-b');
    }
    close() {
        utils.hide(this.showHtmlCls);
        utils.show(this.mainCon);
        this.body.removeClass('back-c-b');
    }
    calLi() {
        var pap = this.pap;
        var mmToPx = this.mmToPx;
        var width = utils.getCssParseInt(pap, 'width');
        var height = utils.getCssParseInt(pap, 'height');
        // 以5mm为一个刻度格
        var i = Math.round(width / mmToPx / 5) + 1;
        var hi = Math.round(height / mmToPx / 5) + 1;
        var li = utils.eachstr(i, addliEmpty);
        var nli = utils.eachstr(Math.round(i / 2), addli);
        var hli = utils.eachstr(hi, addliEmpty);
        var nhli = utils.eachstr(Math.round(hi / 2), addli);

        this.rulerX.html(li);
        this.numX.html(nli);
        this.rulerY.html(hli);
        this.numY.html(nhli);

        this.centerY.css('left', width / 2 + 260 + 'px');

        function addliEmpty() {
            return '<li></li>';
        }

        function addli(k) {
            return '<li>' + k * 10 + '</li>';
        }
    }
    paperRange(y, x) {
        var pap = this.pap;
        var width = utils.getCssParseInt(pap, 'width');
        var height = utils.getCssParseInt(pap, 'height');
        return x > 260 && x < 260 + width && y > 40 && y < 40 + height;
    }
    unbindEvent() {
        super.unbindEvent();
        this.uninitDrag();
        this.uninitResize();
    }
    destroy() {
        super.destroy();
        this.unbindEvent(this.eventsMap);
    }
}

export default reportCustomApplication;
