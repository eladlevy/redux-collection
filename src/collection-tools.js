import { combineReducers } from 'redux';
import { Schema, arrayOf } from 'normalizr';
import IterableSchema from 'normalizr/lib/IterableSchema';
import UnionSchema from 'normalizr/lib/UnionSchema';
import { reducerCreator, entityReducerCreator, generalEntitiesReducerCreator } from './reducerCreator';
import { actionCreator, actionPrefix } from './actionCreator';

function buildConstants(collectionName) {
    const uppercasedCollectionName = collectionName.toUpperCase();
    
    return {
        requestType: `${actionPrefix}/REQUEST_${uppercasedCollectionName}`,
        successType: `${actionPrefix}/REQUEST_SUCCESS_${uppercasedCollectionName}`,
        failureType: `${actionPrefix}/REQUEST_FAILURE_${uppercasedCollectionName}`,
        addType: `${actionPrefix}/ADD_${uppercasedCollectionName}`,
        removeType: `${actionPrefix}/REMOVE_${uppercasedCollectionName}`,
        updateType: `${actionPrefix}/UPDATE_${uppercasedCollectionName}`,
        resetType: `${actionPrefix}/RESET_${uppercasedCollectionName}`
    };
}

function buildEntityConstants(entityName) {
    const uppercasedEntityName = entityName.toUpperCase();

    return {
        requestEntityType: `${actionPrefix}/REQUEST_ENTITY_${uppercasedEntityName}`,
        requestEntitySuccessType: `${actionPrefix}/REQUEST_ENTITY_SUCCESS_${uppercasedEntityName}`,
        requestEntityFailure: `${actionPrefix}/REQUEST_ENTITY_FAILURE_${uppercasedEntityName}`
    };
}

export let collectionsProps = {};

export function createCollections(collectionsMap) {
    let collectionReducers = {};
    let collectionEntities = {};
    collectionsProps = Object.assign({}, collectionsProps, collectionsMap);
    Object.keys(collectionsMap).map((collectionName) => {
        const {schema = new Schema(collectionName)} = collectionsMap[collectionName];
        const entityName = schema.getKey();
        collectionReducers[collectionName] = reducerCreator({types: buildConstants(collectionName), collectionName});
        collectionEntities[entityName] = entityReducerCreator({types: buildEntityConstants(entityName), entityName, defaultState: collectionsMap[collectionName].defaultState});
    });
    return combineReducers({entities: generalEntitiesReducerCreator(collectionEntities), selectedEntities: combineReducers(collectionReducers)});
}

//Inspired from https://github.com/elado/normalizr/blob/24e496c4057765ff7b0f7a9f8b633ae52d593b40/src/denormalize.js
function denormalize(bag, schema, id) {
    if (!id) return null;

    let normalizedEntity = null;

    if (schema.constructor === Schema) {
        const type = schema.getKey();
        normalizedEntity = bag[type] && bag[type][id]
    } else if (schema.constructor === UnionSchema) {
        normalizedEntity = bag[id.schema] && bag[id.schema][id.id]
    } else if (schema.constructor === IterableSchema) {
        const itemSchema = schema.getItemSchema();
        return id.map(i => denormalize(bag, itemSchema, i))
    } else {
        throw new Error('no such schema type: ' + schema.constructor.name)
    }

    if (!normalizedEntity) return null;

    const instance = { ...normalizedEntity };

    const relationKeys = Object.keys(schema).filter(k => k[0] != '_');

    for (let relaionKey of relationKeys) {
        let relationId = normalizedEntity[relaionKey];
        let cachedValue;

        Object.defineProperty(
            instance,
            relaionKey,
            {
                get() {
                    if (cachedValue) return cachedValue;

                    let denormalizedRelation = denormalize(bag, schema[relaionKey], relationId);
                    cachedValue = denormalizedRelation;

                    return denormalizedRelation
                }
            }
        )
    }

    return instance
}

export function getCollection({collections} , collectionName) {
    if (typeof collectionName !== 'string') {
        throw new Error('Expected collectionName to be a string.');
    }
    const {entities, selectedEntities} = collections;
    const { schema } = collectionsProps[collectionName];
    const collectionEntities = entities[schema.getKey()];
    const returnedCollection = selectedEntities[collectionName].ids.map((id)=> collectionEntities[id]);
    return {isFetching: selectedEntities[collectionName].isFetching, entities: returnedCollection};
}


//Helper function to denormalize entities or collections. Use with caution.
export function denormalizeCollection({ collections }, collectionName) {
    if (typeof collectionName !== 'string') {
        throw new Error('Expected collectionName to be a string.');
    }
    const {entities, selectedEntities} = collections;
    const { schema } = collectionsProps[collectionName];
    const returnedCollection = selectedEntities[collectionName];
    return denormalize(entities, arrayOf(schema || new Schema(collectionName)), returnedCollection.ids);
}

export function denormalizeEntity({ collections }, collectionName, entityId) {
    if (typeof collectionName !== 'string') {
        throw new Error('Expected collectionName to be a string.');
    }
    
    if (!entityId) {
        throw new Error('Expected entityId to be defined');
    }
    const {entities, selectedEntities} = collections;
    const { schema } = collectionsProps[collectionName];
    return denormalize(entities, schema || new Schema(collectionName), entityId);
}

export const {
    addEntity,
    removeEntity,
    updateEntity,
    resetEntity,
    requestCollection,
    requestCollectionSuccess,
    requestCollectionFailure,
    requestEntity,
    requestEntitySuccess,
    requestEntityFailure
    } = actionCreator();
