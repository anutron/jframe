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
description: Keyboard shortcuts for Desktop
provides: [JFrame.Keys]
requires: [More/Keyboard.Extras, Widgets/ART.Popup, More/HtmlTable, More/Element.Shortcuts]
script: JFrame.Keys.js

...
*/
/*
	adds window level keys to desktop as well as a method to display the active keys in use.
*/
(function(){

	var keyShower;

	//prevent accidental scrolling
	var stopper = function(e) {
		if (e.target.tagName.toLowerCase() == 'html') e.stop();
	};
	Keyboard.manager.addEvents({
		'space': stopper,
		'down': stopper,
		'pagedown': stopper,
		'end': stopper,
		'keydown:backspace': stopper
	});

	Keyboard.manager.addShortcuts({
		'Show/Hide Shortcuts': {
			keys: 'alt+/',
			shortcut: 'alt + /',
			handler: function(e){
				keyShower.toggle();
				Keyboard.stop(e);
			},
			description: 'Show or hide the list of all active shortcuts.'
		}
	});
	Keyboard.manager.addEvents({
		'esc': function(e){
			keyShower.hide();
		}
	});

	//functionality to display the shortcuts to the user.
	ART.Popup.DefaultManager.setLayer('shortcuts', 150);

	KeyList = new Class({

		Implements: Events,

		initialize: function(){
			//create a table for the active shortcuts
			this.table = new HtmlTable({
				headers: ['Key', 'Shortcut Name', 'Description'],
				properties: {
					'data-filters':'HtmlTable'
				}
			});
			//a holder for styling
			this.win = new Element('div', {
				'id':'jframe-shortcut_list',
				styles: {
					display: 'none'
				}
			}).inject(document.body).adopt(this.table);
			//a local instance of Mask for the document
			this.mask = new Mask(document.body, {
				hideOnClick: true,
				onHide: this.hide.bind(this, true)
			});
		},

		//show the shortcut list
		show: function(){
			if (this.win.isDisplayed()) return;
			this.fill();
			this.mask.show();
			this.win.show().position();
			this.fireEvent('show');
		},

		//hide the shortcut list
		hide: function(dontHideMask){
			if (!this.win.isDisplayed()) return;
			if (dontHideMask) {
				this.win.hide();
				this.fireEvent('hide');
			} else {
				this.mask.hide();
			}
		},

		//toggle visibility of the shortcut list
		toggle: function(){
			if (this.win.isDisplayed()) this.hide();
			else this.show();
		},

		//fills the shortcut element with a list of active shortcuts
		fill: function(){
			var keys = Keyboard.getActiveShortcuts();
			this.table.empty();
			var wname;
			keys.reverse().each(function(key){
				var widget = key.getKeyboard().widget;
				var widgetName = widget && widget.getName ? widget.getName() : "Application";
				if (wname != widgetName) {
					wname = widgetName;
					this.table.push([{
						content: wname,
						properties: {
							colspan: 3,
							styles: {
								'font-weight': 'bold'
							}
						}
					}]);
				}
				this.table.push([key.shortcut, key.name, key.description || ""]);
			}, this);
		}

	});

	window.addEvent('domready', function(){
		keyShower = new KeyList();
		$$('.hotkeys').addEvent('click', function(){
			keyShower.show();
		});
	});

})();
