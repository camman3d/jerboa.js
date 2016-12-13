import { getGlobalOffset } from './positioning';
import { emit } from './events';
import state from './state';
import { isSafari } from './utils';
/*
 HTML Manipulation Methods
 -------------------------
 */

let openSpot;
export let annotationPositions = [];


// Methods for testing
export function __getOpenSpot() {
    return openSpot;
}

export function __setOpenSpot(spot) {
    openSpot = spot;
}

// second parameter is true if the point is being initially loaded
export function createMarker(payload, init) {
    const pos = payload.position;
    const container = document.querySelector(pos.container);
    let spot = document.createElement('div');
    let left, top;
    spot.classList.add('feedback-spot');
    if (init) {
        spot.classList.add('off');
    }

    annotationPositions.push([spot, pos, container]);

    let calculatedPosition = calculatePosition(pos, container);
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
    const offset = getGlobalOffset(container);
    let top, left;

    if (pos.positioning === 'PIXEL') {
        left = offset[0] + pos.offset['x'];
        top = offset[1] + pos.offset['y'];
    } else if (pos.positioning === 'PERCENT') {
        const percentX = pos.offset['x'] / pos.containerSize.width;
        const percentY = pos.offset['y'] / pos.containerSize.height;
        const rect = container.getBoundingClientRect();
        left = offset[0] + rect.width * percentX;
        top = offset[1] + rect.height * percentY;
    }

    return {
        top: top,
        left: left
    }
}

export function resetPositioning(spot, pos, container) {
    let calculatedPosition = calculatePosition(pos, container);
    spot.style.top = calculatedPosition.top + 'px';
    spot.style.left = calculatedPosition.left + 'px';
}

export function addBox(spot, toggled) {
    spot.addEventListener('click', event => {
        if (!state.active) {
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

// addText function renders a an annotation or comment
export function addText(container, payload, className) {
    let text = document.createElement('div');
    text.classList.add('feedback-text');
    if (className) {
        text.classList.add(className);
    }
    container.appendChild(text);


    let comment = document.createElement('div');
    comment.classList.add('feedback-comment');
    comment.textContent = payload.text;
    text.appendChild(comment);

    let info = document.createElement('div');
    info.classList.add('feedback-info');
    const rawTime = !!payload.time.match(/.*[Z]$/) ? payload.time : payload.time + 'Z';
    let parsedTime = isSafari() ? (Date.parse(rawTime) + new Date().getTimezoneOffset() * 60000) : Date.parse(rawTime);
    const time = new Date(parsedTime);
    info.textContent = 'By ' + (payload.user || state.currentUser || 'unknown user') + ' at ' + time.toLocaleString('en-US', {weekday: 'short', month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC', hour12: true, hour: 'numeric', minute: 'numeric'});
    text.appendChild(info);

    if (parseInt(payload.userId) === parseInt(state.currentUserId)) {
        if (state.allowDeleteComments) {
            let deleteBtn = document.createElement('a');
            deleteBtn.classList.add('delete-button');
            deleteBtn.innerText = 'X';
            deleteBtn.setAttribute('role', 'button');
            deleteBtn.setAttribute('href', '#');
            // don't render delete button for original annotation comment
            if (!payload.hasOwnProperty('comments')) {
                info.appendChild(deleteBtn);
            };

            deleteBtn.addEventListener('click', (e) => {
                e.preventDefault();
                container.removeChild(text);
                emit('deleteComment', payload);
            });
        }

        let editBtn = document.createElement('a');
        editBtn.classList.add('edit-button');
        editBtn.innerText = 'Edit';
        editBtn.setAttribute('role', 'button');
        editBtn.setAttribute('href', '#');
        info.appendChild(editBtn);

        editBtn.addEventListener('click', (e) => {
            e.preventDefault();
            let editCommentTextField = addTextField(null, null, 'comment-textfield');
            editCommentTextField.textarea.value = payload.text;

            editCommentTextField.cancel.addEventListener('click', () => {
                container.replaceChild(text, editCommentTextField.container);
            });

            editCommentTextField.save.addEventListener('click', () => {
                // if content didn't change, just put back old comment (don't change)
                if (payload.text === editCommentTextField.textarea.value) {
                    container.replaceChild(text, editCommentTextField.container);
                } else {
                    // change content
                    payload.text = editCommentTextField.textarea.value;
                    text.children[0].textContent = payload.text;
                    container.replaceChild(text, editCommentTextField.container);
                    emit('saveEdittedComment', payload);
                }
            });

            container.replaceChild(editCommentTextField.container, text);
            emit('editComment');
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

// const generateReply = text => ({
//     time: new Date().toISOString(),
//     user: state.currentUser,
//     text
// });

const generateComment = text => ({
    time: new Date(Date.now() - (new Date().getTimezoneOffset() * 60000)).toISOString(),
    user: state.currentUser,
    userId: state.currentUserId,
    text
    // replies: []
});



export function createInfoBox(spot, payload) {
    function changeColor(classList, currentClassName, newClassName) {
        if (classList.contains(currentClassName)) {classList.remove(currentClassName)};
        if (!classList.contains(newClassName)) {classList.add(newClassName)};
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
    const defaultOwner = 'pm';
    let ownerLabel = document.createElement('label');
    ownerLabel.innerHTML = 'Assigned To:';
    let statusLabel = document.createElement('label');
    statusLabel.innerHTML = 'Status:';
    let ownerSelect = document.createElement('select');
    if (!state.isAdmin) {
        ownerSelect.disabled = true;
    }
    boxParts.container.appendChild(ownerLabel);
    boxParts.container.appendChild(ownerSelect);
    let ownerOptionsArr = Object.keys(ownerOptions);
    for (let i = 0; i < ownerOptionsArr.length; i++) {
        let option = document.createElement('option');
        option.value = ownerOptions[ownerOptionsArr[i]];
        option.text = ownerOptionsArr[i];
        ownerSelect.appendChild(option);
    }
    let currentAssigneeRole = payload.assigneeRole;
    if (payload.assigneeRole && (payload.assigneeRole !== defaultOwner)) {
        ownerSelect.value = payload.assigneeRole;
        changeColor(spot.classList, null, `owner-${payload.assigneeRole}`)
    } else {
        ownerSelect.value = defaultOwner;
    }
    ownerSelect.addEventListener('change', (e) => {
        payload.assigneeRole = e.target.value;
        changeColor(spot.classList, `owner-${currentAssigneeRole}`, `owner-${payload.assigneeRole}`)
        currentAssigneeRole = payload.assigneeRole;
        emit('changeOwner', payload);
    });

    const defaultStatus = 'open';
    let statusSelect = document.createElement('select');
    if (!state.isAdmin) {
        statusSelect.disabled = true;
    }
    boxParts.container.appendChild(statusLabel);
    boxParts.container.appendChild(statusSelect);
    let statusOptionsArr = Object.keys(statusOptions);
    for (let i = 0; i < statusOptionsArr.length; i++) {
        let option = document.createElement('option');
        option.value = statusOptions[statusOptionsArr[i]];
        option.text = statusOptionsArr[i];
        statusSelect.appendChild(option);
    }
    let currentStatus = payload.status;
    if (payload.status && (payload.status !== defaultStatus)) {
        statusSelect.value = payload.status;
        changeColor(spot.classList, null, `status-${payload.status}`)
    } else {
        statusSelect.value = defaultStatus;
    }
    statusSelect.addEventListener('change', (e) => {
        payload.status = e.target.value;
        changeColor(spot.classList, `status-${currentStatus}`, `status-${payload.status}`)
        currentStatus = payload.status;
        emit('changeStatus', payload);
    });

    // add each comment to container
    addText(boxParts.container, payload); // first comment in root of payload
    payload.comments.forEach(comment => {
        addText(boxParts.container, comment, 'comment-reply');
    });

    let parts = addTextField(boxParts.container, 'Comment:', 'comment-textfield');
    parts.cancel.addEventListener('click', () => {
        const comment = generateComment(parts.textarea.value);
        parts.textarea.value = '';
        emit('cancelComment', comment);
        closeInfoBox();
    });

    parts.save.addEventListener('click', () => {
        if (parts.textarea.value) {
            const comment = generateComment(parts.textarea.value);
            parts.textarea.value = '';
            payload.comments.push(comment);
            emit('saveComment', payload);

            boxParts.container.removeChild(parts.container);
            addText(boxParts.container, comment, 'comment-reply');
            boxParts.container.appendChild(parts.container);
        } else {
            const comment = generateComment(parts.textarea.value);
            parts.textarea.value = '';
            emit('cancelComment', comment);
            closeInfoBox();
        }
    });

    return Object.assign({}, parts, boxParts);
}
