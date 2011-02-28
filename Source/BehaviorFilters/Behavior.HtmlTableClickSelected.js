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
description: Adds support for automatically clicking a link for each selected row of an HtmlTable.
provides: [Behavior.HtmlTableClickSelected]
requires: [More-Behaviors/Behavior.HtmlTable, /Event.Mock]
script: Behavior.HtmlTableClickSelected.js
...
*/

Behavior.addGlobalPlugin('HtmlTable', 'HtmlTableClickSelected', function(element, behaviorAPI) {

	function rowFocusHandler(row, selectedRows){
		var clickSelector = row.getData('click-on-select');
		if (!clickSelector) return;
		var el = row.getElement(clickSelector);
		if (!el) return;
		var mockClick = new Event.Mock(el, 'click');
		el.fireEvent('click', mockClick);
		behaviorAPI.callClick(mockClick, el);
	}

	var events = {
		rowFocus: rowFocusHandler
	};

	var table = element.retrieve('HtmlTable');
	table.addEvents(events);
	this.markForCleanup(element, function(){
		table.removeEvents(events);
	});
});
