import StoreMapa from '../stores/store-mapa';

// Dynamically moves the docs when the order is adjusted
export default class CollectionMapa extends StoreMapa {
  _getProp(doc, name) {
    return doc.getValue(name);
  }
}
