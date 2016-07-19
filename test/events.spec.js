import { addEventListener, emit, __listeners } from '../src/events';
import { expect } from 'chai';
import sinon from 'sinon';

describe('The events library', () => {
   it('should register event listeners', () => {
       let handler = sinon.spy();
       expect(__listeners.foo).to.be.undefined;
       addEventListener('foo', handler);
       expect(__listeners.foo).to.not.be.undefined;
       expect(handler.called).to.be.false;
       __listeners.foo[0]();
       expect(handler.called).to.be.true;
       delete __listeners.foo;
   });

    it('should trigger handlers on event emit', () => {
        let handler = sinon.spy();
        addEventListener('foo', handler);
        expect(handler.called).to.be.false;
        emit('foo', {a: 'b'});
        expect(handler.called).to.be.true;
        expect(handler.args[0][0]).to.deep.equal({a: 'b'});
    });
});
