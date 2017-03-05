/**
 * Created by che on 2017/2/24.
 * Reconstruction by xiaojue on 2017/3/4
 */

(function(global, $, _, doc) {
    'use strict';

    var reportCustomApplication = function(options) {
        options = options || {};
        this.posObj = {};
        this.mmToPx = options.mmToPx || 3; // 定义mm换算为px的倍数为3
        this.xx = 0;
        this.yy = 0; // 定义鼠标位置
        this.initializeElements();
        this.eventsMap = {
            'dblclick .title': 'titledblclick',
            'dblclick .input input': 'inputdbclick',
            'click .input span': 'changeFontSize',
            'click .make-hr a': 'makehr',
            'click .change-paper a': 'changepapaer',
            'click #cusGo': 'cusGo',
            'click #toHtml': 'toHtml',
            'click #close': 'close'
        };
        this.initialization();
    };

    reportCustomApplication.Eles = {
        body: 'body',
        widgetDiv: ".left-widget div",
        inputResize: '.input-resize',
        pap: '.paper',
        centerY: '.center-y',
        centerBox: '.center-box',
        lineX: '.line-x',
        lineY: '.line-y',
        lineXY: '.line-x .line-y',
        widgetUl: '.left-widget ul',
        hr: '.hr',
        txt: '.input-group-btn button',
        cus: '#paper-type-cus',
        paperCusw: '#paper-cus-width',
        paperCush: '#paper-cus-height',
        hid: '#hidden',
        showHtmlCls: '.showHtml',
        showHtmlId: '#showHtml',
        mainCon: '#mainCon',
        rulerX: '.ruler-x',
        numX: '.num-x',
        rulerY: '.ruler-y',
        numY: '.num-y',
    };

    var utils = {
        getCssParseInt: function(ele, attr) {
            return parseInt($(ele).css(attr), 10);
        },
        setCenter: function(box, width, left) {
            box.css({
                width: width,
                left: left - Math.floor(width / 2)
            });
        },
        has: function(arr, name) {
            return arr.indexOf(name) > -1;
        },
        eachstr: function(len, func) {
            var str = '';
            for (var i = 0; i < len; i++) {
                str += func(i);
            }
            return str;
        },
        hide:function(ele){
            $(ele).addClass('hidden'); 
        },
        show:function(ele){
            $(ele).removeClass('hidden'); 
        },
        toggle:function(ele){
            return $(ele).toggleClass('hidden');
        }
    };

    reportCustomApplication.prototype = {
        constructor: reportCustomApplication,
        _dragStart: function(e, ui) {
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
        },
        setPos: function(ele, style, prefix) {
            var id = ele.id;
            this.posObj[id] = {
                id: id,
                outerHTML: this.delStyle(ele.outerHTML),
                style: '#' + id + '{' + style + (prefix || '') + '}'
            };
        },
        setPosStyle: function(id, style) {
            this.posObj[id].style = '#' + id + '{' + style + '}';
        },
        getMM: function(num) {
            return num / this.mmToPx + 'mm';
        },
        _dragStop: function(event, ui) {
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
        },
        _getPositionLT: function(top, left) {
            return 'position:absolute;left:' + this.getMM(left - 260) + ';top:' + this.getMM(top - 40);
        },
        _drawNextLine: function(nextEle, left, top) {
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
        },
        _dragging: function(e, ui) {
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
        },
        _resizing: function(event, ui) {
            var target = event.target,
                size = ui.size,
                offset = $(target).offset();
            utils.show(this.lineXY);
            this.lineX.css('top', +size.height + offset.top);
            this.lineY.css('left', +size.width + offset.left);
        },
        _resizeStop: function(event, ui) {
            var target = event.target,
                id = target.id,
                offset = $(target).offset(),
                left = offset.left,
                top = offset.top,
                width = ui.size.width,
                height = ui.size.height;
            utils.hide(this.lineXY);
            this.setPosStyle(id, this._getPositionLT(top, left), 'width:' + this.getMM(width) + ';height:' + this.getMM(height));
        },
        titledblclick: function(e) {
            var target = e.target;
            utils.toggle(utils.toggle(target).next('.input'));
        },
        inputdblclick: function(e) {
            var target = e.target;
            var input = $(target).parent('.input');
            var prev = input.prev();
            prev.html($(target).val());
            prev.css('font-size', $(target).css('font-size'));
            utils.toggle(input);
            utils.toggle(prev);
        },
        // 点击增加和减小按钮时，控制字体变化
        changeFontSize: function(e) {
            var target = e.target;
            var input = $(target).parent('.input').find('input');
            var afontSize = utils.getCssParseInt(input, 'font-size');
            afontSize = target.className === 'glyphicon glyphicon-plus-sign' ? afontSize + 1 : afontSize - 1;
            input.css('font-size', afontSize + 'px');
        },
        // 生成分割线
        makehr: function(e) {
            this.widgetUl.append('<li><div class="hr ' + e.target.id + '"></div></li>');
            this.initDrag();
            this.initHRResize();
        },
        initHRResize: function() {
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
        },
        setPapWH: function(w, h) {
            var mmToPx = this.mmToPx;
            this.pap.css({
                width: w * mmToPx + 'px',
                height: h * mmToPx + 'px'
            });
        },
        // 切换纸张
        changepaper: function(e) {
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
        },
        // 自定义纸张
        cusGo: function() {
            var width = +this.paperCusw.val();
            var height = +this.paperCush.val();
            if (width && height) { // 当宽高不为0时，才执行
                this.setPapWH(width, height);
                this.calLi();
            }
        },
        toHtml: function() {
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
        },
        close: function() {
            utils.hide(this.showHtmlCls);
            utils.show(this.mainCon);
            this.body.removeClass('back-c-b');
        },
        calLi: function() {
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
        },
        /**
         * 处理outHTML的内容，把从class开始到style结束的内容裁剪掉
         */
        delStyle: function(con) {
            var styleStart = con.indexOf('class');
            var styleEnd = con.indexOf('px;"', styleStart) + 4;
            return con.substring(0, styleStart) + con.substring(styleEnd);
        },

        /**
         * 判断鼠标位置是否在paper范围内
         */
        paperRange: function(y, x) {
            var pap = this.pap;
            var width = utils.getCssParseInt(pap, 'width');
            var height = utils.getCssParseInt(pap, 'height');
            return x > 260 && x < 260 + width && y > 40 && y < 40 + height;
        },
        initialization: function() {
            // 计算标尺参考线
            this.calLi();
            this.bindEvent();
        },
        initializeElements: function() {
            var eles = reportCustomApplication.Eles;
            for (var name in eles) {
                if (eles.hasOwnProperty(name)) {
                    this[name] = $(eles[name]);
                }
            }
        },
        _scanEventsMap: function(maps, isOn) {
            var delegateEventSplitter = /^(\S+)\s*(.*)$/;
            var bind = isOn ? this._delegate : this._undelegate;
            for (var keys in maps) {
                if (maps.hasOwnProperty(keys)) {
                    var matchs = keys.match(delegateEventSplitter);
                    bind(matchs[1], matchs[2], maps[keys].bind(this));
                }
            }
        },
        initializeOrdinaryEvents: function(maps) {
            this._scanEventsMap(maps, true);
        },
        uninitializeOrdinaryEvents: function(maps) {
            this._scanEventsMap(maps);
        },
        _delegate: function(name, selector, func) {
            doc.on(name, selector, func);
        },
        _undelegate: function(name, selector, func) {
            doc.off(name, selector, func);
        },
        initDrag: function() {
            var self = this;
            // 拖拽函数，记录拖拽到的位置，并把绝对位置改为mm单位
            this.widgetDiv.draggable({
                snap: ".center-box,.line-left,.line-top",
                snapMode: "inner",
                snapTolerance: 15,
                start: self._dragStart,
                drag: self._dragging,
                stop: self._dragStop,
                zIndex: 100
            });
        },
        initResize: function() {
            var self = this;
            // 自定义文本输入框大小
            this.inputResize.resizable({
                resize: self._resizing,
                stop: self._resizeStop
            });
        },
        uninitDrag: function() {
            this.widgetDiv.draggable('destroy');
        },
        uninitResize: function() {
            this.inputResize.resizable('destroy');
            this.hr.resizable('destroy');
        },
        bindEvent: function() {
            this.initDrag();
            this.initResize();
            this.initializeOrdinaryEvents();
        },
        unbindEvent: function() {
            this.uninitDrag();
            this.uninitResize();
            this.uninitializeOrdinaryEvents();
        },
        destroy: function() {
            this.unbindEvent(this.eventsMap);
        }
    };

    global.reportCustomApplication = reportCustomApplication;

    $(function() {
        new reportCustomApplication();
    });

})(this, this.jQuery, this._, document);
