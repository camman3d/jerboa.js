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
	        time: new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString(),
	        position: positionObject,
	        url: _state2.default.url,
	        data: _state2.default.additionalData,
	        user: _state2.default.currentUser,
	        userId: _state2.default.currentUserId,
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
	    buttonLabel.textContent = 'Feedback Off';
	    buttonContainer.appendChild(buttonLabel);

	    var buttonDiv = document.createElement('div');
	    buttonDiv.classList.add('toggle-button');
	    buttonContainer.appendChild(buttonDiv);

	    var button = document.createElement('button');
	    buttonDiv.appendChild(button);

	    buttonContainer.style.bottom = bottom;
	    buttonContainer.style.left = left;
	    buttonContainer.style.position = 'fixed';

	    var matchState = function matchState() {
	        var feedbackSpots = document.getElementsByClassName('feedback-spot');
	        if (_state2.default.active) {
	            buttonDiv.classList.add('toggle-button-selected');
	            buttonLabel.textContent = 'Feedback On';
	            Array.prototype.forEach.call(feedbackSpots, function (feedbackSpotElement) {
	                feedbackSpotElement.classList.remove('off');
	            });
	        } else {
	            buttonDiv.classList.remove('toggle-button-selected');
	            buttonLabel.textContent = 'Feedback Off';
	            Array.prototype.forEach.call(feedbackSpots, function (feedbackSpotElement) {
	                feedbackSpotElement.classList.add('off');
	            });
	        }
	    };
	    buttonDiv.addEventListener('click', function (event) {
	        event.preventDefault();
	        _state2.default.active = !_state2.default.active;
	        matchState();
	        (0, _events.emit)('active', _state2.default.active);
	    });
	    matchState();
	    document.body.appendChild(buttonContainer);
	}

	(function () {
	    var throttle = function throttle(type, name, obj) {
	        obj = obj || window;
	        var running = false;
	        var func = function func() {
	            if (running) {
	                return;
	            }
	            running = true;
	            requestAnimationFrame(function () {
	                obj.dispatchEvent(new CustomEvent(name));
	                running = false;
	            });
	        };
	        obj.addEventListener(type, func);
	    };

	    throttle("resize", "optimizedResize");
	})();

	/*
	    Return object
	    -------------
	 */

	exports.default = {
	    init: function init(options) {
	        console.log('options', options);
	        options = options || {};
	        _state2.default.active = options.active || false;
	        _state2.default.currentStrategy = options.strategy || strategies.global;
	        _state2.default.currentPositioning = options.positioning || 'PERCENT';
	        _state2.default.currentUser = options.currentUser;
	        _state2.default.currentUserId = options.currentUserId;
	        _state2.default.isAdmin = options.isAdmin || false;
	        _state2.default.url = window.location.href;
	        _state2.default.allowDeleteComments = options.allowDeleteComments || false;
	        console.log('state', _state2.default);
	        if (options.data) {
	            _state2.default.additionalData = options.data;
	        }
	        if (options.points) {
	            options.points.forEach(function (point) {
	                var spot = (0, _htmlManip.createMarker)(point, true); //loads existing points
	                (0, _htmlManip.createInfoBox)(spot, point);
	            });
	        }

	        document.addEventListener('click', clickListener);
	        window.addEventListener("optimizedResize", function () {
	            console.log("Resource conscious resize callback!");
	            _htmlManip.annotationPositions.forEach(function (annotationPosition) {
	                _htmlManip.resetPositioning.apply(null, annotationPosition);
	            });
	        });
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
	exports.annotationPositions = undefined;
	exports.__getOpenSpot = __getOpenSpot;
	exports.__setOpenSpot = __setOpenSpot;
	exports.createMarker = createMarker;
	exports.resetPositioning = resetPositioning;
	exports.addBox = addBox;
	exports.closeInfoBox = closeInfoBox;
	exports.addText = addText;
	exports.addTextField = addTextField;
	exports.createInfoBox = createInfoBox;

	var _positioning = __webpack_require__(2);

	var _events = __webpack_require__(3);

	var _state = __webpack_require__(5);

	var _state2 = _interopRequireDefault(_state);

	var _utils = __webpack_require__(6);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	/*
	 HTML Manipulation Methods
	 -------------------------
	 */

	var openSpot = void 0;
	var annotationPositions = exports.annotationPositions = [];

	// Methods for testing
	function __getOpenSpot() {
	    return openSpot;
	}

	function __setOpenSpot(spot) {
	    openSpot = spot;
	}

	// second parameter is true if the point is being initially loaded
	function createMarker(payload, init) {
	    var pos = payload.position;
	    var container = document.querySelector(pos.container);
	    var spot = document.createElement('div');
	    var left = void 0,
	        top = void 0;
	    spot.classList.add('feedback-spot');
	    if (init) {
	        spot.classList.add('off');
	    }

	    annotationPositions.push([spot, pos, container]);

	    var calculatedPosition = calculatePosition(pos, container);
	    // const offset = getGlobalOffset(container);
	    // if (pos.positioning === 'PIXEL') {
	    //     left = offset[0] + pos.offset['x'];
	    //     top = offset[1] + pos.offset['y'];
	    // } else if (pos.positioning === 'PERCENT') {
	    //     const percentX = pos.offset['x'] / pos.containerSize.width;
	    //     const percentY = pos.offset['y'] / pos.containerSize.height;
	    //     const rect = container.getBoundingClientRect();
	    //     left = offset[0] + rect.width * percentX;
	    //     top = offset[1] + rect.height * percentY;
	    // }
	    spot.style.top = calculatedPosition.top + 'px';
	    spot.style.left = calculatedPosition.left + 'px';

	    document.body.appendChild(spot);
	    return spot;
	}

	function calculatePosition(pos, container) {
	    var offset = (0, _positioning.getGlobalOffset)(container);
	    var top = void 0,
	        left = void 0;

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

	    return {
	        top: top,
	        left: left
	    };
	}

	function resetPositioning(spot, pos, container) {
	    var calculatedPosition = calculatePosition(pos, container);
	    spot.style.top = calculatedPosition.top + 'px';
	    spot.style.left = calculatedPosition.left + 'px';
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

	    // adds user and date
	    var info = document.createElement('div');
	    var span = document.createElement('span');
	    info.classList.add('feedback-info');
	    var rawTime = !!payload.time.match(/.*[Z]$/) ? payload.time : payload.time + 'Z';
	    var parsedTime = (0, _utils.isSafari)() ? Date.parse(rawTime) + new Date().getTimezoneOffset() * 60000 : Date.parse(rawTime);
	    var time = new Date(parsedTime);
	    info.textContent = payload.user || _state2.default.currentUser || 'Unknown User';
	    span.textContent = time.toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC', hour12: true, hour: 'numeric', minute: 'numeric' });
	    info.appendChild(span);
	    text.appendChild(info);

	    // adds comment
	    var comment = document.createElement('div');
	    comment.classList.add('feedback-comment');
	    comment.textContent = payload.text;
	    text.appendChild(comment);

	    if (parseInt(payload.userId) === parseInt(_state2.default.currentUserId)) {
	        if (_state2.default.allowDeleteComments) {
	            var deleteBtn = document.createElement('a');
	            deleteBtn.classList.add('delete-button');
	            deleteBtn.innerText = 'X';
	            deleteBtn.setAttribute('role', 'button');
	            deleteBtn.setAttribute('href', '#');
	            // don't render delete button for original annotation comment
	            if (!payload.hasOwnProperty('comments')) {
	                info.appendChild(deleteBtn);
	            };

	            deleteBtn.addEventListener('click', function (e) {
	                e.preventDefault();
	                container.removeChild(text);
	                (0, _events.emit)('deleteComment', payload);
	            });
	        }

	        var editBtn = document.createElement('a');
	        editBtn.classList.add('edit-button');
	        editBtn.innerText = 'Edit';
	        editBtn.setAttribute('role', 'button');
	        editBtn.setAttribute('href', '#');
	        info.appendChild(editBtn);

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
	    textarea.placeholder = 'Write a comment';
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
	        time: new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString(),
	        user: _state2.default.currentUser,
	        userId: _state2.default.currentUserId,
	        text: text
	        // replies: []
	    };
	};

	function createInfoBox(spot, payload) {
	    function changeColor(classList, currentClassName, newClassName) {
	        if (classList.contains(currentClassName)) {
	            classList.remove(currentClassName);
	        };
	        if (!classList.contains(newClassName)) {
	            classList.add(newClassName);
	        };
	    }

	    // function changeOuterColor(classList, className) {
	    //     classList.forEach((value, index) => {
	    //         if (value.includes('owner-')) {
	    //             classList.remove(value);
	    //         }
	    //     });
	    //     classList.add(className);
	    // }
	    // function changeInnerColor(classList, className) {
	    //     classList.forEach((value, index) => {
	    //         if (value.includes('status-')) {
	    //             classList.remove(value);
	    //         }
	    //     });
	    //     classList.add(className);
	    // }

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
	    var ownerLabel = document.createElement('label');
	    ownerLabel.innerHTML = 'Assigned To:';
	    var statusLabel = document.createElement('label');
	    statusLabel.innerHTML = 'Status:';
	    var ownerSelect = document.createElement('select');
	    if (!_state2.default.isAdmin) {
	        ownerSelect.disabled = true;
	    }
	    boxParts.container.appendChild(ownerLabel);
	    boxParts.container.appendChild(ownerSelect);
	    var ownerOptionsArr = Object.keys(ownerOptions);
	    for (var i = 0; i < ownerOptionsArr.length; i++) {
	        var option = document.createElement('option');
	        option.value = ownerOptions[ownerOptionsArr[i]];
	        option.text = ownerOptionsArr[i];
	        ownerSelect.appendChild(option);
	    }
	    var currentAssigneeRole = payload.assigneeRole;
	    if (payload.assigneeRole && payload.assigneeRole !== defaultOwner) {
	        ownerSelect.value = payload.assigneeRole;
	        changeColor(spot.classList, null, 'owner-' + payload.assigneeRole);
	    } else {
	        ownerSelect.value = defaultOwner;
	    }
	    ownerSelect.addEventListener('change', function (e) {
	        payload.assigneeRole = e.target.value;
	        changeColor(spot.classList, 'owner-' + currentAssigneeRole, 'owner-' + payload.assigneeRole);
	        currentAssigneeRole = payload.assigneeRole;
	        (0, _events.emit)('changeOwner', payload);
	    });

	    var defaultStatus = 'open';
	    var statusSelect = document.createElement('select');
	    if (!_state2.default.isAdmin) {
	        statusSelect.disabled = true;
	    }
	    boxParts.container.appendChild(statusLabel);
	    boxParts.container.appendChild(statusSelect);
	    var statusOptionsArr = Object.keys(statusOptions);
	    for (var _i = 0; _i < statusOptionsArr.length; _i++) {
	        var _option = document.createElement('option');
	        _option.value = statusOptions[statusOptionsArr[_i]];
	        _option.text = statusOptionsArr[_i];
	        statusSelect.appendChild(_option);
	    }
	    var currentStatus = payload.status;
	    if (payload.status && payload.status !== defaultStatus) {
	        statusSelect.value = payload.status;
	        changeColor(spot.classList, null, 'status-' + payload.status);
	    } else {
	        statusSelect.value = defaultStatus;
	    }
	    statusSelect.addEventListener('change', function (e) {
	        payload.status = e.target.value;
	        changeColor(spot.classList, 'status-' + currentStatus, 'status-' + payload.status);
	        currentStatus = payload.status;
	        (0, _events.emit)('changeStatus', payload);
	    });

	    // add each comment to container
	    addText(boxParts.container, payload); // first comment in root of payload
	    payload.comments.forEach(function (comment) {
	        addText(boxParts.container, comment, 'comment-reply');
	    });

	    var parts = addTextField(boxParts.container, null, 'comment-textfield');
	    parts.cancel.addEventListener('click', function () {
	        var comment = generateComment(parts.textarea.value);
	        parts.textarea.value = '';
	        (0, _events.emit)('cancelComment', comment);
	        closeInfoBox();
	    });
	    //@TODO: create util function to handle onKeyUp and click
	    parts.textarea.addEventListener('keyup', function (e) {
	        e.preventDefault();
	        if (e.keyCode == 13) {
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
	        }
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
	            var _comment2 = generateComment(parts.textarea.value);
	            parts.textarea.value = '';
	            (0, _events.emit)('cancelComment', _comment2);
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
	    active: false,
	    currentStrategy: undefined,
	    currentUser: undefined,
	    currentUserId: undefined,
	    currentPositioning: undefined,
	    additionalData: undefined,
	    feedbackBoxOpen: false,
	    url: undefined,
	    isAdmin: false
	};

/***/ },
/* 6 */
/***/ function(module, exports) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.isSafari = isSafari;
	/*
	 Positioning Related Methods
	 ---------------------------
	 */

	function isSafari() {
	    var userAgent = navigator.userAgent.toLowerCase();
	    if (userAgent.indexOf('safari') !== -1 && userAgent.indexOf('chrome') === -1) {
	        return true;
	    }
	    return false;
	}

/***/ }
/******/ ]);