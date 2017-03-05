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

    reportCustomApplication.prototype = {
        constructor: reportCustomApplication,
        _dragStart: function(e, ui) {
            var centerY = this.centerY;
            // 当拖拽的对象为标题或者副标题的时候才会有中间对齐辅助线
            if (['titleDrag', 'subtitleDrag'].indexOf(e.target.id) > -1) {
                // 动态调整标题对齐框的大小，因为没法按中间线对齐，所以引入一个box
                var width = ui.helper.width();
                var left = parseInt(centerY.css('left'), 10);
                this.centerBox.removeClass('hidden').css({
                    width: width,
                    left: left - Math.floor(width / 2)
                });
            } else {
                this.centerBox.addClass('hidden');
            }
        },
        _dragStop: function(event, ui) {
            var mmToPx = this.mmToPx,
                posObj = this.posObj,
                target = event.target,
                id = target.id,
                top = ui.offset.top,
                left = ui.offset.left,
                nextEle = $(target).next(),
                inputResize = target.find('.input-resize');
            //当停止在paper范围时执行
            if (this.paperRange(top, left)) {
                posObj[id] = {
                    id: id,
                    outerHTML: this.delStyle(target.outerHTML),
                    style: '#' + id + '{' + this._getPositionLT(top, left, mmToPx) + '}'
                };
                if (['imgDescI', 'diagDescI'].indexOf(id) > -1) {
                    var wi = parseInt(inputResize.css('width'));
                    var he = parseInt(inputResize.css('height'));
                    posObj[id].style = '#' + id + '{' + this._getPositionLT(top, left, mmToPx) + 'width:' + wi / mmToPx + 'mm;height:' + he / mmToPx + 'mm}';
                }
                // 拖拽停止之后画出参考线
                this._drawNextLine(nextEle, left, top);
            } else { // 如果停止的时候不在paper范围内，则隐藏参考线
                nextEle.addClass('hidden');
            }
            this.lineXY.addClass('hidden'); // 隐藏鼠标十字线
        },
        _getPositionLT: function(top, left, mmToPx) {
            return 'position:absolute;left' + (left - 260) / mmToPx + 'mm;top' + (top - 40) / mmToPx + 'mm';
        },
        _drawNextLine: function(nextEle, left, top) {
            var pap = this.pap,
                height = parseInt(pap.css('height'), 10),
                width = parseInt(pap.css('width'), 10),
                nextEleLineLeft = nextEle.find('.line-left'),
                nextEleLineTop = nextEle.find('.line-top');
            nextEle.removeClass('hidden');
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
                width = ui.helper.width();
            if (['titleDrag', 'subtitleDrag'].indexOf(id) > -1) { // 如果是标题把鼠标十字线挪到中间位置
                xx = top + Math.floor(height / 2);
                yy = left + Math.floor(width / 2);
            } else {
                xx = top;
                yy = left;
            }
            // 移到paper范围时显示鼠标十字线
            if (this.paperRange(xx, yy)) {
                this.lineXY.removeClass('hidden');
                this.lineX.css('top', xx);
                this.lineY.css('left', yy);
            } else {
                this.lineXY.addClass('hidden'); // 隐藏鼠标十字线
            }
        },
        _resizing: function(event, ui) {
            var target = event.target;
            this.lineXY.removeClass('hidden');
            this.lineX.css('top', +ui.size.height + $(target).offset().top);
            this.lineY.css('left', +ui.size.width + $(target).offset().left);
        },
        _resizeStop: function(event, ui) {
            var mmToPx = this.mmToPx,
                posObj = this.posObj,
                target = event.target,
                id = target.id,
                offset = $(target).offset(),
                left = offset.left,
                top = offset.top;
            this.lineXY.addClass('hidden');
            posObj[id].style = '#' + id + '{' + this._getPositionLT(top, left, mmToPx) + ';width:' + ui.size.width / mmToPx + 'mm;height:' + ui.size.height / mmToPx + 'mm}';
        },
        titledblclick: function(e) {
            var target = e.target;
            $(target).toggleClass('hidden');
            $(target).next('.input').toggleClass('hidden');
        },
        inputdblclick: function(e) {
            var target = e.target;
            var input = $(target).parent('.input');
            var prev = input.prev();
            prev.html($(target).val());
            prev.css('font-size', $(target).css('font-size'));
            input.toggleClass('hidden');
            prev.toggleClass('hidden');
        },
        // 点击增加和减小按钮时，控制字体变化
        changeFontSize: function(e) {
            var target = e.target;
            var input = $(target).parent('.input').find('input');
            var afontSize = parseInt(input.css('font-size'));
            if (target.className == 'glyphicon glyphicon-plus-sign') {
                afontSize = parseInt(afontSize) + 1 + 'px';
            } else {
                afontSize = parseInt(afontSize) - 1 + 'px';
            }
            input.css('font-size', afontSize);
        },
        // 生成分割线
        makehr: function(e) {
            var ul = this.widgetUl;
            var ht; // 定义要生成的分割线html
            switch (e.target.id) {
                case 'thin':
                    ht = '<li><div class="hr thin"></div></li>';
                    ul.append(ht);
                    break;
                case 'middle':
                    ht = '<li><div class="hr middle"></div></li>';
                    ul.append(ht);
                    break;
                case 'thick':
                    ht = '<li><div class="hr thick"></div></li>';
                    ul.append(ht);
                    break;
            }
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
                    this.lineXY.removeClass('hidden');
                    this.lineX.css('top', +ui.size.height + xx);
                    this.lineY.css('left', +ui.size.width + yy);
                },
                stop: function() {
                    this.lineXY.addClass('hidden');
                }
            });
        },
        // 切换纸张
        changepaper: function(e) {
            var txt = this.txt;
            var cus = this.cus;
            var mmToPx = this.mmToPx;
            var pap = this.pap;
            var target = $(e.target);
            txt.text(target.text());
            switch (e.target.id) {
                // 切换纸张
                case 'a4':
                    pap.css({
                        width: 210 * mmToPx + 'px',
                        height: 297 * mmToPx + 'px'
                    });
                    cus.addClass('hidden');
                    break;
                case 'b5':
                    pap.css({
                        width: 176 * mmToPx + 'px',
                        height: 250 * mmToPx + 'px'
                    });
                    cus.addClass('hidden');
                    break;
                case '16k':
                    pap.css({
                        width: 184 * mmToPx + 'px',
                        height: 260 * mmToPx + 'px'
                    });
                    cus.addClass('hidden');
                    break;
                case 'cus':
                    cus.removeClass('hidden');
                    break;
            }
            this.calLi();
        },
        // 自定义纸张
        cusGo: function() {
            var pap = this.pap;
            var width = +this.paperCusw[0].value;
            var height = +this.paperCush[0].value;
            if (width && height) { // 当宽高不为0时，才执行
                pap.css({
                    width: width * 3 + 'px',
                    height: height * 3 + 'px'
                });
                this.calLi();
            }
        },
        toHtml: function() {
            var posObj = this.posObj;
            var mmToPx = this.mmToPx;
            var htmlCon = _.map(posObj, 'outerHTML').join('');
            var hid = this.hid;
            var hrs = this.hrs;
            var hrsHtml = '';
            hid.append(htmlCon).find('span').remove('.input'); // 移除class为input的元素
            htmlCon = hid.html();
            // 把分割线写入到html中
            for (var i = 0; i < hrs.length; i++) {
                if (hrs[i].offsetLeft > 260 && hrs[i].offsetTop > 40) {
                    hrsHtml = hrsHtml + '<div style="position: absolute;left:' + (hrs[i].offsetLeft - 260) / mmToPx + 'mm;top:' + (hrs[i].offsetTop - 40) / mmToPx +
                        'mm;width: ' + hrs[i].clientWidth / mmToPx + 'mm;border-top: ' + hrs[i].clientTop / mmToPx + 'mm solid #0f0f0f"></div>';
                }
            }
            htmlCon = htmlCon + hrsHtml;
            var htmlStyle = '<style>' + _.map(posObj, 'style').join('') + '</style>';
            this.showHtmlCls.removeClass('hidden');
            this.showHtmlId.text(htmlStyle + htmlCon);
            this.mainCon.addClass('hidden');
            $('body').addClass('back-c-b');
        },
        close: function() {
            this.showHtmlCls.addClass('hidden');
            this.mainCon.removeClass('hidden');
            $('body').removeClass('back-c-b');
        },
        calLi: function() {
            var pap = this.pap;
            var mmToPx = this.mmToPx;
            var width = parseInt(pap.css('width'));
            var height = parseInt(pap.css('height'));
            // 以5mm为一个刻度格
            var i = Math.round(width / mmToPx / 5) + 1;
            var hi = Math.round(height / mmToPx / 5) + 1;
            var li = '',
                nli = '',
                hli = '',
                nhli = '';
            for (var j = 0; j < i; j++) {
                li = '<li></li>' + li;
            }
            for (var k = 0; k < Math.round(i / 2) + 1; k++) {
                nli = nli + '<li>' + k * 10 + '</li>';
            }
            for (var m = 0; m < hi; m++) {
                hli = '<li></li>' + hli;
            }
            for (var n = 0; n < Math.round(hi / 2) + 1; n++) {
                nhli = nhli + '<li>' + n * 10 + '</li>';
            }
            this.rulerX.html(li);
            this.numX.html(nli);
            this.rulerY.html(hli);
            this.numY.html(nhli);
            this.centerY.css('left', width / 2 + 260 + 'px');
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
            var width = parseInt(pap.css('width'));
            var height = parseInt(pap.css('height'));
            return x > 260 && x < 260 + width && y > 40 && y < 40 + height;
        },
        initialization: function() {
            // 计算标尺参考线
            this.calLi();
            this.bindEvent(this.eventsMap);
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
        },
        bindEvent: function(maps) {
            this.initDrag();
            this.initResize();
            this.initializeOrdinaryEvents(maps);
        },
        unbindEvent: function(maps) {
            this.uninitDrag();
            this.uninitResize();
            this.uninitializeOrdinaryEvents(maps);
        },
        destroy: function() {
            this.unbindEvent();
        }
    };

    global.reportCustomApplication = reportCustomApplication;

    $(function() {
        new reportCustomApplication();
    });

})(this, this.jQuery, this._, document);
