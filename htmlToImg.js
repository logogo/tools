/* eslint-disable no-undef */
/**
 * [saveImg description]
 *
 * @param   {[dom|object]}  el  [el description]
 * @param   {[function]}  cb  [cb description]
 *
 * @return  {[null]}      [return null]
 */
function saveImg(el, cb) {
    // 异常判断
    // 判断是否存在htmltocanvas
    if (typeof html2canvas === 'undefined') {
        console.error(new Error(`html2canvas is undefined`));
        return;
    }
    let dom = el;
    if (!el.nodeName) {
        dom = el.el;
    }
    const box = window.getComputedStyle(dom);  // 获取到的节点都是计算后的值
    // DOM 节点计算后宽高
    const width = parseValue(box.width);
    const height = parseValue(box.height);
    var cloneDom = dom.cloneNode(true);
    // console.log(height);
    // 删除不必要节点
    if(el.removeClass){
        el.removeClass.forEach((c) => {
            cloneDom.querySelector(`${c}`).style.display='none';
        })
    }
    // cloneDom.querySelector('.user-sex icon-nan').style.top = '-0.08rem';
    // cloneDom.querySelector('.user-level span').style.top = '-0.08rem';
    var obj = {
        'background-color': 'transparent',
        'position': 'absolute',
        'top': '0px',
        'width': width + 'px',
        'z-index': -1,
        'height': height + 'px'
    };
    for (var key in obj) {
        cloneDom.style[key] = obj[key];
    }
    // 将克隆节点动态追加到body后面。
    document.body.appendChild(cloneDom);
    // 获取像素比
    const scaleBy = DPR();
    // 创建自定义 canvas 元素，设置高清图片
    const canvas = document.createElement('canvas');
    canvas.width = width * scaleBy;
    canvas.height = height * scaleBy;
    // 设定 canvas css宽高为 DOM 节点宽高
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    // 获取画笔
    const context = canvas.getContext('2d');
    context.scale(scaleBy, scaleBy);
    // context.translate(-20, -10);

    html2canvas(cloneDom, {
        canvas,
        backgroundColor: 'transparent',
        useCORS: true
    }).then(function(canvas) {
    // 获取图片的base64
        var toDataURL = canvas.toDataURL('image/png',1.0);

        console.log('toDataURL', toDataURL)
    });
}
// 四舍五入及计算数值
function parseValue(value) {
    return parseInt(value, 10);
}
// 获取像素比
function DPR() {
    if (window.devicePixelRatio && window.devicePixelRatio > 1) {
        return window.devicePixelRatio;
    }
    return 1;
}

export default saveImg;
