import $ from 'jQuery';

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
    hide: function(ele) {
        $(ele).addClass('hidden');
    },
    show: function(ele) {
        $(ele).removeClass('hidden');
    },
    toggle: function(ele) {
        return $(ele).toggleClass('hidden');
    },
    delStyle:function(con) {
        var styleStart = con.indexOf('class');
        var styleEnd = con.indexOf('px;"', styleStart) + 4;
        return con.substring(0, styleStart) + con.substring(styleEnd);
    }
};

export default utils;
