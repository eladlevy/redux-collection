import { combineReducers } from 'redux';
import { Schema, arrayOf } from 'normalizr';
import IterableSchema from 'normalizr/lib/IterableSchema';
import UnionSchema from 'normalizr/lib/UnionSchema';
import { reducerCreator, entityReducerCreator, generalEntitiesReducerCreator } from './reducerCreator';
import { actionCreator, actionPrefix } from './actionCreator';

function buildConstants(collectionName) {
    const uppercasedCollectionName = collectionName.toUpperCase();

    return [
        `${actionPrefix}/REQUEST_${uppercasedCollectionName}`,
        `${actionPrefix}/REQUEST_${uppercasedCollectionName}_SUCCESS`,
        `${actionPrefix}/REQUEST_${uppercasedCollectionName}_FAILURE`,
        `${actionPrefix}/ADD_${uppercasedCollectionName}`,
        `${actionPrefix}/REMOVE_${uppercasedCollectionName}`,
        `${actionPrefix}/UPDATE_${uppercasedCollectionName}`,
        `${actionPrefix}/RESET_${uppercasedCollectionName}`
    ];
}

export let collectionsProps = {};

export function createCollections(collectionsMap) {
    let collectionReducers = {};
    let collectionEntities = {};
    collectionsProps = Object.assign({}, collectionsProps, collectionsMap);
    Object.keys(collectionsMap).map((collectionName) => {
        collectionReducers[collectionName] = reducerCreator({types: buildConstants(collectionName), collectionName});
        collectionEntities[collectionName] = entityReducerCreator({types: buildConstants(collectionName), collectionName});
    });

    return combineReducers({entities: generalEntitiesReducerCreator(collectionEntities), selectedEntities: combineReducers(collectionReducers)});
}

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

export function denormalizeCollection({ collections }, collectionName) {
    const {entities, selectedEntities} = collections;
    const { schema } = collectionsProps[collectionName];
    const returnedCollection = selectedEntities[collectionName];
    return denormalize(entities,arrayOf(schema), returnedCollection.ids);
}

export const {
    addEntity,
    removeEntity,
    updateEntity,
    resetEntity
    } = actionCreator();
