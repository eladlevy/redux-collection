import merge from 'lodash/object/merge';

export function reducerCreator({ types: {
    requestType, 
    successType, 
    failureType, 
    addType, 
    removeType, 
    resetType
}, collectionName }) {
    
    if (typeof collectionName !== 'string') {
        throw new Error('Expected collectionType to be a string.')
    }

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
                    ids: [...action.payload.result]
                });
            case failureType:
                return merge({}, state, {
                    isFetching: false
                });
            case addType:
                return merge({}, state, {
                    ids:  [...state.ids, ...action.payload.result]
                });
            case removeType:
                return Object.assign({}, state, {
                    ids: state.ids.filter(id => id !== action.meta.id)
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

export function entityReducerCreator({types: {
    requestEntityType,
    requestEntitySuccessType,
    requestEntityFailureType
}, entityName, defaultState = {}}) {
    if (typeof entityName !== 'string') {
        throw new Error('Expected entityName to be a string.')
    }

    return function entityReducer(state = {}, action) {
        switch (action.type) {
            case requestEntityType:
                return {
                    ...state,
                    [action.meta.id]: {
                        ...state[action.meta.id],
                        isFetching: true
                    }
                };
            case requestEntitySuccessType:
                return {
                    ...state,
                    [action.meta.id]: {
                        ...state[action.meta.id],
                        isFetching: false,
                        ...action.payload.entities[entityName][action.meta.id]
                    }
                };
            case requestEntityFailureType:
                return {
                    ...state,
                    [action.meta.id]: {
                        ...state[action.meta.id],
                        isFetching: false,
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