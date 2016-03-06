export {reducerCreator} from './reducerCreator';

function buildConstants(collectionName) {
    const uppercasedCollectionName = collectionName.toUpperCase();

    return [
        `ADD_${uppercasedCollectionName}`,
        `REMOVE_${uppercasedCollectionName}`,
        `MERGE_${uppercasedCollectionName}`,
        `RESET_${uppercasedCollectionName}`,
    ];
}

export default function createCollections(collectionsMap) {
    let collectionReducers = {};
    return Object.keys(collectionsMap).map((collectionName) => {
        collectionReducers[collectionName] = reducerCreator(buildConstants(collectionName))
    });
}
