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
description: Base wrapper for JFrame.Window and JFrame.Browser to subclass. Wraps a JFrame providing common functionality and state for when JFrame is integrated into a container class.
provides: [JFrame.Container]
requires: [/JFrame, /JFrame.Error]
requires:
 - Widgets/ART.Widget
 - /JFrame
 - /JFrame.Request
 - /ContextMenu

 - /JFrame.Alert
 - /JFrame.PartialRefresh
 - /PartialUpdate
 - /JFrame.Prompt

 - /JFrame.AutoRefresh
 - /JFrame.DoubleClickDelegate
 - /JFrame.FormRequest

 - /JFrame.AjaxLoad
 - /JFrame.CheckAllOrNone
 - /JFrame.ConfirmAndPost
 - /JFrame.FakeRefresh
 - /JFrame.HideParent
 - /JFrame.LivePath
 - /JFrame.Nav
 - /JFrame.NoScroll
 - /JFrame.PromptAndPost
 - /JFrame.Refresh
 - /JFrame.RefreshWithParams
 - /JFrame.SubmitLink
 - /JFrame.SplitViewLinkers
script: JFrame.Container.js
...
*/

JFrame.Container = new Class({

	Extends: ART.Widget,

	Implements: ART.WindowTools,

	options: {
		makeCanvas: false,
		//onLoad: $empty(view),

		jframeOptions: {},
		element: null,
		toolbar: null,
		footerText: null
	},

	initialize: function(path, options) {
		this.parent(options);
		//disable context menu by default
		$(this.element).addEvent('contextmenu', function(e){
			if (!window.dbug || !dbug.enabled) e.preventDefault();
		});

		//create a keyboard for this instance and activate it
		new ART.Keyboard(this, this.keyboardOptions);
		this.keyboard.activate();
		this.addClass('jframe-shared');
		//store toolbar/footer
		this.toolbar = document.id(this.options.toolbar);
		this.footerText = document.id(this.options.footerText);
		//make jframe
		this._makeJFrame(path, options);
	},

	_getContent: function(){
		//by default, the content is the element of this container
		return this.element;
	},

	_makeJFrame: function(path, options){
		if (!options.spinnerTarget) options.spinnerTarget = this._getContent();
		this.jframe = new JFrame(path, options.jframeOptions);
		this.jframe.inject(this, this._getContent())
			.addEvents({
				refresh: this._storeScroll.bind(this),
				loadComplete: this._jframeLoaded.bind(this),
				redirect: function(){
					//do not restore scroll offsets when jframe is redirected
					this._scrolled = null;
				}.bind(this),
				empty: this._emptyToolbar.bind(this)
			});

		if (this.toolbar) this.jframe.applyDelegates(this.toolbar);
		if (this.footerText) this.jframe.applyDelegates(this.footerText);
	},

	load: function(options) {
		this.jframe.load(options);
		return this;
	},

/*
	options are passed to jframe's renderContent method
	*/

	setContent: function(options){
		this.jframe.renderContent(options);
		return this;
	},

	refresh: function() {
		this.jframe.refresh();
		return this;
	},

	resize: function(w, h) {
		this.jframe.resize(w, h);
	},

	_emptyToolbar: function(){
		this.jframe.behavior.cleanup(this.toolbar);
		this.toolbar.empty();
	},

	_emptyFooter: function(){
		this.jframe.behavior.cleanup(this.footerText);
		this.footerText.empty();
	},

	_jframeLoaded: function(data) {
		//if there's a toolbar, empty it and adopt the new toolbar data if there is any
		if (this.toolbar) {
			this._emptyToolbar();
			if (data.toolbar) this.toolbar.adopt(data.toolbar);
		}
		//ditto with the footer
		if (this.footerText) {
			this._emptyFooter();
			if (data.footer) this.footerText.adopt(data.footer);
		}
		this._applyView(data);
		this.fireEvent('load', data.view);
		/*
			I hate this delay, but the browser apparently needs it to render the HTML. You can't set the scroll offset of something
			thats empty (because there's no where to scroll). The duration may require some additional care with diff. browsers or
			slower computers.
		*/
		this._restoreScroll.delay(50, this);
	},

	_applyView: function(data, target){
		target = target || this;
		var previous_view = $type(target) == 'element' ? target.retrieve('_jframe_view') : target._jframe_view;
		//if there's a view, and it's not the current one, store it and change the state/class
		if (previous_view != data.view) {
			if (previous_view) {
				target.removeClass(previous_view);
			}
			if (data.view) {
				target.addClass(data.view);
				if ($type(target) == 'element') element.store('_jframe_view', data.view);
				else target._jframe_view = data.view;
			}
		}
	},

	//returns the elements whose scroll offset we want to store
	//this includes any element with the .save_scroll class
	//and also the contents of the window itself.
	_getScrollElements: function(){
		var scrollers = $(this).getElements('.save_scroll');
		scrollers.include(this._getContent());
		return scrollers;
	},

	//stores the scroll offset for all the elements that we are saving
	_storeScroll: function(){
		this._storedScrollPath = this.jframe.currentPath;
		this._scrolled = this._getScrollElements().map(function(el){
			return el.getScroll();
		});
	},

	//restores the scroll offsets to the elements we saved
	//but only if we found a matched number of each
	//note: that this behavior is only triggered on refresh. The main issue with refresh is if there's a redirect.
	_restoreScroll: function(){
		if (!this._scrolled || this.jframe.currentPath != this._storedScrollPath) return;
		var scrollers = this._getScrollElements();
		if (scrollers.length == this._scrolled.length) {
			this._scrolled.each(function(data, i) {
				scrollers[i].scrollTo(data.x, data.y);
			});
		}
		this._scrolled = null;
	}

});
