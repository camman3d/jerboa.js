import { getGlobalOffset, getRelativeOffset, getSelector, resolveContainer } from '../src/positioning';
import { expect } from 'chai';
import sinon from 'sinon';
import jsdom from 'mocha-jsdom';

describe('The positioning library', () => {
    jsdom();

    describe('The getSelector method', () => {
        let div1, div2, p, input;

        before(() => {
            div1 = document.createElement('div');
            div1.id = 'a';
            document.body.appendChild(div1);
            div2 = document.createElement('div');
            document.body.appendChild(div2);
            p = document.createElement('p');
            div1.appendChild(p);
            input = document.createElement('input');
            div2.appendChild(input);
        });

        after(() => {
            document.body.removeChild(div1);
            document.body.removeChild(div2);
        });

        it('should trace the DOM tree up to the body element', () => {
            let selector = getSelector(input);
            expect(selector).to.equal('body > div:nth-child(2) > input:nth-child(1)');
        });

        it('should trace the DOM tree until an id', () => {
            let selector = getSelector(p);
            expect(selector).to.equal('#a > p:nth-child(1)');
        });

        it('should return just the body if it is the target', () => {
            let selector = getSelector(document.body);
            expect(selector).to.equal('body');
        });

        it('should return just the tag w/ id if it is the target', () => {
            let selector = getSelector(div1);
            expect(selector).to.equal('#a');
        })
    });

    describe('The getGlobalOffset method', () => {

        let div;
        before(() => {
            div = document.createElement('div');
            div.offsetLeft = 123;
            div.offsetTop = 456;
        });

        it('should return the left and top offset of an element', () => {
            expect(getGlobalOffset(div)).to.deep.equal([123, 456]);
        });
    });

    describe('The getRelativeOffset method', () => {

        let target, container;
        before(() => {
            target = document.createElement('div');
            container = document.createElement('div');
            let middle = document.createElement('div');
            container.appendChild(middle);
            middle.appendChild(target);
            container.offsetLeft = 10;
            container.offsetTop = 20;
            target.offsetLeft = 50;
            target.offsetTop = 30;
        });

        it('should return the x/y offset of the child element from the parent', () => {
            expect(getRelativeOffset(target, container)).to.deep.equal([40, 10]);
        });
    });

    describe('The resolveContainer method', () => {

        let div1, div2;
        before(() => {
            div1 = document.createElement('div');
            div1.classList.add('some-thing');
            document.body.appendChild(div1);
            div2 = document.createElement('div');
            div1.appendChild(div2);
        });

        after(() => {
            document.body.removeChild(div1);
        });

        it('should return a falsey value if nothing resolves', () => {
            let container = resolveContainer(div2, () => false);
            expect(container).to.not.be.ok;
        });

        it('should return the element if the strategy resolves', () => {
            let container = resolveContainer(div2, e => e.classList.contains('some-thing'));
            expect(container).to.equal(div1);
        });
    });
});
