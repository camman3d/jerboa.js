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

	var _blueimpMd = __webpack_require__(6);

	var _blueimpMd2 = _interopRequireDefault(_blueimpMd);

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
	    offset['x'] += event.offsetX;
	    offset['y'] += event.offsetY;
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
	        time: new Date().toISOString(),
	        position: positionObject,
	        url: _state2.default.url,
	        data: _state2.default.additionalData,
	        user: _state2.default.currentUser,
	        userId: _state2.default.currentUserId,
	        pageId: _state2.default.pageId,
	        comments: []
	    };
	}

	function clickListener(event) {
	    if (!_state2.default.active) {
	        return;
	    }
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
	    var parts = (0, _htmlManip.addTextField)(boxParts.container, 'Enter comment:');

	    parts.cancel.addEventListener('click', function () {
	        (0, _events.emit)('cancel', payload);
	        _state2.default.feedbackBoxOpen = false;
	        document.body.removeChild(spot);
	    });

	    parts.save.addEventListener('click', function () {
	        // payload.comments = [
	        //     {
	        //         text: parts.textarea.value,
	        //         user: state.currentUser,
	        //         time: new Date().toISOString(),
	        //         replies: []
	        //     }
	        // ];
	        if (parts.textarea.value) {
	            payload.text = parts.textarea.value;
	            (0, _events.emit)('save', payload);
	            _state2.default.feedbackBoxOpen = false;
	            spot.removeChild(boxParts.box);
	            (0, _htmlManip.createInfoBox)(spot, payload);
	        } else {
	            (0, _events.emit)('cancel', payload);
	            _state2.default.feedbackBoxOpen = false;
	            document.body.removeChild(spot);
	        }
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
	    Create Toggle Button
	    -------------
	 */

	function createToggleButton() {
	    var bottom = '25px';
	    var left = '25px';

	    var buttonContainer = document.createElement('div');
	    buttonContainer.classList.add('toggle-button-container');

	    var buttonLabel = document.createElement('div');
	    buttonLabel.classList.add('toggle-button-text');
	    buttonLabel.textContent = 'Feedback On';
	    buttonContainer.appendChild(buttonLabel);

	    var buttonDiv = document.createElement('div');
	    buttonDiv.classList.add('toggle-button', 'toggle-button-selected');
	    buttonContainer.appendChild(buttonDiv);

	    var button = document.createElement('button');
	    buttonDiv.appendChild(button);

	    buttonContainer.style.bottom = bottom;
	    buttonContainer.style.left = left;
	    buttonContainer.style.position = 'fixed';

	    buttonDiv.addEventListener('click', function (event) {
	        event.preventDefault();
	        var feedbackSpots = document.getElementsByClassName('feedback-spot');
	        if (buttonDiv.classList.contains('toggle-button-selected')) {
	            buttonDiv.classList.remove('toggle-button-selected');
	            buttonLabel.textContent = 'Feedback Off';
	            _state2.default.active = false;
	            Array.prototype.forEach.call(feedbackSpots, function (feedbackSpotElement) {
	                feedbackSpotElement.classList.add('off');
	            });
	        } else {
	            buttonDiv.classList.add('toggle-button-selected');
	            buttonLabel.textContent = 'Feedback On';
	            _state2.default.active = true;
	            Array.prototype.forEach.call(feedbackSpots, function (feedbackSpotElement) {
	                feedbackSpotElement.classList.remove('off');
	            });
	        }
	    });

	    document.body.appendChild(buttonContainer);
	}

	/*
	    Return object
	    -------------
	 */

	exports.default = {
	    init: function init(options) {
	        options = options || {};
	        _state2.default.currentStrategy = options.strategy || strategies.global;
	        _state2.default.currentPositioning = options.positioning || 'PERCENT';
	        _state2.default.currentUser = options.currentUser;
	        _state2.default.currentUserId = options.currentUserId;
	        _state2.default.url = window.location.href;
	        _state2.default.pageId = (0, _blueimpMd2.default)(window.location.href);
	        if (options.data) {
	            _state2.default.additionalData = options.data;
	        }
	        if (options.points) {
	            options.points.forEach(function (point) {
	                var spot = (0, _htmlManip.createMarker)(point); //loads existing points
	                (0, _htmlManip.createInfoBox)(spot, point);
	            });
	        }

	        document.addEventListener('click', clickListener);
	        createToggleButton();
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
	    console.log('offset: ', offset, 'cOffset: ', cOffset);
	    return {
	        x: offset[0] - cOffset[0],
	        y: offset[1] - cOffset[1]
	    };
	    // return [offset[0] - cOffset[0], offset[1] - cOffset[1]];
	}

	function getGlobalOffset(element) {
	    var position = element.getBoundingClientRect();
	    var left = position.left + document.body.scrollLeft;
	    var top = position.top + document.body.scrollTop;
	    console.log(1, left, 2, top, 3, element.offsetLeft, 4, element.offsetTop);
	    return [left, top];
	}

	function resolveContainer(elem, strategy) {
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

	exports.__listeners = listeners;

/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.__getOpenSpot = __getOpenSpot;
	exports.__setOpenSpot = __setOpenSpot;
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

	// Methods for testing
	function __getOpenSpot() {
	    return openSpot;
	}

	function __setOpenSpot(spot) {
	    openSpot = spot;
	}

	function createMarker(payload) {
	    var pos = payload.position;
	    var container = document.querySelector(pos.container);
	    var offset = (0, _positioning.getGlobalOffset)(container);
	    var spot = document.createElement('div');
	    var left = void 0,
	        top = void 0;
	    spot.classList.add('feedback-spot');

	    if (pos.positioning === 'PIXEL') {
	        left = offset[0] + pos.offset['x'];
	        top = offset[1] + pos.offset['y'];
	    } else if (pos.positioning === 'PERCENT') {
	        var percentX = pos.offset['x'] / pos.containerSize.width;
	        var percentY = pos.offset['y'] / pos.containerSize.height;
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
	        if (!_state2.default.active) {
	            return;
	        }
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

	// addText function renders a an annotation or comment
	function addText(container, payload, className) {
	    var text = document.createElement('div');
	    text.classList.add('feedback-text');
	    if (className) {
	        text.classList.add(className);
	    }
	    container.appendChild(text);

	    var comment = document.createElement('div');
	    comment.classList.add('feedback-comment');
	    comment.textContent = payload.text;
	    text.appendChild(comment);

	    var info = document.createElement('div');
	    info.classList.add('feedback-info');
	    var time = new Date(payload.time);
	    info.textContent = 'By ' + (payload.user || _state2.default.currentUser || 'unknown user') + ' at ' + time.toLocaleString();
	    text.appendChild(info);

	    if (parseInt(payload.userId) === parseInt(_state2.default.currentUserId)) {
	        var deleteBtn = document.createElement('a');
	        deleteBtn.classList.add('delete-button');
	        deleteBtn.innerText = 'X';
	        deleteBtn.setAttribute('role', 'button');
	        deleteBtn.setAttribute('href', '#');
	        // don't render delete button for original annotation comment
	        if (!payload.hasOwnProperty('comments')) {
	            info.appendChild(deleteBtn);
	        };

	        var editBtn = document.createElement('a');
	        editBtn.classList.add('edit-button');
	        editBtn.innerText = 'Edit';
	        editBtn.setAttribute('role', 'button');
	        editBtn.setAttribute('href', '#');
	        info.appendChild(editBtn);

	        deleteBtn.addEventListener('click', function (e) {
	            e.preventDefault();
	            container.removeChild(text);
	            (0, _events.emit)('deleteComment', payload);
	        });

	        editBtn.addEventListener('click', function (e) {
	            e.preventDefault();
	            var editCommentTextField = addTextField(null, null, 'comment-textfield');
	            editCommentTextField.textarea.value = payload.text;

	            editCommentTextField.cancel.addEventListener('click', function () {
	                container.replaceChild(text, editCommentTextField.container);
	            });

	            editCommentTextField.save.addEventListener('click', function () {
	                // if content didn't change, just put back old comment (don't change)
	                if (payload.text === editCommentTextField.textarea.value) {
	                    container.replaceChild(text, editCommentTextField.container);
	                } else {
	                    // change content
	                    payload.text = editCommentTextField.textarea.value;
	                    text.children[0].textContent = payload.text;
	                    container.replaceChild(text, editCommentTextField.container);
	                    (0, _events.emit)('saveEdittedComment', payload);
	                }
	            });

	            container.replaceChild(editCommentTextField.container, text);
	            (0, _events.emit)('editComment');
	        });
	    }

	    // let replyBtn = document.createElement('a');
	    // replyBtn.classList.add('reply-button');
	    // replyBtn.innerText = 'Reply';
	    // replyBtn.setAttribute('role', 'button');
	    // replyBtn.setAttribute('href', '#');
	    // text.appendChild(replyBtn);

	    // // if there are replies, render them
	    // let repliesContainer = document.createElement('div');
	    // repliesContainer.classList.add('replies-container');
	    // text.appendChild(repliesContainer);

	    // if (payload.replies) {
	    //     payload.replies.forEach(reply => {
	    //         addReply(repliesContainer, reply);
	    //     });
	    // };

	    // replyBtn.addEventListener('click', (e) => {
	    //     e.preventDefault();
	    //     let parts;

	    //     // if the repliesContainer is empty or if the last element in the replies container contains the class 'reply-textfield'
	    //     if (repliesContainer && (!repliesContainer.lastElementChild || !repliesContainer.lastElementChild.classList.contains('reply-textfield'))) {
	    //         parts = addTextField(repliesContainer, 'Reply:', 'reply-textfield');

	    //         parts.cancel.addEventListener('click', () => {
	    //             const reply = generateReply(parts.textarea.value);
	    //             parts.textarea.value = '';
	    //             emit('cancelReply', reply);
	    //             closeInfoBox();
	    //         });

	    //         parts.save.addEventListener('click', () => {
	    //             const reply = generateReply(parts.textarea.value);
	    //             parts.textarea.value = '';
	    //             payload.replies.push(reply);
	    //             emit('saveReply', payload);

	    //             repliesContainer.removeChild(parts.container);
	    //             addReply(repliesContainer, reply);
	    //         });
	    //     }

	    // });

	    return text;
	}

	// export function addReply(container, payload) {
	//     let replyContainer = document.createElement('div');
	//     replyContainer.classList.add('reply-container');
	//     container.appendChild(replyContainer);

	//     let reply = document.createElement('div');
	//     reply.classList.add('feedback-reply');
	//     reply.textContent = payload.text;
	//     replyContainer.appendChild(reply);

	//     let info = document.createElement('div');
	//     info.classList.add('feedback-info');
	//     const time = new Date(payload.time);
	//     info.textContent = 'By ' + (payload.user || 'unknown user') + ' at ' + time.toLocaleString();
	//     // if the user is the creator of the comment, show the delete and edit
	//     if (payload.user === state.currentUser) {
	//         let deleteBtn = document.createElement('a');
	//         deleteBtn.classList.add('delete-button');
	//         deleteBtn.innerText = 'X';
	//         deleteBtn.setAttribute('role', 'button');
	//         deleteBtn.setAttribute('href', '#');
	//         info.appendChild(deleteBtn);

	//         let editBtn = document.createElement('a');
	//         editBtn.classList.add('edit-button');
	//         editBtn.innerText = 'Edit';
	//         editBtn.setAttribute('role', 'button');
	//         editBtn.setAttribute('href', '#');
	//         info.appendChild(editBtn);

	//         deleteBtn.addEventListener('click', (e) => {
	//             e.preventDefault();
	//             container.removeChild(replyContainer);
	//             emit('deleteReply');
	//         });

	//         editBtn.addEventListener('click', (e) => {
	//             e.preventDefault();
	//             emit('editReply');
	//         });
	//     }

	//     replyContainer.appendChild(info);

	//     return replyContainer;
	// }

	function addTextField(boxContainer, label, containerClass) {
	    var container = document.createElement('div');
	    if (containerClass) {
	        container.classList.add(containerClass);
	    };
	    if (boxContainer) {
	        boxContainer.appendChild(container);
	    };

	    if (label) {
	        var fieldLabel = document.createElement('label');
	        fieldLabel.textContent = label;
	        container.appendChild(fieldLabel);
	    };

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

	// const generateReply = text => ({
	//     time: new Date().toISOString(),
	//     user: state.currentUser,
	//     text
	// });

	var generateComment = function generateComment(text) {
	    return {
	        time: new Date().toISOString(),
	        user: _state2.default.currentUser,
	        userId: _state2.default.currentUserId,
	        text: text
	        // replies: []
	    };
	};

	function createInfoBox(spot, payload) {
	    function changeOuterColor(classList, className) {
	        classList.forEach(function (value, index) {
	            if (value.includes('owner-')) {
	                classList.remove(value);
	            }
	        });
	        classList.add(className);
	    }
	    function changeInnerColor(classList, className) {
	        classList.forEach(function (value, index) {
	            if (value.includes('status-')) {
	                classList.remove(value);
	            }
	        });
	        classList.add(className);
	    }

	    var boxParts = addBox(spot, true);
	    var ownerOptions = {
	        'PM': 'pm',
	        'Client': 'client',
	        'ID': 'id',
	        'IxD': 'ixd',
	        'Video': 'video'
	    };
	    var statusOptions = {
	        'Open': 'open',
	        'Closed': 'closed',
	        'No Action': 'no-action'
	    };

	    // add owner and status
	    var defaultOwner = 'pm';
	    var ownerSelect = document.createElement('select');
	    boxParts.container.appendChild(ownerSelect);
	    var ownerOptionsArr = Object.keys(ownerOptions);
	    for (var i = 0; i < ownerOptionsArr.length; i++) {
	        var option = document.createElement('option');
	        option.value = ownerOptions[ownerOptionsArr[i]];
	        option.text = ownerOptionsArr[i];
	        ownerSelect.appendChild(option);
	    }
	    if (payload.assigneeRole && payload.assigneeRole !== defaultOwner) {
	        ownerSelect.value = payload.assigneeRole;
	        changeOuterColor(spot.classList, 'owner-' + payload.assigneeRole);
	    } else {
	        ownerSelect.value = defaultOwner;
	    }
	    ownerSelect.addEventListener('change', function (e) {
	        payload.assigneeRole = e.target.value;
	        changeOuterColor(spot.classList, 'owner-' + payload.assigneeRole);
	        (0, _events.emit)('changeOwner', payload);
	    });

	    var defaultStatus = 'open';
	    var statusSelect = document.createElement('select');
	    boxParts.container.appendChild(statusSelect);
	    var statusOptionsArr = Object.keys(statusOptions);
	    for (var _i = 0; _i < statusOptionsArr.length; _i++) {
	        var _option = document.createElement('option');
	        _option.value = statusOptions[statusOptionsArr[_i]];
	        _option.text = statusOptionsArr[_i];
	        statusSelect.appendChild(_option);
	    }
	    if (payload.status && payload.status !== defaultStatus) {
	        statusSelect.value = payload.status;
	        changeInnerColor(spot.classList, 'status-' + payload.status);
	    } else {
	        statusSelect.value = defaultStatus;
	    }
	    statusSelect.addEventListener('change', function (e) {
	        payload.status = e.target.value;
	        changeInnerColor(spot.classList, 'status-' + payload.status);
	        (0, _events.emit)('changeStatus', payload);
	    });

	    // add each comment to container
	    addText(boxParts.container, payload); // first comment in root of payload
	    payload.comments.forEach(function (comment) {
	        addText(boxParts.container, comment, 'comment-reply');
	    });

	    var parts = addTextField(boxParts.container, 'Comment:', 'comment-textfield');
	    parts.cancel.addEventListener('click', function () {
	        var comment = generateComment(parts.textarea.value);
	        parts.textarea.value = '';
	        (0, _events.emit)('cancelComment', comment);
	        closeInfoBox();
	    });

	    parts.save.addEventListener('click', function () {

	        if (parts.textarea.value) {
	            var comment = generateComment(parts.textarea.value);
	            parts.textarea.value = '';
	            payload.comments.push(comment);
	            (0, _events.emit)('saveComment', payload);

	            boxParts.container.removeChild(parts.container);
	            addText(boxParts.container, comment, 'comment-reply');
	            boxParts.container.appendChild(parts.container);
	        } else {
	            var _comment = generateComment(parts.textarea.value);
	            parts.textarea.value = '';
	            (0, _events.emit)('cancelComment', _comment);
	            closeInfoBox();
	        }
	    });

	    return Object.assign({}, parts, boxParts);
	}

/***/ },
/* 5 */
/***/ function(module, exports) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.default = {
	    active: true,
	    currentStrategy: undefined,
	    currentUser: undefined,
	    currentUserId: undefined,
	    currentPositioning: undefined,
	    additionalData: undefined,
	    feedbackBoxOpen: false,
	    url: undefined,
	    pageId: undefined
	};

/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_RESULT__;/*
	 * JavaScript MD5
	 * https://github.com/blueimp/JavaScript-MD5
	 *
	 * Copyright 2011, Sebastian Tschan
	 * https://blueimp.net
	 *
	 * Licensed under the MIT license:
	 * http://www.opensource.org/licenses/MIT
	 *
	 * Based on
	 * A JavaScript implementation of the RSA Data Security, Inc. MD5 Message
	 * Digest Algorithm, as defined in RFC 1321.
	 * Version 2.2 Copyright (C) Paul Johnston 1999 - 2009
	 * Other contributors: Greg Holt, Andrew Kepert, Ydnar, Lostinet
	 * Distributed under the BSD License
	 * See http://pajhome.org.uk/crypt/md5 for more info.
	 */

	/*global unescape, define, module */

	;(function ($) {
	  'use strict'

	  /*
	  * Add integers, wrapping at 2^32. This uses 16-bit operations internally
	  * to work around bugs in some JS interpreters.
	  */
	  function safe_add (x, y) {
	    var lsw = (x & 0xFFFF) + (y & 0xFFFF)
	    var msw = (x >> 16) + (y >> 16) + (lsw >> 16)
	    return (msw << 16) | (lsw & 0xFFFF)
	  }

	  /*
	  * Bitwise rotate a 32-bit number to the left.
	  */
	  function bit_rol (num, cnt) {
	    return (num << cnt) | (num >>> (32 - cnt))
	  }

	  /*
	  * These functions implement the four basic operations the algorithm uses.
	  */
	  function md5_cmn (q, a, b, x, s, t) {
	    return safe_add(bit_rol(safe_add(safe_add(a, q), safe_add(x, t)), s), b)
	  }
	  function md5_ff (a, b, c, d, x, s, t) {
	    return md5_cmn((b & c) | ((~b) & d), a, b, x, s, t)
	  }
	  function md5_gg (a, b, c, d, x, s, t) {
	    return md5_cmn((b & d) | (c & (~d)), a, b, x, s, t)
	  }
	  function md5_hh (a, b, c, d, x, s, t) {
	    return md5_cmn(b ^ c ^ d, a, b, x, s, t)
	  }
	  function md5_ii (a, b, c, d, x, s, t) {
	    return md5_cmn(c ^ (b | (~d)), a, b, x, s, t)
	  }

	  /*
	  * Calculate the MD5 of an array of little-endian words, and a bit length.
	  */
	  function binl_md5 (x, len) {
	    /* append padding */
	    x[len >> 5] |= 0x80 << (len % 32)
	    x[(((len + 64) >>> 9) << 4) + 14] = len

	    var i
	    var olda
	    var oldb
	    var oldc
	    var oldd
	    var a = 1732584193
	    var b = -271733879
	    var c = -1732584194
	    var d = 271733878

	    for (i = 0; i < x.length; i += 16) {
	      olda = a
	      oldb = b
	      oldc = c
	      oldd = d

	      a = md5_ff(a, b, c, d, x[i], 7, -680876936)
	      d = md5_ff(d, a, b, c, x[i + 1], 12, -389564586)
	      c = md5_ff(c, d, a, b, x[i + 2], 17, 606105819)
	      b = md5_ff(b, c, d, a, x[i + 3], 22, -1044525330)
	      a = md5_ff(a, b, c, d, x[i + 4], 7, -176418897)
	      d = md5_ff(d, a, b, c, x[i + 5], 12, 1200080426)
	      c = md5_ff(c, d, a, b, x[i + 6], 17, -1473231341)
	      b = md5_ff(b, c, d, a, x[i + 7], 22, -45705983)
	      a = md5_ff(a, b, c, d, x[i + 8], 7, 1770035416)
	      d = md5_ff(d, a, b, c, x[i + 9], 12, -1958414417)
	      c = md5_ff(c, d, a, b, x[i + 10], 17, -42063)
	      b = md5_ff(b, c, d, a, x[i + 11], 22, -1990404162)
	      a = md5_ff(a, b, c, d, x[i + 12], 7, 1804603682)
	      d = md5_ff(d, a, b, c, x[i + 13], 12, -40341101)
	      c = md5_ff(c, d, a, b, x[i + 14], 17, -1502002290)
	      b = md5_ff(b, c, d, a, x[i + 15], 22, 1236535329)

	      a = md5_gg(a, b, c, d, x[i + 1], 5, -165796510)
	      d = md5_gg(d, a, b, c, x[i + 6], 9, -1069501632)
	      c = md5_gg(c, d, a, b, x[i + 11], 14, 643717713)
	      b = md5_gg(b, c, d, a, x[i], 20, -373897302)
	      a = md5_gg(a, b, c, d, x[i + 5], 5, -701558691)
	      d = md5_gg(d, a, b, c, x[i + 10], 9, 38016083)
	      c = md5_gg(c, d, a, b, x[i + 15], 14, -660478335)
	      b = md5_gg(b, c, d, a, x[i + 4], 20, -405537848)
	      a = md5_gg(a, b, c, d, x[i + 9], 5, 568446438)
	      d = md5_gg(d, a, b, c, x[i + 14], 9, -1019803690)
	      c = md5_gg(c, d, a, b, x[i + 3], 14, -187363961)
	      b = md5_gg(b, c, d, a, x[i + 8], 20, 1163531501)
	      a = md5_gg(a, b, c, d, x[i + 13], 5, -1444681467)
	      d = md5_gg(d, a, b, c, x[i + 2], 9, -51403784)
	      c = md5_gg(c, d, a, b, x[i + 7], 14, 1735328473)
	      b = md5_gg(b, c, d, a, x[i + 12], 20, -1926607734)

	      a = md5_hh(a, b, c, d, x[i + 5], 4, -378558)
	      d = md5_hh(d, a, b, c, x[i + 8], 11, -2022574463)
	      c = md5_hh(c, d, a, b, x[i + 11], 16, 1839030562)
	      b = md5_hh(b, c, d, a, x[i + 14], 23, -35309556)
	      a = md5_hh(a, b, c, d, x[i + 1], 4, -1530992060)
	      d = md5_hh(d, a, b, c, x[i + 4], 11, 1272893353)
	      c = md5_hh(c, d, a, b, x[i + 7], 16, -155497632)
	      b = md5_hh(b, c, d, a, x[i + 10], 23, -1094730640)
	      a = md5_hh(a, b, c, d, x[i + 13], 4, 681279174)
	      d = md5_hh(d, a, b, c, x[i], 11, -358537222)
	      c = md5_hh(c, d, a, b, x[i + 3], 16, -722521979)
	      b = md5_hh(b, c, d, a, x[i + 6], 23, 76029189)
	      a = md5_hh(a, b, c, d, x[i + 9], 4, -640364487)
	      d = md5_hh(d, a, b, c, x[i + 12], 11, -421815835)
	      c = md5_hh(c, d, a, b, x[i + 15], 16, 530742520)
	      b = md5_hh(b, c, d, a, x[i + 2], 23, -995338651)

	      a = md5_ii(a, b, c, d, x[i], 6, -198630844)
	      d = md5_ii(d, a, b, c, x[i + 7], 10, 1126891415)
	      c = md5_ii(c, d, a, b, x[i + 14], 15, -1416354905)
	      b = md5_ii(b, c, d, a, x[i + 5], 21, -57434055)
	      a = md5_ii(a, b, c, d, x[i + 12], 6, 1700485571)
	      d = md5_ii(d, a, b, c, x[i + 3], 10, -1894986606)
	      c = md5_ii(c, d, a, b, x[i + 10], 15, -1051523)
	      b = md5_ii(b, c, d, a, x[i + 1], 21, -2054922799)
	      a = md5_ii(a, b, c, d, x[i + 8], 6, 1873313359)
	      d = md5_ii(d, a, b, c, x[i + 15], 10, -30611744)
	      c = md5_ii(c, d, a, b, x[i + 6], 15, -1560198380)
	      b = md5_ii(b, c, d, a, x[i + 13], 21, 1309151649)
	      a = md5_ii(a, b, c, d, x[i + 4], 6, -145523070)
	      d = md5_ii(d, a, b, c, x[i + 11], 10, -1120210379)
	      c = md5_ii(c, d, a, b, x[i + 2], 15, 718787259)
	      b = md5_ii(b, c, d, a, x[i + 9], 21, -343485551)

	      a = safe_add(a, olda)
	      b = safe_add(b, oldb)
	      c = safe_add(c, oldc)
	      d = safe_add(d, oldd)
	    }
	    return [a, b, c, d]
	  }

	  /*
	  * Convert an array of little-endian words to a string
	  */
	  function binl2rstr (input) {
	    var i
	    var output = ''
	    var length32 = input.length * 32
	    for (i = 0; i < length32; i += 8) {
	      output += String.fromCharCode((input[i >> 5] >>> (i % 32)) & 0xFF)
	    }
	    return output
	  }

	  /*
	  * Convert a raw string to an array of little-endian words
	  * Characters >255 have their high-byte silently ignored.
	  */
	  function rstr2binl (input) {
	    var i
	    var output = []
	    output[(input.length >> 2) - 1] = undefined
	    for (i = 0; i < output.length; i += 1) {
	      output[i] = 0
	    }
	    var length8 = input.length * 8
	    for (i = 0; i < length8; i += 8) {
	      output[i >> 5] |= (input.charCodeAt(i / 8) & 0xFF) << (i % 32)
	    }
	    return output
	  }

	  /*
	  * Calculate the MD5 of a raw string
	  */
	  function rstr_md5 (s) {
	    return binl2rstr(binl_md5(rstr2binl(s), s.length * 8))
	  }

	  /*
	  * Calculate the HMAC-MD5, of a key and some data (raw strings)
	  */
	  function rstr_hmac_md5 (key, data) {
	    var i
	    var bkey = rstr2binl(key)
	    var ipad = []
	    var opad = []
	    var hash
	    ipad[15] = opad[15] = undefined
	    if (bkey.length > 16) {
	      bkey = binl_md5(bkey, key.length * 8)
	    }
	    for (i = 0; i < 16; i += 1) {
	      ipad[i] = bkey[i] ^ 0x36363636
	      opad[i] = bkey[i] ^ 0x5C5C5C5C
	    }
	    hash = binl_md5(ipad.concat(rstr2binl(data)), 512 + data.length * 8)
	    return binl2rstr(binl_md5(opad.concat(hash), 512 + 128))
	  }

	  /*
	  * Convert a raw string to a hex string
	  */
	  function rstr2hex (input) {
	    var hex_tab = '0123456789abcdef'
	    var output = ''
	    var x
	    var i
	    for (i = 0; i < input.length; i += 1) {
	      x = input.charCodeAt(i)
	      output += hex_tab.charAt((x >>> 4) & 0x0F) +
	      hex_tab.charAt(x & 0x0F)
	    }
	    return output
	  }

	  /*
	  * Encode a string as utf-8
	  */
	  function str2rstr_utf8 (input) {
	    return unescape(encodeURIComponent(input))
	  }

	  /*
	  * Take string arguments and return either raw or hex encoded strings
	  */
	  function raw_md5 (s) {
	    return rstr_md5(str2rstr_utf8(s))
	  }
	  function hex_md5 (s) {
	    return rstr2hex(raw_md5(s))
	  }
	  function raw_hmac_md5 (k, d) {
	    return rstr_hmac_md5(str2rstr_utf8(k), str2rstr_utf8(d))
	  }
	  function hex_hmac_md5 (k, d) {
	    return rstr2hex(raw_hmac_md5(k, d))
	  }

	  function md5 (string, key, raw) {
	    if (!key) {
	      if (!raw) {
	        return hex_md5(string)
	      }
	      return raw_md5(string)
	    }
	    if (!raw) {
	      return hex_hmac_md5(key, string)
	    }
	    return raw_hmac_md5(key, string)
	  }

	  if (true) {
	    !(__WEBPACK_AMD_DEFINE_RESULT__ = function () {
	      return md5
	    }.call(exports, __webpack_require__, exports, module), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__))
	  } else if (typeof module === 'object' && module.exports) {
	    module.exports = md5
	  } else {
	    $.md5 = md5
	  }
	}(this))


/***/ }
/******/ ]);