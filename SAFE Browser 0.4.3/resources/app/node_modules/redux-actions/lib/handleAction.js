'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

exports.default = handleAction;

var _isFunction = require('lodash/isFunction');

var _isFunction2 = _interopRequireDefault(_isFunction);

var _identity = require('lodash/identity');

var _identity2 = _interopRequireDefault(_identity);

var _isNil = require('lodash/isNil');

var _isNil2 = _interopRequireDefault(_isNil);

var _includes = require('lodash/includes');

var _includes2 = _interopRequireDefault(_includes);

var _combineActions = require('./combineActions');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function handleAction(actionType, reducers, defaultState) {
  var actionTypes = actionType.toString().split(_combineActions.ACTION_TYPE_DELIMITER);

  var _ref = (0, _isFunction2.default)(reducers) ? [reducers, reducers] : [reducers.next, reducers.throw].map(function (reducer) {
    return (0, _isNil2.default)(reducer) ? _identity2.default : reducer;
  });

  var _ref2 = _slicedToArray(_ref, 2);

  var nextReducer = _ref2[0];
  var throwReducer = _ref2[1];


  return function () {
    var state = arguments.length <= 0 || arguments[0] === undefined ? defaultState : arguments[0];
    var action = arguments[1];

    if (!(0, _includes2.default)(actionTypes, action.type.toString())) {
      return state;
    }

    return (action.error === true ? throwReducer : nextReducer)(state, action);
  };
}