class config {
    constructor(options){
        options = options || {};
        this.posObj = {};
        this.mmToPx = options.mmToPx || 3; // 定义mm换算为px的倍数为3
        this.xx = 0;
        this.yy = 0; // 定义鼠标位置
        this.eles = {
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
    }
}

export default config;
