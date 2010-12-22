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
description: JFrame.Browser is a window that encapsulates a JFrame and a linked HistoryMenu.
provides: [JFrame.Browser, JBrowser]
requires: 
 - /JFrame.Container
 - Widgets/ART.Browser
 - Widgets/ART.SolidWindow
 - /JFrame.ToggleHistory
 - /Events.Relay

script: JFrame.Browser.js

...
*/
(function(){

	var jbrowserContainer = new Class({

		Extends: JFrame.Container,

		_getContent: function(){
			return this.parentWidget.content;
		},

		_makeJFrame: function(path, options){
			this.parent(path, options);
			this.jframe.addEvents({
				rewritePath: this._rewritePath.bind(this)
			});
		},

		_rewritePath: function(path){
			this.history.getSelected().path = path;
		},

		_jframeLoaded: function(data){
			this.parent(data);
			if (!Browser.Engine.trident) {
				(function(){
					$(this.parentWidget).setStyle('visibility', 'visible');
					if (this.parentWidget.history) $(this.parentWidget.history).setStyle('visibility', 'visible');
				}).delay(20, this);
			}
			this.parentWidget._incrementHistory(data);
			this.parentWidget.setCaption(this.parentWidget.options.windowTitler(data.title || data.repsonsePath));
			if (this.getState('focused')) this.focus();
		}

	});

	var jframeBrowser = {

		Implements: Events.Relay,

		options: {
			//the onLoad event fires when new content loads
			//onLoad: $empty(view),
			
			//display the history widget in the header?
			displayHistory: true,
			//showNow: if true, the window is displayed on instantiation
			showNow: false,
			//draggable: if true, the window can be dragged around
			draggable: true,
			//windowTitler: passed the default title from the response, returns a title for the window.
			windowTitler: function(title) {
				return title || this.options.windowOptions.caption || '';
			},
			jframeOptions: {}
		},

		initialize: function(path, options) {
			options = options || {};
			var show = $pick(options.showNow, true);
			options.showNow = false;
			this.parent(options);
			$(this.element).addEvent('contextmenu', function(e){
				if (!window.dbug || !dbug.enabled) e.preventDefault();
			});

			this.addClass('jframe-shared');
			this.toolbar = new Element('div', {
				'class':'jframe-window-toolbar',
				events: {
					mousedown: function(e){
						//prevent clicks to the toolbar element from starting the drag behavior attached to the entire header
						//note that OBJECT tags in IE won't give you a .match method - they aren't extended
						if ($(e.target).match && !$(e.target).match('.draggable') && !$(e.target).getParent('.draggable')) e.stopPropagation();
					}
				}
			}).inject(this.header);
			
			var jframeContainerOpts = $merge({
				windowTitler: this.options.windowTitler,
				jframeOptions: this.options.jframeOptions,
				toolbar: this.toolbar,
				footerText: this.footerText
			});
			jframeContainerOpts.parentWidget = this;
			this.jframeContainer = new jbrowserContainer(path, jframeContainerOpts);
			this.jframe = this.jframeContainer.jframe;

			this.jframe.resize(this.contentSize.x, this.contentSize.y);

			this._setupHistory(path);
			this._setupJFrame();
			this._addKeys();
			if (show) {
				this.options.showNow = true;
				this.show();
			}
			if (Browser.Engine.trident) {
				$(this).setStyle('top', -111111111);
			} else {
				$(this).setStyle('visibility', 'hidden');
				if (this.history) $(this.history).setStyle('visibility', 'hidden');
			}

			this.addEvents({
				maximize: function(){
					if (!this._jframeBrowserMinMaxState) this._jframeBrowserMinMaxState = this.element.getStyles('top', 'left');
					this.element.setStyles({
						top: 0,
						left: 0
					});
				}.bind(this),
				restore: function(){
					//restore
					this.element.setStyles(this._jframeBrowserMinMaxState);
					this._jframeBrowserMinMaxState = null;
				}.bind(this)
			});
		},

		_addKeys: function(){
			this.keyboard.addShortcuts({
				'Previous Window': {
					keys: 'alt+left',
					shortcut: 'alt + left',
					handler: function(e){
						ART.Popup.DefaultManager.cycle('back', 'default');
						Keyboard.stop(e);
						e.stop();
					},
					description: 'Bring the previous window to the foreground.'
				},
				'Next Window': {
					keys: 'alt+right',
					shortcut: 'alt + right',
					handler: function(e){
						ART.Popup.DefaultManager.cycle('forward', 'default');
						Keyboard.stop(e);
						e.stop();
					},
					description: 'Bring the next window to the foreground.'
				},
				'New Window': {
					keys: 'alt+shift+n',
					shortcut: 'alt + shift + n',
					handler: function(e){
						new JFrame.Browser(this.jframe.currentPath, this.options).inject($('mt-content'));
						Keyboard.stop(e);
					}.bind(this),
					description: 'Launch a new window for the current application (if it allows it).'
				},
				'Close Window': {
					keys: 'alt+shift+w',
					shortcut: 'alt + shift + w',
					handler: function(e){
						if (ART.Popup.DefaultManager.focused) ART.Popup.DefaultManager.focused.hide();
						Keyboard.stop(e);
					},
					description: 'Close the current window.'
				}
			});
		},

		draw: function(){
			this.parent.apply(this, arguments);
			var cur = this.jframe.currentSize;
			if (cur.x != this.contentSize.x || cur.y != this.contentSize.y) {
				this.jframe.resize(this.contentSize.x, this.contentSize.y);
			}
		},

		_incrementHistory: function(data){
			if (!data.suppressHistory && this.history) {
				this.history.push({ path: data.responsePath, title: data.title || data.repsonsePath});
			}
		},

		_setupHistory: function(path){
			if (this.history) {
				if (!this.options.displayHistory) this.hideHistory();
				//prevent clicks to the history element from starting the drag behavior attached to the entire header
				$(this.history).addEvent('click', function(e) { e.stopPropagation(); });
				this.history.addEvents({
					refresh: function(){
						this.jframeContainer.refresh();
					}.bind(this),
					select: function(path, title){
						if (path != this.jframe.currentPath) this.load({requestPath: path, suppressHistory: true });
					}.bind(this)
				});
			}
		},

		_setupJFrame: function(path){
			this.addEvents({
				focus: function(){
					this.jframe.focus();
				}.bind(this),
				destroy: function(){
					this.jframe.destroy();
				}.bind(this),
				unshade: function(){
					this.jframe.behavior.show();
				},
				shade: function(){
					this.jframe.behavior.hide();
				}
			});
			this.inheritEvents({
				load: this.jframeContainer
			});
		},

		load: function(options) {
			this.jframe.load(options);
			return this;
		},

		resize: function(w, h) {
			if (w == this.currentWidth && h == this.currentHeight) return;
			this.parent(w, h);
			this.jframe.resize(this.contentSize.x, this.contentSize.y);
		},

		//returns an object with the dimensions, location, path, and options
		serialize: function(){
			return {
				styles: $(this).getStyles(['top', 'left']),
				size: this.getSize(),
				path: this.jframe.currentPath,
				options: this.options
			};
		},

		//restore's a window to a given location and size
		restore: function(state){
			//restore the position
			$(this).setStyles(state.styles);
			//restore the size
			this.resize(state.size.width, state.size.height);
			return this;
		},
		
		resetMinMaxState: function(){
			this.parent.apply(this, arguments);
			this._jframeBrowserMinMaxState = null;
		}

	};

	JFrame.Browser = new Class(
		$merge({
			Extends: ART.Browser
		}, jframeBrowser)
	);
	JFrame.Browser.Solid = new Class(
		$merge({
			Extends: ART.SolidWindow
		}, jframeBrowser)
	);
	//a window alert w/ a jframe
	JFrame.Browser.Confirm = new Class(
		$merge({
			Extends: ART.Confirm,
			displayHistory: false
		}, jframeBrowser)
	);
	//shortcut for JFrame.Browser.Confirm
	JFrame.Browser.confirm = function(caption, content, callback, options) {
		return new JFrame.Browser.Confirm(options.path,
			$extend(options || {}, {
				caption: caption,
				onConfirm: callback || $empty
			})
		);
	};
})();
