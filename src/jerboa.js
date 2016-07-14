window.jerboa = (function () {
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

    var feedbackBoxOpen = false;
    var listeners = {};
    var additionalData;
    var openSpot;

    function emit(event, payload) {
        if (listeners[event]) {
            listeners[event].forEach(function (l) { l(payload); });
        }
    }

    function placeMarker(pos) {
        var left = pos.rect.left + pos.offsetX;
        var top = pos.rect.top + pos.offsetY;

        var spot = document.createElement('div');
        spot.classList.add('feedback-spot');
        spot.style.top = top + 'px';
        spot.style.left = left + 'px';
        document.body.appendChild(spot);

        return spot;
    }

    function placeInfoBox(spot, payload) {
        spot.addEventListener('click', function (event) {
            event.stopPropagation();
            spot.classList.toggle('active');
            if (openSpot !== spot) {
                closeInfoBox();
            }
            openSpot = (openSpot === spot) ? null : spot;
        });

        var box = document.createElement('div');
        box.classList.add('feedback-box', 'toggled');
        spot.appendChild(box);

        var text = document.createElement('p');
        text.textContent = payload.text;
        box.appendChild(text);
    }

    function closeInfoBox() {
        if (openSpot) {
            openSpot.classList.remove('active');
            openSpot = null;
        }
    }

    function preAnnotate(payload) {
        var spot = placeMarker(payload.position);

        feedbackBoxOpen = true;
        var box = document.createElement('div');
        box.classList.add('feedback-box');
        box.addEventListener('click', function (event) {
            event.stopPropagation();
        });
        spot.appendChild(box);

        var textarea = document.createElement('textarea');
        box.appendChild(textarea);

        var buttonHolder = document.createElement('div');
        buttonHolder.classList.add('button-holder');
        box.appendChild(buttonHolder);

        var button1 = document.createElement('button');
        button1.classList.add('cancel-button');
        button1.innerText = 'Cancel';
        button1.addEventListener('click', function () {
            emit('cancel', payload);
            feedbackBoxOpen = false;
            document.body.removeChild(spot);
        });
        buttonHolder.appendChild(button1);

        var button2 = document.createElement('button');
        button2.classList.add('save-button');
        button2.innerText = 'Save';
        button2.addEventListener('click', function () {
            payload.text = textarea.value;
            emit('save', payload);
            spot.removeChild(box);
            feedbackBoxOpen = false;
            placeInfoBox(spot, payload);
        });
        buttonHolder.appendChild(button2);
    }

    function clickListener(event) {
        closeInfoBox();
        if (feedbackBoxOpen) {
            return;
        }
        var rect = event.target.getBoundingClientRect();
        var positionObject = {
            selector: getSelector(event.target),
            offsetX: event.offsetX,
            offsetY: event.offsetY,
            rect: { // Copy over the rect so we're dealing with a vanilla object, not a ClientRect
                top: rect.top,
                left: rect.left,
                bottom: rect.bottom,
                right: rect.right,
                width: rect.width,
                height: rect.height
            },
            windowSize: {
                width: window.innerWidth,
                height: window.innerHeight
            }
        };
        var payload = {
            datetime: new Date().toISOString(),
            position: positionObject,
            url: window.location.href,
            data: additionalData
        };
        emit('preAnnotate', payload);
        preAnnotate(payload);
    }

    return {
        init: function (options) {
            options = options || {};
            if (options.data) {
                additionalData = options.data;
            }
            if (options.points) {
                options.points.forEach(function (point) {
                    var spot = placeMarker(point.position);
                    placeInfoBox(spot, point);
                });
            }
            document.addEventListener('click', clickListener);
        },
        cleanup: function () {
            document.removeEventListener('click', clickListener);
        },
        addEventListener: function (event, handler) {
            if (!listeners[event]) {
                listeners[event] = [];
            }
            listeners[event].push(handler);
        }
    };
})();