import { getGlobalOffset, getRelativeOffset, getSelector, resolveContainer } from './positioning';
import { addEventListener, emit } from './events';
import { addBox, addText, addTextField, closeInfoBox, createInfoBox, createMarker } from './html-manip';
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
        url: window.location.href,
        data: state.additionalData,
        user: state.currentUser,
        replies: []
    };
}

function clickListener(event) {
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
    const parts = addTextField(boxParts.container, 'Enter message:');

    parts.cancel.addEventListener('click', () => {
        emit('cancel', payload);
        state.feedbackBoxOpen = false;
        document.body.removeChild(spot);
    });

    parts.save.addEventListener('click', () => {
        payload.text = parts.textarea.value;
        emit('save', payload);
        state.feedbackBoxOpen = false;
        spot.removeChild(boxParts.box);
        createInfoBox(spot, payload);
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
                let spot = createMarker(point);
                createInfoBox(spot, point);
            });
        }
        state.currentStrategy = options.strategy || strategies.global;
        state.currentPositioning = options.positioning || 'percent';
        state.currentUser = options.user;

        document.addEventListener('click', clickListener);
    },

    close() {
        document.removeEventListener('click', clickListener);
    },

    addEventListener,
    strategies
};