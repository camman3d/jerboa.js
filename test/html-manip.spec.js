import { addBox, addText, addTextField, closeInfoBox, createMarker } from '../src/html-manip';
import { expect } from 'chai';
import sinon from 'sinon';
import jsdom from 'mocha-jsdom';

describe('The html manipulation library', () => {
    jsdom();

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
