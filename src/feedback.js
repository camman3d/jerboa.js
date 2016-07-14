function getSelector(e, child) {
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

function placeMarker(pos) {
    window.feedbackBoxOpen = true;
    var left = pos.rect.left + pos.offsetX;
    var top = pos.rect.top + pos.offsetY;

    var e = document.createElement('div');
    e.classList.add('feedback-spot');
    e.style.top = top + 'px';
    e.style.left = left + 'px';
    document.body.appendChild(e);

    var b = document.createElement('div');
    b.classList.add('feedback-box');
    b.addEventListener('click', function (event) {
        event.stopPropagation();
    });
    e.appendChild(b);
    b.appendChild(document.createElement('textarea'));

    var b1 = document.createElement('button');
    b1.classList.add('cancel-button');
    b1.innerText = 'Cancel';
    b1.addEventListener('click', function () {
        window.feedbackBoxOpen = false;
        document.body.removeChild(e);
    });
    b.appendChild(b1);

    var b2 = document.createElement('button');
    b2.classList.add('save-button');
    b2.innerText = 'Save';
    b2.addEventListener('click', function () {
        e.removeChild(b);
        window.feedbackBoxOpen = false;
        saveMarker(pos);
    });
    b.appendChild(b2);
}

function saveMarker(pos) {
    console.log(pos);
}

window.feedbackBoxOpen = false;
document.addEventListener('click', function (event) {
    if (window.feedbackBoxOpen) {
        return;
    }
    var positionObject = {
        selector: getSelector(event.target),
        offsetX: event.offsetX,
        offsetY: event.offsetY,
        rect: event.target.getBoundingClientRect(),
        windowSize: {
            width: window.innerWidth,
            height: window.innerHeight
        }
    };
    placeMarker(positionObject);
});