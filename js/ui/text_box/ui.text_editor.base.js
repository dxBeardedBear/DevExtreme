"use strict";

var $ = require("../../core/renderer"),
    eventsEngine = require("../../events/core/events_engine"),
    domUtils = require("../../core/utils/dom"),
    focused = require("../widget/selectors").focused,
    isDefined = require("../../core/utils/type").isDefined,
    extend = require("../../core/utils/extend").extend,
    inArray = require("../../core/utils/array").inArray,
    each = require("../../core/utils/iterator").each,
    themes = require("../themes"),
    Editor = require("../editor/editor"),
    eventUtils = require("../../events/utils"),
    pointerEvents = require("../../events/pointer"),
    clickEvent = require("../../events/click");

var TEXTEDITOR_CLASS = "dx-texteditor",
    TEXTEDITOR_INPUT_CLASS = "dx-texteditor-input",
    TEXTEDITOR_INPUT_SELECTOR = "." + TEXTEDITOR_INPUT_CLASS,
    TEXTEDITOR_CONTAINER_CLASS = "dx-texteditor-container",
    TEXTEDITOR_BUTTONS_CONTAINER_CLASS = "dx-texteditor-buttons-container",
    TEXTEDITOR_PLACEHOLDER_CLASS = "dx-placeholder",
    TEXTEDITOR_SHOW_CLEAR_BUTTON_CLASS = "dx-show-clear-button",
    TEXTEDITOR_ICON_CLASS = "dx-icon",
    TEXTEDITOR_CLEAR_ICON_CLASS = "dx-icon-clear",
    TEXTEDITOR_CLEAR_BUTTON_CLASS = "dx-clear-button-area",
    TEXTEDITOR_EMPTY_INPUT_CLASS = "dx-texteditor-empty";

var EVENTS_LIST = [
    "KeyDown", "KeyPress", "KeyUp",
    "Change", "Cut", "Copy", "Paste", "Input"
];

var CONTROL_KEYS = [
    "Tab",
    "Enter",
    "Shift",
    "Control",
    "Alt",
    "Escape",
    "PageUp",
    "PageDown",
    "End",
    "Home",
    "ArrowLeft",
    "ArrowUp",
    "ArrowRight",
    "ArrowDown",
    //IE9 fallback:
    "Esc",
    "Left",
    "Up",
    "Right",
    "Down"
];

/**
* @name dxTextEditor
* @publicName dxTextEditor
* @inherits Editor
* @hidden
*/
var TextEditorBase = Editor.inherit({

    _supportedKeys: function() {
        var stop = function(e) {
            e.stopPropagation();
        };
        return {
            space: stop,
            enter: stop,
            leftArrow: stop,
            rightArrow: stop
        };
    },

    _setDeprecatedOptions: function() {
        this.callBase();

        extend(this._deprecatedOptions, {
            /**
            * @name dxTextEditorOptions_attr
            * @publicName attr
            * @deprecated dxTextEditorOptions_inputAttr
            * @extend_doc
            */
            "attr": { since: "16.2", alias: "inputAttr" }
        });
    },

    _getDefaultOptions: function() {
        return extend(this.callBase(), {
            /**
            * @name dxTextEditorOptions_value
            * @publicName value
            * @type any
            * @default ""
            */
            value: "",

            /**
            * @name dxTextEditorOptions_spellcheck
            * @publicName spellcheck
            * @type boolean
            * @default false
            */
            spellcheck: false,

            /**
            * @name dxTextEditorOptions_showClearButton
            * @publicName showClearButton
            * @type boolean
            * @default false
            */
            showClearButton: false,

            /**
            * @name dxTextEditorOptions_valueChangeEvent
            * @publicName valueChangeEvent
            * @type string
            * @default "change"
            */
            valueChangeEvent: "change",

            /**
            * @name dxTextEditorOptions_placeholder
            * @publicName placeholder
            * @type string
            * @default ""
            */
            placeholder: "",

            /**
            * @name dxTextEditorOptions_inputAttr
            * @publicName inputAttr
            * @type object
            * @default {}
            */
            inputAttr: {},

            /**
            * @name dxTextEditorOptions_onFocusIn
            * @publicName onFocusIn
            * @extends Action
            * @type function(e)
            * @type_function_param1 e:object
            * @type_function_param1_field4 jQueryEvent:jQuery.Event:deprecated(event)
            * @type_function_param1_field5 event:event
            * @action
            */
            onFocusIn: null,

            /**
            * @name dxTextEditorOptions_onFocusOut
            * @publicName onFocusOut
            * @extends Action
            * @type function(e)
            * @type_function_param1 e:object
            * @type_function_param1_field4 jQueryEvent:jQuery.Event:deprecated(event)
            * @type_function_param1_field5 event:event
            * @action
            */
            onFocusOut: null,

            /**
            * @name dxTextEditorOptions_onKeyDown
            * @publicName onKeyDown
            * @extends Action
            * @type function(e)
            * @type_function_param1 e:object
            * @type_function_param1_field4 jQueryEvent:jQuery.Event:deprecated(event)
            * @type_function_param1_field5 event:event
            * @default null
            * @action
            */
            onKeyDown: null,

            /**
            * @name dxTextEditorOptions_onKeyPress
            * @publicName onKeyPress
            * @extends Action
            * @type function(e)
            * @type_function_param1 e:object
            * @type_function_param1_field4 jQueryEvent:jQuery.Event:deprecated(event)
            * @type_function_param1_field5 event:event
            * @action
            */
            onKeyPress: null,

            /**
            * @name dxTextEditorOptions_onKeyUp
            * @publicName onKeyUp
            * @extends Action
            * @type function(e)
            * @type_function_param1 e:object
            * @type_function_param1_field4 jQueryEvent:jQuery.Event:deprecated(event)
            * @type_function_param1_field5 event:event
            * @action
            */
            onKeyUp: null,

            /**
            * @name dxTextEditorOptions_onChange
            * @publicName onChange
            * @extends Action
            * @type function(e)
            * @type_function_param1 e:object
            * @type_function_param1_field4 jQueryEvent:jQuery.Event:deprecated(event)
            * @type_function_param1_field5 event:event
            * @action
            */
            onChange: null,

            /**
            * @name dxTextEditorOptions_onInput
            * @publicName onInput
            * @extends Action
            * @type function(e)
            * @type_function_param1 e:object
            * @type_function_param1_field4 jQueryEvent:jQuery.Event:deprecated(event)
            * @type_function_param1_field5 event:event
            * @action
            */
            onInput: null,

            /**
            * @name dxTextEditorOptions_onCut
            * @publicName onCut
            * @extends Action
            * @type function(e)
            * @type_function_param1 e:object
            * @type_function_param1_field4 jQueryEvent:jQuery.Event:deprecated(event)
            * @type_function_param1_field5 event:event
            * @action
            */
            onCut: null,

            /**
            * @name dxTextEditorOptions_onCopy
            * @publicName onCopy
            * @extends Action
            * @type function(e)
            * @type_function_param1 e:object
            * @type_function_param1_field4 jQueryEvent:jQuery.Event:deprecated(event)
            * @type_function_param1_field5 event:event
            * @action
            */
            onCopy: null,

            /**
            * @name dxTextEditorOptions_onPaste
            * @publicName onPaste
            * @extends Action
            * @type function(e)
            * @type_function_param1 e:object
            * @type_function_param1_field4 jQueryEvent:jQuery.Event:deprecated(event)
            * @type_function_param1_field5 event:event
            * @action
            */
            onPaste: null,

            /**
            * @name dxTextEditorOptions_onEnterKey
            * @publicName onEnterKey
            * @extends Action
            * @type function(e)
            * @type_function_param1 e:object
            * @type_function_param1_field4 jQueryEvent:jQuery.Event:deprecated(event)
            * @type_function_param1_field5 event:event
            * @action
            */
            onEnterKey: null,

            mode: "text",

            /**
             * @name dxTextEditorOptions_hoverStateEnabled
             * @publicName hoverStateEnabled
             * @type boolean
             * @default true
             * @extend_doc
             */
            hoverStateEnabled: true,

            /**
             * @name dxTextEditorOptions_focusStateEnabled
             * @publicName focusStateEnabled
             * @type boolean
             * @default true
             * @extend_doc
             */
            focusStateEnabled: true,

            /**
            * @name dxTextEditorOptions_text
            * @publicName text
            * @type string
            * @readonly
            */
            text: undefined,

            valueFormat: function(value) {
                return value;
            }

            /**
            * @name dxTextEditorOptions_name
            * @publicName name
            * @type string
            * @hidden false
            * @extend_doc
            */
        });
    },

    _defaultOptionsRules: function() {
        return this.callBase().concat([
            {
                device: function() {
                    var currentTheme = (themes.current() || "").split(".")[0];
                    return currentTheme === "android5";
                },
                options: {
                    validationMessageOffset: { v: -8 }
                }
            }
        ]);
    },

    _input: function() {
        return this.$element().find(TEXTEDITOR_INPUT_SELECTOR).first();
    },

    _inputWrapper: function() {
        return this.$element();
    },

    _buttonsContainer: function() {
        return this._inputWrapper().find("." + TEXTEDITOR_BUTTONS_CONTAINER_CLASS).eq(0);
    },

    _isControlKey: function(key) {
        return CONTROL_KEYS.indexOf(key) !== -1;
    },

    _render: function() {
        this.$element().addClass(TEXTEDITOR_CLASS);

        this._renderInput();
        this._renderInputType();
        this._renderValue();
        this._renderProps();
        this._renderPlaceholder();

        this._refreshValueChangeEvent();
        this._renderEvents();
        this._renderEnterKeyAction();
        this._renderEmptinessEvent();
        this.callBase();
    },

    _renderInput: function() {
        $("<div>").addClass(TEXTEDITOR_CONTAINER_CLASS)
            .append(this._createInput())
            .append($("<div>").addClass(TEXTEDITOR_BUTTONS_CONTAINER_CLASS))
            .appendTo(this.$element());
    },

    _createInput: function() {
        var $input = $("<input>");
        this._applyInputAttributes($input, this.option("inputAttr"));
        return $input;
    },

    _setSubmitElementName: function(name) {
        var inputAttrName = this.option("inputAttr.name");
        return this.callBase(name || inputAttrName || "");
    },

    _applyInputAttributes: function($input, customAttributes) {
        $input.attr("autocomplete", "off")
            .attr(customAttributes)
            .addClass(TEXTEDITOR_INPUT_CLASS)
            .css("minHeight", this.option("height") ? "0" : "");
    },

    _renderValue: function() {
        this._renderInputValue();
        this._renderInputAddons();
    },

    _renderInputValue: function(value) {
        value = value || this.option("value");

        var text = this.option("text"),
            displayValue = this.option("displayValue"),
            valueFormat = this.option("valueFormat");

        if(displayValue !== undefined && value !== null) {
            text = valueFormat(displayValue);
        } else if(!isDefined(text)) {
            text = valueFormat(value);
        }

        this.option("text", text);

        //fallback to empty string is required to support WebKit native date picker in some basic scenarios
        //can not be covered by QUnit
        if(this._input().val() !== (isDefined(text) ? text : "")) {
            this._renderDisplayText(text);
        } else {
            this._toggleEmptinessEventHandler();
        }
    },

    _renderDisplayText: function(text) {
        this._input().val(text);
        this._toggleEmptinessEventHandler();
    },

    _isValueValid: function() {
        if(this._input().length) {
            var validity = this._input().get(0).validity;

            if(validity) {
                return validity.valid;
            }
        }

        return true;
    },

    _toggleEmptiness: function(isEmpty) {
        this.$element().toggleClass(TEXTEDITOR_EMPTY_INPUT_CLASS, isEmpty);
        this._togglePlaceholder(isEmpty);
    },

    _togglePlaceholder: function(isEmpty) {
        if(!this._$placeholder) {
            return;
        }

        this._$placeholder.toggleClass("dx-state-invisible", !isEmpty);
    },

    _renderProps: function() {
        this._toggleReadOnlyState();
        this._toggleSpellcheckState();
        this._toggleTabIndex();
    },

    _toggleDisabledState: function(value) {
        this.callBase.apply(this, arguments);

        var $input = this._input();
        if(value) {
            $input.attr("disabled", true);
        } else {
            $input.removeAttr("disabled");
        }
    },

    _toggleTabIndex: function() {
        var $input = this._input(),
            disabled = this.option("disabled"),
            focusStateEnabled = this.option("focusStateEnabled");

        if(disabled || !focusStateEnabled) {
            $input.attr("tabIndex", -1);
        } else {
            $input.removeAttr("tabIndex");
        }
    },

    _toggleReadOnlyState: function() {
        this._input().prop("readOnly", this._readOnlyPropValue());
        this.callBase();
    },

    _readOnlyPropValue: function() {
        return this.option("readOnly");
    },

    _toggleSpellcheckState: function() {
        this._input().prop("spellcheck", this.option("spellcheck"));
    },

    _renderPlaceholder: function() {
        if(this._$placeholder) {
            this._$placeholder.remove();
            this._$placeholder = null;
        }

        var that = this,
            $input = that._input(),
            placeholderText = that.option("placeholder"),
            $placeholder = this._$placeholder = $('<div>')
                .attr("data-dx_placeholder", placeholderText),
            startEvent = eventUtils.addNamespace(pointerEvents.up, this.NAME);

        eventsEngine.on($placeholder, startEvent, function() {
            eventsEngine.trigger($input, "focus");
        });

        $placeholder.insertAfter($input);

        $placeholder.addClass(TEXTEDITOR_PLACEHOLDER_CLASS);
        this._toggleEmptinessEventHandler();
    },

    _placeholder: function() {
        return this._$placeholder || $();
    },

    _renderInputAddons: function() {
        this._renderClearButton();
    },

    _renderClearButton: function() {
        var clearButtonVisibility = this._clearButtonVisibility();

        this.$element().toggleClass(TEXTEDITOR_SHOW_CLEAR_BUTTON_CLASS, clearButtonVisibility);

        if(clearButtonVisibility) {
            if(!this._$clearButton || this._$clearButton && !this._$clearButton.closest(this.$element()).length) {
                this._$clearButton = this._createClearButton();
            }
            this._$clearButton.prependTo(this._buttonsContainer());
        }

        if(this._$clearButton) {
            this._$clearButton.toggleClass("dx-state-invisible", !clearButtonVisibility);
        }
    },

    _clearButtonVisibility: function() {
        return this.option("showClearButton") && !this.option("readOnly");
    },

    _createClearButton: function() {
        var $clearButton = $("<span>")
            .addClass(TEXTEDITOR_CLEAR_BUTTON_CLASS)
            .append($("<span>").addClass(TEXTEDITOR_ICON_CLASS).addClass(TEXTEDITOR_CLEAR_ICON_CLASS));

        eventsEngine.on($clearButton, eventUtils.addNamespace(pointerEvents.down, this.NAME), function(e) {
            if(e.pointerType === "mouse") {
                e.preventDefault();
            }
        });
        eventsEngine.on($clearButton, eventUtils.addNamespace(clickEvent.name, this.NAME), this._clearValueHandler.bind(this));

        return $clearButton;
    },

    _clearValueHandler: function(e) {
        var $input = this._input();
        e.stopPropagation();

        this._valueChangeEventHandler(e);
        this.reset();

        !focused($input) && eventsEngine.trigger($input, "focus");
        eventsEngine.trigger($input, "input");
    },

    _renderEvents: function() {
        var that = this,
            $input = that._input();

        each(EVENTS_LIST, function(_, event) {
            if(that.hasActionSubscription("on" + event)) {

                var action = that._createActionByOption("on" + event, { excludeValidators: ["readOnly"] });

                eventsEngine.on($input, eventUtils.addNamespace(event.toLowerCase(), that.NAME), function(e) {
                    if(that._disposed) {
                        return;
                    }

                    action({ event: e });
                });
            }
        });
    },

    _refreshEvents: function() {
        var that = this,
            $input = this._input();

        each(EVENTS_LIST, function(_, event) {
            eventsEngine.off($input, eventUtils.addNamespace(event.toLowerCase(), that.NAME));
        });

        this._renderEvents();
    },

    _keyPressHandler: function() {
        this.option("text", this._input().val());
    },

    _renderValueChangeEvent: function() {
        var keyPressEvent = eventUtils.addNamespace(this._renderValueEventName(), this.NAME + "TextChange"),
            valueChangeEvent = eventUtils.addNamespace(this.option("valueChangeEvent"), this.NAME + "ValueChange");

        eventsEngine.on(this._input(), keyPressEvent, this._keyPressHandler.bind(this));
        eventsEngine.on(this._input(), valueChangeEvent, this._valueChangeEventHandler.bind(this));
    },

    _cleanValueChangeEvent: function() {
        var eventNamespace = this.NAME + "ValueChange",
            keyPressEvent = eventUtils.addNamespace(this._renderValueEventName(), this.NAME + "TextChange");

        eventsEngine.off(this._input(), "." + eventNamespace);
        eventsEngine.off(this._input(), keyPressEvent);
    },

    _refreshValueChangeEvent: function() {
        this._cleanValueChangeEvent();
        this._renderValueChangeEvent();
    },

    _renderValueEventName: function() {
        return "input change keypress";
    },

    _focusTarget: function() {
        return this._input();
    },

    _focusClassTarget: function() {
        return this.$element();
    },

    _toggleFocusClass: function(isFocused, $element) {
        this.callBase(isFocused, this._focusClassTarget($element));
    },

    _hasFocusClass: function(element) {
        return this.callBase($(element || this.$element()));
    },

    _renderEmptinessEvent: function() {
        var $input = this._input();

        eventsEngine.on($input, "input blur", this._toggleEmptinessEventHandler.bind(this));
    },

    _toggleEmptinessEventHandler: function() {
        var text = this._input().val(),
            isEmpty = (text === "" || text === null) && this._isValueValid();

        this._toggleEmptiness(isEmpty);
    },

    _valueChangeEventHandler: function(e, formattedValue) {
        this._saveValueChangeEvent(e);
        this.option("value", arguments.length > 1 ? formattedValue : this._input().val());
        this._saveValueChangeEvent(undefined);
    },

    _renderEnterKeyAction: function() {
        this._enterKeyAction = this._createActionByOption("onEnterKey", {
            excludeValidators: ["readOnly"]
        });

        eventsEngine.off(this._input(), "keyup.onEnterKey.dxTextEditor");
        eventsEngine.on(this._input(), "keyup.onEnterKey.dxTextEditor", this._enterKeyHandlerUp.bind(this));
    },

    _enterKeyHandlerUp: function(e) {
        if(this._disposed) {
            return;
        }

        if(e.which === 13) {
            this._enterKeyAction({
                event: e
            });
        }
    },

    _updateValue: function() {
        this.option("text", undefined);
        this._renderValue();
    },

    _dispose: function() {
        this._enterKeyAction = undefined;
        this.callBase();
    },

    _getSubmitElement: function() {
        return this._input();
    },

    _optionChanged: function(args) {
        var name = args.name;

        if(inArray(name.replace("on", ""), EVENTS_LIST) > -1) {
            this._refreshEvents();
            return;
        }

        switch(name) {
            case "valueChangeEvent":
                this._refreshValueChangeEvent();
                this._refreshFocusEvent();
                this._refreshEvents();
                break;
            case "onValueChanged":
                this._createValueChangeAction();
                break;
            case "readOnly":
                this.callBase(args);
                this._renderInputAddons();
                break;
            case "focusStateEnabled":
                this.callBase(args);
                this._toggleTabIndex();
                break;
            case "spellcheck":
                this._toggleSpellcheckState();
                break;
            case "mode":
                this._renderInputType();
                break;
            case "onEnterKey":
                this._renderEnterKeyAction();
                break;
            case "placeholder":
                this._renderPlaceholder();
                break;
            case "showClearButton":
                this._renderInputAddons();
                break;
            case "text":
                break;
            case "value":
                this._updateValue();
                this.callBase(args);
                break;
            case "inputAttr":
                this._applyInputAttributes(this._input(), args.value);
                break;
            case "valueFormat":
                this._invalidate();
                break;
            default:
                this.callBase(args);
        }
    },

    _renderInputType: function() {
        // B218621, B231875
        this._setInputType(this.option("mode"));
    },

    _setInputType: function(type) {
        var input = this._input();

        if(type === "search") {
            type = "text";
        }

        try {
            input.prop("type", type);
        } catch(e) {
            input.prop("type", "text");
        }
    },

    /**
    * @name dxTextEditorMethods_focus
    * @publicName focus()
    */
    focus: function() {
        eventsEngine.trigger(this._input(), "focus");
    },

    /**
    * @name dxTextEditorMethods_blur
    * @publicName blur()
    */
    blur: function() {
        if(this._input().is(document.activeElement)) {
            domUtils.resetActiveElement();
        }
    },

    reset: function() {
        this.option("value", "");
    },

    on: function(eventName, eventHandler) {
        var result = this.callBase(eventName, eventHandler),
            event = eventName.charAt(0).toUpperCase() + eventName.substr(1);

        if(EVENTS_LIST.indexOf(event) >= 0) {
            this._refreshEvents();
        }
        return result;
    }
});

module.exports = TextEditorBase;
