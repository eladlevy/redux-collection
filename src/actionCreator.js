import { collectionsProps } from './collection-tools';
import { normalize, Schema, arrayOf} from 'normalizr';
import _ from 'lodash';

export const actionPrefix = 'redux-collection';

function constBuilder(actionType, collectionName) {
    const uppercasedCollectionName = collectionName.toUpperCase();
    const uppercasedActionType = actionType.toUpperCase();
    return`${actionPrefix}/${uppercasedActionType}_${uppercasedCollectionName}`
}

export function actionCreator() {
    const actionWrapper = function(actionType, entityAction) {
        return function ({collectionName, data, getString, entityName, meta={}}) {
            if (typeof collectionName !== 'string' && !entityAction) {
                throw new Error('Expected collectionName to be a string.');
            }

            const { schema = new Schema(collectionName || entityName) } = collectionsProps[collectionName] || {};
            const actionString = constBuilder(actionType, entityAction ? schema.getKey() : collectionName);

            if (getString) return actionString;

            let id;
            let payload;
            if (data) {
                if (data instanceof Array) {
                    payload = normalize(data, arrayOf(schema));
                } else {
                    if (!data.id) {
                        data.id = _.uniqueId('client_');
                    }
                    id = data.id;
                    payload = normalize(data, schema);
                }
            }

            return {
                type: actionString,
                meta: Object.assign({}, {id}, meta),
                payload
            };
        }
    };

    const replaceEntityActionWrapper = function(actionType, entityAction) {
        const action = actionWrapper(actionType, entityAction);
        return function ({collectionName, data, getString}, replaceId) {
            if (!getString && !replaceId) throw new Error('Expected replaceId to be defined');
            return action({collectionName, data, getString, meta: { replaceId: parseInt(replaceId)}});
        }
    };

    return {
        addEntity: actionWrapper('add'),
        removeEntity: actionWrapper('remove'),
        updateEntity: actionWrapper('update'),
        replaceEntity: replaceEntityActionWrapper('replace'),
        bulkUpdateEntities: actionWrapper('bulk_update', true),
        resetEntity: actionWrapper('reset'),

        //collection network events
        requestCollection: actionWrapper('request'),
        requestCollectionSuccess: actionWrapper('request_success'),
        requestCollectionFailure: actionWrapper('request_failure'),

        //entity network events
        requestEntity: actionWrapper('request_entity', true),
        requestEntitySuccess: actionWrapper('request_entity_success', true),
        requestEntityFailure: actionWrapper('request_entity_success', true)
    };
}