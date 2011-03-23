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
description: Provides functionality for links that load content into a target element via ajax.
provides: [JFrame.AjaxLoad]
requires: [/JFrame, More-Behaviors/Behavior.FormRequest]
script: JFrame.AjaxLoad.js
...
*/

(function(){

	/*
		loads the contents of a link into a specific target
		* event - the event object from the link click
		* link - the link clicked

		notes:
		* links have properties for one of data-ajax-append, data-ajax-replace, and data-ajax-target
		* replace means destroy the target and replace it entirely with the response.
		* append means leave everything in place and inject the response after the target.
		* target means empty the target and fill it with the response
		* links with a "data-ajax-filter" property will inject only the elements that match the selector it specifies.
		  For example, if you have a table that you want to add rows to, and your request returns an HTML document that
		  includes an entire table, you would specify data-ajax-filter="table tbody tr" to only inject the rows from
		  the body in the response.
	*/

	var linkers = {};

	['append', 'replace', 'target', 'after', 'before'].each(function(action){
		linkers['[data-ajax-' + action + ']'] = function(event, link){
			var options = configureOptions(link, action, event, $(this));
			if (options) this.load(options);
			else this.callClick(event, link, true);
		};
	});
	JFrame.addGlobalLinkers(linkers);

	//this runs AFTER Behavior.FormRequest
	Behavior.addGlobalPlugin('FormRequest', 'JFrameFormRequestAjaxTargeting', function(element, behaviorAPI){
		//get the Form.Request instance
		var formRequest = element.get('formRequest');
		formRequest.addEvent('send', function(form, query){
			var options = {};
			['append', 'replace', 'target', 'after', 'before'].each(function(action){
				if (form.getData('ajax-' + action)) {
					options = configureOptions(element, action, null, behaviorAPI.getContentElement()) || {};
				}
			}, this);
			behaviorAPI.configureRequest(formRequest.request, options, true);
		});
	});

	//configures the options for passing to JFrame's load method or through behaviorAPI's configureRequest method.
	var configureOptions = function(element, action, event, containerElement){
		var target,
			selector = element.getData('ajax-' + action);
		if (selector) {
			if (selector == "parent") {
				target = element.getParent();
			} else if (selector == "self") {
				target = element;
			} else if (selector == "top") {
				target = containerElement;
			} else {
				target = containerElement.getElement(selector);
			}
		}

		if (!target) {
			dbug.log('could not ' + action + ' the target element with response; element matching selector %s was not found', element.getData('ajax-' + action));
			element.erase('data-ajax-' + action);
			//we return here with no options; this allows the caller to do some default behavior.
			return;
		}

		var requestTarget = target;
		if (action != 'target') requestTarget = new Element('div');

		var spinnerTarget = element.getData('spinner-target');
		if (spinnerTarget) spinnerTarget = $(this).getElement(spinnerTarget);

		return {
			spinnerTarget: spinnerTarget || target,
			target: requestTarget,
			filter: element.getData('ajax-filter'),
			requestPath: element.get('href'),
			spinnerTarget: spinnerTarget || target,
			target: requestTarget,
			noScroll: true,
			onlyProcessPartials: true,
			ignoreAutoRefresh: true,
			suppressLoadComplete: true,
			fullFrameLoad: false,
			retainPath: true,
			callback: function(data, caller){
				if (caller !== "_defaultRenderer") {
					// Only perform ajax replace for the default renderer.
					return;
				}
				switch(action){
					case 'replace':
						//reverse the elements and inject them
						//reversal is required since it injects each after the target
						//pushing down the previously added element
						data.elements.reverse().injectAfter(target);
						target.destroy();
						break;
					case 'append':
					case 'after':
						//see note above in 'replace' case as to why we use reverse here
						data.elements.reverse().injectAfter(target);
						break;
					case 'before':
						data.elements.reverse().injectBefore(target);
					//do nothing for update, as Request.HTML already does it for you
				}
				var state = {
					event: event,
					target: target,
					action: action
				};
				if (element.get('tag') == 'a') state.link = element;
				else if (element.get('tag') == 'form') state.form = element;
				//pass along the data that came back from JFrame's response handler as well as the state of this ajax load.
				this.fireEvent('ajaxLoad', [data, state]);
				this.behavior.fireEvent('update', [data, state]);
			}
		};
	};

})();


