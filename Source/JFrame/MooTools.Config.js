// Licensed to Cloudera, Inc. under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  Cloudera, Inc. licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
/*
---
description: JFrame Configuration Options
provides: [MooTools.Config]
requires: [clientcide/StickyWin, Widgets/ART.Popup, Core/Element.Event, Core/Request.HTML,
  More/Spinner, Core/Selectors, More/URI, More/HtmlTable.Resize]
script: MooTools.Config.js

...
*/
/* config */
Request.implement({
	options: {
		evalScripts: true,
		noCache: true
	}
});

Spinner.implement({
	options: {
		fxOptions: {
			link: 'cancel'
		}
	}
});

Hash.implement({
	//implements the ability to serialize arrays into query strings without brackets
	//foo[0]=bar&foo[1]=baz
	//vs
	//foo=bar&foo=baz
	toQueryString: function(base, useBrackets){
		useBrackets = useBrackets == null ? true : useBrackets;
		var queryString = [];
		Hash.each(this, function(value, key){
			if (base && useBrackets) key = base + '[' + key + ']';
			var result;
			switch ($type(value)){
				case 'object': result = Hash.toQueryString(value, key); break;
				case 'array':
					if (useBrackets) {
						var qs = {};
						value.each(function(val, i){
							qs[i] = val;
						});
						result = Hash.toQueryString(qs, key);
					} else {
						result = value.map(function(val){
							return key + '=' + encodeURIComponent(val);
						}).join('&');
					}
				break;
				default: result = key + '=' + encodeURIComponent(value);
			}
			if (value != undefined) queryString.push(result);
		});
		return queryString.join('&');
	}
});

URI.implement({

	options: {
		useBrackets: false
	},

	setData: function(values, merge, part){
		if (typeof values == 'string'){
			data = this.getData();
			data[arguments[0]] = arguments[1];
			values = data;
		} else if (merge) {
			values = $merge(this.getData(), values);
		}
		return this.set(part || 'query', Hash.toQueryString(values, null, this.options.useBrackets));
	}

});

Element.Events.esc = {
	base: 'keydown', //we set a base type
	condition: function(event){ //and a function to perform additional checks.
		return (event.escape == true); //this means the event is free to fire
	}
};
StickyWin.implement({
	options: {
		destroyOnClose: true,
		allowNegative: false
	}
});
ART.Popup.implement({
	options: {
		destroyOnClose: true,
		allowNegative: false,
		posMin: {x: 0, y: 0}
	}
});
StickyWin.Stacker.implement({
	options: {
		zIndexBase: 10003
	}
});
StickyWin.WM.setOptions({
	zIndexBase: 10003
});
HtmlTable.implement({
	options: {
		setStylesOnStartup: false
	}
});



HtmlTable.implement({
	options: {
		classNoSort: 'noSort'
	}
});

StickyWin.implement({
	destroyOnClose: true
});

//same for ART.Popup instances
ART.Popup.implement({
	destroyOnClose: true,
	options: {
		cascaded: true
	}
});
ART.Sheet.define('window.art', {
	'min-height': 88,
	'width':800
});

ART.Sheet.define('window.art.browser.logo_header', {
	'header-height': 90,
	'header-overflow': 'visible',
	'min-width': 620
});

ART.Sheet.define('window.art.browser.logo_header history.art', {
	'padding': [0, 8, 0, 70]
});

ART.Sheet.define('window.art.browser.logo_header history.art', {
	'top':32
}, 'css');

ART.Sheet.define('window.art.browser history.art ul', {
	'z-index': 101
}, 'css');

UI.Sheet.define('window.art button.art.wincontrol', {
	'background-color': ['hsb(0, 0, 100)', 'hsb(0, 0, 85)'],
	'border-color': ['hsb(0, 0, 60)', 'hsb(0, 0, 50)'],
	'font-family': 'Moderna',
	'font-size': 13,
	'font-color': 'black'
});

(function(){
	var button = {
		'height': 19,
		'width': 22,
		'padding': [0, 0, 0, 0],
		'float': 'left',
		'marginLeft': -1,
		'corner-radius-top-right': 4,
		'corner-radius-bottom-right': 4,
		'corner-radius-top-left': 0,
		'corner-radius-bottom-left': 0,
		'glyph': ART.Glyphs.refresh,
		'glyph-stroke': 0,
		'glyph-fill': true,
		'glyph-height': 12,
		'glyph-width': 12,
		'glyph-top': 4,
		'glyph-left': 5
	};
	var large = {
		'height': 24,
		'width': 24,
		'glyph-top': 6,
		'glyph-left': 6
	};
	ART.Sheet.define('button.art.jframe-refresh', button);
	ART.Sheet.define('button.art.jframe-refresh.large', large);
	button.glyph = ART.Glyphs.triangleLeft;
	button['glyph-top'] = 5;
	button['glyph-left'] = 6;
	ART.Sheet.define('button.art.jframe-back', button);
	ART.Sheet.define('button.art.jframe-back.large', large);
	button.glyph = ART.Glyphs.triangleRight;
	button['glyph-left'] = 8;
	ART.Sheet.define('button.art.jframe-next', button);
	ART.Sheet.define('button.art.jframe-next.large', large);
})();

if (Browser.Engine.trident) {
	UI.Sheet.define('window.art:dragging', {
		'background-color': hsb(202, 20, 38, 1)
	});
}

window.addEvent('domready', function(){
	$(document.body).addEvent('contextmenu', function(e){
		if (!dbug.enabled) e.preventDefault();
	});
	
	//given an element, determine if it's cool to double click and select text within it
	var canSelectOnDblClick = function(elem) {
		//if it's a textarea or input, go for it
		if (elem.match('input') || elem.match('textarea')) return true;
		//otherwise, we only allow double click selection inside of window contents
		if (elem.getParent('.jframe_contents')) {
			//except if the double clicked element is inside an html table that has selectable rows
			var parentTable = elem.getParent('[data-filters*=HtmlTable]');
			if(parentTable && (parentTable.hasClass('.selectable') || parentTable.hasClass('.multiselect'))){
				return false;
			}
			//or if the element is part of a double click action
			if(elem.match('[data-dblclick-delegate]') || elem.getParent('[data-dblclick-delegate]')) return false;
			return true;
		}
		return false;
	};
	
	$(document.body).addEvent('dblclick', function(e){
		if(!canSelectOnDblClick(e.target)){ 
			if(document.selection && document.selection.empty) document.selection.empty();
			else if(window.getSelection) window.getSelection().removeAllRanges();
		}
	});
});

//Although implement checks for a pre-existing implementation of the method, it has to be forced for IE to overwrite the MooTools version.
//Thus, the IE check.
if (Browser.Engine.trident) {
	Array.implement({
		forEach: function(fn, bind){
			var len = this.length;
			for (var i=0; i < len; i++) {
				if(i in this) fn.call(bind, this[i], i, this);
			}
		}       
	}, true);

	Array.alias('forEach', 'each', true); 
}