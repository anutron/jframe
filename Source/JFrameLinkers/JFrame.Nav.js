/*
---
description: Makes links with .css-nav_back and .jframe-nav_next navigate forward and back.
provides: [JFrame.Nav]
requires: [/JFrame]
script: JFrame.Nav.js

...
*/
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
JFrame.addGlobalLinkers({

	//any link with a target value launches the app named as the target if there is one
	//else opens new browser window/tab
	'.jframe-nav_next': function(event, link) {
		this.getWindow().history.forward();
	},

	'.jframe-nav_back': function(event, link) {
		this.getWindow().history.back();
	}

});