import { collectionsProps } from './collection-tools';
import { normalize, Schema, arrayOf} from 'normalizr';
import uniqueId from 'lodash/utility/uniqueId';

export const actionPrefix = 'redux-collection';

function constBuilder(actionType, collectionName) {
    const uppercasedCollectionName = collectionName.toUpperCase();
    const uppercasedActionType = actionType.toUpperCase();
    return`${actionPrefix}/${uppercasedActionType}_${uppercasedCollectionName}`
}

export function actionCreator() {
    const actionWrapper = function(actionType, entityAction) {
        return function ({collectionName, data, getString}) {
            if (typeof collectionName !== 'string') {
                throw new Error('Expected collectionName to be a string.');
            }

            const { schema = new Schema(collectionName) } = collectionsProps[collectionName];
            const actionString = constBuilder(actionType, entityAction ? schema.getKey() : collectionName);

            if (getString) return actionString;

            let id;
            let payload;
            if (data) {
                if (data instanceof Array) {
                    payload = normalize(data, arrayOf(schema));
                } else {
                    if (!data.id) {
                        data.id = uniqueId('client_');
                    }
                    id = data.id;
                    payload = normalize(data, schema);
                }
            }

            return {
                type: actionString,
                meta: {id},
                payload
            };
        }
    };

    return {
        addEntity: actionWrapper('add'),
        removeEntity: actionWrapper('remove'),
        updateEntity: actionWrapper('update'),
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