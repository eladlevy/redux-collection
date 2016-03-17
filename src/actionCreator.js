import { collectionsProps } from './collection-tools';
import { normalize, Schema, arrayOf} from 'normalizr';

export const actionPrefix = 'redux-collection';

export function actionCreator() {
    const actionWrapper = function(actionType) {
        return function (collectionName, data) {
            const uppercasedCollectionName = collectionName.toUpperCase();
            const uppercasedActionType = actionType.toUpperCase();
            const { schema = new Schema(collectionName) } = collectionsProps[collectionName];
            let id;
            if (data) {
                id = data.id;
                var normalizedData = normalize(data, schema);
            }

            return {
                type: `${actionPrefix}/${uppercasedActionType}_${uppercasedCollectionName}`,
                id,
                payload: normalizedData
            };
        }
    };

    const networkActionWrapper = function(actionType) {
        return function (collectionName, data) {
            const uppercasedCollectionName = collectionName.toUpperCase();
            const uppercasedActionType = actionType.toUpperCase();
            const { schema = new Schema(collectionName) } = collectionsProps[collectionName];
            let id;
            if (data) {
                if (data instanceof Array) {
                    var normalizedData = normalize(data, arrayOf(schema));
                } else {
                    id = data.id;
                    var normalizedData = normalize(data, schema);
                }
            }

            return {
                type: `${actionPrefix}/${uppercasedActionType}_${uppercasedCollectionName}`,
                id,
                payload: normalizedData
            };
        }
    };

    return {
        addEntity: actionWrapper('add'),

        removeEntity: actionWrapper('remove'),

        updateEntity: actionWrapper('update'),

        resetEntity: actionWrapper('reset'),

        //network events
        requestCollection: networkActionWrapper('reset'),
        requestCollectionSuccess: networkActionWrapper('reset'),
        requestCollectionFailure: networkActionWrapper('reset')
    };
}