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
description: Configures FormValidator instances to look for containers for .jframe-errors for error messages.
provides: [Behavior.JFrameFormValidator]
requires: [More-Behaviors/Behavior.FormValidator]
script: Behavior.JFrameFormValidator.js

...
*/


Behavior.addGlobalPlugin('FormValidator', 'JFrameFormValidator', function(element, behaviorAPI){
	var validator = element.retrieve('validator');
	//stupid monkey patch, for now. TODO(nutron)
	validator.insertAdvice = function(advice, field){
		//look for a .jframe-errors advice element that is a sibling of the field and inject errors there
		var target = field.getParent().getElement('.jframe-errors');
		if (target) target.adopt(advice);
		//otherwise inject them as siblings.
		else field.getParent().adopt(advice);
	};
	
});