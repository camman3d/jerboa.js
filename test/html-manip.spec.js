import { addBox, addText, addTextField, closeInfoBox, createMarker, createInfoBox, __getOpenSpot, __setOpenSpot } from '../src/html-manip';
import { addEventListener } from '../src/events';
import { expect } from 'chai';
import sinon from 'sinon';
import jsdom from 'mocha-jsdom';

describe('The html manipulation library', () => {
    jsdom();

    function click(element) {
        let e = document.createEvent('HTMLEvents');
        e.initEvent('click', true, true);
        element.dispatchEvent(e);
    }

    describe('The createMarker method', () => {
        let div;
        before(() => {
            div = document.createElement('div');
            div.id = 'a';
            div.offsetLeft = div.offsetTop = 50;
            div.getBoundingClientRect = () => ({
                width: 100,
                height: 100
            });
            document.body.appendChild(div);
        });

        it('should create the marker using pixel positioning', () => {
            let marker = createMarker({
                position: {
                    container: '#a',
                    positioning: 'pixel',
                    offset: [10, 20]
                }
            });
            expect(marker).to.be.ok;
            expect(marker.style.top).to.equal('70px');
            expect(marker.style.left).to.equal('60px');
        });

        it('should create the marker using percent positioning', () => {
            let marker = createMarker({
                position: {
                    container: '#a',
                    positioning: 'percent',
                    offset: [20, 40],
                    containerSize: {
                        width: 80,
                        height: 80
                    }
                }
            });
            expect(marker).to.be.ok;
            expect(marker.style.left).to.equal('75px');
            expect(marker.style.top).to.equal('100px');
        });
    });

    describe('The addBox method', () => {
        let container, spot;
        before(() => {
            container = document.createElement('div');
            spot = document.createElement('div');
            container.appendChild(spot);
        });

        it('should add a non-toggled box', () => {
            let { box } = addBox(spot, false);

            expect(spot.children).to.not.be.empty;
            expect(box.classList.contains('toggled')).to.be.false;

            // Check event listeners
            let containerListener = sinon.spy();
            container.addEventListener('click', containerListener);
            let spotListener = sinon.spy();
            spot.addEventListener('click', spotListener);

            click(box);
            expect(spotListener.called).to.be.false;
            click(spot);
            expect(containerListener.called).to.be.false;
            expect(__getOpenSpot()).to.not.be.ok;
        });

        it('should add a toggled box', () => {
            let { box } = addBox(spot, true);

            expect(box.classList.contains('toggled')).to.be.true;

            // Check event listeners
            click(spot);
            expect(__getOpenSpot()).to.equal(spot);
            expect(spot.classList.contains('active')).to.be.true;

            click(spot);
            expect(__getOpenSpot()).to.not.be.ok;
            expect(spot.classList.contains('active')).to.be.false;
        });
    });

    describe('The closeInfoBox method', () => {
        it('should do nothing if there is no open box', () => {
            __setOpenSpot(null);
            closeInfoBox();
            expect(__getOpenSpot()).to.not.be.ok;
        });

        it('should close an open box', () => {
            let spot = document.createElement('div');
            spot.classList.add('active');
            __setOpenSpot(spot);
            closeInfoBox();
            expect(__getOpenSpot()).to.not.be.ok;
            expect(spot.classList.contains('active')).to.be.false;
        });
    });

    describe('The addText method', () => {
        it('should add text from the payload', () => {
            let container = document.createElement('div');
            let text = addText(container, {
                text: 'hello world',
                datetime: '2016-07-20T16:16:10.324Z',
                user: 'test-user'
            });
            expect(text.textContent).to.contain('hello world');
            expect(text.textContent).to.contain('test-user');
            expect(text.textContent).to.contain('7/20/2016');
        });

        it('should say "unknown user" if no user info is given', () => {
            let container = document.createElement('div');
            let text = addText(container, {
                text: 'hello world',
                datetime: '2016-07-20T16:16:10.324Z'
            });
            expect(text.textContent).to.contain('unknown user');
        });
    });

    describe('The addTextField method', () => {
        it('should create the field and buttons', () => {
            let boxContainer = document.createElement('div');
            let { cancel, save, textarea, container } = addTextField(boxContainer, 'some-label');

            expect(cancel.tagName).to.equal('BUTTON');
            expect(save.tagName).to.equal('BUTTON');
            expect(textarea.tagName).to.equal('TEXTAREA');
            expect(container.textContent).to.contain('some-label');
        });
    });

    describe('The createInfoBox method', () => {

        let spot, save, cancel, textarea;
        before(() => {
            spot = document.createElement('div');
            let parts = createInfoBox(spot, {
                text: 'test1',
                datetime: '2016-07-20T16:16:10.324Z',
                replies: [{
                    text: 'test2',
                    datetime: '2016-07-20T16:16:10.324Z'
                }]
            });
            save = parts.save;
            cancel = parts.cancel;
            textarea = parts.textarea;
        });

        it('should create a toggled box', () => {
            click(spot);
            expect(__getOpenSpot()).to.equal(spot);
            expect(spot.textContent).to.contain('test1');
            expect(spot.textContent).to.contain('test2');
            closeInfoBox();
        });

        it('should add click behavior to the cancel button', () => {
            click(spot);
            textarea.value = 'foo';
            let handler = sinon.spy();
            addEventListener('cancelReply', handler);
            click(cancel);
            expect(handler.called).to.be.true;
            expect(handler.args[0][0].text).to.equal('foo');
            expect(textarea.value).to.not.be.ok;
            expect(__getOpenSpot()).to.not.be.ok;
        });

        it('should add click behavior to the save button', () => {
            click(spot);
            textarea.value = 'bar';
            let handler = sinon.spy();
            addEventListener('saveReply', handler);
            click(save);
            expect(handler.called).to.be.true;
            expect(handler.args[0][0].replies).to.have.length(2);
            expect(handler.args[0][0].replies[1].text).to.equal('bar');
            expect(textarea.value).to.not.be.ok;
            expect(__getOpenSpot()).to.equal(spot);
            expect(spot.textContent).to.contain('bar');
            closeInfoBox();
        });
    });

});
