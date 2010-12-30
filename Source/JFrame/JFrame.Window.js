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
provides: [JFrame.Window]
requires: [/JFrame, /JFrame.Error]
requires:
 - /JFrame.Container
script: JFrame.Window.js
...
*/
(function(){

	JFrame.Window = new Class({

		Extends: JFrame.Container,

		options: {
			makeCanvas: false,
			//windowTitler: passed the default title from the response, returns a title for the window.
			windowTitler: function(title) {
				return title;
			}
		},

		initialize: function(path, options) {
			this.parent(path, options);

			this.getWindow = $lambda(this);
			this.getWindowElement = this._getContent.bind(this);

			this.jframe.getContentElement = this._getContent.bind(this);
			this.jframe.getWindow = $lambda(this);
			this.contents = this.element;

			var timer;
			window.addEvent('resize', function(e){
				var size = this.element.getSize();
				this.resize(size.x, size.y);
				clearTimeout(timer);
				timer = (function(){
					this.jframe.behavior.show();
				}).delay(30, this);
			}.bind(this));

			this._setupHistory();
		},

		_setupHistory: function(){
			this.history = new History({
				onChange: function(hashpath){
					if (hashpath) this.load({ requestPath: hashpath });
				}.bind(this)
			});
		},

		_makeJFrame: function(path, options){
			var size = this.element.getSize();
			var opt = $merge({
				size: {
					width: size.x,
					height: size.y
				}
			}, this.options.jframeOptions, options);
			opt.parentWidget = this;
			this.parent(path, opt);

			this.jframe.addEvents({
				loadComplete: this._jframeLoaded.bind(this),
				rewritePath: this._rewritePath.bind(this)
			});
		},

		_jframeLoaded: function(data){
			this.parent(data);
			this.setCaption(this.options.windowTitler(data.title || data.repsonsePath));
			this._incrementHistory(data);
		},

		_rewritePath: function(path){
			this.history.rewrite({
				responsePath: path
			});
		},

		getSize: function(){
			var size = this.element.getSize();
			return {width: size.x, height: size.y};
		},

		setCaption: function(title){
			$$('title')[0].set('text', title);
		},

		_incrementHistory: function(data){
			if (!data.suppressHistory && this.history) {
				this.history.push(data);
			}
		}

	});

	//TODO(nutron): check out https://github.com/cpojer/mootools-history
	var History = new Class({

		Implements: [Options, Events],

		options: {
			/*
			onAdd: $empty(item, index),
			onRemove: $empty(item),
			onSelectManual: $empty(path),
			onSelect: $empty(item),
			onBack: $empty(item, index),
			onForward: $empty(item, index),
			onRefresh: $empty,
			selected: null,
			*/
			pathFilter: function(val){ return val;},
			pathBuilder: function(val){ return val; },
			history: [],
			start: window.location.hash
		},

		initialize: function(options) {
			this.setOptions(options);
			this.setHistory(this.options.history);
			this._currentLocation = this.options.start.replace('#', '');
			this.attach();
		},

		history: [],

		attach: function(attach) {
			clearInterval(this._locationMonitor);
			if (attach || attach == null) this._locationMonitor = this._monitor.periodical(100, this);
		},

		detach: function(){
			this.attach(false);
		},

		_monitor: function(){
			if ("#" + this._currentLocation != window.location.hash) {
				var location = window.location.hash.replace('#', '');
				this.fireEvent('change', location);
				this._currentLocation = location;
			}
		},

		rewrite: function(data){
			this.back();
			this.push(data);
		},

		push: function(data) {
			var uri = data.responsePath;
			if (data.requestParams) {
				uri = new URI(data.requestParams.uri);
				uri.setData('___method___', data.requestParams.method);
				var postKeys = [];
				for (key in data.requestParams.formData){
					postKeys.push(key);
				}
				uri.setData('___postKeys___', postKeys.join(',,'));
			}
			uri = unescape(uri.toString());
			this._currentLocation = uri;
			window.location.hash = uri;
			//here for API compatibility
		},

		pop: function(){
			//here for API compatibility
		},

		remove: function(item) {
			//here for API compatibility
		},

		dropFutureHistory: function(){
			//here for API compatibility
		},

		toggle: function(e){
			//here for API compatibility
		},

		showEditor: function(show){
			//here for API compatibility
		},

		//displays the dropdown list of your history
		show: function(e){
			//here for API compatibility
		},

		hide: function(e){
			//here for API compatibility
		},

		blur: function(){
			//here for API compatibility
		},

		disable: function(){
			//here for API compatibility
		},

		enable: function(){
			//here for API compatibility
		},

		select: function(hist, suppressEvent){
			//here for API compatibility
		},

		setNavState: function(){
			//here for API compatibility
		},

		back: function(e){
			window.history.back();
		},

		forward: function(e){
			window.history.forward();
		},

		setEditable: function(editable) {
			//here for API compatibility
		},

		setTitle: function(title) {
			$$('title')[0].set('text', title);
		},

		getHistory: function(){
			//here for API compatibility
			return [];
		},

		setHistory: function(arr) {
			//here for API compatibility
		},

		clear: function(){
			//here for API compatibility
		},

		makeEndSelected: function(){
			//here for API compatibility
		},

		getSelected: function(){
			//here for API compatibility
		}

	});

})();
