"use strict";

var gridCore = require("./ui.tree_list.core"),
    dataSourceAdapter = require("./ui.tree_list.data_source_adapter"),
    virtualScrollingModule = require("../grid_core/ui.grid_core.virtual_scrolling"),
    extend = require("../../core/utils/extend").extend;

var oldDefaultOptions = virtualScrollingModule.defaultOptions,
    originalDataControllerExtender = virtualScrollingModule.extenders.controllers.data;

virtualScrollingModule.extenders.controllers.data = extend({}, originalDataControllerExtender, {
    _loadOnOptionChange: function() {
        var virtualScrollController = this._dataSource && this._dataSource._virtualScrollController;

        virtualScrollController && virtualScrollController.reset();
        this.callBase();
    }
});

gridCore.registerModule("virtualScrolling", extend({}, virtualScrollingModule, {
    defaultOptions: function() {
        return extend(true, oldDefaultOptions(), {
            scrolling: {
                /**
                 * @name dxTreeListOptions_scrolling_mode
                 * @publicName mode
                 * @type string
                 * @acceptValues "standard" | "virtual"
                 * @default "virtual"
                 */
                mode: "virtual"
            }
        });
    }
}));

dataSourceAdapter.extend(virtualScrollingModule.extenders.dataSourceAdapter);
