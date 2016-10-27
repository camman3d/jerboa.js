import { getGlobalOffset, getRelativeOffset, getSelector, resolveContainer } from './positioning';
import { addEventListener, emit } from './events';
import { addBox, addText, addTextField, closeInfoBox, createInfoBox, createMarker } from './html-manip';
import state from './state';
import md5 from 'blueimp-md5';

window.md5 = md5;
/*
    Annotating Functionality Methods
    --------------------------------
 */
window.state = state;
function generatePayload(event) {
    const container = resolveContainer(event.target, state.currentStrategy);
    if (!container) {
        return;
    }
    const selector = getSelector(event.target);
    const containerSelector = getSelector(container);
    let offset = getRelativeOffset(event.target, container);
    offset[0] += event.offsetX;
    offset[1] += event.offsetY;
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
        datetime: new Date().toISOString(),
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
        //         datetime: new Date().toISOString(),
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
    console.log('button clicked');
    if (buttonDiv.classList.contains('toggle-button-selected')) {
        buttonDiv.classList.remove('toggle-button-selected');
        buttonLabel.textContent = 'Feedback Off';
        state.active = false;
    } else {
        buttonDiv.classList.add('toggle-button-selected');
        buttonLabel.textContent = 'Feedback On';
        state.active = true;
    }
});

document.body.appendChild(buttonContainer);


    /*
        Return object
        -------------
     */

export default {
    init(options) {
        options = options || {};
        if (options.data) {
            state.additionalData = options.data;
        }
        if (options.points) {
            options.points.forEach(point => {
                let spot = createMarker(point); //loads existing points
                createInfoBox(spot, point);
            });
        }
        state.currentStrategy = options.strategy || strategies.global;
        state.currentPositioning = options.positioning || 'percent';
        state.currentUser = options.user;
        state.url = window.location.href;
        state.pageId = md5(window.location.href);

        document.addEventListener('click', clickListener);
    },

    close() {
        document.removeEventListener('click', clickListener);
    },

    addEventListener,
    strategies
};