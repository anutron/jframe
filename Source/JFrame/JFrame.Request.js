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
description: Refactor of MooTools Request to manage Desktop logins
provides: [JFrame.Request]
requires: [More/Class.Refactor, /JFrame.Error, Core/Request.JSON, Core/Request.HTML]
script: JFrame.Request.js

...
*/
/**
 * Refactors MooTools' Request so that all responses go through a common place.
 * Here, we check the X-Hue-Middleware-Response header for magic values.
 */
(function() {
	var pendingRequests = [];

	var refactoring = {
		
		options: {
			onJFrameError: function(data){
				this.genericErrorAlert(data);
			},
			onFailure: function() {
				var msg;
				if(this.status == 0) {
					msg = "The Hue server can not be reached. (Is the server running ?)";
				} else if (Browser.Engine.trident && (this.status == 12030 || this.status == 12031)) {
					
					//In IE, the attempt to get the profile upon logout often results in a status
					//error 12030 or 12031.  The request completes successfully, just that IE is 
					//unhappy with the response.  This condition catches that condition and passes it
					//to handleLoginRequired(), which is what should happen.
					this.handleLoginRequired();
					return;
				} else {
					msg = "Error " + this.status + " retrieving <a target='_blank' href='" + this.options.url + "'>link</a>";
				}
				this.genericErrorAlert({ 
					message: msg
				});
			}
		},

		success: function(text, xml) {
			var middleware_header = this.getHeader('X-Hue-Middleware-Response');
			if (middleware_header) {
				if (middleware_header == "EXCEPTION") {
					this.handleException(text, xml);
				} else {
					alert('Bad middleware header: ' + middleware_header);
				}
			} else {
				this.previous(text, xml);
			}
		},

		/**
		 * Handle the case when the server side has thrown back an error.
		 */
		handleException: function(text, xml) {
			var data = JSON.decode(text, true);
			this.fireEvent('jframeError', data);
			this.fireEvent('exception', [this.xhr, data]);
		},

		/**
		 * We have an error that wasn't handled by the user-provided onException
		 */
		genericErrorAlert: function(data) {
			var errorAlert;
			if (data.message) errorAlert = JFrame.error('JFrame Error', data.message);
			else errorAlert = JFrame.error('JFrame Error', "Unknown");
			this.fireEvent('onJFrameErrorPopup', errorAlert);
		}

	};

	Request = Class.refactor(Request, refactoring);
	Request.JSON = Class.refactor(Request.JSON, refactoring);
	Request.HTML = Class.refactor(Request.HTML, refactoring);
})();
