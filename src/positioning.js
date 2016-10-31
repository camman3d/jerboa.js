/*
 Positioning Related Methods
 ---------------------------
 */

export function getSelector(e, child) {
    if (e.tagName === 'BODY') {
        return 'body' + (child ? " > " + child : "");
    }
    if (e.id) {
        return "#" + e.id + (child ? " > " + child : "");
    } else {
        var index = Array.prototype.slice.call(e.parentElement.children).indexOf(e);
        var s = e.tagName.toLowerCase() + ":nth-child(" + (index + 1) + ")" + (child ? " > " + child : "");
        return getSelector(e.parentElement, s);
    }
}

export function getRelativeOffset(target, container) {
    var offset = getGlobalOffset(target);
    var cOffset = getGlobalOffset(container);
    return [offset[0] - cOffset[0], offset[1] - cOffset[1]];
}

export function getGlobalOffset(element) {
    const position = element.getBoundingClientRect();
    const left = position.left;
    const top = position.top;
    console.log(1, left, 2, top, 3, element.offsetLeft, 4, element.offsetTop);
    return [left, top];
    // return [element.offsetLeft, element.offsetTop];
}

export function resolveContainer(elem, strategy) {
    console.log('elem', elem);
    console.log('strategy', strategy);
    console.log('strategy(elem)', strategy(elem));
    if (strategy(elem)) {
        return elem;
    } else if (elem.tagName === 'HTML') {
        return null;
    } else {
        return resolveContainer(elem.parentElement, strategy);
    }
}