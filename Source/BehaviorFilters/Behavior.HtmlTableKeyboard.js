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
description: Registers HtmlTable keyboards to the JFrame instance
provides: [Behavior.HtmlTableKeyboard]
requires: [Widgets/Behavior.HtmlTable]
script: Behavior.HtmlTableKeyboard.js
...
*/

Behavior.addGlobalPlugin('HtmlTable', 'HtmlTableJFrame', function(element, behaviorAPI){
	var table = element.retrieve('HtmlTable');
	if (table.keyboard) {
		table.keyboard.relinquish();
		behaviorAPI.registerKeyboard(table.keyboard);
		table.keyboard.activate();
		this.markForCleanup(element, function(){
			behaviorAPI.unregisterKeyboard(table.keyboard);
		});
		// I don't think we need this anymore, but I'm leaving it; it's not clear why
		// it was even added in the first place...
		// ART.Popup.DefaultManager.keyboard.activate();
	}
});
