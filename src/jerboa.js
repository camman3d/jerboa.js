import { getGlobalOffset, getRelativeOffset, getSelector, resolveContainer } from './positioning';
import { addEventListener, emit } from './events';
import { addBox, addText, addTextField, closeInfoBox, createInfoBox, createMarker, resetPositioning, annotationPositions } from './html-manip';
import state from './state';

/*
    Annotating Functionality Methods
    --------------------------------
 */
function generatePayload(event) {
    const container = resolveContainer(event.target, state.currentStrategy);
    if (!container) {
        return;
    }
    const selector = getSelector(event.target);
    const containerSelector = getSelector(container);
    let offset = getRelativeOffset(event.target, container);
    offset['x'] += event.offsetX;
    offset['y'] += event.offsetY;
    const rect = container.getBoundingClientRect();

    const positionObject = {
        positioning: state.currentPositioning,
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
        offset
    };
    return {
        time: new Date(Date.now() - (new Date().getTimezoneOffset() * 60000)).toISOString(),
        position: positionObject,
        url: state.url,
        data: state.additionalData,
        user: state.currentUser,
        userId: state.currentUserId,
        comments: []
    };
}

function clickListener(event) {
    if (!state.active) {
        return;
    }
    closeInfoBox();
    if (state.feedbackBoxOpen) {
        return;
    }

    let payload = generatePayload(event);
    if (!payload) {
        return;
    }
    emit('preAnnotate', payload);

    state.feedbackBoxOpen = true;
    const spot = createMarker(payload);
    const boxParts = addBox(spot, false);
    const parts = addTextField(boxParts.container, 'Enter comment:');

    parts.cancel.addEventListener('click', () => {
        emit('cancel', payload);
        state.feedbackBoxOpen = false;
        document.body.removeChild(spot);
    });

    parts.save.addEventListener('click', () => {
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
            emit('save', payload);
            state.feedbackBoxOpen = false;
            spot.removeChild(boxParts.box);
            createInfoBox(spot, payload);
        } else {
            emit('cancel', payload);
            state.feedbackBoxOpen = false;
            document.body.removeChild(spot);
        }
    });
}

const strategies = {
    global: e => {
        return e.tagName === 'BODY';
    },
    byClass: className => e => {
        return e.classList.contains(className);
    }
};

/*
    Create Toggle Button
    -------------
 */

function createToggleButton() {
    let bottom = '25px';
    let left = '25px';

    let buttonContainer = document.createElement('div');
    buttonContainer.classList.add('toggle-button-container');

    let buttonLabel = document.createElement('div');
    buttonLabel.classList.add('toggle-button-text');
    buttonLabel.textContent = 'Feedback Off';
    buttonContainer.appendChild(buttonLabel);

    let buttonDiv = document.createElement('div');
    buttonDiv.classList.add('toggle-button');
    buttonContainer.appendChild(buttonDiv);

    let button = document.createElement('button');
    buttonDiv.appendChild(button);

    buttonContainer.style.bottom = bottom;
    buttonContainer.style.left = left;
    buttonContainer.style.position = 'fixed';

    let matchState=function(){
        let feedbackSpots = document.getElementsByClassName('feedback-spot');
        if (state.active) {
            buttonDiv.classList.add('toggle-button-selected');
            buttonLabel.textContent = 'Feedback On';
            Array.prototype.forEach.call(feedbackSpots, (feedbackSpotElement) => {
                feedbackSpotElement.classList.remove('off');
            });
        } else {
            buttonDiv.classList.remove('toggle-button-selected');
            buttonLabel.textContent = 'Feedback Off';
            Array.prototype.forEach.call(feedbackSpots, (feedbackSpotElement) => {
                feedbackSpotElement.classList.add('off');
            });
        }
    }
    buttonDiv.addEventListener('click', event => {
        event.preventDefault();
        state.active = !state.active;
        matchState()
        emit('active', state.active);
    });
    matchState()
    document.body.appendChild(buttonContainer);
}


(function() {
    var throttle = function(type, name, obj) {
        obj = obj || window;
        var running = false;
        var func = function() {
            if (running) { return; }
            running = true;
             requestAnimationFrame(function() {
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

export default {
    init(options) {
        console.log('options', options);
        options = options || {};
        state.active = options.active || false
        state.currentStrategy = options.strategy || strategies.global;
        state.currentPositioning = options.positioning || 'PERCENT';
        state.currentUser = options.currentUser;
        state.currentUserId = options.currentUserId;
        state.isAdmin = options.isAdmin || false;
        state.url = window.location.href;
        console.log('state', state);
        if (options.data) {
            state.additionalData = options.data;
        }
        if (options.points) {
            options.points.forEach(point => {
                let spot = createMarker(point, true); //loads existing points
                createInfoBox(spot, point);
            });
        }

        document.addEventListener('click', clickListener);
        window.addEventListener("optimizedResize", function() {
            console.log("Resource conscious resize callback!");
            annotationPositions.forEach((annotationPosition) => {
                resetPositioning.apply(null, annotationPosition);
            });
        });
        createToggleButton();
    },

    close() {
        document.removeEventListener('click', clickListener);
    },

    addEventListener,
    strategies
};
