import { getGlobalOffset, getRelativeOffset, getSelector, resolveContainer } from './positioning';
import { addEventListener, emit } from './events';
import { addBox, addText, addTextField, closeInfoBox, createInfoBox, createMarker } from './html-manip';
import state from './state';
import md5 from 'blueimp-md5';

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
    console.log('OFFSET', offset);
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
        time: new Date().toISOString(),
        position: positionObject,
        url: state.url,
        data: state.additionalData,
        user: state.currentUser,
        pageId: state.pageId,
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
        console.log('e', e);
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
    buttonLabel.textContent = 'Feedback On';
    buttonContainer.appendChild(buttonLabel);

    let buttonDiv = document.createElement('div');
    buttonDiv.classList.add('toggle-button', 'toggle-button-selected');
    buttonContainer.appendChild(buttonDiv);

    let button = document.createElement('button');
    buttonDiv.appendChild(button);

    buttonContainer.style.bottom = bottom;
    buttonContainer.style.left = left;
    buttonContainer.style.position = 'fixed';

    buttonDiv.addEventListener('click', event => {
        event.preventDefault();
        let feedbackSpots = document.getElementsByClassName('feedback-spot');
        console.log(feedbackSpots);
        if (buttonDiv.classList.contains('toggle-button-selected')) {
            buttonDiv.classList.remove('toggle-button-selected');
            buttonLabel.textContent = 'Feedback Off';
            state.active = false;
            Array.prototype.forEach.call(feedbackSpots, (feedbackSpotElement) => {
                feedbackSpotElement.classList.add('off');
            });
        } else {
            buttonDiv.classList.add('toggle-button-selected');
            buttonLabel.textContent = 'Feedback On';
            state.active = true;
            Array.prototype.forEach.call(feedbackSpots, (feedbackSpotElement) => {
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

export default {
    init(options) {
        console.log('init options', options);
        options = options || {};
        state.currentStrategy = options.strategy || strategies.global;
        state.currentPositioning = options.positioning || 'PERCENT';
        state.currentUser = options.currentUser;
        state.currentUserId = options.currentUserId;
        state.url = window.location.href;
        state.pageId = md5(window.location.href);
        console.log('initialized state', state);
        if (options.data) {
            state.additionalData = options.data;
        }
        if (options.points) {
            options.points.forEach(point => {
                console.log('points state', state);
                let spot = createMarker(point); //loads existing points
                console.log('init spot: ', spot, 'init point: ', point);
                createInfoBox(spot, point);
            });
        }

        document.addEventListener('click', clickListener);
        createToggleButton();
    },

    close() {
        document.removeEventListener('click', clickListener);
    },

    addEventListener,
    strategies
};