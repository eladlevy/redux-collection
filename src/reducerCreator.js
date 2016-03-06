
export function reducerCreator({ types, collectionType }) {
    if (!types.every(t => typeof t === 'string')) {
        throw new Error('Expected types to be strings.')
    }
    if (typeof collectionType !== 'string') {
        throw new Error('Expected collectionType to be a string.')
    }
    const [ requestType, successType, failureType , addType, removeType, resetType ] = types;

    //return function updateUserProfile(state = {
    //    isFetching: false,
    //    ids: []
    //}, action) {
    //    switch (action.type) {
    //        case requestType:
    //            return merge({}, state, {
    //                isFetching: true
    //            });
    //        case successType:
    //            return merge({}, state, {
    //                isFetching: false,
    //                ids: union(action.payload.result, state.ids)
    //            });
    //        case failureType:
    //            return merge({}, state, {
    //                isFetching: false
    //            });
    //    }
    //
    //    if (action.meta && action.meta.entityType == collectionType) {
    //        switch (action.type) {
    //            case actions.CREATE_ENTITY:
    //            case actions.ADD_EXISTING_ENTITY_TO_USER:
    //                let newIds = isArray(action.payload.result)? action.payload.result: [action.payload.result];
    //                return Object.assign({}, state, {
    //                    ids: union(newIds, state.ids)
    //                });
    //            case actions.ENTITY_CREATE_SUCCESS:
    //                return Object.assign({}, state, {
    //                    ids: without(union([action.payload.result], state.ids), action.meta.id),
    //                    positionFetching: false
    //                });
    //            case actions.ENTITY_DELETE_SUCCESS:
    //                return Object.assign({}, state, {
    //                    ids: without(state.ids, action.meta.id),
    //                    positionFetching: false
    //                });
    //            case actions.DELETE_ENTITY_ACTION:
    //            case actions.CREATE_ENTITY_ACTION:
    //            case actions.UPDATE_ENTITY_ACTION:
    //                return Object.assign({}, state, {positionFetching: action.meta.id});
    //            case actions.ENTITY_UPDATE_SUCCESS:
    //            case actions.ENTITY_UPDATE_FAILURE:
    //            case actions.ENTITY_CREATE_FAILURE:
    //            case actions.ENTITY_DELETE_FAILURE:
    //                return Object.assign({}, state, {positionFetching: false});
    //            default:
    //                return state
    //        }
    //    }
    //
    //    return state;
    //}
}