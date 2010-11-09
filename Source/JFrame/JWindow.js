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
description: Wrapper for JFrame for full screen behavior.
provides: [JWindow]
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
script: JWindow.js
...
*/
(function(){
	this.JWindow = new Class({

		Extends: ART.Widget,

		options: {
			makeCanvas: false,
			//onLoad: $empty(view),

			//windowTitler: passed the default title from the response, returns a title for the window.
			windowTitler: function(title) {
				return title;
			},
			jframeOptions: {},
			element: null,
			toolbar: null,
			footerText: null
		},

		initialize: function(path, options) {
			this.parent(options);
			this.addClass('jframe-shared');
			this.toolbar = document.id(this.options.toolbar);
			this.footerText = document.id(this.options.footerText);
			this._makeJFrame(path);
		},

		_getContent: function(){
			return this.element;
		},

		_setupHistory: function(path){
			//todo
		},

		_makeJFrame: function(path, options){
			var size = this.element.getSize();
			var opt = $merge({
				onLoadComplete: this._jframeLoaded.bind(this),
				onRedirect: function(){
					//do not restore scroll offsets when jframe is redirected
					this._scrolled = null;
				}.bind(this),
				size: {
					width: size.x,
					height: size.y
				},
				getScroller: function(){
					return this._getContent();
				}.bind(this),
				spinnerTarget: this._getContent()
			}, this.options.jframeOptions, options);
			opt.parentWidget = this;
			this.jframe = new JFrame(path, opt);
			this.jframe.inject(this, this._getContent());

			this.jframe.getContentElement = this._getContent.bind(this);
			this.jframe.getWindow = $lambda(this);
			this.contents = this.element;

			if (this.toolbar) this.jframe.applyDelegates(this.toolbar);
			if (this.footerText) this.jframe.applyDelegates(this.footerText);
			this.jframe.addEvent('refresh', this._storeScroll.bind(this));

		},

		wait: function(start){
			start = $pick(start, true);
			if (start) this._getContent().spin({ fxOptions: {duration: 200} });
			else this._getContent().unspin();
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

		setCaption: function(title){
			$$('title')[0].set('text', title);
		},

		_incrementHistory: function(data){
			if (!data.suppressHistory && this.history) return; //todo
		},

		_jframeLoaded: function(data) {
			this.setCaption(this.options.windowTitler(data.title || data.repsonsePath));
			if (this.toolbar) {
				this.jframe.behavior.cleanup(this.toolbar);
				this.toolbar.empty();
				if (data.toolbar) this.toolbar.adopt(data.toolbar);
			}
			if (this.footerText) {
				this.jframe.behavior.cleanup(this.footerText);
				this.footerText.empty();
				if (data.footer) this.footerText.adopt(data.footer);
			}
			this._incrementHistory(data);
			if (this._jframe_view != data.view) {
				if (this._jframe_view) {
					this.removeClass(this._jframe_view);
				}
				if (data.view) {
					this.addClass(data.view);
					this._jframe_view = data.view;
				}
			}
			this.fireEvent('load', data.view);
			/*
				I hate this delay, but the browser apparently needs it to render the HTML. You can't set the scroll offset of something
				thats empty (because there's no where to scroll). The duration may require some additional care with diff. browsers or
				slower computers.
			*/
			this._restoreScroll.delay(50, this);
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

})();
