import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import { connect, Provider } from 'react-redux';
import { createStore } from 'redux';

import {createCollections, denormalizeCollection, addEntity, removeEntity, updateEntity, resetEntity} from '../../src/collection-tools';
import { Schema, arrayOf } from 'normalizr/lib';
const test = new Schema('positions');
const users = new Schema('users');
test.define({
    user: users,
    users: arrayOf(users)

});

let store = createStore(createCollections(
    {
        test: {
                schema: test
            },
        companies: {}
    })
);

class ExampleComponent extends Component {
    render() {
        const { test } = this.props;
        return (
            <div></div>
        )
    }
}

function mapStateToProps(state) {
    return {
        test: denormalizeCollection(state, 'test')
    }
}

const ConnectedComponent = connect(mapStateToProps)(ExampleComponent);

ReactDOM.render((<Provider store={store}>
        <ConnectedComponent></ConnectedComponent>
    </Provider>
), document.getElementById('container'));

store.dispatch(addEntity('test', { id:2, name: ' Roy', user: {id:99, firstName: 'I am a user!'}}));
store.dispatch(addEntity('test', {id:2, name:' Roy'}));
store.dispatch(addEntity('test', {id:12, name:' Blah'}));
store.dispatch(addEntity('test', {id:31, name:' Josh'}));
store.dispatch(addEntity('companies', {id:999, type: 'high School'}));
store.dispatch(updateEntity('test', {id:12, name:'Elad'}));
store.dispatch(updateEntity('companies', {id:999, type: 'Middle School'}));
store.dispatch(removeEntity('test', {id:12}));
store.dispatch(addEntity('test', {id:12, name:'Yo yo'}));
store.dispatch(resetEntity('test'));