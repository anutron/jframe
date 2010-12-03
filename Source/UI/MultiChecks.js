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
description: Allows users to hold down shift to select multiple check boxes.
provides: [MultiChecks]
requires: [More/Element.Delegation]
script: MultiChecks.js
...
*/
(function(){

	var checkInput = function(input, checked) {
		input.set('checked', checked).fireEvent('change');
	};

	this.MultiChecks = new Class({

		initialize: function(container) {
			this.element = $(container);
			this.bound_clickHandler = this.clickHandler.bind(this);
			this.attach();
		},

		attach: function(detach){
			var method = detach ? 'removeEvent' : 'addEvent';
			return this.element[method]('click:relay(input[type=checkbox])', this.bound_clickHandler);
		},

		detach: function(){
			return this.attach(true);
		},

		clickHandler: function(e, input){
			//if there's a previously clicked input and the shift button is held
			if (this._prev && e.shift) {
				var active, check;
				//get the state of the input, if it's checked, we're selecting things
				//otherwise we're deselecting them
				check = input.get('checked');
				//get all the checkboxes in the element
				this.element.getElements('input[type=checkbox]').each(function(el){
					//if it's the element we checked, or it's the previous one checked
					if (el == input || el == this._prev) {
						//then check it and toggle our start state
						checkInput(el, check);
						active = !active;
						return;
					}
					//if we're active, check the input
					if (active) checkInput(el, check);
				}, this);
			}
			//store the clicked element as the new one.
			this._prev = input;
		}

	});

})();