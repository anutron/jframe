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
description: Allows you to pass through events in Class instances.
provides: [Events.Relay]
requires: 
 - Core/Events

script: Events.Relay.js

...

	Example usage:
	
	var StreetFighter = new Class({
		Implements: Events,
		fight: function(){
			if (Number.random(0,1)) this.fireEvent('win');
			else this.fireEvent('lose');
		}
	});

	var Player = new Class({
		Implements: Events.Relay,
		initialize: function(){
			this.game = new StreetFighter();
			this.inheritEvents({
				win: this.game,
				lose: this.game
			});
		}
	});

	var valerio = new Player();
	valerio.addEvents({
		win: function(){
			alert('Valerio wins!');
		},
		lose: function(){
			//not used; not possible to be invoked
		}
	});

	Note:
	Why do you need both relayEvent and inheritEvent? Because you may want to pass along events
	from a class you don't control. Consider Fx in Core. If I'm writing something with an effect
	and I want to fire onComplete when the Fx is done, I shouldn't have to alter the Fx class to
	do so.

*/

Events.Relay = new Class({

	relayEvent: function(name, target){
		return this.addEvent(name, function(){
			target.fireEvent(name, arguments);
		});
	},

	relayEvents: function(obj){
		for (var name in obj){
			this.relayEvent(name, obj[name]);
		}
	},

	inheritEvent: function(name, target){
		return target.addEvent(name, function(){
			this.fireEvent(name, arguments);
		}.bind(this));
	},

	inheritEvents: function(obj){
		for (var name in obj){
			this.inheritEvent(name, obj[name]);
		}
	}

});