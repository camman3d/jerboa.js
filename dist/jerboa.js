'use strict';

window.jerboa = function () {

    var feedbackBoxOpen = false;
    var listeners = {};
    var currentStrategy = void 0;
    var currentPositioning = void 0;
    var currentUser = void 0;
    var additionalData = void 0;
    var openSpot = void 0;

    /*
        Positioning Related Methods
        ---------------------------
     */

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
            listeners[event].forEach(function (l) {
                return l(payload);
            });
        }
    }

    function getRelativeOffset(target, container) {
        var offset = getGlobalOffset(target);
        var cOffset = getGlobalOffset(container);
        return [offset[0] - cOffset[0], offset[1] - cOffset[1]];
    }

    function getGlobalOffset(element) {
        return [element.offsetLeft, element.offsetTop];
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

    /*
        HTML Manipulation Methods
        -------------------------
     */

    function createMarker(payload) {
        var pos = payload.position;
        var container = document.querySelector(pos.container);
        var offset = getGlobalOffset(container);
        var spot = document.createElement('div');
        var left, top;
        spot.classList.add('feedback-spot');

        if (pos.positioning === 'pixel') {
            left = offset[0] + pos.offset[0];
            top = offset[1] + pos.offset[1];
        } else if (pos.positioning === 'percent') {
            var percentX = pos.offset[0] / pos.containerSize.width;
            var percentY = pos.offset[1] / pos.containerSize.height;
            var rect = container.getBoundingClientRect();
            left = offset[0] + rect.width * percentX;
            top = offset[1] + rect.height * percentY;
        }
        spot.style.top = top + 'px';
        spot.style.left = left + 'px';

        document.body.appendChild(spot);
        return spot;
    }

    function addBox(spot, toggled) {
        spot.addEventListener('click', function (event) {
            event.stopPropagation();

            if (toggled) {
                spot.classList.toggle('active');
                if (openSpot !== spot) {
                    closeInfoBox();
                    openSpot = spot;
                } else {
                    openSpot = null;
                }
            }
        });

        var box = document.createElement('div');
        box.classList.add('feedback-box');
        if (toggled) {
            box.classList.add('toggled');
        }
        box.addEventListener('click', function (event) {
            event.stopPropagation();
        });
        spot.appendChild(box);

        var container = document.createElement('div');
        container.classList.add('feedback-container');
        box.appendChild(container);

        return { box: box, container: container };
    }

    function addText(container, payload) {
        var text = document.createElement('div');
        text.classList.add('feedback-text');
        text.textContent = payload.text;
        container.appendChild(text);

        var info = document.createElement('div');
        info.classList.add('feedback-info');
        var time = new Date(payload.datetime);
        info.textContent = 'By ' + (payload.user || 'unknown user') + ' at ' + time.toLocaleString();
        text.appendChild(info);
    }

    function addTextField(boxContainer, label) {
        var container = document.createElement('div');
        boxContainer.appendChild(container);

        var fieldLabel = document.createElement('label');
        fieldLabel.textContent = label;
        container.appendChild(fieldLabel);

        var textarea = document.createElement('textarea');
        container.appendChild(textarea);

        var buttonHolder = document.createElement('div');
        buttonHolder.classList.add('button-holder');
        container.appendChild(buttonHolder);

        var cancel = document.createElement('button');
        cancel.classList.add('cancel-button');
        cancel.innerText = 'Cancel';
        buttonHolder.appendChild(cancel);

        var save = document.createElement('button');
        save.classList.add('save-button');
        save.innerText = 'Save';
        buttonHolder.appendChild(save);

        return { cancel: cancel, save: save, textarea: textarea, container: container };
    }

    function createInfoBox(spot, payload) {
        var boxParts = addBox(spot, true);
        addText(boxParts.container, payload);
        payload.replies.forEach(function (reply) {
            addText(boxParts.container, reply);
        });

        var parts = addTextField(boxParts.container, 'Reply:');
        parts.cancel.addEventListener('click', function () {
            var reply = {
                datetime: new Date().toISOString(),
                user: currentUser,
                text: parts.textarea.value
            };
            parts.textarea.value = '';
            emit('cancelReply', reply);
            closeInfoBox();
        });

        parts.save.addEventListener('click', function () {
            var reply = {
                datetime: new Date().toISOString(),
                user: currentUser,
                text: parts.textarea.value
            };
            parts.textarea.value = '';
            payload.replies.push(reply);
            emit('saveReply', payload);

            boxParts.container.removeChild(parts.container);
            addText(boxParts.container, reply);
            boxParts.container.appendChild(parts.container);
        });
    }

    /*
        Annotating Functionality Methods
        --------------------------------
     */

    function closeInfoBox() {
        if (openSpot) {
            openSpot.classList.remove('active');
            openSpot = null;
        }
    }

    function generatePayload(event) {
        var container = resolveContainer(event.target, currentStrategy);
        if (!container) {
            return;
        }
        var selector = getSelector(event.target);
        var containerSelector = getSelector(container);
        var offset = getRelativeOffset(event.target, container);
        offset[0] += event.offsetX;
        offset[1] += event.offsetY;
        var rect = container.getBoundingClientRect();

        var positionObject = {
            positioning: currentPositioning,
            target: selector,
            container: containerSelector,
            containerSize: {
                width: rect.width,
                height: rect.height
            },
            windowSize: {
                width: window.innerWidth,
                height: window.innerHeight
            },
            offset: offset
        };
        return {
            datetime: new Date().toISOString(),
            position: positionObject,
            url: window.location.href,
            data: additionalData,
            user: currentUser,
            replies: []
        };
    }

    function clickListener(event) {
        closeInfoBox();
        if (feedbackBoxOpen) {
            return;
        }

        var payload = generatePayload(event);
        if (!payload) {
            return;
        }
        emit('preAnnotate', payload);

        feedbackBoxOpen = true;
        var spot = createMarker(payload);
        var boxParts = addBox(spot, false);
        var parts = addTextField(boxParts.container, 'Enter message:');

        parts.cancel.addEventListener('click', function () {
            emit('cancel', payload);
            feedbackBoxOpen = false;
            document.body.removeChild(spot);
        });

        parts.save.addEventListener('click', function () {
            payload.text = parts.textarea.value;
            emit('save', payload);
            feedbackBoxOpen = false;
            spot.removeChild(boxParts.box);
            createInfoBox(spot, payload);
        });
    }

    var strategies = {
        global: function global(e) {
            return e.tagName === 'BODY';
        },
        byClass: function byClass(className) {
            return function (e) {
                return e.classList.contains(className);
            };
        }
    };

    /*
        Return object
        -------------
     */

    return {
        init: function init(options) {
            options = options || {};
            if (options.data) {
                additionalData = options.data;
            }
            if (options.points) {
                options.points.forEach(function (point) {
                    var spot = createMarker(point);
                    createInfoBox(spot, point);
                });
            }
            currentStrategy = options.strategy || strategies.global;
            currentPositioning = options.positioning || 'pixel';
            currentUser = options.user;

            document.addEventListener('click', clickListener);
        },
        close: function close() {
            document.removeEventListener('click', clickListener);
        },
        addEventListener: function addEventListener(event, handler) {
            if (!listeners[event]) {
                listeners[event] = [];
            }
            listeners[event].push(handler);
        },


        strategies: strategies
    };
}();