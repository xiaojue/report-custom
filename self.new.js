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
            'click .change-paper a': 'changepaper',
            'click #cusGo': 'cusGo',
            'click #toHtml': 'toHtml',
            'click #close': 'close'
        };
        this.initialization();
    };

    reportCustomApplication.Eles = {
        pap: $('.paper'),
        centerY: $('.center-y')
    };

    reportCustomApplication.prototype = {
        constructor: reportCustomApplication,
        _dragStart: function(e, ui) {
            var centerY = this.centerY;
            // 当拖拽的对象为标题或者副标题的时候才会有中间对齐辅助线
            if (e.target.id == 'titleDrag' || e.target.id == 'subtitleDrag') {
                // 动态调整标题对齐框的大小，因为没法按中间线对齐，所以引入一个box
                $('.center-box').removeClass('hidden').css({
                    width: ui.helper.width(),
                    left: parseInt(centerY.css('left')) - Math.floor(ui.helper.width() / 2)
                });
            } else {
                $('.center-box').addClass('hidden');
            }
        },
        _dragStop: function(event, ui) {
            var pap = this.pap,
                mmToPx = this.mmToPx,
                posObj = this.posObj,
                target = event.target;
            //当停止在paper范围时执行
            if (this.paperRange(ui.offset.top, ui.offset.left)) {
                posObj[event.target.id] = {
                    id: event.target.id,
                    outerHTML: this.delStyle(event.target.outerHTML),
                    style: '#' + event.target.id + '{position: absolute;left:' + (ui.offset.left - 260) / mmToPx + 'mm;top:' + (ui.offset.top - 40) / mmToPx + 'mm;}'
                };
                if (event.target.id == 'imgDescI' || event.target.id == 'diagDescI') {
                    var wi = parseInt($(target).find('.input-resize').css('width'));
                    var he = parseInt($(target).find('.input-resize').css('height'));
                    posObj[event.target.id].style = '#' + event.target.id + '{position: absolute;left:' +
                        (ui.offset.left - 260) / mmToPx + 'mm;top:' + (ui.offset.top - 40) / mmToPx + 'mm;width:' + wi / mmToPx + 'mm;height:' + he / mmToPx + 'mm}';
                }
                // 拖拽停止之后画出参考线
                $(target).next().removeClass('hidden');
                $(target).next().find('.line-left').css({
                    top: 40,
                    left: ui.offset.left,
                    height: pap.css('height'),
                    width: parseInt(pap.css('width')) - ui.offset.left + 260 + 'px'
                });
                $(target).next().find('.line-top').css({
                    left: 260,
                    top: ui.offset.top,
                    width: pap.css('width'),
                    height: parseInt(pap.css('height')) - ui.offset.top + 40 + 'px'
                });
            } else { // 如果停止的时候不在paper范围内，则隐藏参考线
                $(target).next().addClass('hidden');
            }
            $('.line-x, .line-y').addClass('hidden'); // 隐藏鼠标十字线
        },
        _dragging: function(e, ui) {
            var xx = this.xx,
                yy = this.yy;
            if (e.target.id == 'titleDrag' || e.target.id == 'subtitleDrag') { // 如果是标题把鼠标十字线挪到中间位置
                xx = ui.offset.top + Math.floor(ui.helper.height() / 2);
                yy = ui.offset.left + Math.floor(ui.helper.width() / 2);
            } else {
                xx = ui.offset.top;
                yy = ui.offset.left;
            }
            // 移到paper范围时显示鼠标十字线
            if (this.paperRange(xx, yy)) {
                $('.line-x').removeClass('hidden').css('top', xx);
                $('.line-y').removeClass('hidden').css('left', yy);
            } else {
                $('.line-x, .line-y').addClass('hidden'); // 隐藏鼠标十字线
            }
        },
        _resizing: function(event, ui) {
            var target = event.target;
            $('.line-x').removeClass('hidden').css('top', +ui.size.height + $(target).offset().top);
            $('.line-y').removeClass('hidden').css('left', +ui.size.width + $(target).offset().left);
        },
        _resizeStop: function(event, ui) {
            var mmToPx = this.mmToPx,
                posObj = this.posObj,
                target = event.target;
            $('.line-x').addClass('hidden');
            $('.line-y').addClass('hidden');
            event = $(target).parent()[0];
            posObj[event.id].style = '#' + event.id + '{position: absolute;left:' +
                ($(target).offset().left - 260) / mmToPx + 'mm;top:' + ($(target).offset().top - 40) / mmToPx + 'mm;width:' + ui.size.width / mmToPx + 'mm;height:' + ui.size.height / mmToPx + 'mm}';
        },
        titledblclick: function(e) {
            var target = e.target;
            $(target).toggleClass('hidden');
            $(target).next('.input').toggleClass('hidden');
        },
        inputdbclick: function(e) {
            var target = e.target;
            $(target).parent('.input').prev()[0].innerHTML = $(target)[0].value;
            $(target).parent('.input').prev().css('font-size', $(target).css('font-size'));
            $(target).parent('.input').toggleClass('hidden');
            $(target).parent('.input').prev().toggleClass('hidden');
        },
        // 点击增加和减小按钮时，控制字体变化
        changeFontSize: function(e) {
            var target = e.target;
            var afontSize = parseInt($(target).parent('.input').find('input').css('font-size'));
            if ($(target)[0].className == 'glyphicon glyphicon-plus-sign') {
                afontSize = parseInt(afontSize) + 1 + 'px';
            } else {
                afontSize = parseInt(afontSize) - 1 + 'px';
            }
            $(target).parent('.input').find('input').css('font-size', afontSize);
        },
        // 生成分割线
        makehr: function(e) {
            var ul = $('.left-widget ul');
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
            $(".hr").resizable({
                handles: 'e',
                minHeight: 1,
                resize: function(event, ui) {
                    $('.line-x').removeClass('hidden').css('top', +ui.size.height + xx);
                    $('.line-y').removeClass('hidden').css('left', +ui.size.width + yy);
                },
                stop: function() {
                    $('.line-x').addClass('hidden');
                    $('.line-y').addClass('hidden');
                }
            });
        },
        // 切换纸张
        changepaper: function(e) {
            var txt = $('.input-group-btn button');
            var cus = $('#paper-type-cus');
            var mmToPx = this.mmToPx;
            var pap = this.pap;
            txt[0].textContent = e.target.textContent;
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
            var width = +$('#paper-cus-width')[0].value;
            var height = +$('#paper-cus-height')[0].value;
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
            var hid = $('#hidden');
            var hrs = $('.hr');
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
            $('.showHtml').removeClass('hidden');
            $('#showHtml').text(htmlStyle + htmlCon);
            $('#mainCon').addClass('hidden');
            $('body').addClass('back-c-b');
        },
        close: function() {
            $('.showHtml').addClass('hidden');
            $('#mainCon').removeClass('hidden');
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
            $('.ruler-x')[0].innerHTML = li;
            $('.num-x')[0].innerHTML = nli;
            $('.ruler-y')[0].innerHTML = hli;
            $('.num-y')[0].innerHTML = nhli;
            $('.center-y').css('left', width / 2 + 260 + 'px');
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
                    bind(matchs[1], matchs[2], this[maps[keys]].bind(this));
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
            $(".left-widget div").draggable({
                snap: ".center-box,.line-left,.line-top",
                snapMode: "inner",
                snapTolerance: 15,
                start: self._dragStart.bind(self),
                drag: self._dragging.bind(self),
                stop: self._dragStop.bind(self),
                zIndex: 100
            });
        },
        initResize: function() {
            var self = this;
            // 自定义文本输入框大小
            $('.input-resize').resizable({
                resize: self._resizing,
                stop: self._resizeStop
            });
        },
        uninitDrag: function() {
            $(".left-widget div").draggable('destroy');
        },
        uninitResize: function() {
            $('.input-resize').resizable('destroy');
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

    $(function(){
        new reportCustomApplication(); 
    });

})(this, this.jQuery, this._,  this.jQuery(document));
