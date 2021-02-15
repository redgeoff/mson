import cloneDeep from 'lodash/cloneDeep';
import isEqual from 'lodash/isEqual';

// TODO: improve the loading when scrolling up so that the user can "jump" to previous pages.
// Currently, when we scroll up the pages are loaded in reverse order, which means that it can take
// a while to get to where the user has scrolled. Instead, clear all the items and start fresh from
// the current place--may need to approximate it. Will there be problems with this as the height of
// the items is variable?

// NOTE: we cannot use react-virtualized as react-virtualized doesn't appear to work with responsive
// content like MaterialUI's grid.

// NOTE: to simplify the logic by removing the need to calculate the itemsPerRow when the screen
// size changes, we simply expect itemsPerPage to be a multiple of 4. This assumes that the max
// number of columns that will be shown on any screen is 4 and that the grid downsizes by a factor
// of 2, i.e. 4 => 2 => 1. With this assumption we can be sure that the cells in the grid will not
// shift as we remove/add entire rows and not partial rows. In the future we may decide that we want
// to support an odd number of columns. This will significantly increase the complexity, but can be
// accomplished by calculating the following on window resize: 1. itemsPerPage, 2. Select a previous
// item for buffer top so that buffer aligns with items per row.

// |    Spacer     |
// |---------------|
// |  Buffer Top   |
// |      ...      |
// |  - - - - - -  |
// |   Viewport    |
// |  - - - - - -  |
// |      ...      |
// | Buffer Bottom |
// |---------------|
// |  End Screen   |
export default class InfiniteLoader {
  constructor({
    onGetAll,
    onGetItemsPerPage,
    onGetScrollThreshold,
    onGetMaxBufferPages,
    onGetItemElement,
    onGetSpacerElement,
    onRemoveItems,
    onResizeSpacer,
    onSetBufferTopId,
    onGetItem,
    onGetItems,
    onGetItemId,
    onGetItemCursor,
    onAddItem,
    onAddItems,
    onEmitChange,
    onSetIsLoading,
    onGetOrder,
    onGetWhere,
    onGetSearchString,
  }) {
    this._onGetAll = onGetAll;
    this._onGetItemsPerPage = onGetItemsPerPage;
    this._onGetScrollThreshold = onGetScrollThreshold;
    this._onGetMaxBufferPages = onGetMaxBufferPages;
    this._onGetItemElement = onGetItemElement;
    this._onGetSpacerElement = onGetSpacerElement;
    this._onRemoveItems = onRemoveItems;
    this._onResizeSpacer = onResizeSpacer;
    this._onSetBufferTopId = onSetBufferTopId;
    this._onGetItem = onGetItem;
    this._onGetItems = onGetItems;
    this._onSetIsLoading = onSetIsLoading;
    this._onGetOrder = onGetOrder;
    this._onGetWhere = onGetWhere;
    this._onGetSearchString = onGetSearchString;

    this._onGetItemId = onGetItemId;
    this._onGetItemCursor = onGetItemCursor;
    this._onAddItem = onAddItem;
    this._onAddItems = onAddItems;
    this._onEmitChange = onEmitChange;

    this.reset();
  }

  _resizeBuffer({ previous }) {
    if (previous) {
      // We just added to the top of the buffer so remove from the bottom of the buffer
      this._bufferBottomId = this._onRemoveItems(
        this._bufferBottomId,
        this._onGetItemsPerPage(),
        true
      );
      const item = this._onGetItem(this._bufferBottomId);
      this._bufferBottomCursor = this._onGetItemCursor(item);
    } else {
      const bufferTop = this._onGetItemElement(this._bufferTopId);

      // We just added to the bottom of the buffer so remove from the top of the buffer
      const newBufferTopId = this._onRemoveItems(
        this._bufferTopId,
        this._onGetItemsPerPage()
      );

      const newBufferBegin = this._onGetItemElement(newBufferTopId);

      const dHeight = newBufferBegin.offsetTop - bufferTop.offsetTop;

      // Resize the spacer to account for the removed items
      this._onResizeSpacer(dHeight);

      this._bufferTopId = newBufferTopId;
      const item = this._onGetItem(newBufferTopId);
      this._bufferTopCursor = this._onGetItemCursor(item);
    }
  }

  _setDefaults() {
    if (!this._bufferTopCursor) {
      this._bufferTopCursor = this._beginCursor;
      this._bufferTopId = this._beginId;
    }

    if (!this._bufferBottomCursor) {
      this._bufferBottomCursor = this._endCursor;
      this._bufferBottomId = this._endId;
    }
  }

  _resetBufferReferences() {
    this._bufferTopId = null;
    this._bufferTopCursor = null;
    this._firstCursor = null;
    this._bufferBottomId = null;
    this._bufferBottomCursor = null;
    this._bufferSize = 0;
  }

  reset() {
    this._resetBufferReferences();
    this._lastGetAllProps = null;
    this._lastScrollY = null;
    this._spacerResizing = false;
    this._showArchived = false;
    this._onSetBufferTopId(null);
    this._onSetIsLoading(false);
    this._onResizeSpacer(null, 0);
  }

  async getAll(props) {
    let beginId = null;
    let endId = null;

    props = props ? cloneDeep(props) : {};

    props.showArchived = this._showArchived;

    if (this._onGetWhere) {
      props.where = this._onGetWhere();
    }

    if (this._onGetSearchString) {
      props.searchString = this._onGetSearchString();
    }

    if (this._onGetOrder) {
      props.order = this._onGetOrder();
    }

    if (props.before) {
      props.last = this._onGetItemsPerPage();
    } else {
      props.first = this._onGetItemsPerPage();
    }

    // FUTURE: when getting previous page, could use before just to find beginCursor and then use
    // after with beginCursor so that get same data already in cache when scrolling up. Or, is this
    // optimization not really worth it?
    const records = await this._getAllDebounced(props);

    // Not debounced?
    if (records) {
      let first = null;
      let last = null;
      const size = records.edges.length;

      const beforeKey = props.before ? this._bufferTopId : null;

      await this._onAddItems(records.edges, beforeKey);

      if (size > 0) {
        if (!this._firstCursor) {
          this._firstCursor = records.edges[0].cursor;
        }
        first = records.edges[0];
        beginId = first.node.id;
        last = records.edges[size - 1];
        endId = last.node.id;

        this._beginCursor = first.cursor;
        this._endCursor = last.cursor;
        this._beginId = beginId;
        this._endId = endId;
        this._bufferSize += size;

        this._setDefaults();

        // We emit records so that we trigger a change even whenever the data changes
        this._onEmitChange(records);
      }
    }

    return records;
  }

  _noMoreData(records) {
    return (
      !records ||
      (!!records.edges && records.edges.length === 0) ||
      (!!records.pageInfo && !records.pageInfo.hasNextPage)
    );
  }

  async _getAllDebounced(props) {
    // Standardize props
    if (!props.after) {
      props.after = null;
    }
    if (!props.before) {
      props.before = null;
    }

    // Props changing? Debounce duplicates
    if (!isEqual(props, this._lastGetAllProps)) {
      this._onSetIsLoading(true);
      this._lastGetAllProps = cloneDeep(props);
      const records = await this._onGetAll(props);

      // No more data?
      if (this._noMoreData(records)) {
        // Set isLoading to false as the UI will not be changed so the UI will not set isLoading
        this._onSetIsLoading(false);
      }

      return records;
    }
  }

  async _getMore({ previous }) {
    const props = {};

    if (previous) {
      props.before = this._bufferTopCursor;
    } else {
      props.after = this._bufferBottomCursor;
    }

    const records = await this.getAll(props);

    const maxBufferSize =
      this._onGetMaxBufferPages() * this._onGetItemsPerPage();

    this._lastMoreWasPrevious = previous;

    // Not debounced?
    if (records && records.edges.length > 0) {
      if (previous) {
        const oldBufferTopId = this._bufferTopId;

        // Move buffer pointers up
        if (records.pageInfo.hasPreviousPage) {
          // Some data stores, like DynamoDB, don't return a cursor on the first page. When this
          // occurs we want to avoid updating the _bufferTopCursor so that duplicate calls to
          // getAll() can be ignored.
          this._bufferTopCursor = this._beginCursor;
        }
        this._bufferTopId = this._beginId;

        // Resize the spacer to account for the inserted items after the DOM has been upated. Note:
        // we cannot call _onResizeSpacer() directly as our items may have yet to be rendered and
        // therefore we would have no way of knowing how much to adjust our spacer as the size of
        // our items is variable.
        this._onSetBufferTopId(oldBufferTopId);
      } else {
        // Move buffer pointers down
        if (records.pageInfo.hasNextPage) {
          // Some data stores, like DynamoDB, don't return a cursor on the last page. When this
          // occurs we want to avoid updating the _bufferBottomCursor so that duplicate calls to
          // getAll() can be ignored.
          this._bufferBottomCursor = this._endCursor;
        }
        this._bufferBottomId = this._endId;
      }

      // Has our buffer reached its max size?
      if (this._bufferSize > maxBufferSize) {
        this._resizeBuffer({ previous });
      }
    }
  }

  resizeSpacer(bufferTopId) {
    const bufferTop = this._onGetItemElement(bufferTopId);

    // Has the buffer top been rendered?
    if (bufferTop) {
      const spacer = this._onGetSpacerElement();
      const dHeight =
        spacer.offsetTop + spacer.offsetHeight - bufferTop.offsetTop;

      if (dHeight > 0) {
        // Only set to true if we are actually resizing or else the React layer will never detect a
        // change in spacerHeight
        this._spacerResizing = true;
      }

      this._onResizeSpacer(dHeight);
    }
  }

  _shouldLoadPrevious(scrollY) {
    // Elements may not exist if they have not yet been rendered
    const bufferTop = this._onGetItemElement(this._bufferTopId);
    const beginning = this.beginningLoaded();
    return (
      bufferTop &&
      scrollY < bufferTop.offsetTop + this._onGetScrollThreshold() &&
      !beginning
    );
  }

  _shouldLoadNext(scrollY) {
    // Elements may not exist if they have not yet been rendered
    const bufferBottom = this._onGetItemElement(this._bufferBottomId);
    return (
      bufferBottom &&
      scrollY >
        bufferBottom.offsetTop +
          bufferBottom.offsetHeight -
          this._onGetScrollThreshold()
    );
  }

  async scroll({ scrollY }) {
    const down =
      !this._lastScrollY || scrollY >= this._lastScrollY ? true : false;
    this._lastScrollY = scrollY;

    if (this._spacerResizing) {
      // The spacer is resizing so we need to ignore any scroll events or else we can trigger a
      // cascade of previous page loads when scrolling up as items are added to the top of the
      // buffer and the spacer is not yet resized.
      return;
    }

    if (!down && this._shouldLoadPrevious(scrollY)) {
      await this._getMore({ previous: true });
    } else if (down && this._shouldLoadNext(scrollY)) {
      await this._getMore({ previous: false });
    }
  }

  setSpacerResizing(resizing) {
    this._spacerResizing = resizing;

    // Are we no longer resizing, was the last getMore for a previous page and have we scrolled to a
    // position where more previous items are needed? We also check beginningLoaded() as this
    // reduces the likelyhood of a race condition where the user scrolls all the way up and then
    // very quickly scrolls down and up repeatedly, resulting in an inproperly sized spacer. TODO:
    // properly fix this as it is still possible to encounter this race condition.
    if (
      !resizing &&
      this._lastMoreWasPrevious &&
      this._shouldLoadPrevious(window.scrollY) &&
      !this.beginningLoaded()
    ) {
      // We kick off another getMore just in the case the user has scrolled up and now waiting for
      // earlier items to load.

      // We don't await here as we are just kicking of a tick to do the loading
      this._getMore({ previous: true });
    }
  }

  beginningLoaded() {
    return this._bufferTopCursor === this._firstCursor;
  }

  setShowArchived(showArchived) {
    this._showArchived = showArchived;
  }

  removeItem(id) {
    // Are we removing one of the buffer references?
    if (id === this._bufferTopId || id === this._bufferBottomId) {
      // Reposition the buffer references as they need to be accurate when we resize the buffer

      const reverse = id === this._bufferBottomId;
      const items = this._onGetItems(id, reverse);
      let newId = null;
      let newCursor = null;
      let i = 0;
      for (const item of items) {
        newId = this._onGetItemId(item);
        newCursor = this._onGetItemCursor(item);

        // Exit loop as we only need the second item
        if (i++ === 1) {
          break;
        }
      }

      if (newId) {
        if (id === this._bufferTopId) {
          this._bufferTopId = newId;
          this._bufferTopCursor = newCursor;
          this._firstCursor = newCursor;
        } else {
          // id === this._bufferBottomId
          this._bufferBottomId = newId;
          this._bufferBottomCursor = newCursor;
        }
      } else {
        this._resetBufferReferences();
      }
    }
  }
}
