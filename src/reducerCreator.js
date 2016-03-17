import merge from 'lodash.merge';

export function reducerCreator({ types, collectionName }) {
    if (!types.every(t => typeof t === 'string')) {
        throw new Error('Expected types to be strings.')
    }
    if (typeof collectionName !== 'string') {
        throw new Error('Expected collectionType to be a string.')
    }

    const [ requestType, successType, failureType , addType, removeType, updateType, resetType ] = types;

    return function collectionReducer(state = {
        isFetching: false,
        ids: []
    }, action) {
        switch (action.type) {
            case requestType:
                return merge({}, state, {
                    isFetching: true
                });
            case successType:
                return merge({}, state, {
                    isFetching: false,
                    ids: union(action.payload.result, state.ids)
                });
            case failureType:
                return merge({}, state, {
                    isFetching: false
                });
            case addType:
                return merge({}, state, {
                    ids:  [...state.ids, action.id]
                });
            case removeType:
                return Object.assign({}, state, {
                    ids: [
                        ...state.ids.slice(0, state.ids.indexOf(action.id)),
                        ...state.ids.slice(state.ids.indexOf(action.id + 1))
                    ]
                });
            case resetType:
                return Object.assign({}, state, {
                    isFetching: false,
                    ids: []
                });
        }

        return state;
    }
}

export function entityReducerCreator({types, collectionName}) {
    const [ requestType, successType, failureType , addType, removeType, updateType,resetType ] = types;
    if (typeof collectionName !== 'string') {
        throw new Error('Expected collectionType to be a string.')
    }

    return function entityReducer(state = {}, action) {
        switch (action.type) {
            case addType:
                return {
                    ...state,
                    [action.id]: {
                        ...action.payload.entities[collectionName][action.id]
                    }
                };
            case updateType:
                return {
                    ...state,
                    [action.id]: {
                        ...state[action.id],
                        ...action.payload.entities[collectionName][action.id]
                    }
                };
        }
        return state;
    }
}

export function generalEntitiesReducerCreator(entitiesReducers) {

    return function entityReducer(state = {}, action) {
        if (action.payload && action.payload.entities) {
            Object.keys(action.payload.entities).map((entityName) => {
                if (entitiesReducers[entityName]) {
                    state[entityName] = entitiesReducers[entityName](state[entityName], action);
                }
            });

            return merge({}, state, action.payload.entities)
        }
        return state;
    };
}