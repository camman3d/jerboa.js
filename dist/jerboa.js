/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _jerboa = __webpack_require__(1);

	var _jerboa2 = _interopRequireDefault(_jerboa);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	window.jerboa = _jerboa2.default;

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	var _positioning = __webpack_require__(2);

	var _events = __webpack_require__(3);

	var _htmlManip = __webpack_require__(4);

	var _state = __webpack_require__(5);

	var _state2 = _interopRequireDefault(_state);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	/*
	    Annotating Functionality Methods
	    --------------------------------
	 */

	function generatePayload(event) {
	    var container = (0, _positioning.resolveContainer)(event.target, _state2.default.currentStrategy);
	    if (!container) {
	        return;
	    }
	    var selector = (0, _positioning.getSelector)(event.target);
	    var containerSelector = (0, _positioning.getSelector)(container);
	    var offset = (0, _positioning.getRelativeOffset)(event.target, container);
	    offset[0] += event.offsetX;
	    offset[1] += event.offsetY;
	    var rect = container.getBoundingClientRect();

	    var positionObject = {
	        positioning: _state2.default.currentPositioning,
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
	        data: _state2.default.additionalData,
	        user: _state2.default.currentUser,
	        replies: []
	    };
	}

	function clickListener(event) {
	    (0, _htmlManip.closeInfoBox)();
	    if (_state2.default.feedbackBoxOpen) {
	        return;
	    }

	    var payload = generatePayload(event);
	    if (!payload) {
	        return;
	    }
	    (0, _events.emit)('preAnnotate', payload);

	    _state2.default.feedbackBoxOpen = true;
	    var spot = (0, _htmlManip.createMarker)(payload);
	    var boxParts = (0, _htmlManip.addBox)(spot, false);
	    var parts = (0, _htmlManip.addTextField)(boxParts.container, 'Enter message:');

	    parts.cancel.addEventListener('click', function () {
	        (0, _events.emit)('cancel', payload);
	        _state2.default.feedbackBoxOpen = false;
	        document.body.removeChild(spot);
	    });

	    parts.save.addEventListener('click', function () {
	        payload.text = parts.textarea.value;
	        (0, _events.emit)('save', payload);
	        _state2.default.feedbackBoxOpen = false;
	        spot.removeChild(boxParts.box);
	        (0, _htmlManip.createInfoBox)(spot, payload);
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

	exports.default = {
	    init: function init(options) {
	        options = options || {};
	        if (options.data) {
	            _state2.default.additionalData = options.data;
	        }
	        if (options.points) {
	            options.points.forEach(function (point) {
	                var spot = (0, _htmlManip.createMarker)(point);
	                (0, _htmlManip.createInfoBox)(spot, point);
	            });
	        }
	        _state2.default.currentStrategy = options.strategy || strategies.global;
	        _state2.default.currentPositioning = options.positioning || 'percent';
	        _state2.default.currentUser = options.user;

	        document.addEventListener('click', clickListener);
	    },
	    close: function close() {
	        document.removeEventListener('click', clickListener);
	    },


	    addEventListener: _events.addEventListener,
	    strategies: strategies
	};

/***/ },
/* 2 */
/***/ function(module, exports) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.getSelector = getSelector;
	exports.getRelativeOffset = getRelativeOffset;
	exports.getGlobalOffset = getGlobalOffset;
	exports.resolveContainer = resolveContainer;
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

/***/ },
/* 3 */
/***/ function(module, exports) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.emit = emit;
	exports.addEventListener = addEventListener;
	/*
	 Event Methods
	 ---------------------------
	 */

	var listeners = {};

	function emit(event, payload) {
	    if (listeners[event]) {
	        listeners[event].forEach(function (l) {
	            return l(payload);
	        });
	    }
	}

	function addEventListener(event, handler) {
	    if (!listeners[event]) {
	        listeners[event] = [];
	    }
	    listeners[event].push(handler);
	}

/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.createMarker = createMarker;
	exports.addBox = addBox;
	exports.closeInfoBox = closeInfoBox;
	exports.addText = addText;
	exports.addTextField = addTextField;
	exports.createInfoBox = createInfoBox;

	var _positioning = __webpack_require__(2);

	var _events = __webpack_require__(3);

	var _state = __webpack_require__(5);

	var _state2 = _interopRequireDefault(_state);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	/*
	 HTML Manipulation Methods
	 -------------------------
	 */

	var openSpot = void 0;

	function createMarker(payload) {
	    var pos = payload.position;
	    var container = document.querySelector(pos.container);
	    var offset = (0, _positioning.getGlobalOffset)(container);
	    var spot = document.createElement('div');
	    var left = void 0,
	        top = void 0;
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

	function closeInfoBox() {
	    if (openSpot) {
	        openSpot.classList.remove('active');
	        openSpot = null;
	    }
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
	            user: _state2.default.currentUser,
	            text: parts.textarea.value
	        };
	        parts.textarea.value = '';
	        (0, _events.emit)('cancelReply', reply);
	        closeInfoBox();
	    });

	    parts.save.addEventListener('click', function () {
	        var reply = {
	            datetime: new Date().toISOString(),
	            user: _state2.default.currentUser,
	            text: parts.textarea.value
	        };
	        parts.textarea.value = '';
	        payload.replies.push(reply);
	        (0, _events.emit)('saveReply', payload);

	        boxParts.container.removeChild(parts.container);
	        addText(boxParts.container, reply);
	        boxParts.container.appendChild(parts.container);
	    });
	}

/***/ },
/* 5 */
/***/ function(module, exports) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.default = {
	    currentStrategy: undefined,
	    currentUser: undefined,
	    currentPositioning: undefined,
	    additionalData: undefined,
	    feedbackBoxOpen: false
	};

/***/ }
/******/ ]);