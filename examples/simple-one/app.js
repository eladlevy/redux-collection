import { createStore } from 'redux'
import {createCollections, addEntity, removeEntity, updateEntity, resetEntity} from '../../lib/collection-tools';


let store = createStore(createCollections({test: {}}));


store.subscribe(() =>
    console.log(JSON.stringify(store.getState()))
);

store.dispatch(addEntity('test', {id:2, name:' Roy'}));
store.dispatch(addEntity('test', {id:12, name:' Blah'}));
store.dispatch(addEntity('test', {id:31, name:' Josh'}));
store.dispatch(updateEntity('test', {id:12, name:'Elad'}));
store.dispatch(removeEntity('test', {id:12}));
store.dispatch(addEntity('test', {id:12, name:'Yo yo'}));
//store.dispatch(resetEntity('test'));