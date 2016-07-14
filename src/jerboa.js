window.jerboa = (function () {

    var feedbackBoxOpen = false;
    var listeners = {};
    var currentStrategy;
    var additionalData;
    var openSpot;

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


    function emit(event, payload) {
        if (listeners[event]) {
            listeners[event].forEach(function (l) { l(payload); });
        }
    }


    function getRelativeOffset(target, container) {
        if (target === container) {
            return [0,0];
        } else {
            var o = getRelativeOffset(target.parentElement, container);
            return [target.offsetLeft + o[0], target.offsetTop + o[1]];
        }
    }


    function getGlobalOffset(element) {
        return getRelativeOffset(element, document.body);
    }


    function resolveContainer(elem, strategy) {
        if (strategy(elem)) {
            return elem;
        } else if (elem.tagName === 'HTML') {
            return null;
        } else {
            return resolveContainer(elem.parentElement, strategy);
        }
    }


    function placeMarker(payload) {
        var container = document.querySelector(payload.container);
        var offset = getGlobalOffset(container);
        var left = offset[0] + payload.offset[0];
        var top = offset[1] + payload.offset[1];

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

    function addAnnotateDialog(payload) {
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

        var container = resolveContainer(event.target, currentStrategy);
        if (!container) {
            return;
        }
        var selector = getSelector(event.target);
        var containerSelector = getSelector(container);
        var offset = getRelativeOffset(event.target, container);
        offset[0] += event.offsetX;
        offset[1] += event.offsetY;

        var positionObject = {
            target: selector,
            container: containerSelector,
            offset: offset,
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
        addAnnotateDialog(payload);
    }

    var strategies = {
        global: function (e) {
            this.name = 'global';
            return e.tagName === 'BODY';
        },
        byClass: function (className) {
            return function (e) {
                this.name = 'byClass:' + className;
                return e.classList.contains(className);
            }
        }
    };


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
            if (options.strategy) {
                currentStrategy = options.strategy;
            } else {
                currentStrategy = strategies.global;
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
        },
        strategies: strategies
    };
})();