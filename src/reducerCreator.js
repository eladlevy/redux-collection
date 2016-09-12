import _ from 'lodash';

export function reducerCreator({ types: {
    requestType,
    successType,
    failureType,
    addType,
    replaceType,
    removeType,
    resetType
}, collectionName, reducer }) {

    if (typeof collectionName !== 'string') {
        throw new Error('Expected collectionType to be a string.')
    }

    if (reducer && typeof reducer !== 'function') {
        throw new Error('Expected reducer to be a function.')
    }

    function collectionReducer(state = {
        isFetching: false,
        ids: []
    }, action) {
        switch (action.type) {
            case requestType:
                return Object.assign({}, state, {
                    isFetching: true
                });
            case successType:
                return Object.assign({}, state, {
                    isFetching: false,
                    ids: [...action.payload.result]
                });
            case failureType:
                return Object.assign({}, state, {
                    isFetching: false
                });
            case addType:
                const { meta = {}} = action;
                const { index = state.ids.length } = meta;
                return Object.assign({}, state, {
                    ids:  [
                        ...state.ids.slice(0, index),
                        ...Array.isArray(action.payload.result)? action.payload.result : [action.payload.result],
                        ...state.ids.slice(index)
                    ]
                });
            case replaceType:
                const { replaceId } = action.meta;
                let replaceIndex = state.ids.indexOf(replaceId);
                replaceIndex = replaceIndex == -1 ? 0 : replaceIndex;
                return Object.assign({}, state, {
                    ids:  [
                        ...state.ids.slice(0, replaceIndex),
                        ...Array.isArray(action.payload.result)? action.payload.result : [action.payload.result],
                        ...state.ids.slice(replaceIndex + 1)
                    ]
                });
            case removeType:
                return Object.assign({}, state, {
                    ids: state.ids.filter(id => id !== action.meta.id)
                });
            case resetType:
                const defaultIds = Array.isArray(action.payload.result)? action.payload.result : [action.payload.result];
                return Object.assign({}, state, {
                    isFetching: false,
                    ids: [...action.payload.result? defaultIds: []]
                });
            default:
                return state;
        }
    }

    return function (state, action) {
        const result = collectionReducer(state, action);
        return {
            ...result,
            ...(reducer && reducer(result, action))
        }
    }
}

export function entityReducerCreator({types: {
    requestEntityType,
    requestEntitySuccessType,
    requestEntityFailureType,
    updateType,
    bulkUpdateType
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
                        ...(action.payload.entities && action.payload.entities[entityName][action.meta.id])
                    }
                };
            case requestEntityFailureType:
                return {
                    ...state,
                    [action.meta.id]: {
                        ...state[action.meta.id],
                        isFetching: false
                    }
                };
            case updateType:
                return {
                    ...state,
                    [action.meta.id]: {
                        ...state[action.meta.id],
                        ...action.payload.entities[entityName][action.meta.id]
                    }
                };

            case bulkUpdateType:
                return {
                    ...state,
                    ...action.payload.entities[entityName]
                };
            default:
                return state;
        }
    }
}

export function generalEntitiesReducerCreator(entitiesReducers) {

    return function entityReducer(state = {}, action) {
        Object.keys(state).map((entityName) => {
            if (entitiesReducers[entityName]) {
                state[entityName] = entitiesReducers[entityName](state[entityName], action);
            }
        });

        if (action.payload && action.payload.entities) {
            Object.keys(action.payload.entities).map((entityName) => {
                const mergedEntities = {};
                //merge only the changed entities
                Object.keys(action.payload.entities[entityName]).map(entityId => {
                    mergedEntities[entityId] = _.merge({}, (state[entityName] && state[entityName][entityId])|| {}, action.payload.entities[entityName][entityId]);
                });

                state[entityName] = Object.assign({}, state[entityName], mergedEntities);
            });
        }
        return state;
    };
}