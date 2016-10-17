import { getGlobalOffset } from './positioning';
import { emit } from './events';
import state from './state';

/*
 HTML Manipulation Methods
 -------------------------
 */

let openSpot;


// Methods for testing
export function __getOpenSpot() {
    return openSpot;
}

export function __setOpenSpot(spot) {
    openSpot = spot;
}

export function createMarker(payload) {
    const pos = payload.position;
    const container = document.querySelector(pos.container);
    const offset = getGlobalOffset(container);
    let spot = document.createElement('div');
    let left, top;
    spot.classList.add('feedback-spot');

    if (pos.positioning === 'pixel') {
        left = offset[0] + pos.offset[0];
        top = offset[1] + pos.offset[1];
    } else if (pos.positioning === 'percent') {
        const percentX = pos.offset[0] / pos.containerSize.width;
        const percentY = pos.offset[1] / pos.containerSize.height;
        const rect = container.getBoundingClientRect();
        left = offset[0] + rect.width * percentX;
        top = offset[1] + rect.height * percentY;
    }
    spot.style.top = top + 'px';
    spot.style.left = left + 'px';

    document.body.appendChild(spot);
    return spot;
}

export function addBox(spot, toggled) {
    spot.addEventListener('click', event => {
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

    let box = document.createElement('div');
    box.classList.add('feedback-box');
    if (toggled) {
        box.classList.add('toggled');
    }
    box.addEventListener('click', event => {
        event.stopPropagation();
    });
    spot.appendChild(box);

    let container = document.createElement('div');
    container.classList.add('feedback-container');
    box.appendChild(container);

    return {box, container};
}

export function closeInfoBox() {
    if (openSpot) {
        openSpot.classList.remove('active');
        openSpot = null;
    }
}

// addText function renders a single comment and all of it's replies
export function addText(container, payload) {
    let text = document.createElement('div');
    text.classList.add('feedback-text');
    text.textContent = payload.text;
    container.appendChild(text);

    let info = document.createElement('div');
    info.classList.add('feedback-info');
    const time = new Date(payload.datetime);
    info.textContent = 'By ' + (payload.user || 'unknown user') + ' at ' + time.toLocaleString();
    text.appendChild(info);

    if (payload.user === state.currentUser) {
        let deleteBtn = document.createElement('a');
        deleteBtn.classList.add('delete-button');
        deleteBtn.innerText = 'X';
        deleteBtn.setAttribute('role', 'button');
        deleteBtn.setAttribute('href', '#');
        info.appendChild(deleteBtn);

        let editBtn = document.createElement('a');
        editBtn.classList.add('edit-button');
        editBtn.innerText = 'Edit';
        editBtn.setAttribute('role', 'button');
        editBtn.setAttribute('href', '#');
        info.appendChild(editBtn);

        deleteBtn.addEventListener('click', (e) => {
            e.preventDefault();
            container.removeChild(text);
            emit('deleteComment');
        });

        editBtn.addEventListener('click', (e) => {
            e.preventDefault();
            let editCommentTextField = addTextField(null, null, 'comment-textfield');
            editCommentTextField.textarea.value = payload.text;

            editCommentTextField.cancel.addEventListener('click', () => {
                console.log('edit comment text field cancel clicked');
                container.replaceChild(text, editCommentTextField.container);
                // const reply = generateReply(editReplyTextField.textarea.value);
                // editReplyTextField.textarea.value = '';
                // emit('cancelReply', reply);
            });

            editCommentTextField.save.addEventListener('click', () => {
                console.log('edit comment text field save clicked');
                // if content didn't change, just put back old comment (don't change)
                console.log(text.textContent, '|||', editCommentTextField.textarea.value)
                if (payload.text === editReplyTextField.textarea.value) {
                    container.replaceChild(text, editCommentTextField.container);
                } else {
                    //change
                }
                // const reply = generateReply(editReplyTextField.textarea.value);
                // editReplyTextField.textarea.value = '';
                // payload.replies.push(reply);
                // emit('saveReply', payload);

                // repliesContainer.removeChild(editReplyTextField.container);
                // addReply(repliesContainer, reply);
            });

            container.replaceChild(editCommentTextField.container, text);
            emit('editComment');
        });
    }

    let replyBtn = document.createElement('a');
    replyBtn.classList.add('reply-button');
    replyBtn.innerText = 'Reply';
    replyBtn.setAttribute('role', 'button');
    replyBtn.setAttribute('href', '#');
    text.appendChild(replyBtn);

    // if there are replies, render them
    let repliesContainer = document.createElement('div');
    repliesContainer.classList.add('replies-container');
    text.appendChild(repliesContainer);

    if (payload.replies) {
        payload.replies.forEach(reply => {
            addReply(repliesContainer, reply);
        });
    };

    replyBtn.addEventListener('click', (e) => {
        e.preventDefault();
        let parts;

        // if the repliesContainer is empty or if the last element in the replies container contains the class 'reply-textfield'
        if (repliesContainer && (!repliesContainer.lastElementChild || !repliesContainer.lastElementChild.classList.contains('reply-textfield'))) {
            parts = addTextField(repliesContainer, 'Reply:', 'reply-textfield');

            parts.cancel.addEventListener('click', () => {
                const reply = generateReply(parts.textarea.value);
                parts.textarea.value = '';
                emit('cancelReply', reply);
                closeInfoBox();
            });

            parts.save.addEventListener('click', () => {
                const reply = generateReply(parts.textarea.value);
                parts.textarea.value = '';
                payload.replies.push(reply);
                emit('saveReply', payload);

                repliesContainer.removeChild(parts.container);
                addReply(repliesContainer, reply);
            });
        }

    });

    return text;
}

export function addReply(container, payload) {
    let replyContainer = document.createElement('div');
    replyContainer.classList.add('reply-container');
    container.appendChild(replyContainer);

    let reply = document.createElement('div');
    reply.classList.add('feedback-reply');
    reply.textContent = payload.text;
    replyContainer.appendChild(reply);

    let info = document.createElement('div');
    info.classList.add('feedback-info');
    const time = new Date(payload.datetime);
    info.textContent = 'By ' + (payload.user || 'unknown user') + ' at ' + time.toLocaleString();
    // if the user is the creator of the comment, show the delete and edit
    if (payload.user === state.currentUser) {
        let deleteBtn = document.createElement('a');
        deleteBtn.classList.add('delete-button');
        deleteBtn.innerText = 'X';
        deleteBtn.setAttribute('role', 'button');
        deleteBtn.setAttribute('href', '#');
        info.appendChild(deleteBtn);

        let editBtn = document.createElement('a');
        editBtn.classList.add('edit-button');
        editBtn.innerText = 'Edit';
        editBtn.setAttribute('role', 'button');
        editBtn.setAttribute('href', '#');
        info.appendChild(editBtn);

        deleteBtn.addEventListener('click', (e) => {
            e.preventDefault();
            container.removeChild(replyContainer);
            emit('deleteReply');
        });

        editBtn.addEventListener('click', (e) => {
            e.preventDefault();
            emit('editReply');
        });
    }

    replyContainer.appendChild(info);

    return replyContainer;
}

export function addTextField(boxContainer, label, containerClass) {
    let container = document.createElement('div');
    if (containerClass) {
        container.classList.add(containerClass)
    };
    if (boxContainer) {
        boxContainer.appendChild(container)
    };

    if (label) {
        let fieldLabel = document.createElement('label');
        fieldLabel.textContent = label;
        container.appendChild(fieldLabel);
    };

    let textarea = document.createElement('textarea');
    container.appendChild(textarea);

    let buttonHolder = document.createElement('div');
    buttonHolder.classList.add('button-holder');
    container.appendChild(buttonHolder);

    let cancel = document.createElement('button');
    cancel.classList.add('cancel-button');
    cancel.innerText = 'Cancel';
    buttonHolder.appendChild(cancel);

    let save = document.createElement('button');
    save.classList.add('save-button');
    save.innerText = 'Save';
    buttonHolder.appendChild(save);

    return {cancel, save, textarea, container};
}

const generateReply = text => ({
    datetime: new Date().toISOString(),
    user: state.currentUser,
    text
});

const generateComment = text => ({
    datetime: new Date().toISOString(),
    user: state.currentUser,
    text,
    replies: []
});



export function createInfoBox(spot, payload) {

    function changeOuterColor(classList, className) {
        classList.forEach((value, index) => {
            if (value.includes('owner-')) {
                classList.remove(value);
            }
        });
        classList.add(className);
    }
    function changeInnerColor(classList, className) {
        classList.forEach((value, index) => {
            if (value.includes('status-')) {
                classList.remove(value);
            }
        });
        classList.add(className);
    }

    const boxParts = addBox(spot, true);
    const ownerOptions = {
        'PM': 'pm',
        'Client': 'client',
        'ID': 'id',
        'IxD': 'ixd',
        'Video': 'video'
    };
    const statusOptions = {
        'Open': 'open',
        'Closed': 'closed',
        'No Action': 'no-action'
    };

    // add owner and status
    let ownerSelect = document.createElement('select');
    boxParts.container.appendChild(ownerSelect);
    let ownerOptionsArr = Object.keys(ownerOptions);
    for (let i = 0; i < ownerOptionsArr.length; i++) {
        let option = document.createElement('option');
        option.value = ownerOptionsArr[i];
        option.text = ownerOptionsArr[i];
        ownerSelect.appendChild(option);
    }
    ownerSelect.addEventListener('change', (e) => {
        let ownerValue = e.target.value;
        changeOuterColor(spot.classList, `owner-${ownerOptions[ownerValue]}`)
        emit('changeOwner', ownerValue);
    });

    let statusSelect = document.createElement('select');
    boxParts.container.appendChild(statusSelect);
    let statusOptionsArr = Object.keys(statusOptions);
    for (let i = 0; i < statusOptionsArr.length; i++) {
        let option = document.createElement('option');
        option.value = statusOptionsArr[i];
        option.text = statusOptionsArr[i];
        statusSelect.appendChild(option);
    }
    statusSelect.addEventListener('change', (e) => {
        let statusValue = e.target.value;
        changeInnerColor(spot.classList, `status-${statusOptions[statusValue]}`)
        emit('changeStatus', statusValue);
    });

    // add each comment to container
    payload.comments.forEach(comment => {
        addText(boxParts.container, comment);
    });

    let parts = addTextField(boxParts.container, 'Comment:', 'comment-textfield');
    parts.cancel.addEventListener('click', () => {
        const comment = generateComment(parts.textarea.value);
        parts.textarea.value = '';
        emit('cancelComment', comment);
        closeInfoBox();
    });

    parts.save.addEventListener('click', () => {
        const comment = generateComment(parts.textarea.value);
        parts.textarea.value = '';
        payload.comments.push(comment);
        emit('saveComment', payload);

        boxParts.container.removeChild(parts.container);
        addText(boxParts.container, comment);
        boxParts.container.appendChild(parts.container);
    });

    return Object.assign({}, parts, boxParts);
}