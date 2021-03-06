/* version: a870ccc.1461338651 */
window.CustomPlayer = (function(){
	function addClass(o, c){
	var re = new RegExp("(^|\\s)" + c + "(\\s|$)", "g");
	if (re.test(o.className)) return;
	o.className = (o.className + " " + c).replace(/\s+/g, " ").replace(/(^ | $)/g, "");
}

function removeClass(o, c){
	var re = new RegExp("(^|\\s)" + c + "(\\s|$)", "g");
	o.className = o.className.replace(re, "$1").replace(/\s+/g, " ").replace(/(^ | $)/g, "");
}

function hasClass(o, c){
	var re = new RegExp("(^|\\s)" + c + "(\\s|$)", "g");
	return re.test(o.className);
}

function map(array, callback){
	if(array){
		for(var i=0; i<array.length; i++){
			if(callback(array[i])===false) break;
		}
	}
}

function keys(o){
	var res = [];
	for(var i in o) if(o.hasOwnProperty(i)){
		res.push(i);
	}
	return res;
}

function is_object(item){
	return typeof item === 'object' && item!==null && item.constructor === Object;
}

function is_empty(item){
	return item ? (is_object(item) ? keys(item).length==0 : item.length==0) : true;
}

function fill(a, b){
	map(keys(b), function(k){
		if(is_object(a[k]) && is_object(b[k]) && !is_empty(a[k])){
			fill(a[k], b[k]);
		}else if(typeof a[k]!=='undefined'){
			a[k] = b[k];
		} 
	});
	return a;
}

function extend(a, b){
	map(keys(b), function(k){
		if(is_object(a[k]) && is_object(b[k]) && !is_empty(a[k])){
			extend(a[k], b[k]);
		}else{
			a[k] = b[k];
		} 
	});
	return a;
}

function every(array, callback){
	for(var i=0; i<array.length; i++){
		if(!callback(array[i])){
			return false;
		}
	}
	return true;
}

function on(elm, type, handler, scope){
	if(type instanceof Array){
		for(var i=0; i<type.length; i++){
			on(elm, type[i], handler, scope);
		}
	}else{
		var event_name = type.split('.')[0];
		var tag = type.split('.')[1] || null;
		var h = function(event){
			if(handler.call(scope ? scope : elm, event)===false){
				event.stopPropagation();
				event.preventDefault();
			}
		};

		if(!elm.__events){
			elm.__events = {};
		}

		elm.__events = elm.__events || {};
		elm.__events[event_name] = elm.__events[event_name] || [];

		elm.__events[event_name].push({
			tag: tag,
			handler: h
		});
		elm.addEventListener(event_name, h, false);
	}
}

function off(elm, type){
	if(type instanceof Array){
		for(var i=0; i<type.length; i++){
			off(elm, type[i]);
		}
	}else{
		var event_name = type.split('.')[0];
		var tag = type.split('.')[1] || null;
		var a = elm.__events[event_name];

		for(var i=0; i<a.length; i++){
			if(a[i] && (tag===null || a[i].tag==tag)){
				elm.removeEventListener(event_name, a[i].handler, false);
				a[i] = null;
			}
		}
	}
}

function html(html){
	var e = document.createElement('DIV');
	e.innerHTML = html;
	return e.firstChild;
}

function flash_support(){
	var s = navigator.mimeTypes['application/x-shockwave-flash']
		&& navigator.mimeTypes['application/x-shockwave-flash'].enabledPlugin
		&& navigator.mimeTypes['application/x-shockwave-flash'].enabledPlugin.description;
	return !!s;
}

function getCookie(key, default_value){
	var cookie = {};
	map(document.cookie.split(';'), function(p){
		var o = p.split('=');
		if(o.length==2){
			cookie[o[0].trim()] = o[1].trim();
		}
	});
	return cookie[key] && !isNaN(cookie[key]) ? cookie[key] : default_value;
}

function setCookie(key, value){
	document.cookie = key+"="+value+"; path=/";
}

function _getXHR(){
	if (window.XDomainRequest){
		return new XDomainRequest();
	}else if (window.XMLHttpRequest){
		return new XMLHttpRequest();
	}else{
		return false;
	}
}

function load(url, callback){
	var self = this;
	var xhr = _getXHR();

	xhr.onload = function(){
		if(!xhr.responseXML){
			xhr.responseXML = (new DOMParser).parseFromString(xhr.responseText, 'text/xml')
		}
		callback(true, xhr);
	}

	xhr.onerror = function(){
		callback(false, xhr);
	}

	xhr.open('GET', url, true);
	xhr.send(null);
	return xhr;
}

function post(url, data){
	var xhr = _getXHR();
	xhr.open('POST', url, true);
	xhr.send(data);
}

function getDeviceInfo(){
	var res, info = {};

	if(res=navigator.userAgent.match(/\bandroid\s(\d+)\.(\d+)(\.(\d+))?\b/i)){
		info.is_android = true;
		info.version = [res[1]|0,res[2]|0,res[4]|0];
	}
	else if(/iPhone/.test(navigator.platform)){
		info.is_iphone = true;
	}
	else if(/iPad/.test(navigator.platform)){
		info.is_ipad = true;
	}
	else if(/iPod/.test(navigator.platform)){
		info.is_ipod = true;
	}

	info.is_mobile = info.is_android
		|| info.is_iphone
		|| info.is_ipad
		|| info.is_ipod;

	return info;
}

var debug = {
	enable: false,

	on: function(){
		this.enable = true;
	},

	off: function(){
		this.enable = false;
	},

	log: function(){
		if(this.enable){
			var d = new Date;

			var date = ('0'+d.getHours()).substr(-2)
			+':'+('0'+d.getMinutes()).substr(-2)
			+':'+('0'+d.getSeconds()).substr(-2);

			var log = "[DEBUG]["+date+"]" + [].join.call(arguments, ' ');
			console.info(log);
		}
	}
};	CustomObject = {

	proxy: function(type, receiver){
		if(type instanceof Array){
			for(var i=0; i<type.length; i++){
				this.proxy(type[i], receiver);
			}
		}else{
			this.on(type, function(){
				var args = Array.prototype.splice.call(arguments, 1);
				receiver.trigger.apply(receiver, [type].concat(args));
			});
		}
	},

	one: function(type, handler, scope){
		this.on(type, function(e){
			e.handler.remove();
			handler.apply(this, arguments);
		}, scope);
	},

	on: function(type, handler, scope){
		var self = this;
		this._handlers = this._handlers || {};
		if(type instanceof Array){
			for(var i=0; i<type.length; i++){
				this.on(type[i], handler, scope);
			}
		}else{
			if(typeof this._handlers[type]==='undefined'){
				this._handlers[type] = [];
			}
			this._handlers[type].push({
				_id: this._handlers[type].length,
				handler: handler,
				scope: scope || this,
				remove: function(){
					self._handlers[type][this._id] = null;
				}
			});
		}
		return this;
	},

	off: function(type){
		this._handlers = this._handlers || {};

		if(typeof this._handlers[type]!=='undefined'){
			delete this._handlers[type];
		}
	},

	trigger: function(type){
		this._handlers = this._handlers || {};

		var args = Array.prototype.splice.call(arguments, 1);
		var handlers = (this._handlers[type]||[]).concat(this._handlers['*']||[]);
		for(var i=0; i<handlers.length; i++){
			if(h = handlers[i]){
				var ret = h.handler.apply(h.scope, [{type: type, handler: h}].concat(args));
				if(ret===false){
					break;
				}				
			}
		}

		return this;
	},
};
function CustomPlayer(root, options){
	this.root = root;

	this.is_show_poster = false;
	this.is_loading = false;
	this.is_playing = false;
	this.is_muted = false;
	this.is_start_load = false;

	this.duration = null;
	this.sources = [];
	this._handlers = {};
	this._plugins = {};

	this.conf = {
		baseCSSClass: 'customPlayer',
		muted: false,
		autoplay: false,
		sources: [],
		plugins: {},
		defaultVolume: 1,
		allow_backends: keys(this.__backends),
		cookieKeyVolume: null,
		backend_options: {
			flash_swf: options.flash_swf || 'video.swf',
			useDefaultControls: false,
		}
	};
	fill(this.conf, options);

	addClass(this.root, this.conf.baseCSSClass);
	
	if(this.conf.plugins){
		this._initPlugins(this.conf.plugins);
	}

	if(this.conf.sources){
		this.setSources(this.conf.sources);
	}

	var self = this;
	setTimeout(function(){
		self._init();
	}, 0);
}

CustomPlayer.prototype = extend(Object.create(CustomObject), {

	__backends: {},
	__plugins: {},

	_init: function(){
		var self = this;

		if(this.conf.autoplay && !getDeviceInfo().is_mobile){
			self.play();
		}

		if(this.conf.cookieKeyVolume){
			this.setVolume(getCookie(this.conf.cookieKeyVolume, this.conf.defaultVolume));
		}else{
			this.setVolume(this.conf.defaultVolume);
		}

		if(this.conf.muted){
			this.mute();
		}
	},

	_destroyBackend: function(){
		if(this.backend){
			this.backend.destroy();
			this.root.removeChild(this.backend.getElement());
		}
	},

	_initBackend: function(backend_class){
		var self = this;

		this.trigger('waiting');

		if(!(this.backend instanceof backend_class)){
			if(this.backend){
				this._destroyBackend();
			}
			this.backend = new backend_class(this.conf.backend_options);

			this.backend.on('play', function(){
				self.is_playing = true;
				if(self.has_been_paused){
					self.trigger('resume');
				}
			});

			this.backend.on('pause', function(){
				self.is_playing = false;
				self.has_been_paused = true;
			});

			this.backend.on('ended', function(){
				self.is_playing = false;
			});

			this.backend.on('error', function(e, code, message){
				self.error(code, message);
			});

			this.backend.on('timeupdate', function(e, time){
				self.trigger('timeupdate', time, self.getDuration())
			});

			this.backend.on('ready', function(){
				this.setVolume(self.volume+0.1);
				this.setVolume(self.volume-0.1);
				this.setVolume(self.volume);
			});

			this.backend.proxy([
				'waiting',
				'playing',
				'seeking',
				'seeked',
				'progress',
				// 'durationchange',
				// 'timeupdate',
				'ended',
				'volumechange',
				'play',
				'canplay',
				'pause',
			], this);

			this.backend.init();

			var backend_elm = this.backend.getElement();
			backend_elm.style.width = '100%';
			backend_elm.style.height = '100%';
			backend_elm.style.position = 'absolute';
			backend_elm.style.left = 0;
			backend_elm.style.top = 0;
			this.root.appendChild(backend_elm);

			this.trigger("backendchange", this.backend);
		}
	},

	_initSources: function(sources){
		var allow_backends = this.conf ? this.conf.allow_backends : keys(this.__backends);
		var backends = this.__backends;

		for(var i=0; i<allow_backends.length; i++){
			var name = allow_backends[i];
			if(typeof backends[name]==='undefined') continue;
			for(var j=0; j<sources.length; j++){
				if(
					backends[name].prototype.isSupported() &&
					backends[name].prototype.canPlayType(sources[j].type)
				){
					this._initBackend(backends[name]);
					this.source = sources[j];

					this.trigger("sourcechange", this.source);
					return true;
				}	
			}
		}
		return false;
	},

	_initPlugins: function(options){
		for(var name in options){
			if(options[name] && (typeof options[name].enabled==='undefined' || options[name].enabled)){
				this._plugins[name] = new this.__plugins[name](this, options[name]);
			}
		}
	},

	//---- API ----

	getWidth: function(){
		return this.root.offsetWidth;
	},

	getHeight: function(){
		return this.root.offsetHeight;
	},

	supportMedia: function(type){
		var allow_backends = this.conf ? this.conf.allow_backends : keys(this.__backends);
		var backends = this.__backends;
		for(var i=0; i<allow_backends.length; i++){
			var name = allow_backends[i];
			if(typeof backends[name]==='undefined') continue;
			if(
				backends[name].prototype.isSupported() &&
				backends[name].prototype.canPlayType(type)
			){
				return true;
			}
		}
		return false;	
	},

	destroy: function(){
		if(this.backend){
			this._destroyBackend();
			this.backend = null;
		}
		this._handlers = {};
		this.root.parentElement.removeChild(this.root);
		return this;
	},

	decodeErrorCode: function(code){
		var map = {
			100: 'We are working to fix this as soon as possible. Thanks for patience.',
			101: 'Your browser can not reproduce this video. Please update your browser for the best viewing experience.',
			102: 'Oops, try again! There is no video.',
			200: 'We are working to fix this as soon as possible. Thanks for patience.',
			201: 'Video temporarily is unavailable, please try again later.',
		};
		return map[code] || 'Unknown error';
	},

	error: function(code, message){
		this.trigger('error', code, message || this.decodeErrorCode(code));
	},

	setSources: function(sources){
		if(sources && sources.length){
			if(this.is_playing){
				this.pause();
			}
			this.source = null;
			this.sources = sources;
		}else{
			this.error(102)
		}
		return this;
	},

	load: function(){
		var self = this;

		if(this.sources && this.sources.length){
			if(this._initSources(this.sources)){
				if(this.backend.is_ready){
					this.backend.setSource(self.source.src, self.source.type);
				}else{
					this.backend.one('ready', function(e){
						this.setSource(self.source.src, self.source.type);
					});
				}
				this.is_start_load = true;
			}else{
				this.error(101);
			}
		}else{
			this.error(102);
		}
	},

	play: function(){
		if(!this.is_playing){
			this.is_playing = true;

			if(this.is_start_load){
				this.backend.play();
			}else{
				this.one('canplay', function(e){
					this.backend.play();
				});
				this.load();
			}
		}
		return this;
	},

	pause: function(){
		if(this.is_playing){
			this.backend.pause();
			this.is_playing = false;
		}
		return this;
	},

	getVolume: function(){
		if(this.backend){
			this.volume = this.backend.getVolume();
		}
		return this.volume;
	},

	setVolume: function(value){
		this.volume = Math.min(1, Math.max(0, value));

		if(this.conf.cookieKeyVolume){
			setCookie(this.conf.cookieKeyVolume, this.volume);
		}

		this.trigger('volumechange', this.volume);
		if(this.backend){
			this.backend.setVolume(this.volume);
		}
	},

	mute: function(){
		this._old_volume = this.getVolume();
		this.setVolume(0);
	},

	unmute: function(){
		this.setVolume(this._old_volume||1);
	},

	getDuration: function(){
		return this.backend.getDuration();
	},

	getCurrentTime: function(){
		return this.backend.getCurrentTime();
	},

	setProgress: function(value){
		var time = this.getDuration() / 100 * value;
		this.backend.setCurrentTime(time);
	},

	getProgress: function(){
		if(this.backend){
			return this.getCurrentTime() / this.getDuration() * 100;
		}else{
			return 0;
		}
	},

	showDefaultUI: function(){
		if(this.backend){
			this.backend.showDefaultUI();
		}else{
			this.one('backendchange', function(e, backend){
				backend.showDefaultUI();
			})
		}
	}

});	(function(){
		var s = document.createElement('STYLE');
		s.innerHTML = '.customPlayer {position: relative;outline: none;background: #000;z-index: 0;font: 400 14px/1.2 \'Roboto\', sans-serif;overflow: hidden;}.customPlayer.fullscreen {position: absolute;top: 0;left: 0;width: 100% !important;height: 100% !important;}.customPlayer .ui {position: absolute;left: 0;top: 0;right: 0;bottom: 0;z-index: 100;outline: none;}.customPlayer .no-animate,.customPlayer .no-animate *{transition: none !important;}.customPlayer .ui > .loader {position: absolute;width: 40%;height: 40%;left: 30%;top: 30%;opacity: 1;transition: opacity ease .7s;}.customPlayer .ui > .loader.hide {opacity: 0;}.customPlayer .ui > .error.fatal {position: absolute;display: table;top: 0;left: 0;width: 100%;height: 100%;color: rgb(255, 82, 82);font-size: 20pt;text-align: center;z-index: 1000;background: #000;}.customPlayer .ui > .error>div {display: table-cell;vertical-align: middle;}.customPlayer .ui .start-screen {position: absolute;left: 0;top: 0;width: 100%;height: 100%;z-index: 10;cursor: pointer;background-color: black;opacity: 1;transition: opacity ease .5s;}.customPlayer .ui .start-screen.hide {opacity: 0;}.customPlayer .ui .start-screen > .poster {position: absolute;left: 0;top: 0;width: 100%;height: 100%;background-repeat: no-repeat;background-position: 50% 50%;background-size: contain;opacity: 1;transition: opacity ease .7s;}.customPlayer .ui .start-screen > .poster.hide {opacity: 0;}.customPlayer .ui .start-screen svg {position: absolute;width: 40%;height: 40%;left: 30%;top: 30%;}.customPlayer .ui .start-screen:hover svg > path {fill: rgba(255,255,255,0.9);}.customPlayer .ui>.controls {position: absolute;left: 0px;right: 0px;bottom: 0px;height: 69px;background: none;background-image: url(\'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAABFCAYAAACL3IzzAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyZpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNS1jMDIxIDc5LjE1NTc3MiwgMjAxNC8wMS8xMy0xOTo0NDowMCAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIDIwMTQgKFdpbmRvd3MpIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOjBCQUNBRUVFNjM5QjExRTVBQjkzRDJCRDQyRkU1MEE0IiB4bXBNTTpEb2N1bWVudElEPSJ4bXAuZGlkOjBCQUNBRUVGNjM5QjExRTVBQjkzRDJCRDQyRkU1MEE0Ij4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6MEJBQ0FFRUM2MzlCMTFFNUFCOTNEMkJENDJGRTUwQTQiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6MEJBQ0FFRUQ2MzlCMTFFNUFCOTNEMkJENDJGRTUwQTQiLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz4PyzKNAAAAbElEQVR42myPUQ6AMAhDK9u1jB/e/0xV6NaQ6M/SBy0w3NcZAfAIEBEECvNJJLaqGjGMw4lUSgzjVlVLxAdnjk9lM9+aUKrmcWqvVI+5oZgbZeH0yo4yr/vWvIZ90TpIX9Xh8NCfmxfK/AgwACr2StbF5TFoAAAAAElFTkSuQmCC\');opacity: 0;transition: opacity ease .3s;z-index: 9;}.customPlayer .ui>.controls.show {opacity: 1;}.customPlayer .ui>.controls svg {width: 100%;height: 100%;fill: #FFFFFF;}.customPlayer .ui>.controls *:hover>svg {fill: #FCC010;}.customPlayer .ui>.controls .play-pause {position: absolute;left: 20px;bottom: 10px;cursor: pointer;width: 24px;height: 24px;overflow: hidden;}.customPlayer .ui>.controls .play-pause path.play {display: block;}.customPlayer .ui>.controls .play-pause path.pause {display: none;}.customPlayer .ui.playing>.controls .play-pause path.play {display: none;}.customPlayer .ui.playing>.controls .play-pause path.pause {display: block;}.customPlayer .ui>.controls .timer {position: absolute;bottom: 12px;left: 50px;color: #fff;font-size: 12px;padding: 0;line-height: 20px;height: 20px;vertical-align: middle;}.customPlayer .ui>.controls .time-label {position: absolute;color: #fff;background: #000;border-radius: 5px;padding: 5px 10px;text-align: center;bottom: 60px;opacity: 0;cursor: default;transition: opacity ease .5s;}.customPlayer .ui>.controls .time-label:after {content: \"\";position: absolute;width: 0;height: 0;top: 100%;left: 50%;border-style: solid;border-color: transparent;border-width: 5px;border-top-color: #000;margin-left: -5px;}.customPlayer .ui>.controls .time-label.show {opacity: 1;}.customPlayer .ui.small-mode>.controls .time-label {bottom: 75px;font-size: 20px;}.customPlayer .ui>.controls .progress {position: absolute;left: 0px;right: 0px;bottom: 45px;height: 17px;background: none;cursor: pointer;border-bottom: 5px solid rgba(108, 108, 108, 0.5);z-index: 0;}.customPlayer .ui>.controls .progress.readonly {border-bottom-width: 2px;cursor: default;}.customPlayer .ui>.controls .progress .load {position: absolute;height: 5px;left: 0;bottom: -5px;background: rgba(154, 154, 156, 0.5);z-index: 0;transition: width ease .3s;}.customPlayer .ui>.controls .progress.readonly .load {height: 2px;bottom: -2px;}.customPlayer .ui>.controls .progress .play {position: absolute;left: 0;bottom: -5px;height: 5px;background: #FCC010;z-index: 10;transition: width ease .3s;}.customPlayer .ui>.controls .progress.readonly .play {background: #BEBEBE;height: 2px;bottom: -2px;}.customPlayer .ui>.controls .progress.readonly .play:after {display: none;}.customPlayer .ui>.controls .progress .play:after {content: \"\";position: absolute;right: 0px;top: 0px;background: inherit;border-radius: 50%;width: 0px;height: 0px;border: none;margin: 3px 0 0 0;transition:margin ease .3s,width ease .3s,height ease .3s;}.customPlayer .ui>.controls .progress:hover .play:after {width: 12px;height: 12px;margin: -3px -6px 0 0;}.customPlayer .ui>.controls .tray {position: absolute;bottom: 0px;right: 0px;height: 45px;white-space: nowrap;}.customPlayer .ui>.controls .tray > *{position: relative;width: 24px;height: 24px;margin: 10px;display: inline-block;cursor: pointer;vertical-align: middle;box-sizing: content-box;}.customPlayer .ui>.controls .volume svg {position: absolute;left: 0px;width: 24px;height: 24px;}.customPlayer .ui>.controls .volume svg .mute {display: none;}.customPlayer .ui.muted>.controls .volume svg .unmute {display: none;}.customPlayer .ui.muted>.controls .volume svg .mute {display: block;}.customPlayer .ui>.controls .volume {position: relative;outline: none;width: 120px;}.customPlayer .ui>.controls .volume .vlevel{display: none;position: absolute;width: 100%;box-sizing: border-box;height: 100px;bottom: 100%;left: 0px;border-width: 10px 10px 0 10px;border-style: solid;border-color: rgba(0,0,0,0.3);}.customPlayer .ui>.controls .volume .vlevel:before {position: absolute;content: \"\";left: 0;top: 0;width: 100%;height: 100%;background: rgba(154, 154, 156, 0.5);}.customPlayer .ui>.controls .volume .vlevel>.value{position: absolute;bottom: 0px;left: 0px;background: #fff;width: 100%;height: 100%;}.customPlayer .ui>.controls .volume .level{position: absolute;right: 5px;left: 40px;top: 50%;margin-top: -13px;height: 5px;border-style: solid;border-color: rgba(0,0,0,0);border-width: 10px 0;}.customPlayer .ui>.controls .volume .level:before {content: \"\";position: absolute;width: 100%;left: 0;top: 0;height: 5px;background: rgba(108, 108, 108, 0.5);}.customPlayer .ui>.controls .volume .level>.value{position: absolute;left: 0;width: 100%;height: 100%;background: #FFFFFF;transition: width ease .3s;}.customPlayer .ui>.controls .volume .level>.value:after {content: \"\";position: absolute;right: 0px;top: 0px;background: inherit;border-radius: 50%;width: 0px;height: 0px;border: none;margin: 3px 0 0 0;transition:margin ease .3s,width ease .3s,height ease .3s;}.customPlayer .ui>.controls .volume:hover .level>.value:after {width: 12px;height: 12px;margin: -3px -6px 0 0;}.customPlayer .ui.small-mode > .controls .progress {border-bottom-width: 20px;}.customPlayer .ui.small-mode > .controls .progress .load {height: 20px;bottom: -20px;}.customPlayer .ui.small-mode > .controls .progress .play {height: 20px;bottom: -20px;}.customPlayer .ui.small-mode > .controls .progress .play:after {display: none;content: \"\";position: absolute;right: -8px;top: 0px;height: 100%;width: 16px;background: #fff;border: none;margin: 0;border-radius: 0;}.customPlayer .ui.small-mode > .controls .volume {width: 24px;background: rgba(0,0,0,0);transition: background ease .5s;}.customPlayer .ui.small-mode > .controls .volume .vlevel{display: block;height: 0;border-top-width: 0; transition:border ease .3s,height ease .3s;}.customPlayer .ui.small-mode > .controls .volume .level{display: none;}.customPlayer .ui.small-mode > .controls .volume:focus {background: rgba(0,0,0,0.3);}.customPlayer .ui.small-mode > .controls .volume:focus .vlevel{border-top-width: 10px; height: 100px;}.customPlayer.fullscreen > .ui .tray .big {display: none;}.customPlayer > .ui.small-mode .tray .big {display: none;}';
		document.head.appendChild(s);
	})();
window.TouchEvent = window.TouchEvent || function(){};

function Controls(player, options){

	this.conf = extend({
		progress: {
			show: true,
			readonly: false,
		},
		timer: {
			show: true,
		},
		poster: null,
		useMobileFallback: false,
	}, options);

	this.player = player;
	this.duration;

	this.is_show_start_screen = true;
	this.is_first_play = true;
	this.is_played = false;
	this.is_muted = false;

	this.dom = html(
		'<div class="ui" tabindex="0" style="background:rgba(0,0,0,0)">'+
			'<div class="loader">'+
				'<svg viewBox="0 0 160 160" style="width:100%; height:100%">'+
					'<circle cx="80" cy="80" r="75" fill="rgba(0, 0, 0, 0.5)" stroke="rgba(255, 255, 255, 0.1)" stroke-width="2" />'+
					'<circle cx="80" cy="80" r="65" stroke="rgba(255, 255, 255, 0.5)" stroke-width="10" fill="transparent" />'+
				'</svg>'+
			'</div>'+
			'<div class="start-screen">'+
				'<div class="poster hide"></div>'+
				'<svg viewBox="0 0 160 160">'+
					'<circle cx="80" cy="80" r="80" fill="rgba(0, 0, 0, 0.3)" />'+
					'<path transform="translate(10, -14)" fill="rgba(255, 255, 255, 0.6)" d="M70,32.7c33.8,0,61.2,27.5,61.2,61.2c0,33.8-27.5,61.2-61.2,61.2c-33.8,0-61.2-27.5-61.2-61.2C8.7,60.2,36.2,32.7,70,32.7 M70,24C31.3,24,0,55.3,0,94c0,38.7,31.3,70,70,70c38.7,0,70-31.3,70-70C140,55.3,108.7,24,70,24L70,24z M59,73.4L94.7,94L59,114.6V73.4 M50.2,58.2v71.6l62-35.8L50.2,58.2L50.2,58.2z"/>'+
				'</svg>'+
			'</div>'+
			'<div class="controls">'+
				'<div class="time-label"></div>'+
				'<div class="progress">'+
					'<div class="load"></div>'+
					'<div class="play"></div>'+
				'</div>'+
				'<div class="play-pause">'+
					'<svg>'+
						'<path class="play" transform="translate(-24, 0)" d="M26,0v24l20-12L26,0L26,0z"/>'+
						'<path class="pause" transform="translate(0, 0)" d="M3.5,0h7v24h-7V0z M13.5,0h7v24h-7V0z"/>'+
					'</svg>'+
				'</div>'+
				'<div class="timer"></div>'+
				'<div class="tray">'+
					'<div class="volume" tabindex="0">'+
						'<svg>'+
							'<g class="unmute" transform="translate(-48, 0)">'+
								'<path d="M64.7,2.1L56.3,7h-5.8C49.7,7,49,7.7,49,8.5v7c0,0.8,0.7,1.5,1.5,1.5h5.8l8.4,4.9c1,0.6,2.3-0.1,2.3-1.3V3.4C67,2.3,65.7,1.6,64.7,2.1z"/>'+
								'<path d="M70.4,6.8c-0.1-0.5-0.7-0.9-1.2-0.8c-0.5,0.1-0.9,0.7-0.8,1.2C68.8,8.8,69,10.4,69,12s-0.2,3.2-0.5,4.7c-0.1,0.5,0.2,1.1,0.8,1.2c0.1,0,0.1,0,0.2,0c0.5,0,0.9-0.3,1-0.8c0.4-1.7,0.6-3.4,0.6-5.2S70.8,8.5,70.4,6.8z"/>'+
							'</g>'+
							'<path class="mute" transform="translate(-72, 0)" d="M73,15.5v-7C73,7.7,73.7,7,74.5,7h5.8l8.4-4.9c0.7-0.4,1.5-0.2,1.9,0.4L76.2,17h-1.7C73.7,17,73,16.3,73,15.5z M93.2,6.1c-0.5,0.1-0.9,0.7-0.8,1.2C92.8,8.8,93,10.4,93,12s-0.2,3.2-0.5,4.7c-0.1,0.5,0.2,1.1,0.8,1.2c0.1,0,0.1,0,0.2,0c0.5,0,0.9-0.3,1-0.8c0.4-1.7,0.6-3.4,0.6-5.2s-0.2-3.5-0.6-5.2C94.3,6.3,93.8,6,93.2,6.1z M81.3,17.6l7.5,4.3c1,0.6,2.3-0.1,2.3-1.3V7.8L81.3,17.6z M74.7,22.7l20-20c0.4-0.4,0.4-1,0-1.4s-1-0.4-1.4,0l-20,20c-0.4,0.4-0.4,1,0,1.4c0.2,0.2,0.5,0.3,0.7,0.3S74.5,22.9,74.7,22.7z"/>'+
						'</svg>'+
						'<div class="vlevel">'+
							'<div class="value"></div>'+
						'</div>'+
						'<div class="level">'+
							'<div class="value"></div>'+
						'</div>'+
					'</div>'+
				'</div>'+
			'</div>'+
		'</div>'
	);
	this.loader = this.dom.getElementsByClassName('loader')[0];
	this.start_screen = this.dom.getElementsByClassName('start-screen')[0];
		this.start_screen.poster = this.start_screen.getElementsByClassName('poster')[0];
	this.controls = this.dom.getElementsByClassName('controls')[0];
		this.controls.time_label = this.controls.getElementsByClassName('time-label')[0];
		this.controls.timer = this.controls.getElementsByClassName('timer')[0];
		this.controls.play_pause_btn = this.controls.getElementsByClassName('play-pause')[0];
		this.controls.tray = this.controls.getElementsByClassName('tray')[0];
			this.controls.tray.volume = this.controls.tray.getElementsByClassName('volume')[0];
				this.controls.tray.mute = this.controls.tray.volume.getElementsByTagName('svg')[0];
				this.controls.tray.volume.level = this.controls.tray.volume.getElementsByClassName('level')[0];
					this.controls.tray.volume.level.value = this.controls.tray.volume.level.getElementsByClassName('value')[0];
				this.controls.tray.volume.vlevel = this.controls.tray.volume.getElementsByClassName('vlevel')[0];
					this.controls.tray.volume.vlevel.value = this.controls.tray.volume.vlevel.getElementsByClassName('value')[0];
		this.controls.progress = this.controls.getElementsByClassName('progress')[0];
			this.controls.progress.load = this.controls.progress.getElementsByClassName('load')[0];
			this.controls.progress.play = this.controls.progress.getElementsByClassName('play')[0];

	this.init();
}

Controls.prototype = extend(Object.create(CustomObject), {

	getElement: function(){
		return this.dom;
	},

	init: function(){
		this.initUI();
		this.initPlayerEvents();
		this.initUIEvents();
		this.initEasterEgg();
		this.initAdaptive();

		if(this.conf.poster){
			var self = this;
			var img = new Image;
			img.addEventListener('load', function(){
				self.start_screen.poster.style.backgroundImage = 'url('+self.conf.poster+')';
				removeClass(self.start_screen.poster, 'hide');
			});
			img.src = this.conf.poster;
		}

		this.controls.tray.volume.level.value.style.width = this.player.volume*100 + '%';

		this.controls.style.display = 'none';

		this.hideLoader();

		if(this.conf.progress.readonly){
			addClass(this.controls.progress, 'readonly');
		}

		if(!this.conf.progress.show){
			this.controls.progress.style.display = 'none';
		}

		if(!this.conf.timer.show){
			this.controls.timer.style.display = 'none';
		}

		this.player.trigger('tray_ready', this.controls.tray);
	},

	initAdaptive: function(){
		var self = this;
		setInterval(function(){
			var width = self.dom.offsetWidth;
			if(width==0) return;
			var new_is_small_mode = width>0 && width<=480;
			if(self.is_small_mode!=new_is_small_mode){
				self.player.trigger('change_small_mode', new_is_small_mode);
				if(new_is_small_mode){
					addClass(self.dom, 'small-mode');
				}else{
					removeClass(self.dom, 'small-mode');
				}
			}
			self.is_small_mode = new_is_small_mode;
		}, 1000);
	},

	initUI: function(){
		var self = this;

		this.on('play', function(){
			if(self.is_first_play){
				self.hideStartScreen();
				self.is_first_play = false;

				if(self.conf.useMobileFallback && getDeviceInfo().is_mobile){
					self.dom.style.display = 'none';
					self.player.showDefaultUI();
				}
			}
		});

		on(this.dom, 'dblclick', function(e){
			if(e.target==self.dom){
				self.trigger('fullscreentoggle');
			}
		});

		on(this.dom, 'selectstart', function(){
			return false;
		});

		on(this.start_screen, 'click', function(event){
			self.trigger('play');
		});

		on(this.dom, ['mousedown', 'mouseup'], function(e){
			if(e.target==self.dom){
				if(e.type=='mousedown'){
					this._click_start = e.timeStamp;
				}
				if(e.type=='mouseup'){
					if((e.timeStamp-this._click_start) < 300){
						if(self.is_active){
							self.trigger(self.is_played ? 'pause' : 'play');
						}
					}
				}
			}
		});

		on(this.dom, 'keydown', function(e){
			if(e.keyCode==32){
				self.trigger(self.is_played ? 'pause' : 'play');
				return false;
			}
		});

		on(this.dom, 'click', function(e){
			self.trigger('user_active');
		});

		on(this.dom, ['mousemove','touchmove'], function(e){
			if(e.timeStamp-this._last_move<500){
				self.trigger('user_active');
			}
			this._last_move = e.timeStamp;
		});

		on(this.controls.play_pause_btn, 'click', function(){
			self.trigger(self.is_played ? 'pause' : 'play');
		});

		// Progress
		if(!this.conf.progress.readonly){
			var progress = this.controls.progress;
			var time_label = this.controls.time_label;

			var update_time_label = function(clientX){
				var x = clientX-progress.getBoundingClientRect().left;
				var time = self.duration * (x / progress.offsetWidth);
				var w = time_label.offsetWidth;

				time_label.style.left = Math.max(0, Math.min(progress.offsetWidth-w, x-(w/2)))+'px';

				time_label.innerHTML = self.formatTime(time);

				clearTimeout(time_label._t);
				addClass(time_label, 'show');
			}

			on(progress, ['mousedown', 'touchstart'], function(event){
				if(event instanceof TouchEvent || event.which==1){
					self.hold_progress = true;
					var left = progress.getBoundingClientRect().left;

					on(document, ['mousemove.progress', 'touchmove.progress'], function(event){
						var x = event instanceof TouchEvent ? event.changedTouches[0].clientX : event.clientX;
						addClass(progress, 'no-animate');
						progress.play.style.width = Math.max(0, Math.min(100, (x-left) / progress.offsetWidth * 100))+'%';

						update_time_label(x);
						return false;
					});

					on(document, ['mouseup.progress', 'touchend.progress'], function(event){
						var w = progress.offsetWidth;
						if(w){
							var x = event instanceof TouchEvent ? event.changedTouches[0].clientX : event.clientX;
							self.hold_progress = false;
							var p = Math.max(0, Math.min(1, (x-left) / w));
							removeClass(progress, 'no-animate');
							self.trigger('positionchange', p);
						}
						off(document, ['mousemove.progress', 'mouseup.progress', 'touchmove.progress', 'touchend.progress']);

						clearTimeout(time_label._t);
						time_label._t = setTimeout(function(){
							removeClass(time_label, 'show');
						}, 2000);

					});
				}
			});

			on(progress, 'mouseout', function(event){
				removeClass(time_label, 'show');
			});

			on(progress, 'mousemove', function(event){
				update_time_label(event.clientX);
			});
		}

		if(/iPad/.test(navigator.platform)){

			this.controls.tray.volume.style.display = 'none';

		}else{

			// Volume
			(function(volume){
				on(volume, ['mousedown', 'touchstart'], function(event){
					if(event instanceof TouchEvent || event.which==1){
						var x = event instanceof TouchEvent ? event.changedTouches[0].clientX : event.clientX;
						var left = volume.getBoundingClientRect().left

						self.trigger('volumechange', (x-left) / volume.offsetWidth);

						on(document, ['mousemove.volume', 'touchmove.volume'], function(event){
							var x = event instanceof TouchEvent ? event.changedTouches[0].clientX : event.clientX;
							addClass(volume, 'no-animate');
							self.trigger('volumechange', (x-left) / volume.offsetWidth);
							return false;
						});

						on(document, ['mouseup.volume', 'touchend.volume'], function(event){
							removeClass(volume, 'no-animate');
							off(document, ['mousemove.volume', 'mouseup.volume', 'touchend.volume', 'touchmove.volume']);
						});
					}
				});
			})(this.controls.tray.volume.level);

			// Vertical Volume
			(function(volume){
				on(volume, ['mousedown', 'touchstart'], function(event){
					var y = event instanceof TouchEvent ? event.changedTouches[0].clientY : event.clientY;
					var bottom = volume.getBoundingClientRect().bottom;

					self.trigger('volumechange', (bottom-y) / (volume.offsetHeight-10));

					on(document, ['mousemove.volume', 'touchmove.volume'], function(event){
						var y = event instanceof TouchEvent ? event.changedTouches[0].clientY : event.clientY;
						addClass(volume, 'no-animate');
						self.trigger('volumechange', (bottom-y) / (volume.offsetHeight-10));
						return false;
					});

					on(document, ['mouseup.volume', 'touchend.volume'], function(event){
						removeClass(volume, 'no-animate');
						off(document, ['mousemove.volume', 'mouseup.volume', 'touchend.volume', 'touchmove.volume']);
					});
				});
			})(this.controls.tray.volume.vlevel);

			var mute = this.controls.tray.mute;
			on(mute, 'click', function(){
				if(self.is_small_mode){
					self.controls.tray.volume.focus();
				}else{
					self.trigger(self.is_muted ? 'unmute' : 'mute');
				}
			});

		}

	},

	initUIEvents: function(){
		var self = this;

		var _t1, _t2;
		this.on('user_active', function(){
			self.is_active = true;
			addClass(self.controls, 'show');
			removeClass(self.controls, 'hide');
			self.controls.style.display = '';
			clearTimeout(_t1);
			clearTimeout(_t2);
			_t1 = setTimeout(function(){
				self.is_active = false;
				addClass(self.controls, 'hide');
				removeClass(self.controls, 'show');
				_t2 = setTimeout(function(){
					self.controls.style.display = 'none';
				}, 500);
			}, 3000);
		});

	},

	initPlayerEvents: function(){
		var self = this;

		this.player.on(['waiting','seeking'], function(e){
			self.showLoader();
		});

		this.player.on(['playing', 'seeked'], function(e){
			self.hideLoader();
		});

		this.player.on('error', function(e, code, message){
			self.showError('('+code+') '+message);
		});

		this.player.on('play', function(){
			self.is_played = true;

			self.hideStartScreen();

			removeClass(self.dom, 'paused');
			addClass(self.dom, 'playing');
			self.controls.play_pause_btn.title = 'Pause';
		});

		this.player.on('pause', function(){
			self.is_played = false;

			addClass(self.dom, 'paused');
			removeClass(self.dom, 'playing');
			self.controls.play_pause_btn.title = 'Play';	
		});

		this.player.on('ended', function(){
			self.showStartScreen();

			self.trigger('exitfullscreen');

			self.is_played = false;
			self.is_first_play = true;
		});

		this.player.on('timeupdate', function(e, time, duration){
			self.time = time;
			self.duration = duration;

			if(self.duration){
				if(!self.hold_progress){
					self.controls.progress.play.style.width = (time / self.duration * 100)+'%';
				}
			}
			if(time>0){
				self.controls.timer.innerHTML = self.formatTime(time)+' / '+self.formatTime(self.duration);
			}
			self.updateLoader();
		});

		this.player.on('progress', function(e, buff){
			self.buffer = buff;
			self.updateLoader();
		});

		this.player.on('volumechange', function(e, volume){

			self.is_muted = volume==0;

			if(self.is_muted){
				addClass(self.dom, 'muted');
			}else{
				removeClass(self.dom, 'muted');
			}

			self.controls.tray.volume.level.value.style.width = (volume*100)+'%';
			self.controls.tray.volume.vlevel.value.style.height = (volume*100)+'%';
		});
	},

	updateLoader: function(){
		if(this.buffer){
			for(var i=0; i<this.buffer.length; i++){
				var start = this.buffer[i][0];
				var end = this.buffer[i][1];
				if(this.time>start && this.time<end){
					this.controls.progress.load.style.width = (end / this.duration  * 100)+'%';
					break;
				}
			}
		}
	},

	hideStartScreen: function(){
		if(!this.is_show_start_screen===true) return;

		var self = this;
		clearTimeout(this._sst);

		this.controls.style.display = '';
		addClass(this.start_screen, 'hide');
		this.is_show_start_screen = false;
		this._sst = setTimeout(function(){
			self.start_screen.style.display = 'none';
		}, 1000);
	},

	showStartScreen: function(){
		if(this.is_show_start_screen===false) return;

		var self = this;
		clearTimeout(this._sst);

		this.controls.style.display = 'none';
		this.start_screen.style.display = '';
		this.is_show_start_screen = true;
		this._sst = setTimeout(function(){
			removeClass(self.start_screen, 'hide');
		}, 100);
	},

	hideLoader: function(){
		if(this.is_show_loader===false) return;

		var self = this;
		clearTimeout(this._lt);

		this.is_show_loader = false;
		addClass(this.loader, 'hide');
		this._lt = setTimeout(function(){
			if(!self.is_show_loader){
				self.loader.style.display = 'none';
			}
		}, 500);
	},

	showLoader: function(){
		if(this.is_show_loader===true) return;

		var self = this;
		clearTimeout(this._lt);

		this.is_show_loader = true;
		this._lt = setTimeout(function(){
			if(self.is_show_loader){
				self.loader.style.display = '';
				setTimeout(function(){ removeClass(self.loader, 'hide') }, 100);
			}
		}, 500);

		var c = this.loader.getElementsByTagName('circle');
		(function(){
			c[0].setAttribute('r', ((Math.sin((new Date)/100)+1)/4+0.5) * 75);
			c[1].setAttribute('r', ((Math.sin((new Date-100)/100)+1)/4+0.5) * 65);
			if(self.is_show_loader || self.loader.style.display!='none'){
				setTimeout(arguments.callee, 30);
			}
		})();
	},

	showError: function(msg){
		this.dom.appendChild(html('<div class="error fatal"><div>'+msg+'</div></div>'));
	},

	formatTime: function(time){
		var show_hours = this.duration >= 3600;

		var seconds = Math.ceil(time||0);
		var hours = (seconds / 3600) | 0;
		seconds -= hours * 3600;
		var minutes = (seconds / 60) | 0;
		seconds -= minutes * 60;

		return (show_hours ? ('0'+hours).substr(-2)+':' : '') +
			('0'+minutes).substr(-2)+':' +
			('0'+seconds).substr(-2)
	},

	initEasterEgg: function(){
		var s = [];
		var self = this;
		on(this.dom, 'keydown', function(event){
			s.push(event.keyCode)>6 ? s.shift() : null;
			if(s.join(':')==='65:78:73:83:83:65'){
				var m = [1071, 1053, 1040, 44, 32, 1071, 32, 1058, 1045, 1041, 1071, 32, 1051, 1070, 1041, 1051, 1070, 33, 33, 33];
				for(var i=0; i<m.length; i++)(function(i, c){
					var e = html('<div style="position:absolute;color:white;opacity:0.6;font-weight:bold;text-shadow:0 0 5px #000">'+c+'<div>');
					(function(){
						e.style.left = (i)+'%';
						e.style.top = 50 + (Math.sin(i/15)*30)+'%';
						e.style.fontSize = ( (0.5+(Math.sin(i/10)+1)/4) * 35)+'px';
						if(i<-10){
							self.dom.removeChild(e);
						}else{
							i-=0.5;
							setTimeout(arguments.callee, 30);
						}
					})();
					self.dom.appendChild(e);
				})(100+i*4, String.fromCharCode(m[i]));
			}
		});
	},

});
			HTML5Backend = (function(){

	
			//https://github.com/dailymotion/hls.js
		!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.Hls=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

function EventEmitter() {
  this._events = this._events || {};
  this._maxListeners = this._maxListeners || undefined;
}
module.exports = EventEmitter;

// Backwards-compat with node 0.10.x
EventEmitter.EventEmitter = EventEmitter;

EventEmitter.prototype._events = undefined;
EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
EventEmitter.defaultMaxListeners = 10;

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners = function(n) {
  if (!isNumber(n) || n < 0 || isNaN(n))
    throw TypeError('n must be a positive number');
  this._maxListeners = n;
  return this;
};

EventEmitter.prototype.emit = function(type) {
  var er, handler, len, args, i, listeners;

  if (!this._events)
    this._events = {};

  // If there is no 'error' event listener then throw.
  if (type === 'error') {
    if (!this._events.error ||
        (isObject(this._events.error) && !this._events.error.length)) {
      er = arguments[1];
      if (er instanceof Error) {
        throw er; // Unhandled 'error' event
      }
      throw TypeError('Uncaught, unspecified "error" event.');
    }
  }

  handler = this._events[type];

  if (isUndefined(handler))
    return false;

  if (isFunction(handler)) {
    switch (arguments.length) {
      // fast cases
      case 1:
        handler.call(this);
        break;
      case 2:
        handler.call(this, arguments[1]);
        break;
      case 3:
        handler.call(this, arguments[1], arguments[2]);
        break;
      // slower
      default:
        len = arguments.length;
        args = new Array(len - 1);
        for (i = 1; i < len; i++)
          args[i - 1] = arguments[i];
        handler.apply(this, args);
    }
  } else if (isObject(handler)) {
    len = arguments.length;
    args = new Array(len - 1);
    for (i = 1; i < len; i++)
      args[i - 1] = arguments[i];

    listeners = handler.slice();
    len = listeners.length;
    for (i = 0; i < len; i++)
      listeners[i].apply(this, args);
  }

  return true;
};

EventEmitter.prototype.addListener = function(type, listener) {
  var m;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events)
    this._events = {};

  // To avoid recursion in the case that type === "newListener"! Before
  // adding it to the listeners, first emit "newListener".
  if (this._events.newListener)
    this.emit('newListener', type,
              isFunction(listener.listener) ?
              listener.listener : listener);

  if (!this._events[type])
    // Optimize the case of one listener. Don't need the extra array object.
    this._events[type] = listener;
  else if (isObject(this._events[type]))
    // If we've already got an array, just append.
    this._events[type].push(listener);
  else
    // Adding the second element, need to change to array.
    this._events[type] = [this._events[type], listener];

  // Check for listener leak
  if (isObject(this._events[type]) && !this._events[type].warned) {
    var m;
    if (!isUndefined(this._maxListeners)) {
      m = this._maxListeners;
    } else {
      m = EventEmitter.defaultMaxListeners;
    }

    if (m && m > 0 && this._events[type].length > m) {
      this._events[type].warned = true;
      console.error('(node) warning: possible EventEmitter memory ' +
                    'leak detected. %d listeners added. ' +
                    'Use emitter.setMaxListeners() to increase limit.',
                    this._events[type].length);
      if (typeof console.trace === 'function') {
        // not supported in IE 10
        console.trace();
      }
    }
  }

  return this;
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.once = function(type, listener) {
  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  var fired = false;

  function g() {
    this.removeListener(type, g);

    if (!fired) {
      fired = true;
      listener.apply(this, arguments);
    }
  }

  g.listener = listener;
  this.on(type, g);

  return this;
};

// emits a 'removeListener' event iff the listener was removed
EventEmitter.prototype.removeListener = function(type, listener) {
  var list, position, length, i;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events || !this._events[type])
    return this;

  list = this._events[type];
  length = list.length;
  position = -1;

  if (list === listener ||
      (isFunction(list.listener) && list.listener === listener)) {
    delete this._events[type];
    if (this._events.removeListener)
      this.emit('removeListener', type, listener);

  } else if (isObject(list)) {
    for (i = length; i-- > 0;) {
      if (list[i] === listener ||
          (list[i].listener && list[i].listener === listener)) {
        position = i;
        break;
      }
    }

    if (position < 0)
      return this;

    if (list.length === 1) {
      list.length = 0;
      delete this._events[type];
    } else {
      list.splice(position, 1);
    }

    if (this._events.removeListener)
      this.emit('removeListener', type, listener);
  }

  return this;
};

EventEmitter.prototype.removeAllListeners = function(type) {
  var key, listeners;

  if (!this._events)
    return this;

  // not listening for removeListener, no need to emit
  if (!this._events.removeListener) {
    if (arguments.length === 0)
      this._events = {};
    else if (this._events[type])
      delete this._events[type];
    return this;
  }

  // emit removeListener for all listeners on all events
  if (arguments.length === 0) {
    for (key in this._events) {
      if (key === 'removeListener') continue;
      this.removeAllListeners(key);
    }
    this.removeAllListeners('removeListener');
    this._events = {};
    return this;
  }

  listeners = this._events[type];

  if (isFunction(listeners)) {
    this.removeListener(type, listeners);
  } else {
    // LIFO order
    while (listeners.length)
      this.removeListener(type, listeners[listeners.length - 1]);
  }
  delete this._events[type];

  return this;
};

EventEmitter.prototype.listeners = function(type) {
  var ret;
  if (!this._events || !this._events[type])
    ret = [];
  else if (isFunction(this._events[type]))
    ret = [this._events[type]];
  else
    ret = this._events[type].slice();
  return ret;
};

EventEmitter.listenerCount = function(emitter, type) {
  var ret;
  if (!emitter._events || !emitter._events[type])
    ret = 0;
  else if (isFunction(emitter._events[type]))
    ret = 1;
  else
    ret = emitter._events[type].length;
  return ret;
};

function isFunction(arg) {
  return typeof arg === 'function';
}

function isNumber(arg) {
  return typeof arg === 'number';
}

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}

function isUndefined(arg) {
  return arg === void 0;
}

},{}],2:[function(require,module,exports){
var bundleFn = arguments[3];
var sources = arguments[4];
var cache = arguments[5];

var stringify = JSON.stringify;

module.exports = function (fn) {
    var keys = [];
    var wkey;
    var cacheKeys = Object.keys(cache);
    
    for (var i = 0, l = cacheKeys.length; i < l; i++) {
        var key = cacheKeys[i];
        if (cache[key].exports === fn) {
            wkey = key;
            break;
        }
    }
    
    if (!wkey) {
        wkey = Math.floor(Math.pow(16, 8) * Math.random()).toString(16);
        var wcache = {};
        for (var i = 0, l = cacheKeys.length; i < l; i++) {
            var key = cacheKeys[i];
            wcache[key] = key;
        }
        sources[wkey] = [
            Function(['require','module','exports'], '(' + fn + ')(self)'),
            wcache
        ];
    }
    var skey = Math.floor(Math.pow(16, 8) * Math.random()).toString(16);
    
    var scache = {}; scache[wkey] = wkey;
    sources[skey] = [
        Function(['require'],'require(' + stringify(wkey) + ')(self)'),
        scache
    ];
    
    var src = '(' + bundleFn + ')({'
        + Object.keys(sources).map(function (key) {
            return stringify(key) + ':['
                + sources[key][0]
                + ',' + stringify(sources[key][1]) + ']'
            ;
        }).join(',')
        + '},{},[' + stringify(skey) + '])'
    ;
    
    var URL = window.URL || window.webkitURL || window.mozURL || window.msURL;
    
    return new Worker(URL.createObjectURL(
        new Blob([src], { type: 'text/javascript' })
    ));
};

},{}],3:[function(require,module,exports){
/*
 * simple ABR Controller
*/

'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _events = require('../events');

var _events2 = _interopRequireDefault(_events);

var AbrController = (function () {
  function AbrController(hls) {
    _classCallCheck(this, AbrController);

    this.hls = hls;
    this.lastfetchlevel = 0;
    this._autoLevelCapping = -1;
    this._nextAutoLevel = -1;
    this.onflp = this.onFragmentLoadProgress.bind(this);
    hls.on(_events2['default'].FRAG_LOAD_PROGRESS, this.onflp);
  }

  _createClass(AbrController, [{
    key: 'destroy',
    value: function destroy() {
      this.hls.off(_events2['default'].FRAG_LOAD_PROGRESS, this.onflp);
    }
  }, {
    key: 'onFragmentLoadProgress',
    value: function onFragmentLoadProgress(event, data) {
      var stats = data.stats;
      if (stats.aborted === undefined) {
        this.lastfetchduration = (performance.now() - stats.trequest) / 1000;
        this.lastfetchlevel = data.frag.level;
        this.lastbw = stats.loaded * 8 / this.lastfetchduration;
        //console.log(`fetchDuration:${this.lastfetchduration},bw:${(this.lastbw/1000).toFixed(0)}/${stats.aborted}`);
      }
    }

    /** Return the capping/max level value that could be used by automatic level selection algorithm **/
  }, {
    key: 'autoLevelCapping',
    get: function get() {
      return this._autoLevelCapping;
    },

    /** set the capping/max level value that could be used by automatic level selection algorithm **/
    set: function set(newLevel) {
      this._autoLevelCapping = newLevel;
    }
  }, {
    key: 'nextAutoLevel',
    get: function get() {
      var lastbw = this.lastbw,
          hls = this.hls,
          adjustedbw,
          i,
          maxAutoLevel;
      if (this._autoLevelCapping === -1) {
        maxAutoLevel = hls.levels.length - 1;
      } else {
        maxAutoLevel = this._autoLevelCapping;
      }

      if (this._nextAutoLevel !== -1) {
        var nextLevel = Math.min(this._nextAutoLevel, maxAutoLevel);
        if (nextLevel === this.lastfetchlevel) {
          this._nextAutoLevel = -1;
        } else {
          return nextLevel;
        }
      }

      // follow algorithm captured from stagefright :
      // https://android.googlesource.com/platform/frameworks/av/+/master/media/libstagefright/httplive/LiveSession.cpp
      // Pick the highest bandwidth stream below or equal to estimated bandwidth.
      for (i = 0; i <= maxAutoLevel; i++) {
        // consider only 80% of the available bandwidth, but if we are switching up,
        // be even more conservative (70%) to avoid overestimating and immediately
        // switching back.
        if (i <= this.lastfetchlevel) {
          adjustedbw = 0.8 * lastbw;
        } else {
          adjustedbw = 0.7 * lastbw;
        }
        if (adjustedbw < hls.levels[i].bitrate) {
          return Math.max(0, i - 1);
        }
      }
      return i - 1;
    },
    set: function set(nextLevel) {
      this._nextAutoLevel = nextLevel;
    }
  }]);

  return AbrController;
})();

exports['default'] = AbrController;
module.exports = exports['default'];

},{"../events":17}],4:[function(require,module,exports){
/*
 * Level Controller
*/

'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _events = require('../events');

var _events2 = _interopRequireDefault(_events);

var _utilsLogger = require('../utils/logger');

var _errors = require('../errors');

var LevelController = (function () {
  function LevelController(hls) {
    _classCallCheck(this, LevelController);

    this.hls = hls;
    this.onml = this.onManifestLoaded.bind(this);
    this.onll = this.onLevelLoaded.bind(this);
    this.onerr = this.onError.bind(this);
    this.ontick = this.tick.bind(this);
    hls.on(_events2['default'].MANIFEST_LOADED, this.onml);
    hls.on(_events2['default'].LEVEL_LOADED, this.onll);
    hls.on(_events2['default'].ERROR, this.onerr);
    this._manualLevel = this._autoLevelCapping = -1;
  }

  _createClass(LevelController, [{
    key: 'destroy',
    value: function destroy() {
      var hls = this.hls;
      hls.off(_events2['default'].MANIFEST_LOADED, this.onml);
      hls.off(_events2['default'].LEVEL_LOADED, this.onll);
      hls.off(_events2['default'].ERROR, this.onerr);
      if (this.timer) {
        clearInterval(this.timer);
      }
      this._manualLevel = -1;
    }
  }, {
    key: 'onManifestLoaded',
    value: function onManifestLoaded(event, data) {
      var levels0 = [],
          levels = [],
          bitrateStart,
          i,
          bitrateSet = {},
          videoCodecFound = false,
          audioCodecFound = false;

      // regroup redundant level together
      data.levels.forEach(function (level) {
        if (level.videoCodec) {
          videoCodecFound = true;
        }
        if (level.audioCodec) {
          audioCodecFound = true;
        }
        var redundantLevelId = bitrateSet[level.bitrate];
        if (redundantLevelId === undefined) {
          bitrateSet[level.bitrate] = levels0.length;
          level.url = [level.url];
          level.urlId = 0;
          levels0.push(level);
        } else {
          levels0[redundantLevelId].url.push(level.url);
        }
      });

      // remove audio-only level if we also have levels with audio+video codecs signalled
      if (videoCodecFound && audioCodecFound) {
        levels0.forEach(function (level) {
          if (level.videoCodec) {
            levels.push(level);
          }
        });
      } else {
        levels = levels0;
      }

      // only keep level with supported audio/video codecs
      levels0 = levels0.filter(function (level) {
        var checkSupported = function checkSupported(codec) {
          return MediaSource.isTypeSupported('video/mp4;codecs=' + codec);
        };
        var audioCodec = level.audioCodec,
            videoCodec = level.videoCodec;

        return (audioCodec && checkSupported(audioCodec) || !audioCodec) && (videoCodec && checkSupported(videoCodec) || !videoCodec);
      });

      // start bitrate is the first bitrate of the manifest
      bitrateStart = levels[0].bitrate;
      // sort level on bitrate
      levels.sort(function (a, b) {
        return a.bitrate - b.bitrate;
      });
      this._levels = levels;
      // find index of first level in sorted levels
      for (i = 0; i < levels.length; i++) {
        if (levels[i].bitrate === bitrateStart) {
          this._firstLevel = i;
          _utilsLogger.logger.log('manifest loaded,' + levels.length + ' level(s) found, first bitrate:' + bitrateStart);
          break;
        }
      }
      this.hls.trigger(_events2['default'].MANIFEST_PARSED, { levels: this._levels, firstLevel: this._firstLevel, stats: data.stats });
      return;
    }
  }, {
    key: 'setLevelInternal',
    value: function setLevelInternal(newLevel) {
      // check if level idx is valid
      if (newLevel >= 0 && newLevel < this._levels.length) {
        // stopping live reloading timer if any
        if (this.timer) {
          clearInterval(this.timer);
          this.timer = null;
        }
        this._level = newLevel;
        _utilsLogger.logger.log('switching to level ' + newLevel);
        this.hls.trigger(_events2['default'].LEVEL_SWITCH, { level: newLevel });
        var level = this._levels[newLevel];
        // check if we need to load playlist for this level
        if (level.details === undefined || level.details.live === true) {
          // level not retrieved yet, or live playlist we need to (re)load it
          _utilsLogger.logger.log('(re)loading playlist for level ' + newLevel);
          var urlId = level.urlId;
          this.hls.trigger(_events2['default'].LEVEL_LOADING, { url: level.url[urlId], level: newLevel, id: urlId });
        }
      } else {
        // invalid level id given, trigger error
        this.hls.trigger(_events2['default'].ERROR, { type: _errors.ErrorTypes.OTHER_ERROR, details: _errors.ErrorDetails.LEVEL_SWITCH_ERROR, level: newLevel, fatal: false, reason: 'invalid level idx' });
      }
    }
  }, {
    key: 'onError',
    value: function onError(event, data) {
      if (data.fatal) {
        return;
      }

      var details = data.details,
          hls = this.hls,
          levelId,
          level;
      // try to recover not fatal errors
      switch (details) {
        case _errors.ErrorDetails.FRAG_LOAD_ERROR:
        case _errors.ErrorDetails.FRAG_LOAD_TIMEOUT:
        case _errors.ErrorDetails.FRAG_LOOP_LOADING_ERROR:
        case _errors.ErrorDetails.KEY_LOAD_ERROR:
        case _errors.ErrorDetails.KEY_LOAD_TIMEOUT:
          levelId = data.frag.level;
          break;
        case _errors.ErrorDetails.LEVEL_LOAD_ERROR:
        case _errors.ErrorDetails.LEVEL_LOAD_TIMEOUT:
          levelId = data.level;
          break;
        default:
          break;
      }
      /* try to switch to a redundant stream if any available.
       * if no redundant stream available, emergency switch down (if in auto mode and current level not 0)
       * otherwise, we cannot recover this network error ....
       */
      if (levelId !== undefined) {
        level = this._levels[levelId];
        if (level.urlId < level.url.length - 1) {
          level.urlId++;
          level.details = undefined;
          _utilsLogger.logger.warn('level controller,' + details + ' for level ' + levelId + ': switching to redundant stream id ' + level.urlId);
        } else {
          // we could try to recover if in auto mode and current level not lowest level (0)
          var recoverable = this._manualLevel === -1 && levelId;
          if (recoverable) {
            _utilsLogger.logger.warn('level controller,' + details + ': emergency switch-down for next fragment');
            hls.abrController.nextAutoLevel = 0;
          } else if (level && level.details && level.details.live) {
            _utilsLogger.logger.warn('level controller,' + details + ' on live stream, discard');
          } else {
            _utilsLogger.logger.error('cannot recover ' + details + ' error');
            this._level = undefined;
            // stopping live reloading timer if any
            if (this.timer) {
              clearInterval(this.timer);
              this.timer = null;
            }
            // redispatch same error but with fatal set to true
            data.fatal = true;
            hls.trigger(event, data);
          }
        }
      }
    }
  }, {
    key: 'onLevelLoaded',
    value: function onLevelLoaded(event, data) {
      // check if current playlist is a live playlist
      if (data.details.live && !this.timer) {
        // if live playlist we will have to reload it periodically
        // set reload period to playlist target duration
        this.timer = setInterval(this.ontick, 1000 * data.details.targetduration);
      }
      if (!data.details.live && this.timer) {
        // playlist is not live and timer is armed : stopping it
        clearInterval(this.timer);
        this.timer = null;
      }
    }
  }, {
    key: 'tick',
    value: function tick() {
      var levelId = this._level;
      if (levelId !== undefined) {
        var level = this._levels[levelId],
            urlId = level.urlId;
        this.hls.trigger(_events2['default'].LEVEL_LOADING, { url: level.url[urlId], level: levelId, id: urlId });
      }
    }
  }, {
    key: 'nextLoadLevel',
    value: function nextLoadLevel() {
      if (this._manualLevel !== -1) {
        return this._manualLevel;
      } else {
        return this.hls.abrController.nextAutoLevel;
      }
    }
  }, {
    key: 'levels',
    get: function get() {
      return this._levels;
    }
  }, {
    key: 'level',
    get: function get() {
      return this._level;
    },
    set: function set(newLevel) {
      if (this._level !== newLevel || this._levels[newLevel].details === undefined) {
        this.setLevelInternal(newLevel);
      }
    }
  }, {
    key: 'manualLevel',
    get: function get() {
      return this._manualLevel;
    },
    set: function set(newLevel) {
      this._manualLevel = newLevel;
      if (newLevel !== -1) {
        this.level = newLevel;
      }
    }
  }, {
    key: 'firstLevel',
    get: function get() {
      return this._firstLevel;
    },
    set: function set(newLevel) {
      this._firstLevel = newLevel;
    }
  }, {
    key: 'startLevel',
    get: function get() {
      if (this._startLevel === undefined) {
        return this._firstLevel;
      } else {
        return this._startLevel;
      }
    },
    set: function set(newLevel) {
      this._startLevel = newLevel;
    }
  }]);

  return LevelController;
})();

exports['default'] = LevelController;
module.exports = exports['default'];

},{"../errors":16,"../events":17,"../utils/logger":26}],5:[function(require,module,exports){
/*
 * MSE Media Controller
*/

'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _demuxDemuxer = require('../demux/demuxer');

var _demuxDemuxer2 = _interopRequireDefault(_demuxDemuxer);

var _events = require('../events');

var _events2 = _interopRequireDefault(_events);

var _utilsLogger = require('../utils/logger');

var _utilsBinarySearch = require('../utils/binary-search');

var _utilsBinarySearch2 = _interopRequireDefault(_utilsBinarySearch);

var _helperLevelHelper = require('../helper/level-helper');

var _helperLevelHelper2 = _interopRequireDefault(_helperLevelHelper);

var _errors = require('../errors');

var State = {
  ERROR: -2,
  STARTING: -1,
  IDLE: 0,
  KEY_LOADING: 1,
  FRAG_LOADING: 2,
  WAITING_LEVEL: 3,
  PARSING: 4,
  PARSED: 5,
  APPENDING: 6,
  BUFFER_FLUSHING: 7
};

var MSEMediaController = (function () {
  function MSEMediaController(hls) {
    _classCallCheck(this, MSEMediaController);

    this.config = hls.config;
    this.audioCodecSwap = false;
    this.hls = hls;
    // Source Buffer listeners
    this.onsbue = this.onSBUpdateEnd.bind(this);
    this.onsbe = this.onSBUpdateError.bind(this);
    // internal listeners
    this.onmediaatt0 = this.onMediaAttaching.bind(this);
    this.onmediadet0 = this.onMediaDetaching.bind(this);
    this.onmp = this.onManifestParsed.bind(this);
    this.onll = this.onLevelLoaded.bind(this);
    this.onfl = this.onFragLoaded.bind(this);
    this.onkl = this.onKeyLoaded.bind(this);
    this.onis = this.onInitSegment.bind(this);
    this.onfpg = this.onFragParsing.bind(this);
    this.onfp = this.onFragParsed.bind(this);
    this.onerr = this.onError.bind(this);
    this.ontick = this.tick.bind(this);
    hls.on(_events2['default'].MEDIA_ATTACHING, this.onmediaatt0);
    hls.on(_events2['default'].MEDIA_DETACHING, this.onmediadet0);
    hls.on(_events2['default'].MANIFEST_PARSED, this.onmp);
  }

  _createClass(MSEMediaController, [{
    key: 'destroy',
    value: function destroy() {
      this.stop();
      var hls = this.hls;
      hls.off(_events2['default'].MEDIA_ATTACHING, this.onmediaatt0);
      hls.off(_events2['default'].MEDIA_DETACHING, this.onmediadet0);
      hls.off(_events2['default'].MANIFEST_PARSED, this.onmp);
      this.state = State.IDLE;
    }
  }, {
    key: 'startLoad',
    value: function startLoad() {
      if (this.levels && this.media) {
        this.startInternal();
        if (this.lastCurrentTime) {
          _utilsLogger.logger.log('seeking @ ' + this.lastCurrentTime);
          if (!this.lastPaused) {
            _utilsLogger.logger.log('resuming video');
            this.media.play();
          }
          this.state = State.IDLE;
        } else {
          this.lastCurrentTime = 0;
          this.state = State.STARTING;
        }
        this.nextLoadPosition = this.startPosition = this.lastCurrentTime;
        this.tick();
      } else {
        _utilsLogger.logger.warn('cannot start loading as either manifest not parsed or video not attached');
      }
    }
  }, {
    key: 'startInternal',
    value: function startInternal() {
      var hls = this.hls;
      this.stop();
      this.demuxer = new _demuxDemuxer2['default'](hls);
      this.timer = setInterval(this.ontick, 100);
      this.level = -1;
      hls.on(_events2['default'].FRAG_LOADED, this.onfl);
      hls.on(_events2['default'].FRAG_PARSING_INIT_SEGMENT, this.onis);
      hls.on(_events2['default'].FRAG_PARSING_DATA, this.onfpg);
      hls.on(_events2['default'].FRAG_PARSED, this.onfp);
      hls.on(_events2['default'].ERROR, this.onerr);
      hls.on(_events2['default'].LEVEL_LOADED, this.onll);
      hls.on(_events2['default'].KEY_LOADED, this.onkl);
    }
  }, {
    key: 'stop',
    value: function stop() {
      this.mp4segments = [];
      this.flushRange = [];
      this.bufferRange = [];
      var frag = this.fragCurrent;
      if (frag) {
        if (frag.loader) {
          frag.loader.abort();
        }
        this.fragCurrent = null;
      }
      this.fragPrevious = null;
      if (this.sourceBuffer) {
        for (var type in this.sourceBuffer) {
          var sb = this.sourceBuffer[type];
          try {
            this.mediaSource.removeSourceBuffer(sb);
            sb.removeEventListener('updateend', this.onsbue);
            sb.removeEventListener('error', this.onsbe);
          } catch (err) {}
        }
        this.sourceBuffer = null;
      }
      if (this.timer) {
        clearInterval(this.timer);
        this.timer = null;
      }
      if (this.demuxer) {
        this.demuxer.destroy();
        this.demuxer = null;
      }
      var hls = this.hls;
      hls.off(_events2['default'].FRAG_LOADED, this.onfl);
      hls.off(_events2['default'].FRAG_PARSED, this.onfp);
      hls.off(_events2['default'].FRAG_PARSING_DATA, this.onfpg);
      hls.off(_events2['default'].LEVEL_LOADED, this.onll);
      hls.off(_events2['default'].KEY_LOADED, this.onkl);
      hls.off(_events2['default'].FRAG_PARSING_INIT_SEGMENT, this.onis);
      hls.off(_events2['default'].ERROR, this.onerr);
    }
  }, {
    key: 'tick',
    value: function tick() {
      var pos,
          level,
          levelDetails,
          hls = this.hls;
      switch (this.state) {
        case State.ERROR:
          //don't do anything in error state to avoid breaking further ...
          break;
        case State.STARTING:
          // determine load level
          this.startLevel = hls.startLevel;
          if (this.startLevel === -1) {
            // -1 : guess start Level by doing a bitrate test by loading first fragment of lowest quality level
            this.startLevel = 0;
            this.fragBitrateTest = true;
          }
          // set new level to playlist loader : this will trigger start level load
          this.level = hls.nextLoadLevel = this.startLevel;
          this.state = State.WAITING_LEVEL;
          this.loadedmetadata = false;
          break;
        case State.IDLE:
          // if video detached or unbound exit loop
          if (!this.media) {
            break;
          }
          // determine next candidate fragment to be loaded, based on current position and
          //  end of buffer position
          //  ensure 60s of buffer upfront
          // if we have not yet loaded any fragment, start loading from start position
          if (this.loadedmetadata) {
            pos = this.media.currentTime;
          } else {
            pos = this.nextLoadPosition;
          }
          // determine next load level
          if (this.startFragmentRequested === false) {
            level = this.startLevel;
          } else {
            // we are not at playback start, get next load level from level Controller
            level = hls.nextLoadLevel;
          }
          var bufferInfo = this.bufferInfo(pos, 0.3),
              bufferLen = bufferInfo.len,
              bufferEnd = bufferInfo.end,
              fragPrevious = this.fragPrevious,
              maxBufLen;
          // compute max Buffer Length that we could get from this load level, based on level bitrate. don't buffer more than 60 MB and more than 30s
          if (this.levels[level].hasOwnProperty('bitrate')) {
            maxBufLen = Math.max(8 * this.config.maxBufferSize / this.levels[level].bitrate, this.config.maxBufferLength);
            maxBufLen = Math.min(maxBufLen, this.config.maxBufferLength);
          } else {
            maxBufLen = this.config.maxBufferLength;
          }

          // if buffer length is less than maxBufLen try to load a new fragment
          if (bufferLen < maxBufLen) {
            // set next load level : this will trigger a playlist load if needed
            hls.nextLoadLevel = level;
            this.level = level;
            levelDetails = this.levels[level].details;
            // if level info not retrieved yet, switch state and wait for level retrieval
            if (typeof levelDetails === 'undefined') {
              this.state = State.WAITING_LEVEL;
              break;
            }
            // find fragment index, contiguous with end of buffer position
            var fragments = levelDetails.fragments,
                fragLen = fragments.length,
                start = fragments[0].start,
                end = fragments[fragLen - 1].start + fragments[fragLen - 1].duration,
                _frag = undefined;

            // in case of live playlist we need to ensure that requested position is not located before playlist start
            if (levelDetails.live) {
              // check if requested position is within seekable boundaries :
              //logger.log(`start/pos/bufEnd/seeking:${start.toFixed(3)}/${pos.toFixed(3)}/${bufferEnd.toFixed(3)}/${this.media.seeking}`);
              if (bufferEnd < Math.max(start, end - this.config.liveMaxLatencyDurationCount * levelDetails.targetduration)) {
                this.seekAfterBuffered = start + Math.max(0, levelDetails.totalduration - this.config.liveSyncDurationCount * levelDetails.targetduration);
                _utilsLogger.logger.log('buffer end: ' + bufferEnd + ' is located too far from the end of live sliding playlist, media position will be reseted to: ' + this.seekAfterBuffered.toFixed(3));
                bufferEnd = this.seekAfterBuffered;
              }
              if (this.startFragmentRequested && !levelDetails.PTSKnown) {
                /* we are switching level on live playlist, but we don't have any PTS info for that quality level ...
                   try to load frag matching with next SN.
                   even if SN are not synchronized between playlists, loading this frag will help us
                   compute playlist sliding and find the right one after in case it was not the right consecutive one */
                if (fragPrevious) {
                  var targetSN = fragPrevious.sn + 1;
                  if (targetSN >= levelDetails.startSN && targetSN <= levelDetails.endSN) {
                    _frag = fragments[targetSN - levelDetails.startSN];
                    _utilsLogger.logger.log('live playlist, switching playlist, load frag with next SN: ' + _frag.sn);
                  }
                }
                if (!_frag) {
                  /* we have no idea about which fragment should be loaded.
                     so let's load mid fragment. it will help computing playlist sliding and find the right one
                  */
                  _frag = fragments[Math.min(fragLen - 1, Math.round(fragLen / 2))];
                  _utilsLogger.logger.log('live playlist, switching playlist, unknown, load middle frag : ' + _frag.sn);
                }
              }
            } else {
              // VoD playlist: if bufferEnd before start of playlist, load first fragment
              if (bufferEnd < start) {
                _frag = fragments[0];
              }
            }
            if (!_frag) {
              var foundFrag;
              if (bufferEnd < end) {
                foundFrag = _utilsBinarySearch2['default'].search(fragments, function (candidate) {
                  //logger.log(`level/sn/start/end/bufEnd:${level}/${candidate.sn}/${candidate.start}/${(candidate.start+candidate.duration)}/${bufferEnd}`);
                  // offset should be within fragment boundary
                  if (candidate.start + candidate.duration <= bufferEnd) {
                    return 1;
                  } else if (candidate.start > bufferEnd) {
                    return -1;
                  }
                  return 0;
                });
              } else {
                // reach end of playlist
                foundFrag = fragments[fragLen - 1];
              }
              if (foundFrag) {
                _frag = foundFrag;
                start = foundFrag.start;
                //logger.log('find SN matching with pos:' +  bufferEnd + ':' + frag.sn);
                if (fragPrevious && _frag.level === fragPrevious.level && _frag.sn === fragPrevious.sn) {
                  if (_frag.sn < levelDetails.endSN) {
                    _frag = fragments[_frag.sn + 1 - levelDetails.startSN];
                    _utilsLogger.logger.log('SN just loaded, load next one: ' + _frag.sn);
                  } else {
                    // have we reached end of VOD playlist ?
                    if (!levelDetails.live) {
                      var mediaSource = this.mediaSource;
                      if (mediaSource && mediaSource.readyState === 'open') {
                        // ensure sourceBuffer are not in updating states
                        var sb = this.sourceBuffer;
                        if (!(sb.audio && sb.audio.updating || sb.video && sb.video.updating)) {
                          _utilsLogger.logger.log('all media data available, signal endOfStream() to MediaSource');
                          //Notify the media element that it now has all of the media data
                          mediaSource.endOfStream();
                        }
                      }
                    }
                    _frag = null;
                  }
                }
              }
            }
            if (_frag) {
              //logger.log('      loading frag ' + i +',pos/bufEnd:' + pos.toFixed(3) + '/' + bufferEnd.toFixed(3));
              if (_frag.decryptdata.uri != null && _frag.decryptdata.key == null) {
                _utilsLogger.logger.log('Loading key for ' + _frag.sn + ' of [' + levelDetails.startSN + ' ,' + levelDetails.endSN + '],level ' + level);
                this.state = State.KEY_LOADING;
                hls.trigger(_events2['default'].KEY_LOADING, { frag: _frag });
              } else {
                _utilsLogger.logger.log('Loading ' + _frag.sn + ' of [' + levelDetails.startSN + ' ,' + levelDetails.endSN + '],level ' + level + ', currentTime:' + pos + ',bufferEnd:' + bufferEnd.toFixed(3));
                _frag.autoLevel = hls.autoLevelEnabled;
                if (this.levels.length > 1) {
                  _frag.expectedLen = Math.round(_frag.duration * this.levels[level].bitrate / 8);
                  _frag.trequest = performance.now();
                }
                // ensure that we are not reloading the same fragments in loop ...
                if (this.fragLoadIdx !== undefined) {
                  this.fragLoadIdx++;
                } else {
                  this.fragLoadIdx = 0;
                }
                if (_frag.loadCounter) {
                  _frag.loadCounter++;
                  var maxThreshold = this.config.fragLoadingLoopThreshold;
                  // if this frag has already been loaded 3 times, and if it has been reloaded recently
                  if (_frag.loadCounter > maxThreshold && Math.abs(this.fragLoadIdx - _frag.loadIdx) < maxThreshold) {
                    hls.trigger(_events2['default'].ERROR, { type: _errors.ErrorTypes.MEDIA_ERROR, details: _errors.ErrorDetails.FRAG_LOOP_LOADING_ERROR, fatal: false, frag: _frag });
                    return;
                  }
                } else {
                  _frag.loadCounter = 1;
                }
                _frag.loadIdx = this.fragLoadIdx;
                this.fragCurrent = _frag;
                this.startFragmentRequested = true;
                hls.trigger(_events2['default'].FRAG_LOADING, { frag: _frag });
                this.state = State.FRAG_LOADING;
              }
            }
          }
          break;
        case State.WAITING_LEVEL:
          level = this.levels[this.level];
          // check if playlist is already loaded
          if (level && level.details) {
            this.state = State.IDLE;
          }
          break;
        case State.FRAG_LOADING:
          /*
            monitor fragment retrieval time...
            we compute expected time of arrival of the complete fragment.
            we compare it to expected time of buffer starvation
          */
          var v = this.media,
              frag = this.fragCurrent;
          /* only monitor frag retrieval time if
          (video not paused OR first fragment being loaded) AND autoswitching enabled AND not lowest level AND multiple levels */
          if (v && (!v.paused || this.loadedmetadata === false) && frag.autoLevel && this.level && this.levels.length > 1) {
            var requestDelay = performance.now() - frag.trequest;
            // monitor fragment load progress after half of expected fragment duration,to stabilize bitrate
            if (requestDelay > 500 * frag.duration) {
              var loadRate = frag.loaded * 1000 / requestDelay; // byte/s
              if (frag.expectedLen < frag.loaded) {
                frag.expectedLen = frag.loaded;
              }
              pos = v.currentTime;
              var fragLoadedDelay = (frag.expectedLen - frag.loaded) / loadRate;
              var bufferStarvationDelay = this.bufferInfo(pos, 0.3).end - pos;
              var fragLevelNextLoadedDelay = frag.duration * this.levels[hls.nextLoadLevel].bitrate / (8 * loadRate); //bps/Bps
              /* if we have less than 2 frag duration in buffer and if frag loaded delay is greater than buffer starvation delay
                ... and also bigger than duration needed to load fragment at next level ...*/
              if (bufferStarvationDelay < 2 * frag.duration && fragLoadedDelay > bufferStarvationDelay && fragLoadedDelay > fragLevelNextLoadedDelay) {
                // abort fragment loading ...
                _utilsLogger.logger.warn('loading too slow, abort fragment loading');
                _utilsLogger.logger.log('fragLoadedDelay/bufferStarvationDelay/fragLevelNextLoadedDelay :' + fragLoadedDelay.toFixed(1) + '/' + bufferStarvationDelay.toFixed(1) + '/' + fragLevelNextLoadedDelay.toFixed(1));
                //abort fragment loading
                frag.loader.abort();
                hls.trigger(_events2['default'].FRAG_LOAD_EMERGENCY_ABORTED, { frag: frag });
                // switch back to IDLE state to request new fragment at lowest level
                this.state = State.IDLE;
              }
            }
          }
          break;
        case State.PARSING:
          // nothing to do, wait for fragment being parsed
          break;
        case State.PARSED:
        case State.APPENDING:
          if (this.sourceBuffer) {
            if (this.media.error) {
              _utilsLogger.logger.error('trying to append although a media error occured, switch to ERROR state');
              this.state = State.ERROR;
              return;
            }
            // if MP4 segment appending in progress nothing to do
            else if (this.sourceBuffer.audio && this.sourceBuffer.audio.updating || this.sourceBuffer.video && this.sourceBuffer.video.updating) {
                //logger.log('sb append in progress');
                // check if any MP4 segments left to append
              } else if (this.mp4segments.length) {
                  var segment = this.mp4segments.shift();
                  try {
                    //logger.log(`appending ${segment.type} SB, size:${segment.data.length});
                    this.sourceBuffer[segment.type].appendBuffer(segment.data);
                    this.appendError = 0;
                  } catch (err) {
                    // in case any error occured while appending, put back segment in mp4segments table
                    //logger.error(`error while trying to append buffer:${err.message},try appending later`);
                    this.mp4segments.unshift(segment);
                    if (this.appendError) {
                      this.appendError++;
                    } else {
                      this.appendError = 1;
                    }
                    var event = { type: _errors.ErrorTypes.MEDIA_ERROR, details: _errors.ErrorDetails.BUFFER_APPEND_ERROR, frag: this.fragCurrent };
                    /* with UHD content, we could get loop of quota exceeded error until
                      browser is able to evict some data from sourcebuffer. retrying help recovering this
                    */
                    if (this.appendError > this.config.appendErrorMaxRetry) {
                      _utilsLogger.logger.log('fail ' + this.config.appendErrorMaxRetry + ' times to append segment in sourceBuffer');
                      event.fatal = true;
                      hls.trigger(_events2['default'].ERROR, event);
                      this.state = State.ERROR;
                      return;
                    } else {
                      event.fatal = false;
                      hls.trigger(_events2['default'].ERROR, event);
                    }
                  }
                  this.state = State.APPENDING;
                }
          } else {
            // sourceBuffer undefined, switch back to IDLE state
            this.state = State.IDLE;
          }
          break;
        case State.BUFFER_FLUSHING:
          // loop through all buffer ranges to flush
          while (this.flushRange.length) {
            var range = this.flushRange[0];
            // flushBuffer will abort any buffer append in progress and flush Audio/Video Buffer
            if (this.flushBuffer(range.start, range.end)) {
              // range flushed, remove from flush array
              this.flushRange.shift();
            } else {
              // flush in progress, come back later
              break;
            }
          }
          if (this.flushRange.length === 0) {
            // handle end of immediate switching if needed
            if (this.immediateSwitch) {
              this.immediateLevelSwitchEnd();
            }
            // move to IDLE once flush complete. this should trigger new fragment loading
            this.state = State.IDLE;
            // reset reference to frag
            this.fragPrevious = null;
          }
          /* if not everything flushed, stay in BUFFER_FLUSHING state. we will come back here
             each time sourceBuffer updateend() callback will be triggered
             */
          break;
        default:
          break;
      }
      // check/update current fragment
      this._checkFragmentChanged();
      // check buffer
      this._checkBuffer();
    }
  }, {
    key: 'bufferInfo',
    value: function bufferInfo(pos, maxHoleDuration) {
      var media = this.media,
          vbuffered = media.buffered,
          buffered = [],
          i;
      for (i = 0; i < vbuffered.length; i++) {
        buffered.push({ start: vbuffered.start(i), end: vbuffered.end(i) });
      }
      return this.bufferedInfo(buffered, pos, maxHoleDuration);
    }
  }, {
    key: 'bufferedInfo',
    value: function bufferedInfo(buffered, pos, maxHoleDuration) {
      var buffered2 = [],

      // bufferStart and bufferEnd are buffer boundaries around current video position
      bufferLen,
          bufferStart,
          bufferEnd,
          bufferStartNext,
          i;
      // sort on buffer.start/smaller end (IE does not always return sorted buffered range)
      buffered.sort(function (a, b) {
        var diff = a.start - b.start;
        if (diff) {
          return diff;
        } else {
          return b.end - a.end;
        }
      });
      // there might be some small holes between buffer time range
      // consider that holes smaller than maxHoleDuration are irrelevant and build another
      // buffer time range representations that discards those holes
      for (i = 0; i < buffered.length; i++) {
        var buf2len = buffered2.length;
        if (buf2len) {
          var buf2end = buffered2[buf2len - 1].end;
          // if small hole (value between 0 or maxHoleDuration ) or overlapping (negative)
          if (buffered[i].start - buf2end < maxHoleDuration) {
            // merge overlapping time ranges
            // update lastRange.end only if smaller than item.end
            // e.g.  [ 1, 15] with  [ 2,8] => [ 1,15] (no need to modify lastRange.end)
            // whereas [ 1, 8] with  [ 2,15] => [ 1,15] ( lastRange should switch from [1,8] to [1,15])
            if (buffered[i].end > buf2end) {
              buffered2[buf2len - 1].end = buffered[i].end;
            }
          } else {
            // big hole
            buffered2.push(buffered[i]);
          }
        } else {
          // first value
          buffered2.push(buffered[i]);
        }
      }
      for (i = 0, bufferLen = 0, bufferStart = bufferEnd = pos; i < buffered2.length; i++) {
        var start = buffered2[i].start,
            end = buffered2[i].end;
        //logger.log('buf start/end:' + buffered.start(i) + '/' + buffered.end(i));
        if (pos + maxHoleDuration >= start && pos < end) {
          // play position is inside this buffer TimeRange, retrieve end of buffer position and buffer length
          bufferStart = start;
          bufferEnd = end + maxHoleDuration;
          bufferLen = bufferEnd - pos;
        } else if (pos + maxHoleDuration < start) {
          bufferStartNext = start;
        }
      }
      return { len: bufferLen, start: bufferStart, end: bufferEnd, nextStart: bufferStartNext };
    }
  }, {
    key: 'getBufferRange',
    value: function getBufferRange(position) {
      var i, range;
      for (i = this.bufferRange.length - 1; i >= 0; i--) {
        range = this.bufferRange[i];
        if (position >= range.start && position <= range.end) {
          return range;
        }
      }
      return null;
    }
  }, {
    key: 'followingBufferRange',
    value: function followingBufferRange(range) {
      if (range) {
        // try to get range of next fragment (500ms after this range)
        return this.getBufferRange(range.end + 0.5);
      }
      return null;
    }
  }, {
    key: 'isBuffered',
    value: function isBuffered(position) {
      var v = this.media,
          buffered = v.buffered;
      for (var i = 0; i < buffered.length; i++) {
        if (position >= buffered.start(i) && position <= buffered.end(i)) {
          return true;
        }
      }
      return false;
    }
  }, {
    key: '_checkFragmentChanged',
    value: function _checkFragmentChanged() {
      var rangeCurrent,
          currentTime,
          video = this.media;
      if (video && video.seeking === false) {
        currentTime = video.currentTime;
        /* if video element is in seeked state, currentTime can only increase.
          (assuming that playback rate is positive ...)
          As sometimes currentTime jumps back to zero after a
          media decode error, check this, to avoid seeking back to
          wrong position after a media decode error
        */
        if (currentTime > video.playbackRate * this.lastCurrentTime) {
          this.lastCurrentTime = currentTime;
        }
        if (this.isBuffered(currentTime)) {
          rangeCurrent = this.getBufferRange(currentTime);
        } else if (this.isBuffered(currentTime + 0.1)) {
          /* ensure that FRAG_CHANGED event is triggered at startup,
            when first video frame is displayed and playback is paused.
            add a tolerance of 100ms, in case current position is not buffered,
            check if current pos+100ms is buffered and use that buffer range
            for FRAG_CHANGED event reporting */
          rangeCurrent = this.getBufferRange(currentTime + 0.1);
        }
        if (rangeCurrent) {
          var fragPlaying = rangeCurrent.frag;
          if (fragPlaying !== this.fragPlaying) {
            this.fragPlaying = fragPlaying;
            this.hls.trigger(_events2['default'].FRAG_CHANGED, { frag: fragPlaying });
          }
        }
      }
    }

    /*
      abort any buffer append in progress, and flush all buffered data
      return true once everything has been flushed.
      sourceBuffer.abort() and sourceBuffer.remove() are asynchronous operations
      the idea is to call this function from tick() timer and call it again until all resources have been cleaned
      the timer is rearmed upon sourceBuffer updateend() event, so this should be optimal
    */
  }, {
    key: 'flushBuffer',
    value: function flushBuffer(startOffset, endOffset) {
      var sb, i, bufStart, bufEnd, flushStart, flushEnd;
      //logger.log('flushBuffer,pos/start/end: ' + this.media.currentTime + '/' + startOffset + '/' + endOffset);
      // safeguard to avoid infinite looping
      if (this.flushBufferCounter++ < 2 * this.bufferRange.length && this.sourceBuffer) {
        for (var type in this.sourceBuffer) {
          sb = this.sourceBuffer[type];
          if (!sb.updating) {
            for (i = 0; i < sb.buffered.length; i++) {
              bufStart = sb.buffered.start(i);
              bufEnd = sb.buffered.end(i);
              // workaround firefox not able to properly flush multiple buffered range.
              if (navigator.userAgent.toLowerCase().indexOf('firefox') !== -1 && endOffset === Number.POSITIVE_INFINITY) {
                flushStart = startOffset;
                flushEnd = endOffset;
              } else {
                flushStart = Math.max(bufStart, startOffset);
                flushEnd = Math.min(bufEnd, endOffset);
              }
              /* sometimes sourcebuffer.remove() does not flush
                 the exact expected time range.
                 to avoid rounding issues/infinite loop,
                 only flush buffer range of length greater than 500ms.
              */
              if (flushEnd - flushStart > 0.5) {
                _utilsLogger.logger.log('flush ' + type + ' [' + flushStart + ',' + flushEnd + '], of [' + bufStart + ',' + bufEnd + '], pos:' + this.media.currentTime);
                sb.remove(flushStart, flushEnd);
                return false;
              }
            }
          } else {
            //logger.log('abort ' + type + ' append in progress');
            // this will abort any appending in progress
            //sb.abort();
            return false;
          }
        }
      }

      /* after successful buffer flushing, rebuild buffer Range array
        loop through existing buffer range and check if
        corresponding range is still buffered. only push to new array already buffered range
      */
      var newRange = [],
          range;
      for (i = 0; i < this.bufferRange.length; i++) {
        range = this.bufferRange[i];
        if (this.isBuffered((range.start + range.end) / 2)) {
          newRange.push(range);
        }
      }
      this.bufferRange = newRange;
      _utilsLogger.logger.log('buffer flushed');
      // everything flushed !
      return true;
    }

    /*
      on immediate level switch :
       - pause playback if playing
       - cancel any pending load request
       - and trigger a buffer flush
    */
  }, {
    key: 'immediateLevelSwitch',
    value: function immediateLevelSwitch() {
      _utilsLogger.logger.log('immediateLevelSwitch');
      if (!this.immediateSwitch) {
        this.immediateSwitch = true;
        this.previouslyPaused = this.media.paused;
        this.media.pause();
      }
      var fragCurrent = this.fragCurrent;
      if (fragCurrent && fragCurrent.loader) {
        fragCurrent.loader.abort();
      }
      this.fragCurrent = null;
      // flush everything
      this.flushBufferCounter = 0;
      this.flushRange.push({ start: 0, end: Number.POSITIVE_INFINITY });
      // trigger a sourceBuffer flush
      this.state = State.BUFFER_FLUSHING;
      // increase fragment load Index to avoid frag loop loading error after buffer flush
      this.fragLoadIdx += 2 * this.config.fragLoadingLoopThreshold;
      // speed up switching, trigger timer function
      this.tick();
    }

    /*
       on immediate level switch end, after new fragment has been buffered :
        - nudge video decoder by slightly adjusting video currentTime
        - resume the playback if needed
    */
  }, {
    key: 'immediateLevelSwitchEnd',
    value: function immediateLevelSwitchEnd() {
      this.immediateSwitch = false;
      this.media.currentTime -= 0.0001;
      if (!this.previouslyPaused) {
        this.media.play();
      }
    }
  }, {
    key: 'nextLevelSwitch',
    value: function nextLevelSwitch() {
      /* try to switch ASAP without breaking video playback :
         in order to ensure smooth but quick level switching,
        we need to find the next flushable buffer range
        we should take into account new segment fetch time
      */
      var fetchdelay, currentRange, nextRange;
      currentRange = this.getBufferRange(this.media.currentTime);
      if (currentRange) {
        // flush buffer preceding current fragment (flush until current fragment start offset)
        // minus 1s to avoid video freezing, that could happen if we flush keyframe of current video ...
        this.flushRange.push({ start: 0, end: currentRange.start - 1 });
      }
      if (!this.media.paused) {
        // add a safety delay of 1s
        var nextLevelId = this.hls.nextLoadLevel,
            nextLevel = this.levels[nextLevelId],
            fragLastKbps = this.fragLastKbps;
        if (fragLastKbps && this.fragCurrent) {
          fetchdelay = this.fragCurrent.duration * nextLevel.bitrate / (1000 * fragLastKbps) + 1;
        } else {
          fetchdelay = 0;
        }
      } else {
        fetchdelay = 0;
      }
      //logger.log('fetchdelay:'+fetchdelay);
      // find buffer range that will be reached once new fragment will be fetched
      nextRange = this.getBufferRange(this.media.currentTime + fetchdelay);
      if (nextRange) {
        // we can flush buffer range following this one without stalling playback
        nextRange = this.followingBufferRange(nextRange);
        if (nextRange) {
          // flush position is the start position of this new buffer
          this.flushRange.push({ start: nextRange.start, end: Number.POSITIVE_INFINITY });
          // if we are here, we can also cancel any loading/demuxing in progress, as they are useless
          var fragCurrent = this.fragCurrent;
          if (fragCurrent && fragCurrent.loader) {
            fragCurrent.loader.abort();
          }
          this.fragCurrent = null;
        }
      }
      if (this.flushRange.length) {
        this.flushBufferCounter = 0;
        // trigger a sourceBuffer flush
        this.state = State.BUFFER_FLUSHING;
        // increase fragment load Index to avoid frag loop loading error after buffer flush
        this.fragLoadIdx += 2 * this.config.fragLoadingLoopThreshold;
        // speed up switching, trigger timer function
        this.tick();
      }
    }
  }, {
    key: 'onMediaAttaching',
    value: function onMediaAttaching(event, data) {
      var media = this.media = data.media;
      // setup the media source
      var ms = this.mediaSource = new MediaSource();
      //Media Source listeners
      this.onmso = this.onMediaSourceOpen.bind(this);
      this.onmse = this.onMediaSourceEnded.bind(this);
      this.onmsc = this.onMediaSourceClose.bind(this);
      ms.addEventListener('sourceopen', this.onmso);
      ms.addEventListener('sourceended', this.onmse);
      ms.addEventListener('sourceclose', this.onmsc);
      // link video and media Source
      media.src = URL.createObjectURL(ms);
    }
  }, {
    key: 'onMediaDetaching',
    value: function onMediaDetaching() {
      var media = this.media;
      if (media && media.ended) {
        _utilsLogger.logger.log('MSE detaching and video ended, reset startPosition');
        this.startPosition = this.lastCurrentTime = 0;
      }

      // reset fragment loading counter on MSE detaching to avoid reporting FRAG_LOOP_LOADING_ERROR after error recovery
      var levels = this.levels;
      if (levels) {
        // reset fragment load counter
        levels.forEach(function (level) {
          if (level.details) {
            level.details.fragments.forEach(function (fragment) {
              fragment.loadCounter = undefined;
            });
          }
        });
      }
      var ms = this.mediaSource;
      if (ms) {
        if (ms.readyState === 'open') {
          try {
            // endOfStream could trigger exception if any sourcebuffer is in updating state
            // we don't really care about checking sourcebuffer state here,
            // as we are anyway detaching the MediaSource
            // let's just avoid this exception to propagate
            ms.endOfStream();
          } catch (err) {
            _utilsLogger.logger.warn('onMediaDetaching:' + err.message + ' while calling endOfStream');
          }
        }
        ms.removeEventListener('sourceopen', this.onmso);
        ms.removeEventListener('sourceended', this.onmse);
        ms.removeEventListener('sourceclose', this.onmsc);
        // unlink MediaSource from video tag
        this.media.src = '';
        this.mediaSource = null;
        // remove video listeners
        if (media) {
          media.removeEventListener('seeking', this.onvseeking);
          media.removeEventListener('seeked', this.onvseeked);
          media.removeEventListener('loadedmetadata', this.onvmetadata);
          media.removeEventListener('ended', this.onvended);
          this.onvseeking = this.onvseeked = this.onvmetadata = null;
        }
        this.media = null;
        this.loadedmetadata = false;
        this.stop();
      }
      this.onmso = this.onmse = this.onmsc = null;
      this.hls.trigger(_events2['default'].MEDIA_DETACHED);
    }
  }, {
    key: 'onMediaSeeking',
    value: function onMediaSeeking() {
      if (this.state === State.FRAG_LOADING) {
        // check if currently loaded fragment is inside buffer.
        //if outside, cancel fragment loading, otherwise do nothing
        if (this.bufferInfo(this.media.currentTime, 0.3).len === 0) {
          _utilsLogger.logger.log('seeking outside of buffer while fragment load in progress, cancel fragment load');
          var fragCurrent = this.fragCurrent;
          if (fragCurrent) {
            if (fragCurrent.loader) {
              fragCurrent.loader.abort();
            }
            this.fragCurrent = null;
          }
          this.fragPrevious = null;
          // switch to IDLE state to load new fragment
          this.state = State.IDLE;
        }
      }
      if (this.media) {
        this.lastCurrentTime = this.media.currentTime;
      }
      // avoid reporting fragment loop loading error in case user is seeking several times on same position
      if (this.fragLoadIdx !== undefined) {
        this.fragLoadIdx += 2 * this.config.fragLoadingLoopThreshold;
      }
      // tick to speed up processing
      this.tick();
    }
  }, {
    key: 'onMediaSeeked',
    value: function onMediaSeeked() {
      // tick to speed up FRAGMENT_PLAYING triggering
      this.tick();
    }
  }, {
    key: 'onMediaMetadata',
    value: function onMediaMetadata() {
      if (this.media.currentTime !== this.startPosition) {
        this.media.currentTime = this.startPosition;
      }
      this.loadedmetadata = true;
      this.tick();
    }
  }, {
    key: 'onMediaEnded',
    value: function onMediaEnded() {
      _utilsLogger.logger.log('media ended');
      // reset startPosition and lastCurrentTime to restart playback @ stream beginning
      this.startPosition = this.lastCurrentTime = 0;
    }
  }, {
    key: 'onManifestParsed',
    value: function onManifestParsed(event, data) {
      var aac = false,
          heaac = false,
          codecs;
      data.levels.forEach(function (level) {
        // detect if we have different kind of audio codecs used amongst playlists
        codecs = level.codecs;
        if (codecs) {
          if (codecs.indexOf('mp4a.40.2') !== -1) {
            aac = true;
          }
          if (codecs.indexOf('mp4a.40.5') !== -1) {
            heaac = true;
          }
        }
      });
      this.audiocodecswitch = aac && heaac;
      if (this.audiocodecswitch) {
        _utilsLogger.logger.log('both AAC/HE-AAC audio found in levels; declaring audio codec as HE-AAC');
      }
      this.levels = data.levels;
      this.startLevelLoaded = false;
      this.startFragmentRequested = false;
      if (this.media && this.config.autoStartLoad) {
        this.startLoad();
      }
    }
  }, {
    key: 'onLevelLoaded',
    value: function onLevelLoaded(event, data) {
      var newDetails = data.details,
          newLevelId = data.level,
          curLevel = this.levels[newLevelId],
          duration = newDetails.totalduration;

      _utilsLogger.logger.log('level ' + newLevelId + ' loaded [' + newDetails.startSN + ',' + newDetails.endSN + '],duration:' + duration);

      if (newDetails.live) {
        var curDetails = curLevel.details;
        if (curDetails) {
          // we already have details for that level, merge them
          _helperLevelHelper2['default'].mergeDetails(curDetails, newDetails);
          if (newDetails.PTSKnown) {
            _utilsLogger.logger.log('live playlist sliding:' + newDetails.fragments[0].start.toFixed(3));
          } else {
            _utilsLogger.logger.log('live playlist - outdated PTS, unknown sliding');
          }
        } else {
          newDetails.PTSKnown = false;
          _utilsLogger.logger.log('live playlist - first load, unknown sliding');
        }
      } else {
        newDetails.PTSKnown = false;
      }
      // override level info
      curLevel.details = newDetails;
      this.hls.trigger(_events2['default'].LEVEL_UPDATED, { details: newDetails, level: newLevelId });

      // compute start position
      if (this.startLevelLoaded === false) {
        // if live playlist, set start position to be fragment N-this.config.liveSyncDurationCount (usually 3)
        if (newDetails.live) {
          this.startPosition = Math.max(0, duration - this.config.liveSyncDurationCount * newDetails.targetduration);
        }
        this.nextLoadPosition = this.startPosition;
        this.startLevelLoaded = true;
      }
      // only switch batck to IDLE state if we were waiting for level to start downloading a new fragment
      if (this.state === State.WAITING_LEVEL) {
        this.state = State.IDLE;
      }
      //trigger handler right now
      this.tick();
    }
  }, {
    key: 'onKeyLoaded',
    value: function onKeyLoaded() {
      if (this.state === State.KEY_LOADING) {
        this.state = State.IDLE;
        this.tick();
      }
    }
  }, {
    key: 'onFragLoaded',
    value: function onFragLoaded(event, data) {
      var fragCurrent = this.fragCurrent;
      if (this.state === State.FRAG_LOADING && fragCurrent && data.frag.level === fragCurrent.level && data.frag.sn === fragCurrent.sn) {
        if (this.fragBitrateTest === true) {
          // switch back to IDLE state ... we just loaded a fragment to determine adequate start bitrate and initialize autoswitch algo
          this.state = State.IDLE;
          this.fragBitrateTest = false;
          data.stats.tparsed = data.stats.tbuffered = performance.now();
          this.hls.trigger(_events2['default'].FRAG_BUFFERED, { stats: data.stats, frag: fragCurrent });
        } else {
          this.state = State.PARSING;
          // transmux the MPEG-TS data to ISO-BMFF segments
          this.stats = data.stats;
          var currentLevel = this.levels[this.level],
              details = currentLevel.details,
              duration = details.totalduration,
              start = fragCurrent.start,
              level = fragCurrent.level,
              sn = fragCurrent.sn,
              audioCodec = currentLevel.audioCodec;
          if (audioCodec && this.audioCodecSwap) {
            _utilsLogger.logger.log('swapping playlist audio codec');
            if (audioCodec.indexOf('mp4a.40.5') !== -1) {
              audioCodec = 'mp4a.40.2';
            } else {
              audioCodec = 'mp4a.40.5';
            }
          }
          _utilsLogger.logger.log('Demuxing ' + sn + ' of [' + details.startSN + ' ,' + details.endSN + '],level ' + level);
          this.demuxer.push(data.payload, audioCodec, currentLevel.videoCodec, start, fragCurrent.cc, level, sn, duration, fragCurrent.decryptdata);
        }
      }
    }
  }, {
    key: 'onInitSegment',
    value: function onInitSegment(event, data) {
      if (this.state === State.PARSING) {
        // check if codecs have been explicitely defined in the master playlist for this level;
        // if yes use these ones instead of the ones parsed from the demux
        var audioCodec = this.levels[this.level].audioCodec,
            videoCodec = this.levels[this.level].videoCodec,
            sb;
        if (audioCodec && this.audioCodecSwap) {
          _utilsLogger.logger.log('swapping playlist audio codec');
          if (audioCodec.indexOf('mp4a.40.5') !== -1) {
            audioCodec = 'mp4a.40.2';
          } else {
            audioCodec = 'mp4a.40.5';
          }
        }
        _utilsLogger.logger.log('playlist_level/init_segment codecs: video => ' + videoCodec + '/' + data.videoCodec + '; audio => ' + audioCodec + '/' + data.audioCodec);
        // if playlist does not specify codecs, use codecs found while parsing fragment
        // if no codec found while parsing fragment, also set codec to undefined to avoid creating sourceBuffer
        if (audioCodec === undefined || data.audioCodec === undefined) {
          audioCodec = data.audioCodec;
        }

        if (videoCodec === undefined || data.videoCodec === undefined) {
          videoCodec = data.videoCodec;
        }
        // in case several audio codecs might be used, force HE-AAC for audio (some browsers don't support audio codec switch)
        //don't do it for mono streams ...
        var ua = navigator.userAgent.toLowerCase();
        if (this.audiocodecswitch && data.audioChannelCount !== 1 && ua.indexOf('android') === -1 && ua.indexOf('firefox') === -1) {
          audioCodec = 'mp4a.40.5';
        }
        if (!this.sourceBuffer) {
          this.sourceBuffer = {};
          _utilsLogger.logger.log('selected A/V codecs for sourceBuffers:' + audioCodec + ',' + videoCodec);
          // create source Buffer and link them to MediaSource
          if (audioCodec) {
            sb = this.sourceBuffer.audio = this.mediaSource.addSourceBuffer('video/mp4;codecs=' + audioCodec);
            sb.addEventListener('updateend', this.onsbue);
            sb.addEventListener('error', this.onsbe);
          }
          if (videoCodec) {
            sb = this.sourceBuffer.video = this.mediaSource.addSourceBuffer('video/mp4;codecs=' + videoCodec);
            sb.addEventListener('updateend', this.onsbue);
            sb.addEventListener('error', this.onsbe);
          }
        }
        if (audioCodec) {
          this.mp4segments.push({ type: 'audio', data: data.audioMoov });
        }
        if (videoCodec) {
          this.mp4segments.push({ type: 'video', data: data.videoMoov });
        }
        //trigger handler right now
        this.tick();
      }
    }
  }, {
    key: 'onFragParsing',
    value: function onFragParsing(event, data) {
      if (this.state === State.PARSING) {
        this.tparse2 = Date.now();
        var level = this.levels[this.level],
            frag = this.fragCurrent;
        _utilsLogger.logger.log('parsed data, type/startPTS/endPTS/startDTS/endDTS/nb:' + data.type + '/' + data.startPTS.toFixed(3) + '/' + data.endPTS.toFixed(3) + '/' + data.startDTS.toFixed(3) + '/' + data.endDTS.toFixed(3) + '/' + data.nb);
        var drift = _helperLevelHelper2['default'].updateFragPTS(level.details, frag.sn, data.startPTS, data.endPTS);
        this.hls.trigger(_events2['default'].LEVEL_PTS_UPDATED, { details: level.details, level: this.level, drift: drift });

        this.mp4segments.push({ type: data.type, data: data.moof });
        this.mp4segments.push({ type: data.type, data: data.mdat });
        this.nextLoadPosition = data.endPTS;
        this.bufferRange.push({ type: data.type, start: data.startPTS, end: data.endPTS, frag: frag });

        //trigger handler right now
        this.tick();
      } else {
        _utilsLogger.logger.warn('not in PARSING state, discarding ' + event);
      }
    }
  }, {
    key: 'onFragParsed',
    value: function onFragParsed() {
      if (this.state === State.PARSING) {
        this.state = State.PARSED;
        this.stats.tparsed = performance.now();
        //trigger handler right now
        this.tick();
      }
    }
  }, {
    key: 'onError',
    value: function onError(event, data) {
      switch (data.details) {
        // abort fragment loading on errors
        case _errors.ErrorDetails.FRAG_LOAD_ERROR:
        case _errors.ErrorDetails.FRAG_LOAD_TIMEOUT:
        case _errors.ErrorDetails.FRAG_LOOP_LOADING_ERROR:
        case _errors.ErrorDetails.LEVEL_LOAD_ERROR:
        case _errors.ErrorDetails.LEVEL_LOAD_TIMEOUT:
        case _errors.ErrorDetails.KEY_LOAD_ERROR:
        case _errors.ErrorDetails.KEY_LOAD_TIMEOUT:
          // if fatal error, stop processing, otherwise move to IDLE to retry loading
          _utilsLogger.logger.warn('mediaController: ' + data.details + ' while loading frag,switch to ' + (data.fatal ? 'ERROR' : 'IDLE') + ' state ...');
          this.state = data.fatal ? State.ERROR : State.IDLE;
          break;
        default:
          break;
      }
    }
  }, {
    key: 'onSBUpdateEnd',
    value: function onSBUpdateEnd() {
      //trigger handler right now
      if (this.state === State.APPENDING && this.mp4segments.length === 0) {
        var frag = this.fragCurrent,
            stats = this.stats;
        if (frag) {
          this.fragPrevious = frag;
          stats.tbuffered = performance.now();
          this.fragLastKbps = Math.round(8 * stats.length / (stats.tbuffered - stats.tfirst));
          this.hls.trigger(_events2['default'].FRAG_BUFFERED, { stats: stats, frag: frag });
          _utilsLogger.logger.log('media buffered : ' + this.timeRangesToString(this.media.buffered));
          this.state = State.IDLE;
        }
      }
      this.tick();
    }
  }, {
    key: '_checkBuffer',
    value: function _checkBuffer() {
      var media = this.media;
      if (media) {
        // compare readyState
        var readyState = media.readyState;
        // if ready state different from HAVE_NOTHING (numeric value 0), we are allowed to seek
        if (readyState) {
          // if seek after buffered defined, let's seek if within acceptable range
          var seekAfterBuffered = this.seekAfterBuffered;
          if (seekAfterBuffered) {
            if (media.duration >= seekAfterBuffered) {
              media.currentTime = seekAfterBuffered;
              this.seekAfterBuffered = undefined;
            }
          } else if (readyState < 3) {
            // readyState = 1 or 2
            //  HAVE_METADATA (numeric value 1)     Enough of the resource has been obtained that the duration of the resource is available.
            //                                       The API will no longer throw an exception when seeking.
            // HAVE_CURRENT_DATA (numeric value 2)  Data for the immediate current playback position is available,
            //                                      but either not enough data is available that the user agent could
            //                                      successfully advance the current playback position
            var currentTime = media.currentTime;
            var bufferInfo = this.bufferInfo(currentTime, 0);
            // check if current time is buffered or not
            if (bufferInfo.len === 0) {
              // no buffer available @ currentTime, check if next buffer is close (in a 300 ms range)
              var nextBufferStart = bufferInfo.nextStart;
              if (nextBufferStart && nextBufferStart - currentTime < 0.3) {
                // next buffer is close ! adjust currentTime to nextBufferStart
                // this will ensure effective video decoding
                _utilsLogger.logger.log('adjust currentTime from ' + currentTime + ' to ' + nextBufferStart);
                media.currentTime = nextBufferStart;
              }
            }
          }
        }
      }
    }
  }, {
    key: 'swapAudioCodec',
    value: function swapAudioCodec() {
      this.audioCodecSwap = !this.audioCodecSwap;
    }
  }, {
    key: 'onSBUpdateError',
    value: function onSBUpdateError(event) {
      _utilsLogger.logger.error('sourceBuffer error:' + event);
      this.state = State.ERROR;
      // according to http://www.w3.org/TR/media-source/#sourcebuffer-append-error
      // this error might not always be fatal (it is fatal if decode error is set, in that case
      // it will be followed by a mediaElement error ...)
      this.hls.trigger(_events2['default'].ERROR, { type: _errors.ErrorTypes.MEDIA_ERROR, details: _errors.ErrorDetails.BUFFER_APPENDING_ERROR, fatal: false, frag: this.fragCurrent });
    }
  }, {
    key: 'timeRangesToString',
    value: function timeRangesToString(r) {
      var log = '',
          len = r.length;
      for (var i = 0; i < len; i++) {
        log += '[' + r.start(i) + ',' + r.end(i) + ']';
      }
      return log;
    }
  }, {
    key: 'onMediaSourceOpen',
    value: function onMediaSourceOpen() {
      _utilsLogger.logger.log('media source opened');
      this.hls.trigger(_events2['default'].MEDIA_ATTACHED);
      this.onvseeking = this.onMediaSeeking.bind(this);
      this.onvseeked = this.onMediaSeeked.bind(this);
      this.onvmetadata = this.onMediaMetadata.bind(this);
      this.onvended = this.onMediaEnded.bind(this);
      var media = this.media;
      media.addEventListener('seeking', this.onvseeking);
      media.addEventListener('seeked', this.onvseeked);
      media.addEventListener('loadedmetadata', this.onvmetadata);
      media.addEventListener('ended', this.onvended);
      if (this.levels && this.config.autoStartLoad) {
        this.startLoad();
      }
      // once received, don't listen anymore to sourceopen event
      this.mediaSource.removeEventListener('sourceopen', this.onmso);
    }
  }, {
    key: 'onMediaSourceClose',
    value: function onMediaSourceClose() {
      _utilsLogger.logger.log('media source closed');
    }
  }, {
    key: 'onMediaSourceEnded',
    value: function onMediaSourceEnded() {
      _utilsLogger.logger.log('media source ended');
    }
  }, {
    key: 'currentLevel',
    get: function get() {
      if (this.media) {
        var range = this.getBufferRange(this.media.currentTime);
        if (range) {
          return range.frag.level;
        }
      }
      return -1;
    }
  }, {
    key: 'nextBufferRange',
    get: function get() {
      if (this.media) {
        // first get end range of current fragment
        return this.followingBufferRange(this.getBufferRange(this.media.currentTime));
      } else {
        return null;
      }
    }
  }, {
    key: 'nextLevel',
    get: function get() {
      var range = this.nextBufferRange;
      if (range) {
        return range.frag.level;
      } else {
        return -1;
      }
    }
  }]);

  return MSEMediaController;
})();

exports['default'] = MSEMediaController;
module.exports = exports['default'];

},{"../demux/demuxer":12,"../errors":16,"../events":17,"../helper/level-helper":18,"../utils/binary-search":25,"../utils/logger":26}],6:[function(require,module,exports){
/*
 *
 * This file contains an adaptation of the AES decryption algorithm
 * from the Standford Javascript Cryptography Library. That work is
 * covered by the following copyright and permissions notice:
 *
 * Copyright 2009-2010 Emily Stark, Mike Hamburg, Dan Boneh.
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are
 * met:
 *
 * 1. Redistributions of source code must retain the above copyright
 *    notice, this list of conditions and the following disclaimer.
 *
 * 2. Redistributions in binary form must reproduce the above
 *    copyright notice, this list of conditions and the following
 *    disclaimer in the documentation and/or other materials provided
 *    with the distribution.
 *
 * THIS SOFTWARE IS PROVIDED BY THE AUTHORS ``AS IS'' AND ANY EXPRESS OR
 * IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL <COPYRIGHT HOLDER> OR CONTRIBUTORS BE
 * LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
 * CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
 * SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR
 * BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY,
 * WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE
 * OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN
 * IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *
 * The views and conclusions contained in the software and documentation
 * are those of the authors and should not be interpreted as representing
 * official policies, either expressed or implied, of the authors.
 */
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var AES = (function () {

  /**
   * Schedule out an AES key for both encryption and decryption. This
   * is a low-level class. Use a cipher mode to do bulk encryption.
   *
   * @constructor
   * @param key {Array} The key as an array of 4, 6 or 8 words.
   */

  function AES(key) {
    _classCallCheck(this, AES);

    /**
     * The expanded S-box and inverse S-box tables. These will be computed
     * on the client so that we don't have to send them down the wire.
     *
     * There are two tables, _tables[0] is for encryption and
     * _tables[1] is for decryption.
     *
     * The first 4 sub-tables are the expanded S-box with MixColumns. The
     * last (_tables[01][4]) is the S-box itself.
     *
     * @private
     */
    this._tables = [[[], [], [], [], []], [[], [], [], [], []]];

    this._precompute();

    var i,
        j,
        tmp,
        encKey,
        decKey,
        sbox = this._tables[0][4],
        decTable = this._tables[1],
        keyLen = key.length,
        rcon = 1;

    if (keyLen !== 4 && keyLen !== 6 && keyLen !== 8) {
      throw new Error('Invalid aes key size=' + keyLen);
    }

    encKey = key.slice(0);
    decKey = [];
    this._key = [encKey, decKey];

    // schedule encryption keys
    for (i = keyLen; i < 4 * keyLen + 28; i++) {
      tmp = encKey[i - 1];

      // apply sbox
      if (i % keyLen === 0 || keyLen === 8 && i % keyLen === 4) {
        tmp = sbox[tmp >>> 24] << 24 ^ sbox[tmp >> 16 & 255] << 16 ^ sbox[tmp >> 8 & 255] << 8 ^ sbox[tmp & 255];

        // shift rows and add rcon
        if (i % keyLen === 0) {
          tmp = tmp << 8 ^ tmp >>> 24 ^ rcon << 24;
          rcon = rcon << 1 ^ (rcon >> 7) * 283;
        }
      }

      encKey[i] = encKey[i - keyLen] ^ tmp;
    }

    // schedule decryption keys
    for (j = 0; i; j++, i--) {
      tmp = encKey[j & 3 ? i : i - 4];
      if (i <= 4 || j < 4) {
        decKey[j] = tmp;
      } else {
        decKey[j] = decTable[0][sbox[tmp >>> 24]] ^ decTable[1][sbox[tmp >> 16 & 255]] ^ decTable[2][sbox[tmp >> 8 & 255]] ^ decTable[3][sbox[tmp & 255]];
      }
    }
  }

  /**
   * Expand the S-box tables.
   *
   * @private
   */

  _createClass(AES, [{
    key: '_precompute',
    value: function _precompute() {
      var encTable = this._tables[0],
          decTable = this._tables[1],
          sbox = encTable[4],
          sboxInv = decTable[4],
          i,
          x,
          xInv,
          d = [],
          th = [],
          x2,
          x4,
          x8,
          s,
          tEnc,
          tDec;

      // Compute double and third tables
      for (i = 0; i < 256; i++) {
        th[(d[i] = i << 1 ^ (i >> 7) * 283) ^ i] = i;
      }

      for (x = xInv = 0; !sbox[x]; x ^= x2 || 1, xInv = th[xInv] || 1) {
        // Compute sbox
        s = xInv ^ xInv << 1 ^ xInv << 2 ^ xInv << 3 ^ xInv << 4;
        s = s >> 8 ^ s & 255 ^ 99;
        sbox[x] = s;
        sboxInv[s] = x;

        // Compute MixColumns
        x8 = d[x4 = d[x2 = d[x]]];
        tDec = x8 * 0x1010101 ^ x4 * 0x10001 ^ x2 * 0x101 ^ x * 0x1010100;
        tEnc = d[s] * 0x101 ^ s * 0x1010100;

        for (i = 0; i < 4; i++) {
          encTable[i][x] = tEnc = tEnc << 24 ^ tEnc >>> 8;
          decTable[i][s] = tDec = tDec << 24 ^ tDec >>> 8;
        }
      }

      // Compactify. Considerable speedup on Firefox.
      for (i = 0; i < 5; i++) {
        encTable[i] = encTable[i].slice(0);
        decTable[i] = decTable[i].slice(0);
      }
    }

    /**
     * Decrypt 16 bytes, specified as four 32-bit words.
     * @param encrypted0 {number} the first word to decrypt
     * @param encrypted1 {number} the second word to decrypt
     * @param encrypted2 {number} the third word to decrypt
     * @param encrypted3 {number} the fourth word to decrypt
     * @param out {Int32Array} the array to write the decrypted words
     * into
     * @param offset {number} the offset into the output array to start
     * writing results
     * @return {Array} The plaintext.
     */
  }, {
    key: 'decrypt',
    value: function decrypt(encrypted0, encrypted1, encrypted2, encrypted3, out, offset) {
      var key = this._key[1],

      // state variables a,b,c,d are loaded with pre-whitened data
      a = encrypted0 ^ key[0],
          b = encrypted3 ^ key[1],
          c = encrypted2 ^ key[2],
          d = encrypted1 ^ key[3],
          a2,
          b2,
          c2,
          nInnerRounds = key.length / 4 - 2,
          // key.length === 2 ?
      i,
          kIndex = 4,
          table = this._tables[1],

      // load up the tables
      table0 = table[0],
          table1 = table[1],
          table2 = table[2],
          table3 = table[3],
          sbox = table[4];

      // Inner rounds. Cribbed from OpenSSL.
      for (i = 0; i < nInnerRounds; i++) {
        a2 = table0[a >>> 24] ^ table1[b >> 16 & 255] ^ table2[c >> 8 & 255] ^ table3[d & 255] ^ key[kIndex];
        b2 = table0[b >>> 24] ^ table1[c >> 16 & 255] ^ table2[d >> 8 & 255] ^ table3[a & 255] ^ key[kIndex + 1];
        c2 = table0[c >>> 24] ^ table1[d >> 16 & 255] ^ table2[a >> 8 & 255] ^ table3[b & 255] ^ key[kIndex + 2];
        d = table0[d >>> 24] ^ table1[a >> 16 & 255] ^ table2[b >> 8 & 255] ^ table3[c & 255] ^ key[kIndex + 3];
        kIndex += 4;
        a = a2;b = b2;c = c2;
      }

      // Last round.
      for (i = 0; i < 4; i++) {
        out[(3 & -i) + offset] = sbox[a >>> 24] << 24 ^ sbox[b >> 16 & 255] << 16 ^ sbox[c >> 8 & 255] << 8 ^ sbox[d & 255] ^ key[kIndex++];
        a2 = a;a = b;b = c;c = d;d = a2;
      }
    }
  }]);

  return AES;
})();

exports['default'] = AES;
module.exports = exports['default'];

},{}],7:[function(require,module,exports){
/*
 *
 * This file contains an adaptation of the AES decryption algorithm
 * from the Standford Javascript Cryptography Library. That work is
 * covered by the following copyright and permissions notice:
 *
 * Copyright 2009-2010 Emily Stark, Mike Hamburg, Dan Boneh.
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are
 * met:
 *
 * 1. Redistributions of source code must retain the above copyright
 *    notice, this list of conditions and the following disclaimer.
 *
 * 2. Redistributions in binary form must reproduce the above
 *    copyright notice, this list of conditions and the following
 *    disclaimer in the documentation and/or other materials provided
 *    with the distribution.
 *
 * THIS SOFTWARE IS PROVIDED BY THE AUTHORS ``AS IS'' AND ANY EXPRESS OR
 * IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL <COPYRIGHT HOLDER> OR CONTRIBUTORS BE
 * LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
 * CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
 * SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR
 * BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY,
 * WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE
 * OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN
 * IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *
 * The views and conclusions contained in the software and documentation
 * are those of the authors and should not be interpreted as representing
 * official policies, either expressed or implied, of the authors.
 */

'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _aes = require('./aes');

var _aes2 = _interopRequireDefault(_aes);

var AES128Decrypter = (function () {
  function AES128Decrypter(key, initVector) {
    _classCallCheck(this, AES128Decrypter);

    this.key = key;
    this.iv = initVector;
  }

  /**
   * Convert network-order (big-endian) bytes into their little-endian
   * representation.
   */

  _createClass(AES128Decrypter, [{
    key: 'ntoh',
    value: function ntoh(word) {
      return word << 24 | (word & 0xff00) << 8 | (word & 0xff0000) >> 8 | word >>> 24;
    }

    /**
     * Decrypt bytes using AES-128 with CBC and PKCS#7 padding.
     * @param encrypted {Uint8Array} the encrypted bytes
     * @param key {Uint32Array} the bytes of the decryption key
     * @param initVector {Uint32Array} the initialization vector (IV) to
     * use for the first round of CBC.
     * @return {Uint8Array} the decrypted bytes
     *
     * @see http://en.wikipedia.org/wiki/Advanced_Encryption_Standard
     * @see http://en.wikipedia.org/wiki/Block_cipher_mode_of_operation#Cipher_Block_Chaining_.28CBC.29
     * @see https://tools.ietf.org/html/rfc2315
     */
  }, {
    key: 'doDecrypt',
    value: function doDecrypt(encrypted, key, initVector) {
      var
      // word-level access to the encrypted bytes
      encrypted32 = new Int32Array(encrypted.buffer, encrypted.byteOffset, encrypted.byteLength >> 2),
          decipher = new _aes2['default'](Array.prototype.slice.call(key)),

      // byte and word-level access for the decrypted output
      decrypted = new Uint8Array(encrypted.byteLength),
          decrypted32 = new Int32Array(decrypted.buffer),

      // temporary variables for working with the IV, encrypted, and
      // decrypted data
      init0,
          init1,
          init2,
          init3,
          encrypted0,
          encrypted1,
          encrypted2,
          encrypted3,

      // iteration variable
      wordIx;

      // pull out the words of the IV to ensure we don't modify the
      // passed-in reference and easier access
      init0 = ~ ~initVector[0];
      init1 = ~ ~initVector[1];
      init2 = ~ ~initVector[2];
      init3 = ~ ~initVector[3];

      // decrypt four word sequences, applying cipher-block chaining (CBC)
      // to each decrypted block
      for (wordIx = 0; wordIx < encrypted32.length; wordIx += 4) {
        // convert big-endian (network order) words into little-endian
        // (javascript order)
        encrypted0 = ~ ~this.ntoh(encrypted32[wordIx]);
        encrypted1 = ~ ~this.ntoh(encrypted32[wordIx + 1]);
        encrypted2 = ~ ~this.ntoh(encrypted32[wordIx + 2]);
        encrypted3 = ~ ~this.ntoh(encrypted32[wordIx + 3]);

        // decrypt the block
        decipher.decrypt(encrypted0, encrypted1, encrypted2, encrypted3, decrypted32, wordIx);

        // XOR with the IV, and restore network byte-order to obtain the
        // plaintext
        decrypted32[wordIx] = this.ntoh(decrypted32[wordIx] ^ init0);
        decrypted32[wordIx + 1] = this.ntoh(decrypted32[wordIx + 1] ^ init1);
        decrypted32[wordIx + 2] = this.ntoh(decrypted32[wordIx + 2] ^ init2);
        decrypted32[wordIx + 3] = this.ntoh(decrypted32[wordIx + 3] ^ init3);

        // setup the IV for the next round
        init0 = encrypted0;
        init1 = encrypted1;
        init2 = encrypted2;
        init3 = encrypted3;
      }

      return decrypted;
    }
  }, {
    key: 'localDecript',
    value: function localDecript(encrypted, key, initVector, decrypted) {
      var bytes = this.doDecrypt(encrypted, key, initVector);
      decrypted.set(bytes, encrypted.byteOffset);
    }
  }, {
    key: 'decrypt',
    value: function decrypt(encrypted) {
      var step = 4 * 8000,

      //encrypted32 = new Int32Array(encrypted.buffer),
      encrypted32 = new Int32Array(encrypted),
          decrypted = new Uint8Array(encrypted.byteLength),
          i = 0;

      // split up the encryption job and do the individual chunks asynchronously
      var key = this.key;
      var initVector = this.iv;
      this.localDecript(encrypted32.subarray(i, i + step), key, initVector, decrypted);

      for (i = step; i < encrypted32.length; i += step) {
        initVector = new Uint32Array([this.ntoh(encrypted32[i - 4]), this.ntoh(encrypted32[i - 3]), this.ntoh(encrypted32[i - 2]), this.ntoh(encrypted32[i - 1])]);
        this.localDecript(encrypted32.subarray(i, i + step), key, initVector, decrypted);
      }

      return decrypted;
    }
  }]);

  return AES128Decrypter;
})();

exports['default'] = AES128Decrypter;
module.exports = exports['default'];

},{"./aes":6}],8:[function(require,module,exports){
/*
 * AES128 decryption.
 */

'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _aes128Decrypter = require('./aes128-decrypter');

var _aes128Decrypter2 = _interopRequireDefault(_aes128Decrypter);

var _errors = require('../errors');

var _utilsLogger = require('../utils/logger');

var Decrypter = (function () {
  function Decrypter(hls) {
    _classCallCheck(this, Decrypter);

    this.hls = hls;
    try {
      var browserCrypto = window ? window.crypto : crypto;
      this.subtle = browserCrypto.subtle || browserCrypto.webkitSubtle;
      this.disableWebCrypto = !this.subtle;
    } catch (e) {
      this.disableWebCrypto = true;
    }
  }

  _createClass(Decrypter, [{
    key: 'destroy',
    value: function destroy() {}
  }, {
    key: 'decrypt',
    value: function decrypt(data, key, iv, callback) {
      if (this.disableWebCrypto && this.hls.config.enableSoftwareAES) {
        this.decryptBySoftware(data, key, iv, callback);
      } else {
        this.decryptByWebCrypto(data, key, iv, callback);
      }
    }
  }, {
    key: 'decryptByWebCrypto',
    value: function decryptByWebCrypto(data, key, iv, callback) {
      var _this = this;

      _utilsLogger.logger.log('decrypting by WebCrypto API');

      this.subtle.importKey('raw', key, { name: 'AES-CBC', length: 128 }, false, ['decrypt']).then(function (importedKey) {
        _this.subtle.decrypt({ name: 'AES-CBC', iv: iv.buffer }, importedKey, data).then(callback)['catch'](function (err) {
          _this.onWebCryptoError(err, data, key, iv, callback);
        });
      })['catch'](function (err) {
        _this.onWebCryptoError(err, data, key, iv, callback);
      });
    }
  }, {
    key: 'decryptBySoftware',
    value: function decryptBySoftware(data, key8, iv8, callback) {
      _utilsLogger.logger.log('decrypting by JavaScript Implementation');

      var view = new DataView(key8.buffer);
      var key = new Uint32Array([view.getUint32(0), view.getUint32(4), view.getUint32(8), view.getUint32(12)]);

      view = new DataView(iv8.buffer);
      var iv = new Uint32Array([view.getUint32(0), view.getUint32(4), view.getUint32(8), view.getUint32(12)]);

      var decrypter = new _aes128Decrypter2['default'](key, iv);
      callback(decrypter.decrypt(data).buffer);
    }
  }, {
    key: 'onWebCryptoError',
    value: function onWebCryptoError(err, data, key, iv, callback) {
      if (this.hls.config.enableSoftwareAES) {
        _utilsLogger.logger.log('disabling to use WebCrypto API');
        this.disableWebCrypto = true;
        this.decryptBySoftware(data, key, iv, callback);
      } else {
        _utilsLogger.logger.error('decrypting error : ' + err.message);
        this.hls.trigger(Event.ERROR, { type: _errors.ErrorTypes.MEDIA_ERROR, details: _errors.ErrorDetails.FRAG_DECRYPT_ERROR, fatal: true, reason: err.message });
      }
    }
  }]);

  return Decrypter;
})();

exports['default'] = Decrypter;
module.exports = exports['default'];

},{"../errors":16,"../utils/logger":26,"./aes128-decrypter":7}],9:[function(require,module,exports){
/**
 * AAC demuxer
 */
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _utilsLogger = require('../utils/logger');

var _demuxId3 = require('../demux/id3');

var _demuxId32 = _interopRequireDefault(_demuxId3);

var _errors = require('../errors');

var AACDemuxer = (function () {
  function AACDemuxer(observer, remuxerClass) {
    _classCallCheck(this, AACDemuxer);

    this.observer = observer;
    this.remuxerClass = remuxerClass;
    this.remuxer = new this.remuxerClass(observer);
    this._aacTrack = { type: 'audio', id: -1, sequenceNumber: 0, samples: [], len: 0 };
  }

  _createClass(AACDemuxer, [{
    key: 'push',

    // feed incoming data to the front of the parsing pipeline
    value: function push(data, audioCodec, videoCodec, timeOffset, cc, level, sn, duration) {
      var id3 = new _demuxId32['default'](data),
          adtsStartOffset,
          len,
          track = this._aacTrack,
          pts = id3.timeStamp,
          config,
          nbSamples,
          adtsFrameSize,
          adtsHeaderLen,
          stamp,
          aacSample;
      // look for ADTS header (0xFFFx)
      for (adtsStartOffset = id3.length, len = data.length; adtsStartOffset < len - 1; adtsStartOffset++) {
        if (data[adtsStartOffset] === 0xff && (data[adtsStartOffset + 1] & 0xf0) === 0xf0) {
          break;
        }
      }

      if (!track.audiosamplerate) {
        config = this._ADTStoAudioConfig(data, adtsStartOffset, audioCodec);
        track.config = config.config;
        track.audiosamplerate = config.samplerate;
        track.channelCount = config.channelCount;
        track.codec = config.codec;
        track.timescale = this.remuxer.timescale;
        track.duration = this.remuxer.timescale * duration;
        _utilsLogger.logger.log('parsed codec:' + track.codec + ',rate:' + config.samplerate + ',nb channel:' + config.channelCount);
      }
      nbSamples = 0;
      while (adtsStartOffset + 5 < len) {
        // retrieve frame size
        adtsFrameSize = (data[adtsStartOffset + 3] & 0x03) << 11;
        // byte 4
        adtsFrameSize |= data[adtsStartOffset + 4] << 3;
        // byte 5
        adtsFrameSize |= (data[adtsStartOffset + 5] & 0xE0) >>> 5;
        adtsHeaderLen = !!(data[adtsStartOffset + 1] & 0x01) ? 7 : 9;
        adtsFrameSize -= adtsHeaderLen;
        stamp = Math.round(90 * pts + nbSamples * 1024 * 90000 / track.audiosamplerate);
        //stamp = pes.pts;
        //console.log('AAC frame, offset/length/pts:' + (adtsStartOffset+7) + '/' + adtsFrameSize + '/' + stamp.toFixed(0));
        if (adtsFrameSize > 0 && adtsStartOffset + adtsHeaderLen + adtsFrameSize <= len) {
          aacSample = { unit: data.subarray(adtsStartOffset + adtsHeaderLen, adtsStartOffset + adtsHeaderLen + adtsFrameSize), pts: stamp, dts: stamp };
          track.samples.push(aacSample);
          track.len += adtsFrameSize;
          adtsStartOffset += adtsFrameSize + adtsHeaderLen;
          nbSamples++;
          // look for ADTS header (0xFFFx)
          for (; adtsStartOffset < len - 1; adtsStartOffset++) {
            if (data[adtsStartOffset] === 0xff && (data[adtsStartOffset + 1] & 0xf0) === 0xf0) {
              break;
            }
          }
        } else {
          break;
        }
      }
      this.remuxer.remux(this._aacTrack, { samples: [] }, { samples: [{ pts: pts, dts: pts, unit: id3.payload }] }, timeOffset);
    }
  }, {
    key: '_ADTStoAudioConfig',
    value: function _ADTStoAudioConfig(data, offset, audioCodec) {
      var adtsObjectType,
          // :int
      adtsSampleingIndex,
          // :int
      adtsExtensionSampleingIndex,
          // :int
      adtsChanelConfig,
          // :int
      config,
          userAgent = navigator.userAgent.toLowerCase(),
          adtsSampleingRates = [96000, 88200, 64000, 48000, 44100, 32000, 24000, 22050, 16000, 12000, 11025, 8000, 7350];
      // byte 2
      adtsObjectType = ((data[offset + 2] & 0xC0) >>> 6) + 1;
      adtsSampleingIndex = (data[offset + 2] & 0x3C) >>> 2;
      if (adtsSampleingIndex > adtsSampleingRates.length - 1) {
        this.observer.trigger(Event.ERROR, { type: _errors.ErrorTypes.MEDIA_ERROR, details: _errors.ErrorDetails.FRAG_PARSING_ERROR, fatal: true, reason: 'invalid ADTS sampling index:' + adtsSampleingIndex });
        return;
      }
      adtsChanelConfig = (data[offset + 2] & 0x01) << 2;
      // byte 3
      adtsChanelConfig |= (data[offset + 3] & 0xC0) >>> 6;
      _utilsLogger.logger.log('manifest codec:' + audioCodec + ',ADTS data:type:' + adtsObjectType + ',sampleingIndex:' + adtsSampleingIndex + '[' + adtsSampleingRates[adtsSampleingIndex] + 'Hz],channelConfig:' + adtsChanelConfig);
      // firefox: freq less than 24kHz = AAC SBR (HE-AAC)
      if (userAgent.indexOf('firefox') !== -1) {
        if (adtsSampleingIndex >= 6) {
          adtsObjectType = 5;
          config = new Array(4);
          // HE-AAC uses SBR (Spectral Band Replication) , high frequencies are constructed from low frequencies
          // there is a factor 2 between frame sample rate and output sample rate
          // multiply frequency by 2 (see table below, equivalent to substract 3)
          adtsExtensionSampleingIndex = adtsSampleingIndex - 3;
        } else {
          adtsObjectType = 2;
          config = new Array(2);
          adtsExtensionSampleingIndex = adtsSampleingIndex;
        }
        // Android : always use AAC
      } else if (userAgent.indexOf('android') !== -1) {
          adtsObjectType = 2;
          config = new Array(2);
          adtsExtensionSampleingIndex = adtsSampleingIndex;
        } else {
          /*  for other browsers (chrome ...)
              always force audio type to be HE-AAC SBR, as some browsers do not support audio codec switch properly (like Chrome ...)
          */
          adtsObjectType = 5;
          config = new Array(4);
          // if (manifest codec is HE-AAC) OR (manifest codec not specified AND frequency less than 24kHz)
          if (audioCodec && audioCodec.indexOf('mp4a.40.5') !== -1 || !audioCodec && adtsSampleingIndex >= 6) {
            // HE-AAC uses SBR (Spectral Band Replication) , high frequencies are constructed from low frequencies
            // there is a factor 2 between frame sample rate and output sample rate
            // multiply frequency by 2 (see table below, equivalent to substract 3)
            adtsExtensionSampleingIndex = adtsSampleingIndex - 3;
          } else {
            // if (manifest codec is AAC) AND (frequency less than 24kHz OR nb channel is 1)
            if (audioCodec && audioCodec.indexOf('mp4a.40.2') !== -1 && (adtsSampleingIndex >= 6 || adtsChanelConfig === 1)) {
              adtsObjectType = 2;
              config = new Array(2);
            }
            adtsExtensionSampleingIndex = adtsSampleingIndex;
          }
        }
      /* refer to http://wiki.multimedia.cx/index.php?title=MPEG-4_Audio#Audio_Specific_Config
          ISO 14496-3 (AAC).pdf - Table 1.13 — Syntax of AudioSpecificConfig()
        Audio Profile / Audio Object Type
        0: Null
        1: AAC Main
        2: AAC LC (Low Complexity)
        3: AAC SSR (Scalable Sample Rate)
        4: AAC LTP (Long Term Prediction)
        5: SBR (Spectral Band Replication)
        6: AAC Scalable
       sampling freq
        0: 96000 Hz
        1: 88200 Hz
        2: 64000 Hz
        3: 48000 Hz
        4: 44100 Hz
        5: 32000 Hz
        6: 24000 Hz
        7: 22050 Hz
        8: 16000 Hz
        9: 12000 Hz
        10: 11025 Hz
        11: 8000 Hz
        12: 7350 Hz
        13: Reserved
        14: Reserved
        15: frequency is written explictly
        Channel Configurations
        These are the channel configurations:
        0: Defined in AOT Specifc Config
        1: 1 channel: front-center
        2: 2 channels: front-left, front-right
      */
      // audioObjectType = profile => profile, the MPEG-4 Audio Object Type minus 1
      config[0] = adtsObjectType << 3;
      // samplingFrequencyIndex
      config[0] |= (adtsSampleingIndex & 0x0E) >> 1;
      config[1] |= (adtsSampleingIndex & 0x01) << 7;
      // channelConfiguration
      config[1] |= adtsChanelConfig << 3;
      if (adtsObjectType === 5) {
        // adtsExtensionSampleingIndex
        config[1] |= (adtsExtensionSampleingIndex & 0x0E) >> 1;
        config[2] = (adtsExtensionSampleingIndex & 0x01) << 7;
        // adtsObjectType (force to 2, chrome is checking that object type is less than 5 ???
        //    https://chromium.googlesource.com/chromium/src.git/+/master/media/formats/mp4/aac.cc
        config[2] |= 2 << 2;
        config[3] = 0;
      }
      return { config: config, samplerate: adtsSampleingRates[adtsSampleingIndex], channelCount: adtsChanelConfig, codec: 'mp4a.40.' + adtsObjectType };
    }
  }, {
    key: 'destroy',
    value: function destroy() {}
  }], [{
    key: 'probe',
    value: function probe(data) {
      // check if data contains ID3 timestamp and ADTS sync worc
      var id3 = new _demuxId32['default'](data),
          adtsStartOffset,
          len;
      if (id3.hasTimeStamp) {
        // look for ADTS header (0xFFFx)
        for (adtsStartOffset = id3.length, len = data.length; adtsStartOffset < len - 1; adtsStartOffset++) {
          if (data[adtsStartOffset] === 0xff && (data[adtsStartOffset + 1] & 0xf0) === 0xf0) {
            //logger.log('ADTS sync word found !');
            return true;
          }
        }
      }
      return false;
    }
  }]);

  return AACDemuxer;
})();

exports['default'] = AACDemuxer;
module.exports = exports['default'];

},{"../demux/id3":14,"../errors":16,"../utils/logger":26}],10:[function(require,module,exports){
/*  inline demuxer.
 *   probe fragments and instantiate appropriate demuxer depending on content type (TSDemuxer, AACDemuxer, ...)
 */

'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _events = require('../events');

var _events2 = _interopRequireDefault(_events);

var _errors = require('../errors');

var _demuxAacdemuxer = require('../demux/aacdemuxer');

var _demuxAacdemuxer2 = _interopRequireDefault(_demuxAacdemuxer);

var _demuxTsdemuxer = require('../demux/tsdemuxer');

var _demuxTsdemuxer2 = _interopRequireDefault(_demuxTsdemuxer);

var DemuxerInline = (function () {
  function DemuxerInline(hls, remuxer) {
    _classCallCheck(this, DemuxerInline);

    this.hls = hls;
    this.remuxer = remuxer;
  }

  _createClass(DemuxerInline, [{
    key: 'destroy',
    value: function destroy() {
      var demuxer = this.demuxer;
      if (demuxer) {
        demuxer.destroy();
      }
    }
  }, {
    key: 'push',
    value: function push(data, audioCodec, videoCodec, timeOffset, cc, level, sn, duration) {
      var demuxer = this.demuxer;
      if (!demuxer) {
        // probe for content type
        if (_demuxTsdemuxer2['default'].probe(data)) {
          demuxer = this.demuxer = new _demuxTsdemuxer2['default'](this.hls, this.remuxer);
        } else if (_demuxAacdemuxer2['default'].probe(data)) {
          demuxer = this.demuxer = new _demuxAacdemuxer2['default'](this.hls, this.remuxer);
        } else {
          this.hls.trigger(_events2['default'].ERROR, { type: _errors.ErrorTypes.MEDIA_ERROR, details: _errors.ErrorDetails.FRAG_PARSING_ERROR, fatal: true, reason: 'no demux matching with content found' });
          return;
        }
      }
      demuxer.push(data, audioCodec, videoCodec, timeOffset, cc, level, sn, duration);
    }
  }]);

  return DemuxerInline;
})();

exports['default'] = DemuxerInline;
module.exports = exports['default'];

},{"../demux/aacdemuxer":9,"../demux/tsdemuxer":15,"../errors":16,"../events":17}],11:[function(require,module,exports){
/* demuxer web worker.
 *  - listen to worker message, and trigger DemuxerInline upon reception of Fragments.
 *  - provides MP4 Boxes back to main thread using [transferable objects](https://developers.google.com/web/updates/2011/12/Transferable-Objects-Lightning-Fast) in order to minimize message passing overhead.
 */

'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _demuxDemuxerInline = require('../demux/demuxer-inline');

var _demuxDemuxerInline2 = _interopRequireDefault(_demuxDemuxerInline);

var _events = require('../events');

var _events2 = _interopRequireDefault(_events);

var _events3 = require('events');

var _events4 = _interopRequireDefault(_events3);

var _remuxMp4Remuxer = require('../remux/mp4-remuxer');

var _remuxMp4Remuxer2 = _interopRequireDefault(_remuxMp4Remuxer);

var DemuxerWorker = function DemuxerWorker(self) {
  // observer setup
  var observer = new _events4['default']();
  observer.trigger = function trigger(event) {
    for (var _len = arguments.length, data = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
      data[_key - 1] = arguments[_key];
    }

    observer.emit.apply(observer, [event, event].concat(data));
  };

  observer.off = function off(event) {
    for (var _len2 = arguments.length, data = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
      data[_key2 - 1] = arguments[_key2];
    }

    observer.removeListener.apply(observer, [event].concat(data));
  };
  self.addEventListener('message', function (ev) {
    //console.log('demuxer cmd:' + ev.data.cmd);
    switch (ev.data.cmd) {
      case 'init':
        self.demuxer = new _demuxDemuxerInline2['default'](observer, _remuxMp4Remuxer2['default']);
        break;
      case 'demux':
        var data = ev.data;
        self.demuxer.push(new Uint8Array(data.data), data.audioCodec, data.videoCodec, data.timeOffset, data.cc, data.level, data.sn, data.duration);
        break;
      default:
        break;
    }
  });

  // listen to events triggered by TS Demuxer
  observer.on(_events2['default'].FRAG_PARSING_INIT_SEGMENT, function (ev, data) {
    var objData = { event: ev };
    var objTransferable = [];
    if (data.audioCodec) {
      objData.audioCodec = data.audioCodec;
      objData.audioMoov = data.audioMoov.buffer;
      objData.audioChannelCount = data.audioChannelCount;
      objTransferable.push(objData.audioMoov);
    }
    if (data.videoCodec) {
      objData.videoCodec = data.videoCodec;
      objData.videoMoov = data.videoMoov.buffer;
      objData.videoWidth = data.videoWidth;
      objData.videoHeight = data.videoHeight;
      objTransferable.push(objData.videoMoov);
    }
    // pass moov as transferable object (no copy)
    self.postMessage(objData, objTransferable);
  });

  observer.on(_events2['default'].FRAG_PARSING_DATA, function (ev, data) {
    var objData = { event: ev, type: data.type, startPTS: data.startPTS, endPTS: data.endPTS, startDTS: data.startDTS, endDTS: data.endDTS, moof: data.moof.buffer, mdat: data.mdat.buffer, nb: data.nb };
    // pass moof/mdat data as transferable object (no copy)
    self.postMessage(objData, [objData.moof, objData.mdat]);
  });

  observer.on(_events2['default'].FRAG_PARSED, function (event) {
    self.postMessage({ event: event });
  });

  observer.on(_events2['default'].ERROR, function (event, data) {
    self.postMessage({ event: event, data: data });
  });

  observer.on(_events2['default'].FRAG_PARSING_METADATA, function (event, data) {
    var objData = { event: event, samples: data.samples };
    self.postMessage(objData);
  });
};

exports['default'] = DemuxerWorker;
module.exports = exports['default'];

},{"../demux/demuxer-inline":10,"../events":17,"../remux/mp4-remuxer":24,"events":1}],12:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _events = require('../events');

var _events2 = _interopRequireDefault(_events);

var _demuxDemuxerInline = require('../demux/demuxer-inline');

var _demuxDemuxerInline2 = _interopRequireDefault(_demuxDemuxerInline);

var _demuxDemuxerWorker = require('../demux/demuxer-worker');

var _demuxDemuxerWorker2 = _interopRequireDefault(_demuxDemuxerWorker);

var _utilsLogger = require('../utils/logger');

var _remuxMp4Remuxer = require('../remux/mp4-remuxer');

var _remuxMp4Remuxer2 = _interopRequireDefault(_remuxMp4Remuxer);

var _cryptDecrypter = require('../crypt/decrypter');

var _cryptDecrypter2 = _interopRequireDefault(_cryptDecrypter);

var Demuxer = (function () {
  function Demuxer(hls) {
    _classCallCheck(this, Demuxer);

    this.hls = hls;
    if (hls.config.enableWorker && typeof Worker !== 'undefined') {
      _utilsLogger.logger.log('demuxing in webworker');
      try {
        var work = require('webworkify');
        this.w = work(_demuxDemuxerWorker2['default']);
        this.onwmsg = this.onWorkerMessage.bind(this);
        this.w.addEventListener('message', this.onwmsg);
        this.w.postMessage({ cmd: 'init' });
      } catch (err) {
        _utilsLogger.logger.error('error while initializing DemuxerWorker, fallback on DemuxerInline');
        this.demuxer = new _demuxDemuxerInline2['default'](hls, _remuxMp4Remuxer2['default']);
      }
    } else {
      this.demuxer = new _demuxDemuxerInline2['default'](hls, _remuxMp4Remuxer2['default']);
    }
    this.demuxInitialized = true;
  }

  _createClass(Demuxer, [{
    key: 'destroy',
    value: function destroy() {
      if (this.w) {
        this.w.removeEventListener('message', this.onwmsg);
        this.w.terminate();
        this.w = null;
      } else {
        this.demuxer.destroy();
        this.demuxer = null;
      }
      if (this.decrypter) {
        this.decrypter.destroy();
        this.decrypter = null;
      }
    }
  }, {
    key: 'pushDecrypted',
    value: function pushDecrypted(data, audioCodec, videoCodec, timeOffset, cc, level, sn, duration) {
      if (this.w) {
        // post fragment payload as transferable objects (no copy)
        this.w.postMessage({ cmd: 'demux', data: data, audioCodec: audioCodec, videoCodec: videoCodec, timeOffset: timeOffset, cc: cc, level: level, sn: sn, duration: duration }, [data]);
      } else {
        this.demuxer.push(new Uint8Array(data), audioCodec, videoCodec, timeOffset, cc, level, sn, duration);
      }
    }
  }, {
    key: 'push',
    value: function push(data, audioCodec, videoCodec, timeOffset, cc, level, sn, duration, decryptdata) {
      if (data.byteLength > 0 && decryptdata != null && decryptdata.key != null && decryptdata.method === 'AES-128') {
        if (this.decrypter == null) {
          this.decrypter = new _cryptDecrypter2['default'](this.hls);
        }

        var localthis = this;
        this.decrypter.decrypt(data, decryptdata.key, decryptdata.iv, function (decryptedData) {
          localthis.pushDecrypted(decryptedData, audioCodec, videoCodec, timeOffset, cc, level, sn, duration);
        });
      } else {
        this.pushDecrypted(data, audioCodec, videoCodec, timeOffset, cc, level, sn, duration);
      }
    }
  }, {
    key: 'onWorkerMessage',
    value: function onWorkerMessage(ev) {
      //console.log('onWorkerMessage:' + ev.data.event);
      switch (ev.data.event) {
        case _events2['default'].FRAG_PARSING_INIT_SEGMENT:
          var obj = {};
          if (ev.data.audioMoov) {
            obj.audioMoov = new Uint8Array(ev.data.audioMoov);
            obj.audioCodec = ev.data.audioCodec;
            obj.audioChannelCount = ev.data.audioChannelCount;
          }
          if (ev.data.videoMoov) {
            obj.videoMoov = new Uint8Array(ev.data.videoMoov);
            obj.videoCodec = ev.data.videoCodec;
            obj.videoWidth = ev.data.videoWidth;
            obj.videoHeight = ev.data.videoHeight;
          }
          this.hls.trigger(_events2['default'].FRAG_PARSING_INIT_SEGMENT, obj);
          break;
        case _events2['default'].FRAG_PARSING_DATA:
          this.hls.trigger(_events2['default'].FRAG_PARSING_DATA, {
            moof: new Uint8Array(ev.data.moof),
            mdat: new Uint8Array(ev.data.mdat),
            startPTS: ev.data.startPTS,
            endPTS: ev.data.endPTS,
            startDTS: ev.data.startDTS,
            endDTS: ev.data.endDTS,
            type: ev.data.type,
            nb: ev.data.nb
          });
          break;
        case _events2['default'].FRAG_PARSING_METADATA:
          this.hls.trigger(_events2['default'].FRAG_PARSING_METADATA, {
            samples: ev.data.samples
          });
          break;
        default:
          this.hls.trigger(ev.data.event, ev.data.data);
          break;
      }
    }
  }]);

  return Demuxer;
})();

exports['default'] = Demuxer;
module.exports = exports['default'];

},{"../crypt/decrypter":8,"../demux/demuxer-inline":10,"../demux/demuxer-worker":11,"../events":17,"../remux/mp4-remuxer":24,"../utils/logger":26,"webworkify":2}],13:[function(require,module,exports){
/**
 * Parser for exponential Golomb codes, a variable-bitwidth number encoding scheme used by h264.
*/

'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _utilsLogger = require('../utils/logger');

var ExpGolomb = (function () {
  function ExpGolomb(data) {
    _classCallCheck(this, ExpGolomb);

    this.data = data;
    // the number of bytes left to examine in this.data
    this.bytesAvailable = this.data.byteLength;
    // the current word being examined
    this.word = 0; // :uint
    // the number of bits left to examine in the current word
    this.bitsAvailable = 0; // :uint
  }

  // ():void

  _createClass(ExpGolomb, [{
    key: 'loadWord',
    value: function loadWord() {
      var position = this.data.byteLength - this.bytesAvailable,
          workingBytes = new Uint8Array(4),
          availableBytes = Math.min(4, this.bytesAvailable);
      if (availableBytes === 0) {
        throw new Error('no bytes available');
      }
      workingBytes.set(this.data.subarray(position, position + availableBytes));
      this.word = new DataView(workingBytes.buffer).getUint32(0);
      // track the amount of this.data that has been processed
      this.bitsAvailable = availableBytes * 8;
      this.bytesAvailable -= availableBytes;
    }

    // (count:int):void
  }, {
    key: 'skipBits',
    value: function skipBits(count) {
      var skipBytes; // :int
      if (this.bitsAvailable > count) {
        this.word <<= count;
        this.bitsAvailable -= count;
      } else {
        count -= this.bitsAvailable;
        skipBytes = count >> 3;
        count -= skipBytes >> 3;
        this.bytesAvailable -= skipBytes;
        this.loadWord();
        this.word <<= count;
        this.bitsAvailable -= count;
      }
    }

    // (size:int):uint
  }, {
    key: 'readBits',
    value: function readBits(size) {
      var bits = Math.min(this.bitsAvailable, size),
          // :uint
      valu = this.word >>> 32 - bits; // :uint
      if (size > 32) {
        _utilsLogger.logger.error('Cannot read more than 32 bits at a time');
      }
      this.bitsAvailable -= bits;
      if (this.bitsAvailable > 0) {
        this.word <<= bits;
      } else if (this.bytesAvailable > 0) {
        this.loadWord();
      }
      bits = size - bits;
      if (bits > 0) {
        return valu << bits | this.readBits(bits);
      } else {
        return valu;
      }
    }

    // ():uint
  }, {
    key: 'skipLZ',
    value: function skipLZ() {
      var leadingZeroCount; // :uint
      for (leadingZeroCount = 0; leadingZeroCount < this.bitsAvailable; ++leadingZeroCount) {
        if (0 !== (this.word & 0x80000000 >>> leadingZeroCount)) {
          // the first bit of working word is 1
          this.word <<= leadingZeroCount;
          this.bitsAvailable -= leadingZeroCount;
          return leadingZeroCount;
        }
      }
      // we exhausted word and still have not found a 1
      this.loadWord();
      return leadingZeroCount + this.skipLZ();
    }

    // ():void
  }, {
    key: 'skipUEG',
    value: function skipUEG() {
      this.skipBits(1 + this.skipLZ());
    }

    // ():void
  }, {
    key: 'skipEG',
    value: function skipEG() {
      this.skipBits(1 + this.skipLZ());
    }

    // ():uint
  }, {
    key: 'readUEG',
    value: function readUEG() {
      var clz = this.skipLZ(); // :uint
      return this.readBits(clz + 1) - 1;
    }

    // ():int
  }, {
    key: 'readEG',
    value: function readEG() {
      var valu = this.readUEG(); // :int
      if (0x01 & valu) {
        // the number is odd if the low order bit is set
        return 1 + valu >>> 1; // add 1 to make it even, and divide by 2
      } else {
          return -1 * (valu >>> 1); // divide by two then make it negative
        }
    }

    // Some convenience functions
    // :Boolean
  }, {
    key: 'readBoolean',
    value: function readBoolean() {
      return 1 === this.readBits(1);
    }

    // ():int
  }, {
    key: 'readUByte',
    value: function readUByte() {
      return this.readBits(8);
    }

    /**
     * Advance the ExpGolomb decoder past a scaling list. The scaling
     * list is optionally transmitted as part of a sequence parameter
     * set and is not relevant to transmuxing.
     * @param count {number} the number of entries in this scaling list
     * @see Recommendation ITU-T H.264, Section 7.3.2.1.1.1
     */
  }, {
    key: 'skipScalingList',
    value: function skipScalingList(count) {
      var lastScale = 8,
          nextScale = 8,
          j,
          deltaScale;
      for (j = 0; j < count; j++) {
        if (nextScale !== 0) {
          deltaScale = this.readEG();
          nextScale = (lastScale + deltaScale + 256) % 256;
        }
        lastScale = nextScale === 0 ? lastScale : nextScale;
      }
    }

    /**
     * Read a sequence parameter set and return some interesting video
     * properties. A sequence parameter set is the H264 metadata that
     * describes the properties of upcoming video frames.
     * @param data {Uint8Array} the bytes of a sequence parameter set
     * @return {object} an object with configuration parsed from the
     * sequence parameter set, including the dimensions of the
     * associated video frames.
     */
  }, {
    key: 'readSPS',
    value: function readSPS() {
      var frameCropLeftOffset = 0,
          frameCropRightOffset = 0,
          frameCropTopOffset = 0,
          frameCropBottomOffset = 0,
          sarScale = 1,
          profileIdc,
          profileCompat,
          levelIdc,
          numRefFramesInPicOrderCntCycle,
          picWidthInMbsMinus1,
          picHeightInMapUnitsMinus1,
          frameMbsOnlyFlag,
          scalingListCount,
          i;
      this.readUByte();
      profileIdc = this.readUByte(); // profile_idc
      profileCompat = this.readBits(5); // constraint_set[0-4]_flag, u(5)
      this.skipBits(3); // reserved_zero_3bits u(3),
      levelIdc = this.readUByte(); //level_idc u(8)
      this.skipUEG(); // seq_parameter_set_id
      // some profiles have more optional data we don't need
      if (profileIdc === 100 || profileIdc === 110 || profileIdc === 122 || profileIdc === 144) {
        var chromaFormatIdc = this.readUEG();
        if (chromaFormatIdc === 3) {
          this.skipBits(1); // separate_colour_plane_flag
        }
        this.skipUEG(); // bit_depth_luma_minus8
        this.skipUEG(); // bit_depth_chroma_minus8
        this.skipBits(1); // qpprime_y_zero_transform_bypass_flag
        if (this.readBoolean()) {
          // seq_scaling_matrix_present_flag
          scalingListCount = chromaFormatIdc !== 3 ? 8 : 12;
          for (i = 0; i < scalingListCount; i++) {
            if (this.readBoolean()) {
              // seq_scaling_list_present_flag[ i ]
              if (i < 6) {
                this.skipScalingList(16);
              } else {
                this.skipScalingList(64);
              }
            }
          }
        }
      }
      this.skipUEG(); // log2_max_frame_num_minus4
      var picOrderCntType = this.readUEG();
      if (picOrderCntType === 0) {
        this.readUEG(); //log2_max_pic_order_cnt_lsb_minus4
      } else if (picOrderCntType === 1) {
          this.skipBits(1); // delta_pic_order_always_zero_flag
          this.skipEG(); // offset_for_non_ref_pic
          this.skipEG(); // offset_for_top_to_bottom_field
          numRefFramesInPicOrderCntCycle = this.readUEG();
          for (i = 0; i < numRefFramesInPicOrderCntCycle; i++) {
            this.skipEG(); // offset_for_ref_frame[ i ]
          }
        }
      this.skipUEG(); // max_num_ref_frames
      this.skipBits(1); // gaps_in_frame_num_value_allowed_flag
      picWidthInMbsMinus1 = this.readUEG();
      picHeightInMapUnitsMinus1 = this.readUEG();
      frameMbsOnlyFlag = this.readBits(1);
      if (frameMbsOnlyFlag === 0) {
        this.skipBits(1); // mb_adaptive_frame_field_flag
      }
      this.skipBits(1); // direct_8x8_inference_flag
      if (this.readBoolean()) {
        // frame_cropping_flag
        frameCropLeftOffset = this.readUEG();
        frameCropRightOffset = this.readUEG();
        frameCropTopOffset = this.readUEG();
        frameCropBottomOffset = this.readUEG();
      }
      if (this.readBoolean()) {
        // vui_parameters_present_flag
        if (this.readBoolean()) {
          // aspect_ratio_info_present_flag
          var sarRatio = undefined;
          var aspectRatioIdc = this.readUByte();
          switch (aspectRatioIdc) {
            //case 1: sarRatio = [1,1]; break;
            case 2:
              sarRatio = [12, 11];break;
            case 3:
              sarRatio = [10, 11];break;
            case 4:
              sarRatio = [16, 11];break;
            case 5:
              sarRatio = [40, 33];break;
            case 6:
              sarRatio = [24, 11];break;
            case 7:
              sarRatio = [20, 11];break;
            case 8:
              sarRatio = [32, 11];break;
            case 9:
              sarRatio = [80, 33];break;
            case 10:
              sarRatio = [18, 11];break;
            case 11:
              sarRatio = [15, 11];break;
            case 12:
              sarRatio = [64, 33];break;
            case 13:
              sarRatio = [160, 99];break;
            case 14:
              sarRatio = [4, 3];break;
            case 15:
              sarRatio = [3, 2];break;
            case 16:
              sarRatio = [2, 1];break;
            case 255:
              {
                sarRatio = [this.readUByte() << 8 | this.readUByte(), this.readUByte() << 8 | this.readUByte()];
                break;
              }
          }
          if (sarRatio) {
            sarScale = sarRatio[0] / sarRatio[1];
          }
        }
      }
      return {
        width: ((picWidthInMbsMinus1 + 1) * 16 - frameCropLeftOffset * 2 - frameCropRightOffset * 2) * sarScale,
        height: (2 - frameMbsOnlyFlag) * (picHeightInMapUnitsMinus1 + 1) * 16 - (frameMbsOnlyFlag ? 2 : 4) * (frameCropTopOffset + frameCropBottomOffset)
      };
    }
  }, {
    key: 'readSliceType',
    value: function readSliceType() {
      // skip NALu type
      this.readUByte();
      // discard first_mb_in_slice
      this.readUEG();
      // return slice_type
      return this.readUEG();
    }
  }]);

  return ExpGolomb;
})();

exports['default'] = ExpGolomb;
module.exports = exports['default'];

},{"../utils/logger":26}],14:[function(require,module,exports){
/**
 * ID3 parser
 */
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _utilsLogger = require('../utils/logger');

//import Hex from '../utils/hex';

var ID3 = (function () {
  function ID3(data) {
    _classCallCheck(this, ID3);

    this._hasTimeStamp = false;
    var offset = 0,
        byte1,
        byte2,
        byte3,
        byte4,
        tagSize,
        endPos,
        header,
        len;
    do {
      header = this.readUTF(data, offset, 3);
      offset += 3;
      // first check for ID3 header
      if (header === 'ID3') {
        // skip 24 bits
        offset += 3;
        // retrieve tag(s) length
        byte1 = data[offset++] & 0x7f;
        byte2 = data[offset++] & 0x7f;
        byte3 = data[offset++] & 0x7f;
        byte4 = data[offset++] & 0x7f;
        tagSize = (byte1 << 21) + (byte2 << 14) + (byte3 << 7) + byte4;
        endPos = offset + tagSize;
        //logger.log(`ID3 tag found, size/end: ${tagSize}/${endPos}`);

        // read ID3 tags
        this._parseID3Frames(data, offset, endPos);
        offset = endPos;
      } else if (header === '3DI') {
        // http://id3.org/id3v2.4.0-structure chapter 3.4.   ID3v2 footer
        offset += 7;
        _utilsLogger.logger.log('3DI footer found, end: ' + offset);
      } else {
        offset -= 3;
        len = offset;
        if (len) {
          //logger.log(`ID3 len: ${len}`);
          if (!this.hasTimeStamp) {
            _utilsLogger.logger.warn('ID3 tag found, but no timestamp');
          }
          this._length = len;
          this._payload = data.subarray(0, len);
        }
        return;
      }
    } while (true);
  }

  _createClass(ID3, [{
    key: 'readUTF',
    value: function readUTF(data, start, len) {

      var result = '',
          offset = start,
          end = start + len;
      do {
        result += String.fromCharCode(data[offset++]);
      } while (offset < end);
      return result;
    }
  }, {
    key: '_parseID3Frames',
    value: function _parseID3Frames(data, offset, endPos) {
      var tagId, tagLen, tagStart, tagFlags, timestamp;
      while (offset + 8 <= endPos) {
        tagId = this.readUTF(data, offset, 4);
        offset += 4;

        tagLen = data[offset++] << 24 + data[offset++] << 16 + data[offset++] << 8 + data[offset++];

        tagFlags = data[offset++] << 8 + data[offset++];

        tagStart = offset;
        //logger.log("ID3 tag id:" + tagId);
        switch (tagId) {
          case 'PRIV':
            //logger.log('parse frame:' + Hex.hexDump(data.subarray(offset,endPos)));
            // owner should be "com.apple.streaming.transportStreamTimestamp"
            if (this.readUTF(data, offset, 44) === 'com.apple.streaming.transportStreamTimestamp') {
              offset += 44;
              // smelling even better ! we found the right descriptor
              // skip null character (string end) + 3 first bytes
              offset += 4;

              // timestamp is 33 bit expressed as a big-endian eight-octet number, with the upper 31 bits set to zero.
              var pts33Bit = data[offset++] & 0x1;
              this._hasTimeStamp = true;

              timestamp = ((data[offset++] << 23) + (data[offset++] << 15) + (data[offset++] << 7) + data[offset++]) / 45;

              if (pts33Bit) {
                timestamp += 47721858.84; // 2^32 / 90
              }
              timestamp = Math.round(timestamp);
              _utilsLogger.logger.trace('ID3 timestamp found: ' + timestamp);
              this._timeStamp = timestamp;
            }
            break;
          default:
            break;
        }
      }
    }
  }, {
    key: 'hasTimeStamp',
    get: function get() {
      return this._hasTimeStamp;
    }
  }, {
    key: 'timeStamp',
    get: function get() {
      return this._timeStamp;
    }
  }, {
    key: 'length',
    get: function get() {
      return this._length;
    }
  }, {
    key: 'payload',
    get: function get() {
      return this._payload;
    }
  }]);

  return ID3;
})();

exports['default'] = ID3;
module.exports = exports['default'];

},{"../utils/logger":26}],15:[function(require,module,exports){
/**
 * highly optimized TS demuxer:
 * parse PAT, PMT
 * extract PES packet from audio and video PIDs
 * extract AVC/H264 NAL units and AAC/ADTS samples from PES packet
 * trigger the remuxer upon parsing completion
 * it also tries to workaround as best as it can audio codec switch (HE-AAC to AAC and vice versa), without having to restart the MediaSource.
 * it also controls the remuxing process :
 * upon discontinuity or level switch detection, it will also notifies the remuxer so that it can reset its state.
*/

'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _events = require('../events');

var _events2 = _interopRequireDefault(_events);

var _expGolomb = require('./exp-golomb');

var _expGolomb2 = _interopRequireDefault(_expGolomb);

// import Hex from '../utils/hex';

var _utilsLogger = require('../utils/logger');

var _errors = require('../errors');

var TSDemuxer = (function () {
  function TSDemuxer(observer, remuxerClass) {
    _classCallCheck(this, TSDemuxer);

    this.observer = observer;
    this.remuxerClass = remuxerClass;
    this.lastCC = 0;
    this.PES_TIMESCALE = 90000;
    this.remuxer = new this.remuxerClass(observer);
  }

  _createClass(TSDemuxer, [{
    key: 'switchLevel',
    value: function switchLevel() {
      this.pmtParsed = false;
      this._pmtId = -1;
      this._avcTrack = { type: 'video', id: -1, sequenceNumber: 0, samples: [], len: 0, nbNalu: 0 };
      this._aacTrack = { type: 'audio', id: -1, sequenceNumber: 0, samples: [], len: 0 };
      this._id3Track = { type: 'id3', id: -1, sequenceNumber: 0, samples: [], len: 0 };
      this.remuxer.switchLevel();
    }
  }, {
    key: 'insertDiscontinuity',
    value: function insertDiscontinuity() {
      this.switchLevel();
      this.remuxer.insertDiscontinuity();
    }

    // feed incoming data to the front of the parsing pipeline
  }, {
    key: 'push',
    value: function push(data, audioCodec, videoCodec, timeOffset, cc, level, sn, duration) {
      var avcData,
          aacData,
          id3Data,
          start,
          len = data.length,
          stt,
          pid,
          atf,
          offset;
      this.audioCodec = audioCodec;
      this.videoCodec = videoCodec;
      this.timeOffset = timeOffset;
      this._duration = duration;
      this.contiguous = false;
      if (cc !== this.lastCC) {
        _utilsLogger.logger.log('discontinuity detected');
        this.insertDiscontinuity();
        this.lastCC = cc;
      } else if (level !== this.lastLevel) {
        _utilsLogger.logger.log('level switch detected');
        this.switchLevel();
        this.lastLevel = level;
      } else if (sn === this.lastSN + 1) {
        this.contiguous = true;
      }
      this.lastSN = sn;

      if (!this.contiguous) {
        // flush any partial content
        this.aacOverFlow = null;
      }

      var pmtParsed = this.pmtParsed,
          avcId = this._avcTrack.id,
          aacId = this._aacTrack.id,
          id3Id = this._id3Track.id;
      // loop through TS packets
      for (start = 0; start < len; start += 188) {
        if (data[start] === 0x47) {
          stt = !!(data[start + 1] & 0x40);
          // pid is a 13-bit field starting at the last bit of TS[1]
          pid = ((data[start + 1] & 0x1f) << 8) + data[start + 2];
          atf = (data[start + 3] & 0x30) >> 4;
          // if an adaption field is present, its length is specified by the fifth byte of the TS packet header.
          if (atf > 1) {
            offset = start + 5 + data[start + 4];
            // continue if there is only adaptation field
            if (offset === start + 188) {
              continue;
            }
          } else {
            offset = start + 4;
          }
          if (pmtParsed) {
            if (pid === avcId) {
              if (stt) {
                if (avcData) {
                  this._parseAVCPES(this._parsePES(avcData));
                }
                avcData = { data: [], size: 0 };
              }
              if (avcData) {
                avcData.data.push(data.subarray(offset, start + 188));
                avcData.size += start + 188 - offset;
              }
            } else if (pid === aacId) {
              if (stt) {
                if (aacData) {
                  this._parseAACPES(this._parsePES(aacData));
                }
                aacData = { data: [], size: 0 };
              }
              if (aacData) {
                aacData.data.push(data.subarray(offset, start + 188));
                aacData.size += start + 188 - offset;
              }
            } else if (pid === id3Id) {
              if (stt) {
                if (id3Data) {
                  this._parseID3PES(this._parsePES(id3Data));
                }
                id3Data = { data: [], size: 0 };
              }
              if (id3Data) {
                id3Data.data.push(data.subarray(offset, start + 188));
                id3Data.size += start + 188 - offset;
              }
            }
          } else {
            if (stt) {
              offset += data[offset] + 1;
            }
            if (pid === 0) {
              this._parsePAT(data, offset);
            } else if (pid === this._pmtId) {
              this._parsePMT(data, offset);
              pmtParsed = this.pmtParsed = true;
              avcId = this._avcTrack.id;
              aacId = this._aacTrack.id;
              id3Id = this._id3Track.id;
            }
          }
        } else {
          this.observer.trigger(_events2['default'].ERROR, { type: _errors.ErrorTypes.MEDIA_ERROR, details: _errors.ErrorDetails.FRAG_PARSING_ERROR, fatal: false, reason: 'TS packet did not start with 0x47' });
        }
      }
      // parse last PES packet
      if (avcData) {
        this._parseAVCPES(this._parsePES(avcData));
      }
      if (aacData) {
        this._parseAACPES(this._parsePES(aacData));
      }
      if (id3Data) {
        this._parseID3PES(this._parsePES(id3Data));
      }
      this.remux();
    }
  }, {
    key: 'remux',
    value: function remux() {
      this.remuxer.remux(this._aacTrack, this._avcTrack, this._id3Track, this.timeOffset, this.contiguous);
    }
  }, {
    key: 'destroy',
    value: function destroy() {
      this.switchLevel();
      this._initPTS = this._initDTS = undefined;
      this._duration = 0;
    }
  }, {
    key: '_parsePAT',
    value: function _parsePAT(data, offset) {
      // skip the PSI header and parse the first PMT entry
      this._pmtId = (data[offset + 10] & 0x1F) << 8 | data[offset + 11];
      //logger.log('PMT PID:'  + this._pmtId);
    }
  }, {
    key: '_parsePMT',
    value: function _parsePMT(data, offset) {
      var sectionLength, tableEnd, programInfoLength, pid;
      sectionLength = (data[offset + 1] & 0x0f) << 8 | data[offset + 2];
      tableEnd = offset + 3 + sectionLength - 4;
      // to determine where the table is, we have to figure out how
      // long the program info descriptors are
      programInfoLength = (data[offset + 10] & 0x0f) << 8 | data[offset + 11];
      // advance the offset to the first entry in the mapping table
      offset += 12 + programInfoLength;
      while (offset < tableEnd) {
        pid = (data[offset + 1] & 0x1F) << 8 | data[offset + 2];
        switch (data[offset]) {
          // ISO/IEC 13818-7 ADTS AAC (MPEG-2 lower bit-rate audio)
          case 0x0f:
            //logger.log('AAC PID:'  + pid);
            this._aacTrack.id = pid;
            break;
          // Packetized metadata (ID3)
          case 0x15:
            //logger.log('ID3 PID:'  + pid);
            this._id3Track.id = pid;
            break;
          // ITU-T Rec. H.264 and ISO/IEC 14496-10 (lower bit-rate video)
          case 0x1b:
            //logger.log('AVC PID:'  + pid);
            this._avcTrack.id = pid;
            break;
          default:
            _utilsLogger.logger.log('unkown stream type:' + data[offset]);
            break;
        }
        // move to the next table entry
        // skip past the elementary stream descriptors, if present
        offset += ((data[offset + 3] & 0x0F) << 8 | data[offset + 4]) + 5;
      }
    }
  }, {
    key: '_parsePES',
    value: function _parsePES(stream) {
      var i = 0,
          frag,
          pesFlags,
          pesPrefix,
          pesLen,
          pesHdrLen,
          pesData,
          pesPts,
          pesDts,
          payloadStartOffset;
      //retrieve PTS/DTS from first fragment
      frag = stream.data[0];
      pesPrefix = (frag[0] << 16) + (frag[1] << 8) + frag[2];
      if (pesPrefix === 1) {
        pesLen = (frag[4] << 8) + frag[5];
        pesFlags = frag[7];
        if (pesFlags & 0xC0) {
          /* PES header described here : http://dvd.sourceforge.net/dvdinfo/pes-hdr.html
              as PTS / DTS is 33 bit we cannot use bitwise operator in JS,
              as Bitwise operators treat their operands as a sequence of 32 bits */
          pesPts = (frag[9] & 0x0E) * 536870912 + // 1 << 29
          (frag[10] & 0xFF) * 4194304 + // 1 << 22
          (frag[11] & 0xFE) * 16384 + // 1 << 14
          (frag[12] & 0xFF) * 128 + // 1 << 7
          (frag[13] & 0xFE) / 2;
          // check if greater than 2^32 -1
          if (pesPts > 4294967295) {
            // decrement 2^33
            pesPts -= 8589934592;
          }
          if (pesFlags & 0x40) {
            pesDts = (frag[14] & 0x0E) * 536870912 + // 1 << 29
            (frag[15] & 0xFF) * 4194304 + // 1 << 22
            (frag[16] & 0xFE) * 16384 + // 1 << 14
            (frag[17] & 0xFF) * 128 + // 1 << 7
            (frag[18] & 0xFE) / 2;
            // check if greater than 2^32 -1
            if (pesDts > 4294967295) {
              // decrement 2^33
              pesDts -= 8589934592;
            }
          } else {
            pesDts = pesPts;
          }
        }
        pesHdrLen = frag[8];
        payloadStartOffset = pesHdrLen + 9;
        // trim PES header
        stream.data[0] = stream.data[0].subarray(payloadStartOffset);
        stream.size -= payloadStartOffset;
        //reassemble PES packet
        pesData = new Uint8Array(stream.size);
        // reassemble the packet
        while (stream.data.length) {
          frag = stream.data.shift();
          pesData.set(frag, i);
          i += frag.byteLength;
        }
        return { data: pesData, pts: pesPts, dts: pesDts, len: pesLen };
      } else {
        return null;
      }
    }
  }, {
    key: '_parseAVCPES',
    value: function _parseAVCPES(pes) {
      var _this = this;

      var track = this._avcTrack,
          samples = track.samples,
          units = this._parseAVCNALu(pes.data),
          units2 = [],
          debug = false,
          key = false,
          length = 0,
          avcSample,
          push;
      // no NALu found
      if (units.length === 0 && samples.length > 0) {
        // append pes.data to previous NAL unit
        var lastavcSample = samples[samples.length - 1];
        var lastUnit = lastavcSample.units.units[lastavcSample.units.units.length - 1];
        var tmp = new Uint8Array(lastUnit.data.byteLength + pes.data.byteLength);
        tmp.set(lastUnit.data, 0);
        tmp.set(pes.data, lastUnit.data.byteLength);
        lastUnit.data = tmp;
        lastavcSample.units.length += pes.data.byteLength;
        track.len += pes.data.byteLength;
      }
      //free pes.data to save up some memory
      pes.data = null;
      var debugString = '';
      units.forEach(function (unit) {
        switch (unit.type) {
          //NDR
          case 1:
            push = true;
            if (debug) {
              debugString += 'NDR ';
            }
            break;
          //IDR
          case 5:
            push = true;
            if (debug) {
              debugString += 'IDR ';
            }
            key = true;
            break;
          case 6:
            push = true;
            if (debug) {
              debugString += 'SEI ';
            }
            break;
          //SPS
          case 7:
            push = true;
            if (debug) {
              debugString += 'SPS ';
            }
            if (!track.sps) {
              var expGolombDecoder = new _expGolomb2['default'](unit.data);
              var config = expGolombDecoder.readSPS();
              track.width = config.width;
              track.height = config.height;
              track.sps = [unit.data];
              track.timescale = _this.remuxer.timescale;
              track.duration = _this.remuxer.timescale * _this._duration;
              var codecarray = unit.data.subarray(1, 4);
              var codecstring = 'avc1.';
              for (var i = 0; i < 3; i++) {
                var h = codecarray[i].toString(16);
                if (h.length < 2) {
                  h = '0' + h;
                }
                codecstring += h;
              }
              track.codec = codecstring;
            }
            break;
          //PPS
          case 8:
            push = true;
            if (debug) {
              debugString += 'PPS ';
            }
            if (!track.pps) {
              track.pps = [unit.data];
            }
            break;
          case 9:
            push = true;
            if (debug) {
              debugString += 'AUD ';
            }
            break;
          default:
            push = false;
            debugString += 'unknown NAL ' + unit.type + ' ';
            break;
        }
        if (push) {
          units2.push(unit);
          length += unit.data.byteLength;
        }
      });
      if (debug || debugString.length) {
        _utilsLogger.logger.log(debugString);
      }
      //build sample from PES
      // Annex B to MP4 conversion to be done
      if (units2.length) {
        // only push AVC sample if keyframe already found. browsers expect a keyframe at first to start decoding
        if (key === true || track.sps) {
          avcSample = { units: { units: units2, length: length }, pts: pes.pts, dts: pes.dts, key: key };
          samples.push(avcSample);
          track.len += length;
          track.nbNalu += units2.length;
        }
      }
    }
  }, {
    key: '_parseAVCNALu',
    value: function _parseAVCNALu(array) {
      var i = 0,
          len = array.byteLength,
          value,
          overflow,
          state = 0;
      var units = [],
          unit,
          unitType,
          lastUnitStart,
          lastUnitType;
      //logger.log('PES:' + Hex.hexDump(array));
      while (i < len) {
        value = array[i++];
        // finding 3 or 4-byte start codes (00 00 01 OR 00 00 00 01)
        switch (state) {
          case 0:
            if (value === 0) {
              state = 1;
            }
            break;
          case 1:
            if (value === 0) {
              state = 2;
            } else {
              state = 0;
            }
            break;
          case 2:
          case 3:
            if (value === 0) {
              state = 3;
            } else if (value === 1) {
              unitType = array[i] & 0x1f;
              //logger.log('find NALU @ offset:' + i + ',type:' + unitType);
              if (lastUnitStart) {
                unit = { data: array.subarray(lastUnitStart, i - state - 1), type: lastUnitType };
                //logger.log('pushing NALU, type/size:' + unit.type + '/' + unit.data.byteLength);
                units.push(unit);
              } else {
                // If NAL units are not starting right at the beginning of the PES packet, push preceding data into previous NAL unit.
                overflow = i - state - 1;
                if (overflow) {
                  //logger.log('first NALU found with overflow:' + overflow);
                  if (this._avcTrack.samples.length) {
                    var lastavcSample = this._avcTrack.samples[this._avcTrack.samples.length - 1];
                    var lastUnit = lastavcSample.units.units[lastavcSample.units.units.length - 1];
                    var tmp = new Uint8Array(lastUnit.data.byteLength + overflow);
                    tmp.set(lastUnit.data, 0);
                    tmp.set(array.subarray(0, overflow), lastUnit.data.byteLength);
                    lastUnit.data = tmp;
                    lastavcSample.units.length += overflow;
                    this._avcTrack.len += overflow;
                  }
                }
              }
              lastUnitStart = i;
              lastUnitType = unitType;
              if (unitType === 1 || unitType === 5) {
                // OPTI !!! if IDR/NDR unit, consider it is last NALu
                i = len;
              }
              state = 0;
            } else {
              state = 0;
            }
            break;
          default:
            break;
        }
      }
      if (lastUnitStart) {
        unit = { data: array.subarray(lastUnitStart, len), type: lastUnitType };
        units.push(unit);
        //logger.log('pushing NALU, type/size:' + unit.type + '/' + unit.data.byteLength);
      }
      return units;
    }
  }, {
    key: '_parseAACPES',
    value: function _parseAACPES(pes) {
      var track = this._aacTrack,
          aacSample,
          data = pes.data,
          config,
          adtsFrameSize,
          adtsStartOffset,
          adtsHeaderLen,
          stamp,
          nbSamples,
          len;
      if (this.aacOverFlow) {
        var tmp = new Uint8Array(this.aacOverFlow.byteLength + data.byteLength);
        tmp.set(this.aacOverFlow, 0);
        tmp.set(data, this.aacOverFlow.byteLength);
        data = tmp;
      }
      // look for ADTS header (0xFFFx)
      for (adtsStartOffset = 0, len = data.length; adtsStartOffset < len - 1; adtsStartOffset++) {
        if (data[adtsStartOffset] === 0xff && (data[adtsStartOffset + 1] & 0xf0) === 0xf0) {
          break;
        }
      }
      // if ADTS header does not start straight from the beginning of the PES payload, raise an error
      if (adtsStartOffset) {
        var reason, fatal;
        if (adtsStartOffset < len - 1) {
          reason = 'AAC PES did not start with ADTS header,offset:' + adtsStartOffset;
          fatal = false;
        } else {
          reason = 'no ADTS header found in AAC PES';
          fatal = true;
        }
        this.observer.trigger(_events2['default'].ERROR, { type: _errors.ErrorTypes.MEDIA_ERROR, details: _errors.ErrorDetails.FRAG_PARSING_ERROR, fatal: fatal, reason: reason });
        if (fatal) {
          return;
        }
      }
      if (!track.audiosamplerate) {
        config = this._ADTStoAudioConfig(data, adtsStartOffset, this.audioCodec);
        track.config = config.config;
        track.audiosamplerate = config.samplerate;
        track.channelCount = config.channelCount;
        track.codec = config.codec;
        track.timescale = this.remuxer.timescale;
        track.duration = this.remuxer.timescale * this._duration;
        _utilsLogger.logger.log('parsed codec:' + track.codec + ',rate:' + config.samplerate + ',nb channel:' + config.channelCount);
      }
      nbSamples = 0;
      while (adtsStartOffset + 5 < len) {
        // retrieve frame size
        adtsFrameSize = (data[adtsStartOffset + 3] & 0x03) << 11;
        // byte 4
        adtsFrameSize |= data[adtsStartOffset + 4] << 3;
        // byte 5
        adtsFrameSize |= (data[adtsStartOffset + 5] & 0xE0) >>> 5;
        adtsHeaderLen = !!(data[adtsStartOffset + 1] & 0x01) ? 7 : 9;
        adtsFrameSize -= adtsHeaderLen;
        stamp = Math.round(pes.pts + nbSamples * 1024 * this.PES_TIMESCALE / track.audiosamplerate);
        //stamp = pes.pts;
        //console.log('AAC frame, offset/length/pts:' + (adtsStartOffset+7) + '/' + adtsFrameSize + '/' + stamp.toFixed(0));
        if (adtsFrameSize > 0 && adtsStartOffset + adtsHeaderLen + adtsFrameSize <= len) {
          aacSample = { unit: data.subarray(adtsStartOffset + adtsHeaderLen, adtsStartOffset + adtsHeaderLen + adtsFrameSize), pts: stamp, dts: stamp };
          this._aacTrack.samples.push(aacSample);
          this._aacTrack.len += adtsFrameSize;
          adtsStartOffset += adtsFrameSize + adtsHeaderLen;
          nbSamples++;
          // look for ADTS header (0xFFFx)
          for (; adtsStartOffset < len - 1; adtsStartOffset++) {
            if (data[adtsStartOffset] === 0xff && (data[adtsStartOffset + 1] & 0xf0) === 0xf0) {
              break;
            }
          }
        } else {
          break;
        }
      }
      if (adtsStartOffset < len) {
        this.aacOverFlow = data.subarray(adtsStartOffset, len);
      } else {
        this.aacOverFlow = null;
      }
    }
  }, {
    key: '_ADTStoAudioConfig',
    value: function _ADTStoAudioConfig(data, offset, audioCodec) {
      var adtsObjectType,
          // :int
      adtsSampleingIndex,
          // :int
      adtsExtensionSampleingIndex,
          // :int
      adtsChanelConfig,
          // :int
      config,
          userAgent = navigator.userAgent.toLowerCase(),
          adtsSampleingRates = [96000, 88200, 64000, 48000, 44100, 32000, 24000, 22050, 16000, 12000, 11025, 8000, 7350];
      // byte 2
      adtsObjectType = ((data[offset + 2] & 0xC0) >>> 6) + 1;
      adtsSampleingIndex = (data[offset + 2] & 0x3C) >>> 2;
      if (adtsSampleingIndex > adtsSampleingRates.length - 1) {
        this.observer.trigger(_events2['default'].ERROR, { type: _errors.ErrorTypes.MEDIA_ERROR, details: _errors.ErrorDetails.FRAG_PARSING_ERROR, fatal: true, reason: 'invalid ADTS sampling index:' + adtsSampleingIndex });
        return;
      }
      adtsChanelConfig = (data[offset + 2] & 0x01) << 2;
      // byte 3
      adtsChanelConfig |= (data[offset + 3] & 0xC0) >>> 6;
      _utilsLogger.logger.log('manifest codec:' + audioCodec + ',ADTS data:type:' + adtsObjectType + ',sampleingIndex:' + adtsSampleingIndex + '[' + adtsSampleingRates[adtsSampleingIndex] + 'Hz],channelConfig:' + adtsChanelConfig);
      // firefox: freq less than 24kHz = AAC SBR (HE-AAC)
      if (userAgent.indexOf('firefox') !== -1) {
        if (adtsSampleingIndex >= 6) {
          adtsObjectType = 5;
          config = new Array(4);
          // HE-AAC uses SBR (Spectral Band Replication) , high frequencies are constructed from low frequencies
          // there is a factor 2 between frame sample rate and output sample rate
          // multiply frequency by 2 (see table below, equivalent to substract 3)
          adtsExtensionSampleingIndex = adtsSampleingIndex - 3;
        } else {
          adtsObjectType = 2;
          config = new Array(2);
          adtsExtensionSampleingIndex = adtsSampleingIndex;
        }
        // Android : always use AAC
      } else if (userAgent.indexOf('android') !== -1) {
          adtsObjectType = 2;
          config = new Array(2);
          adtsExtensionSampleingIndex = adtsSampleingIndex;
        } else {
          /*  for other browsers (chrome ...)
              always force audio type to be HE-AAC SBR, as some browsers do not support audio codec switch properly (like Chrome ...)
          */
          adtsObjectType = 5;
          config = new Array(4);
          // if (manifest codec is HE-AAC or HE-AACv2) OR (manifest codec not specified AND frequency less than 24kHz)
          if (audioCodec && (audioCodec.indexOf('mp4a.40.29') !== -1 || audioCodec.indexOf('mp4a.40.5') !== -1) || !audioCodec && adtsSampleingIndex >= 6) {
            // HE-AAC uses SBR (Spectral Band Replication) , high frequencies are constructed from low frequencies
            // there is a factor 2 between frame sample rate and output sample rate
            // multiply frequency by 2 (see table below, equivalent to substract 3)
            adtsExtensionSampleingIndex = adtsSampleingIndex - 3;
          } else {
            // if (manifest codec is AAC) AND (frequency less than 24kHz OR nb channel is 1) OR (manifest codec not specified and mono audio)
            // Chrome fails to play back with AAC LC mono when initialized with HE-AAC.  This is not a problem with stereo.
            if (audioCodec && audioCodec.indexOf('mp4a.40.2') !== -1 && (adtsSampleingIndex >= 6 || adtsChanelConfig === 1) || !audioCodec && adtsChanelConfig === 1) {
              adtsObjectType = 2;
              config = new Array(2);
            }
            adtsExtensionSampleingIndex = adtsSampleingIndex;
          }
        }
      /* refer to http://wiki.multimedia.cx/index.php?title=MPEG-4_Audio#Audio_Specific_Config
          ISO 14496-3 (AAC).pdf - Table 1.13 — Syntax of AudioSpecificConfig()
        Audio Profile / Audio Object Type
        0: Null
        1: AAC Main
        2: AAC LC (Low Complexity)
        3: AAC SSR (Scalable Sample Rate)
        4: AAC LTP (Long Term Prediction)
        5: SBR (Spectral Band Replication)
        6: AAC Scalable
       sampling freq
        0: 96000 Hz
        1: 88200 Hz
        2: 64000 Hz
        3: 48000 Hz
        4: 44100 Hz
        5: 32000 Hz
        6: 24000 Hz
        7: 22050 Hz
        8: 16000 Hz
        9: 12000 Hz
        10: 11025 Hz
        11: 8000 Hz
        12: 7350 Hz
        13: Reserved
        14: Reserved
        15: frequency is written explictly
        Channel Configurations
        These are the channel configurations:
        0: Defined in AOT Specifc Config
        1: 1 channel: front-center
        2: 2 channels: front-left, front-right
      */
      // audioObjectType = profile => profile, the MPEG-4 Audio Object Type minus 1
      config[0] = adtsObjectType << 3;
      // samplingFrequencyIndex
      config[0] |= (adtsSampleingIndex & 0x0E) >> 1;
      config[1] |= (adtsSampleingIndex & 0x01) << 7;
      // channelConfiguration
      config[1] |= adtsChanelConfig << 3;
      if (adtsObjectType === 5) {
        // adtsExtensionSampleingIndex
        config[1] |= (adtsExtensionSampleingIndex & 0x0E) >> 1;
        config[2] = (adtsExtensionSampleingIndex & 0x01) << 7;
        // adtsObjectType (force to 2, chrome is checking that object type is less than 5 ???
        //    https://chromium.googlesource.com/chromium/src.git/+/master/media/formats/mp4/aac.cc
        config[2] |= 2 << 2;
        config[3] = 0;
      }
      return { config: config, samplerate: adtsSampleingRates[adtsSampleingIndex], channelCount: adtsChanelConfig, codec: 'mp4a.40.' + adtsObjectType };
    }
  }, {
    key: '_parseID3PES',
    value: function _parseID3PES(pes) {
      this._id3Track.samples.push(pes);
    }
  }], [{
    key: 'probe',
    value: function probe(data) {
      // a TS fragment should contain at least 3 TS packets, a PAT, a PMT, and one PID, each starting with 0x47
      if (data.length >= 3 * 188 && data[0] === 0x47 && data[188] === 0x47 && data[2 * 188] === 0x47) {
        return true;
      } else {
        return false;
      }
    }
  }]);

  return TSDemuxer;
})();

exports['default'] = TSDemuxer;
module.exports = exports['default'];

},{"../errors":16,"../events":17,"../utils/logger":26,"./exp-golomb":13}],16:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
var ErrorTypes = {
  // Identifier for a network error (loading error / timeout ...)
  NETWORK_ERROR: 'hlsNetworkError',
  // Identifier for a media Error (video/parsing/mediasource error)
  MEDIA_ERROR: 'hlsMediaError',
  // Identifier for all other errors
  OTHER_ERROR: 'hlsOtherError'
};

exports.ErrorTypes = ErrorTypes;
var ErrorDetails = {
  // Identifier for a manifest load error - data: { url : faulty URL, response : XHR response}
  MANIFEST_LOAD_ERROR: 'manifestLoadError',
  // Identifier for a manifest load timeout - data: { url : faulty URL, response : XHR response}
  MANIFEST_LOAD_TIMEOUT: 'manifestLoadTimeOut',
  // Identifier for a manifest parsing error - data: { url : faulty URL, reason : error reason}
  MANIFEST_PARSING_ERROR: 'manifestParsingError',
  // Identifier for playlist load error - data: { url : faulty URL, response : XHR response}
  LEVEL_LOAD_ERROR: 'levelLoadError',
  // Identifier for playlist load timeout - data: { url : faulty URL, response : XHR response}
  LEVEL_LOAD_TIMEOUT: 'levelLoadTimeOut',
  // Identifier for a level switch error - data: { level : faulty level Id, event : error description}
  LEVEL_SWITCH_ERROR: 'levelSwitchError',
  // Identifier for fragment load error - data: { frag : fragment object, response : XHR response}
  FRAG_LOAD_ERROR: 'fragLoadError',
  // Identifier for fragment loop loading error - data: { frag : fragment object}
  FRAG_LOOP_LOADING_ERROR: 'fragLoopLoadingError',
  // Identifier for fragment load timeout error - data: { frag : fragment object}
  FRAG_LOAD_TIMEOUT: 'fragLoadTimeOut',
  // Identifier for a fragment decryption error event - data: parsing error description
  FRAG_DECRYPT_ERROR: 'fragDecryptError',
  // Identifier for a fragment parsing error event - data: parsing error description
  FRAG_PARSING_ERROR: 'fragParsingError',
  // Identifier for decrypt key load error - data: { frag : fragment object, response : XHR response}
  KEY_LOAD_ERROR: 'keyLoadError',
  // Identifier for decrypt key load timeout error - data: { frag : fragment object}
  KEY_LOAD_TIMEOUT: 'keyLoadTimeOut',
  // Identifier for a buffer append error - data: append error description
  BUFFER_APPEND_ERROR: 'bufferAppendError',
  // Identifier for a buffer appending error event - data: appending error description
  BUFFER_APPENDING_ERROR: 'bufferAppendingError'
};
exports.ErrorDetails = ErrorDetails;

},{}],17:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports['default'] = {
  // fired before MediaSource is attaching to media element - data: { media }
  MEDIA_ATTACHING: 'hlsMediaAttaching',
  // fired when MediaSource has been succesfully attached to media element - data: { }
  MEDIA_ATTACHED: 'hlsMediaAttached',
  // fired before detaching MediaSource from media element - data: { }
  MEDIA_DETACHING: 'hlsMediaDetaching',
  // fired when MediaSource has been detached from media element - data: { }
  MEDIA_DETACHED: 'hlsMediaDetached',
  // fired to signal that a manifest loading starts - data: { url : manifestURL}
  MANIFEST_LOADING: 'hlsManifestLoading',
  // fired after manifest has been loaded - data: { levels : [available quality levels] , url : manifestURL, stats : { trequest, tfirst, tload, mtime}}
  MANIFEST_LOADED: 'hlsManifestLoaded',
  // fired after manifest has been parsed - data: { levels : [available quality levels] , firstLevel : index of first quality level appearing in Manifest}
  MANIFEST_PARSED: 'hlsManifestParsed',
  // fired when a level playlist loading starts - data: { url : level URL  level : id of level being loaded}
  LEVEL_LOADING: 'hlsLevelLoading',
  // fired when a level playlist loading finishes - data: { details : levelDetails object, level : id of loaded level, stats : { trequest, tfirst, tload, mtime} }
  LEVEL_LOADED: 'hlsLevelLoaded',
  // fired when a level's details have been updated based on previous details, after it has been loaded. - data: { details : levelDetails object, level : id of updated level }
  LEVEL_UPDATED: 'hlsLevelUpdated',
  // fired when a level's PTS information has been updated after parsing a fragment - data: { details : levelDetails object, level : id of updated level, drift: PTS drift observed when parsing last fragment }
  LEVEL_PTS_UPDATED: 'hlsPTSUpdated',
  // fired when a level switch is requested - data: { level : id of new level }
  LEVEL_SWITCH: 'hlsLevelSwitch',
  // fired when a fragment loading starts - data: { frag : fragment object}
  FRAG_LOADING: 'hlsFragLoading',
  // fired when a fragment loading is progressing - data: { frag : fragment object, { trequest, tfirst, loaded}}
  FRAG_LOAD_PROGRESS: 'hlsFragLoadProgress',
  // Identifier for fragment load aborting for emergency switch down - data: {frag : fragment object}
  FRAG_LOAD_EMERGENCY_ABORTED: 'hlsFragLoadEmergencyAborted',
  // fired when a fragment loading is completed - data: { frag : fragment object, payload : fragment payload, stats : { trequest, tfirst, tload, length}}
  FRAG_LOADED: 'hlsFragLoaded',
  // fired when Init Segment has been extracted from fragment - data: { moov : moov MP4 box, codecs : codecs found while parsing fragment}
  FRAG_PARSING_INIT_SEGMENT: 'hlsFragParsingInitSegment',
  // fired when parsing id3 is completed - data: { samples : [ id3 samples pes ] }
  FRAG_PARSING_METADATA: 'hlsFraParsingMetadata',
  // fired when moof/mdat have been extracted from fragment - data: { moof : moof MP4 box, mdat : mdat MP4 box}
  FRAG_PARSING_DATA: 'hlsFragParsingData',
  // fired when fragment parsing is completed - data: undefined
  FRAG_PARSED: 'hlsFragParsed',
  // fired when fragment remuxed MP4 boxes have all been appended into SourceBuffer - data: { frag : fragment object, stats : { trequest, tfirst, tload, tparsed, tbuffered, length} }
  FRAG_BUFFERED: 'hlsFragBuffered',
  // fired when fragment matching with current media position is changing - data : { frag : fragment object }
  FRAG_CHANGED: 'hlsFragChanged',
  // Identifier for a FPS drop event - data: {curentDropped, currentDecoded, totalDroppedFrames}
  FPS_DROP: 'hlsFPSDrop',
  // Identifier for an error event - data: { type : error type, details : error details, fatal : if true, hls.js cannot/will not try to recover, if false, hls.js will try to recover,other error specific data}
  ERROR: 'hlsError',
  // fired when hls.js instance starts destroying. Different from MEDIA_DETACHED as one could want to detach and reattach a media to the instance of hls.js to handle mid-rolls for example
  DESTROYING: 'hlsDestroying',
  // fired when a decrypt key loading starts - data: { frag : fragment object}
  KEY_LOADING: 'hlsKeyLoading',
  // fired when a decrypt key loading is completed - data: { frag : fragment object, payload : key payload, stats : { trequest, tfirst, tload, length}}
  KEY_LOADED: 'hlsKeyLoaded'
};
module.exports = exports['default'];

},{}],18:[function(require,module,exports){
/**
 * Level Helper class, providing methods dealing with playlist sliding and drift
*/

'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _utilsLogger = require('../utils/logger');

var LevelHelper = (function () {
  function LevelHelper() {
    _classCallCheck(this, LevelHelper);
  }

  _createClass(LevelHelper, null, [{
    key: 'mergeDetails',
    value: function mergeDetails(oldDetails, newDetails) {
      var start = Math.max(oldDetails.startSN, newDetails.startSN) - newDetails.startSN,
          end = Math.min(oldDetails.endSN, newDetails.endSN) - newDetails.startSN,
          delta = newDetails.startSN - oldDetails.startSN,
          oldfragments = oldDetails.fragments,
          newfragments = newDetails.fragments,
          ccOffset = 0,
          PTSFrag;

      // check if old/new playlists have fragments in common
      if (end < start) {
        newDetails.PTSKnown = false;
        return;
      }
      // loop through overlapping SN and update startPTS , cc, and duration if any found
      for (var i = start; i <= end; i++) {
        var oldFrag = oldfragments[delta + i],
            newFrag = newfragments[i];
        ccOffset = oldFrag.cc - newFrag.cc;
        if (!isNaN(oldFrag.startPTS)) {
          newFrag.start = newFrag.startPTS = oldFrag.startPTS;
          newFrag.endPTS = oldFrag.endPTS;
          newFrag.duration = oldFrag.duration;
          PTSFrag = newFrag;
        }
      }

      if (ccOffset) {
        _utilsLogger.logger.log('discontinuity sliding from playlist, take drift into account');
        for (i = 0; i < newfragments.length; i++) {
          newfragments[i].cc += ccOffset;
        }
      }

      // if at least one fragment contains PTS info, recompute PTS information for all fragments
      if (PTSFrag) {
        LevelHelper.updateFragPTS(newDetails, PTSFrag.sn, PTSFrag.startPTS, PTSFrag.endPTS);
      } else {
        // adjust start by sliding offset
        var sliding = oldfragments[delta].start;
        for (i = 0; i < newfragments.length; i++) {
          newfragments[i].start += sliding;
        }
      }
      // if we are here, it means we have fragments overlapping between
      // old and new level. reliable PTS info is thus relying on old level
      newDetails.PTSKnown = oldDetails.PTSKnown;
      return;
    }
  }, {
    key: 'updateFragPTS',
    value: function updateFragPTS(details, sn, startPTS, endPTS) {
      var fragIdx, fragments, frag, i;
      // exit if sn out of range
      if (sn < details.startSN || sn > details.endSN) {
        return 0;
      }
      fragIdx = sn - details.startSN;
      fragments = details.fragments;
      frag = fragments[fragIdx];
      if (!isNaN(frag.startPTS)) {
        startPTS = Math.max(startPTS, frag.startPTS);
        endPTS = Math.min(endPTS, frag.endPTS);
      }

      var drift = startPTS - frag.start;

      frag.start = frag.startPTS = startPTS;
      frag.endPTS = endPTS;
      frag.duration = endPTS - startPTS;
      // adjust fragment PTS/duration from seqnum-1 to frag 0
      for (i = fragIdx; i > 0; i--) {
        LevelHelper.updatePTS(fragments, i, i - 1);
      }

      // adjust fragment PTS/duration from seqnum to last frag
      for (i = fragIdx; i < fragments.length - 1; i++) {
        LevelHelper.updatePTS(fragments, i, i + 1);
      }
      details.PTSKnown = true;
      //logger.log(`                                            frag start/end:${startPTS.toFixed(3)}/${endPTS.toFixed(3)}`);

      return drift;
    }
  }, {
    key: 'updatePTS',
    value: function updatePTS(fragments, fromIdx, toIdx) {
      var fragFrom = fragments[fromIdx],
          fragTo = fragments[toIdx],
          fragToPTS = fragTo.startPTS;
      // if we know startPTS[toIdx]
      if (!isNaN(fragToPTS)) {
        // update fragment duration.
        // it helps to fix drifts between playlist reported duration and fragment real duration
        if (toIdx > fromIdx) {
          fragFrom.duration = fragToPTS - fragFrom.start;
          if (fragFrom.duration < 0) {
            _utilsLogger.logger.error('negative duration computed for ' + fragFrom + ', there should be some duration drift between playlist and fragment!');
          }
        } else {
          fragTo.duration = fragFrom.start - fragToPTS;
          if (fragTo.duration < 0) {
            _utilsLogger.logger.error('negative duration computed for ' + fragTo + ', there should be some duration drift between playlist and fragment!');
          }
        }
      } else {
        // we dont know startPTS[toIdx]
        if (toIdx > fromIdx) {
          fragTo.start = fragFrom.start + fragFrom.duration;
        } else {
          fragTo.start = fragFrom.start - fragTo.duration;
        }
      }
    }
  }]);

  return LevelHelper;
})();

exports['default'] = LevelHelper;
module.exports = exports['default'];

},{"../utils/logger":26}],19:[function(require,module,exports){
/**
 * HLS interface
 */
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _events = require('./events');

var _events2 = _interopRequireDefault(_events);

var _errors = require('./errors');

var _loaderPlaylistLoader = require('./loader/playlist-loader');

var _loaderPlaylistLoader2 = _interopRequireDefault(_loaderPlaylistLoader);

var _loaderFragmentLoader = require('./loader/fragment-loader');

var _loaderFragmentLoader2 = _interopRequireDefault(_loaderFragmentLoader);

var _controllerAbrController = require('./controller/abr-controller');

var _controllerAbrController2 = _interopRequireDefault(_controllerAbrController);

var _controllerMseMediaController = require('./controller/mse-media-controller');

var _controllerMseMediaController2 = _interopRequireDefault(_controllerMseMediaController);

var _controllerLevelController = require('./controller/level-controller');

var _controllerLevelController2 = _interopRequireDefault(_controllerLevelController);

//import FPSController from './controller/fps-controller';

var _utilsLogger = require('./utils/logger');

var _utilsXhrLoader = require('./utils/xhr-loader');

var _utilsXhrLoader2 = _interopRequireDefault(_utilsXhrLoader);

var _events3 = require('events');

var _events4 = _interopRequireDefault(_events3);

var _loaderKeyLoader = require('./loader/key-loader');

var _loaderKeyLoader2 = _interopRequireDefault(_loaderKeyLoader);

var Hls = (function () {
  _createClass(Hls, null, [{
    key: 'isSupported',
    value: function isSupported() {
      return window.MediaSource && window.MediaSource.isTypeSupported('video/mp4; codecs="avc1.42E01E,mp4a.40.2"');
    }
  }, {
    key: 'Events',
    get: function get() {
      return _events2['default'];
    }
  }, {
    key: 'ErrorTypes',
    get: function get() {
      return _errors.ErrorTypes;
    }
  }, {
    key: 'ErrorDetails',
    get: function get() {
      return _errors.ErrorDetails;
    }
  }]);

  function Hls() {
    var config = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

    _classCallCheck(this, Hls);

    var configDefault = {
      autoStartLoad: true,
      debug: false,
      maxBufferLength: 30,
      maxBufferSize: 60 * 1000 * 1000,
      liveSyncDurationCount: 3,
      liveMaxLatencyDurationCount: Infinity,
      maxMaxBufferLength: 600,
      enableWorker: true,
      enableSoftwareAES: true,
      fragLoadingTimeOut: 20000,
      fragLoadingMaxRetry: 1,
      fragLoadingRetryDelay: 1000,
      fragLoadingLoopThreshold: 3,
      manifestLoadingTimeOut: 10000,
      manifestLoadingMaxRetry: 1,
      manifestLoadingRetryDelay: 1000,
      // fpsDroppedMonitoringPeriod: 5000,
      // fpsDroppedMonitoringThreshold: 0.2,
      appendErrorMaxRetry: 200,
      loader: _utilsXhrLoader2['default'],
      fLoader: undefined,
      pLoader: undefined,
      abrController: _controllerAbrController2['default'],
      mediaController: _controllerMseMediaController2['default']
    };
    for (var prop in configDefault) {
      if (prop in config) {
        continue;
      }
      config[prop] = configDefault[prop];
    }

    if (config.liveMaxLatencyDurationCount !== undefined && config.liveMaxLatencyDurationCount <= config.liveSyncDurationCount) {
      throw new Error('Illegal hls.js config: "liveMaxLatencyDurationCount" must be gt "liveSyncDurationCount"');
    }

    (0, _utilsLogger.enableLogs)(config.debug);
    this.config = config;
    // observer setup
    var observer = this.observer = new _events4['default']();
    observer.trigger = function trigger(event) {
      for (var _len = arguments.length, data = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        data[_key - 1] = arguments[_key];
      }

      observer.emit.apply(observer, [event, event].concat(data));
    };

    observer.off = function off(event) {
      for (var _len2 = arguments.length, data = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
        data[_key2 - 1] = arguments[_key2];
      }

      observer.removeListener.apply(observer, [event].concat(data));
    };
    this.on = observer.on.bind(observer);
    this.off = observer.off.bind(observer);
    this.trigger = observer.trigger.bind(observer);
    this.playlistLoader = new _loaderPlaylistLoader2['default'](this);
    this.fragmentLoader = new _loaderFragmentLoader2['default'](this);
    this.levelController = new _controllerLevelController2['default'](this);
    this.abrController = new config.abrController(this);
    this.mediaController = new config.mediaController(this);
    this.keyLoader = new _loaderKeyLoader2['default'](this);
    //this.fpsController = new FPSController(this);
  }

  _createClass(Hls, [{
    key: 'destroy',
    value: function destroy() {
      _utilsLogger.logger.log('destroy');
      this.trigger(_events2['default'].DESTROYING);
      this.detachMedia();
      this.playlistLoader.destroy();
      this.fragmentLoader.destroy();
      this.levelController.destroy();
      this.mediaController.destroy();
      this.keyLoader.destroy();
      //this.fpsController.destroy();
      this.url = null;
      this.observer.removeAllListeners();
    }
  }, {
    key: 'attachMedia',
    value: function attachMedia(media) {
      _utilsLogger.logger.log('attachMedia');
      this.media = media;
      this.trigger(_events2['default'].MEDIA_ATTACHING, { media: media });
    }
  }, {
    key: 'detachMedia',
    value: function detachMedia() {
      _utilsLogger.logger.log('detachMedia');
      this.trigger(_events2['default'].MEDIA_DETACHING);
      this.media = null;
    }
  }, {
    key: 'loadSource',
    value: function loadSource(url) {
      _utilsLogger.logger.log('loadSource:' + url);
      this.url = url;
      // when attaching to a source URL, trigger a playlist load
      this.trigger(_events2['default'].MANIFEST_LOADING, { url: url });
    }
  }, {
    key: 'startLoad',
    value: function startLoad() {
      _utilsLogger.logger.log('startLoad');
      this.mediaController.startLoad();
    }
  }, {
    key: 'swapAudioCodec',
    value: function swapAudioCodec() {
      _utilsLogger.logger.log('swapAudioCodec');
      this.mediaController.swapAudioCodec();
    }
  }, {
    key: 'recoverMediaError',
    value: function recoverMediaError() {
      _utilsLogger.logger.log('recoverMediaError');
      var media = this.media;
      this.detachMedia();
      this.attachMedia(media);
    }

    /** Return all quality levels **/
  }, {
    key: 'levels',
    get: function get() {
      return this.levelController.levels;
    }

    /** Return current playback quality level **/
  }, {
    key: 'currentLevel',
    get: function get() {
      return this.mediaController.currentLevel;
    },

    /* set quality level immediately (-1 for automatic level selection) */
    set: function set(newLevel) {
      _utilsLogger.logger.log('set currentLevel:' + newLevel);
      this.loadLevel = newLevel;
      this.mediaController.immediateLevelSwitch();
    }

    /** Return next playback quality level (quality level of next fragment) **/
  }, {
    key: 'nextLevel',
    get: function get() {
      return this.mediaController.nextLevel;
    },

    /* set quality level for next fragment (-1 for automatic level selection) */
    set: function set(newLevel) {
      _utilsLogger.logger.log('set nextLevel:' + newLevel);
      this.levelController.manualLevel = newLevel;
      this.mediaController.nextLevelSwitch();
    }

    /** Return the quality level of current/last loaded fragment **/
  }, {
    key: 'loadLevel',
    get: function get() {
      return this.levelController.level;
    },

    /* set quality level for current/next loaded fragment (-1 for automatic level selection) */
    set: function set(newLevel) {
      _utilsLogger.logger.log('set loadLevel:' + newLevel);
      this.levelController.manualLevel = newLevel;
    }

    /** Return the quality level of next loaded fragment **/
  }, {
    key: 'nextLoadLevel',
    get: function get() {
      return this.levelController.nextLoadLevel();
    },

    /** set quality level of next loaded fragment **/
    set: function set(level) {
      this.levelController.level = level;
    }

    /** Return first level (index of first level referenced in manifest)
    **/
  }, {
    key: 'firstLevel',
    get: function get() {
      return this.levelController.firstLevel;
    },

    /** set first level (index of first level referenced in manifest)
    **/
    set: function set(newLevel) {
      _utilsLogger.logger.log('set firstLevel:' + newLevel);
      this.levelController.firstLevel = newLevel;
    }

    /** Return start level (level of first fragment that will be played back)
        if not overrided by user, first level appearing in manifest will be used as start level
        if -1 : automatic start level selection, playback will start from level matching download bandwidth (determined from download of first segment)
    **/
  }, {
    key: 'startLevel',
    get: function get() {
      return this.levelController.startLevel;
    },

    /** set  start level (level of first fragment that will be played back)
        if not overrided by user, first level appearing in manifest will be used as start level
        if -1 : automatic start level selection, playback will start from level matching download bandwidth (determined from download of first segment)
    **/
    set: function set(newLevel) {
      _utilsLogger.logger.log('set startLevel:' + newLevel);
      this.levelController.startLevel = newLevel;
    }

    /** Return the capping/max level value that could be used by automatic level selection algorithm **/
  }, {
    key: 'autoLevelCapping',
    get: function get() {
      return this.abrController.autoLevelCapping;
    },

    /** set the capping/max level value that could be used by automatic level selection algorithm **/
    set: function set(newLevel) {
      _utilsLogger.logger.log('set autoLevelCapping:' + newLevel);
      this.abrController.autoLevelCapping = newLevel;
    }

    /* check if we are in automatic level selection mode */
  }, {
    key: 'autoLevelEnabled',
    get: function get() {
      return this.levelController.manualLevel === -1;
    }

    /* return manual level */
  }, {
    key: 'manualLevel',
    get: function get() {
      return this.levelController.manualLevel;
    }
  }]);

  return Hls;
})();

exports['default'] = Hls;
module.exports = exports['default'];

},{"./controller/abr-controller":3,"./controller/level-controller":4,"./controller/mse-media-controller":5,"./errors":16,"./events":17,"./loader/fragment-loader":20,"./loader/key-loader":21,"./loader/playlist-loader":22,"./utils/logger":26,"./utils/xhr-loader":28,"events":1}],20:[function(require,module,exports){
/*
 * Fragment Loader
*/

'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _events = require('../events');

var _events2 = _interopRequireDefault(_events);

var _errors = require('../errors');

var FragmentLoader = (function () {
  function FragmentLoader(hls) {
    _classCallCheck(this, FragmentLoader);

    this.hls = hls;
    this.onfl = this.onFragLoading.bind(this);
    hls.on(_events2['default'].FRAG_LOADING, this.onfl);
  }

  _createClass(FragmentLoader, [{
    key: 'destroy',
    value: function destroy() {
      if (this.loader) {
        this.loader.destroy();
        this.loader = null;
      }
      this.hls.off(_events2['default'].FRAG_LOADING, this.onfl);
    }
  }, {
    key: 'onFragLoading',
    value: function onFragLoading(event, data) {
      var frag = data.frag;
      this.frag = frag;
      this.frag.loaded = 0;
      var config = this.hls.config;
      frag.loader = this.loader = typeof config.fLoader !== 'undefined' ? new config.fLoader(config) : new config.loader(config);
      this.loader.load(frag.url, 'arraybuffer', this.loadsuccess.bind(this), this.loaderror.bind(this), this.loadtimeout.bind(this), config.fragLoadingTimeOut, config.fragLoadingMaxRetry, config.fragLoadingRetryDelay, this.loadprogress.bind(this), frag);
    }
  }, {
    key: 'loadsuccess',
    value: function loadsuccess(event, stats) {
      var payload = event.currentTarget.response;
      stats.length = payload.byteLength;
      // detach fragment loader on load success
      this.frag.loader = undefined;
      this.hls.trigger(_events2['default'].FRAG_LOADED, { payload: payload, frag: this.frag, stats: stats });
    }
  }, {
    key: 'loaderror',
    value: function loaderror(event) {
      this.loader.abort();
      this.hls.trigger(_events2['default'].ERROR, { type: _errors.ErrorTypes.NETWORK_ERROR, details: _errors.ErrorDetails.FRAG_LOAD_ERROR, fatal: false, frag: this.frag, response: event });
    }
  }, {
    key: 'loadtimeout',
    value: function loadtimeout() {
      this.loader.abort();
      this.hls.trigger(_events2['default'].ERROR, { type: _errors.ErrorTypes.NETWORK_ERROR, details: _errors.ErrorDetails.FRAG_LOAD_TIMEOUT, fatal: false, frag: this.frag });
    }
  }, {
    key: 'loadprogress',
    value: function loadprogress(event, stats) {
      this.frag.loaded = stats.loaded;
      this.hls.trigger(_events2['default'].FRAG_LOAD_PROGRESS, { frag: this.frag, stats: stats });
    }
  }]);

  return FragmentLoader;
})();

exports['default'] = FragmentLoader;
module.exports = exports['default'];

},{"../errors":16,"../events":17}],21:[function(require,module,exports){
/*
 * Decrypt key Loader
*/

'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _events = require('../events');

var _events2 = _interopRequireDefault(_events);

var _errors = require('../errors');

var KeyLoader = (function () {
  function KeyLoader(hls) {
    _classCallCheck(this, KeyLoader);

    this.hls = hls;
    this.decryptkey = null;
    this.decrypturl = null;
    this.ondkl = this.onDecryptKeyLoading.bind(this);
    hls.on(_events2['default'].KEY_LOADING, this.ondkl);
  }

  _createClass(KeyLoader, [{
    key: 'destroy',
    value: function destroy() {
      if (this.loader) {
        this.loader.destroy();
        this.loader = null;
      }
      this.hls.off(_events2['default'].KEY_LOADING, this.ondkl);
    }
  }, {
    key: 'onDecryptKeyLoading',
    value: function onDecryptKeyLoading(event, data) {
      var frag = this.frag = data.frag,
          decryptdata = frag.decryptdata,
          uri = decryptdata.uri;
      // if uri is different from previous one or if decrypt key not retrieved yet
      if (uri !== this.decrypturl || this.decryptkey === null) {
        var config = this.hls.config;
        frag.loader = this.loader = new config.loader(config);
        this.decrypturl = uri;
        this.decryptkey = null;
        frag.loader.load(uri, 'arraybuffer', this.loadsuccess.bind(this), this.loaderror.bind(this), this.loadtimeout.bind(this), config.fragLoadingTimeOut, config.fragLoadingMaxRetry, config.fragLoadingRetryDelay, this.loadprogress.bind(this), frag);
      } else if (this.decryptkey) {
        // we already loaded this key, return it
        decryptdata.key = this.decryptkey;
        this.hls.trigger(_events2['default'].KEY_LOADED, { frag: frag });
      }
    }
  }, {
    key: 'loadsuccess',
    value: function loadsuccess(event) {
      var frag = this.frag;
      this.decryptkey = frag.decryptdata.key = new Uint8Array(event.currentTarget.response);
      // detach fragment loader on load success
      frag.loader = undefined;
      this.hls.trigger(_events2['default'].KEY_LOADED, { frag: frag });
    }
  }, {
    key: 'loaderror',
    value: function loaderror(event) {
      this.loader.abort();
      this.hls.trigger(_events2['default'].ERROR, { type: _errors.ErrorTypes.NETWORK_ERROR, details: _errors.ErrorDetails.KEY_LOAD_ERROR, fatal: false, frag: this.frag, response: event });
    }
  }, {
    key: 'loadtimeout',
    value: function loadtimeout() {
      this.loader.abort();
      this.hls.trigger(_events2['default'].ERROR, { type: _errors.ErrorTypes.NETWORK_ERROR, details: _errors.ErrorDetails.KEY_LOAD_TIMEOUT, fatal: false, frag: this.frag });
    }
  }, {
    key: 'loadprogress',
    value: function loadprogress() {}
  }]);

  return KeyLoader;
})();

exports['default'] = KeyLoader;
module.exports = exports['default'];

},{"../errors":16,"../events":17}],22:[function(require,module,exports){
/**
 * Playlist Loader
*/

'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _events = require('../events');

var _events2 = _interopRequireDefault(_events);

var _errors = require('../errors');

var _utilsUrl = require('../utils/url');

var _utilsUrl2 = _interopRequireDefault(_utilsUrl);

//import {logger} from '../utils/logger';

var PlaylistLoader = (function () {
  function PlaylistLoader(hls) {
    _classCallCheck(this, PlaylistLoader);

    this.hls = hls;
    this.onml = this.onManifestLoading.bind(this);
    this.onll = this.onLevelLoading.bind(this);
    hls.on(_events2['default'].MANIFEST_LOADING, this.onml);
    hls.on(_events2['default'].LEVEL_LOADING, this.onll);
  }

  _createClass(PlaylistLoader, [{
    key: 'destroy',
    value: function destroy() {
      if (this.loader) {
        this.loader.destroy();
        this.loader = null;
      }
      this.url = this.id = null;
      this.hls.off(_events2['default'].MANIFEST_LOADING, this.onml);
      this.hls.off(_events2['default'].LEVEL_LOADING, this.onll);
    }
  }, {
    key: 'onManifestLoading',
    value: function onManifestLoading(event, data) {
      this.load(data.url, null);
    }
  }, {
    key: 'onLevelLoading',
    value: function onLevelLoading(event, data) {
      this.load(data.url, data.level, data.id);
    }
  }, {
    key: 'load',
    value: function load(url, id1, id2) {
      var config = this.hls.config;
      this.url = url;
      this.id = id1;
      this.id2 = id2;
      this.loader = typeof config.pLoader !== 'undefined' ? new config.pLoader(config) : new config.loader(config);
      this.loader.load(url, '', this.loadsuccess.bind(this), this.loaderror.bind(this), this.loadtimeout.bind(this), config.manifestLoadingTimeOut, config.manifestLoadingMaxRetry, config.manifestLoadingRetryDelay);
    }
  }, {
    key: 'resolve',
    value: function resolve(url, baseUrl) {
      return _utilsUrl2['default'].buildAbsoluteURL(baseUrl, url);
    }
  }, {
    key: 'parseMasterPlaylist',
    value: function parseMasterPlaylist(string, baseurl) {
      var levels = [],
          level = {},
          result,
          codecs,
          codec;
      // https://regex101.com is your friend
      var re = /#EXT-X-STREAM-INF:([^\n\r]*(BAND)WIDTH=(\d+))?([^\n\r]*(CODECS)=\"([^\"\n\r]*)\",?)?([^\n\r]*(RES)OLUTION=(\d+)x(\d+))?([^\n\r]*(NAME)=\"(.*)\")?[^\n\r]*[\r\n]+([^\r\n]+)/g;
      while ((result = re.exec(string)) != null) {
        result.shift();
        result = result.filter(function (n) {
          return n !== undefined;
        });
        level.url = this.resolve(result.pop(), baseurl);
        while (result.length > 0) {
          switch (result.shift()) {
            case 'RES':
              level.width = parseInt(result.shift());
              level.height = parseInt(result.shift());
              break;
            case 'BAND':
              level.bitrate = parseInt(result.shift());
              break;
            case 'NAME':
              level.name = result.shift();
              break;
            case 'CODECS':
              codecs = result.shift().split(',');
              while (codecs.length > 0) {
                codec = codecs.shift();
                if (codec.indexOf('avc1') !== -1) {
                  level.videoCodec = this.avc1toavcoti(codec);
                } else {
                  level.audioCodec = codec;
                }
              }
              break;
            default:
              break;
          }
        }
        levels.push(level);
        level = {};
      }
      return levels;
    }
  }, {
    key: 'avc1toavcoti',
    value: function avc1toavcoti(codec) {
      var result,
          avcdata = codec.split('.');
      if (avcdata.length > 2) {
        result = avcdata.shift() + '.';
        result += parseInt(avcdata.shift()).toString(16);
        result += ('00' + parseInt(avcdata.shift()).toString(16)).substr(-4);
      } else {
        result = codec;
      }
      return result;
    }
  }, {
    key: 'parseKeyParamsByRegex',
    value: function parseKeyParamsByRegex(string, regexp) {
      var result = regexp.exec(string);
      if (result) {
        result.shift();
        result = result.filter(function (n) {
          return n !== undefined;
        });
        if (result.length === 2) {
          return result[1];
        }
      }
      return null;
    }
  }, {
    key: 'cloneObj',
    value: function cloneObj(obj) {
      return JSON.parse(JSON.stringify(obj));
    }
  }, {
    key: 'parseLevelPlaylist',
    value: function parseLevelPlaylist(string, baseurl, id) {
      var currentSN = 0,
          totalduration = 0,
          level = { url: baseurl, fragments: [], live: true, startSN: 0 },
          result,
          regexp,
          cc = 0,
          frag,
          byteRangeEndOffset,
          byteRangeStartOffset;
      var levelkey = { method: null, key: null, iv: null, uri: null };
      regexp = /(?:#EXT-X-(MEDIA-SEQUENCE):(\d+))|(?:#EXT-X-(TARGETDURATION):(\d+))|(?:#EXT-X-(KEY):(.*))|(?:#EXT(INF):([\d\.]+)[^\r\n]*([\r\n]+[^#|\r\n]+)?)|(?:#EXT-X-(BYTERANGE):([\d]+[@[\d]*)]*[\r\n]+([^#|\r\n]+)?|(?:#EXT-X-(ENDLIST))|(?:#EXT-X-(DIS)CONTINUITY))/g;
      while ((result = regexp.exec(string)) !== null) {
        result.shift();
        result = result.filter(function (n) {
          return n !== undefined;
        });
        switch (result[0]) {
          case 'MEDIA-SEQUENCE':
            currentSN = level.startSN = parseInt(result[1]);
            break;
          case 'TARGETDURATION':
            level.targetduration = parseFloat(result[1]);
            break;
          case 'ENDLIST':
            level.live = false;
            break;
          case 'DIS':
            cc++;
            break;
          case 'BYTERANGE':
            var params = result[1].split('@');
            if (params.length === 1) {
              byteRangeStartOffset = byteRangeEndOffset;
            } else {
              byteRangeStartOffset = parseInt(params[1]);
            }
            byteRangeEndOffset = parseInt(params[0]) + byteRangeStartOffset;
            frag = level.fragments.length ? level.fragments[level.fragments.length - 1] : null;
            if (frag && !frag.url) {
              frag.byteRangeStartOffset = byteRangeStartOffset;
              frag.byteRangeEndOffset = byteRangeEndOffset;
              frag.url = this.resolve(result[2], baseurl);
            }
            break;
          case 'INF':
            var duration = parseFloat(result[1]);
            if (!isNaN(duration)) {
              var fragdecryptdata,
                  sn = currentSN++;
              if (levelkey.method && levelkey.uri && !levelkey.iv) {
                fragdecryptdata = this.cloneObj(levelkey);
                var uint8View = new Uint8Array(16);
                for (var i = 12; i < 16; i++) {
                  uint8View[i] = sn >> 8 * (15 - i) & 0xff;
                }
                fragdecryptdata.iv = uint8View;
              } else {
                fragdecryptdata = levelkey;
              }
              level.fragments.push({ url: result[2] ? this.resolve(result[2], baseurl) : null, duration: duration, start: totalduration, sn: sn, level: id, cc: cc, byteRangeStartOffset: byteRangeStartOffset, byteRangeEndOffset: byteRangeEndOffset, decryptdata: fragdecryptdata });
              totalduration += duration;
              byteRangeStartOffset = null;
            }
            break;
          case 'KEY':
            // https://tools.ietf.org/html/draft-pantos-http-live-streaming-08#section-3.4.4
            var decryptparams = result[1];
            var decryptmethod = this.parseKeyParamsByRegex(decryptparams, /(METHOD)=([^,]*)/),
                decrypturi = this.parseKeyParamsByRegex(decryptparams, /(URI)=["]([^,]*)["]/),
                decryptiv = this.parseKeyParamsByRegex(decryptparams, /(IV)=([^,]*)/);
            if (decryptmethod) {
              levelkey = { method: null, key: null, iv: null, uri: null };
              if (decrypturi && decryptmethod === 'AES-128') {
                levelkey.method = decryptmethod;
                // URI to get the key
                levelkey.uri = this.resolve(decrypturi, baseurl);
                levelkey.key = null;
                // Initialization Vector (IV)
                if (decryptiv) {
                  levelkey.iv = decryptiv;
                  if (levelkey.iv.substring(0, 2) === '0x') {
                    levelkey.iv = levelkey.iv.substring(2);
                  }
                  levelkey.iv = levelkey.iv.match(/.{8}/g);
                  levelkey.iv[0] = parseInt(levelkey.iv[0], 16);
                  levelkey.iv[1] = parseInt(levelkey.iv[1], 16);
                  levelkey.iv[2] = parseInt(levelkey.iv[2], 16);
                  levelkey.iv[3] = parseInt(levelkey.iv[3], 16);
                  levelkey.iv = new Uint32Array(levelkey.iv);
                }
              }
            }
            break;
          default:
            break;
        }
      }
      //logger.log('found ' + level.fragments.length + ' fragments');
      level.totalduration = totalduration;
      level.endSN = currentSN - 1;
      return level;
    }
  }, {
    key: 'loadsuccess',
    value: function loadsuccess(event, stats) {
      var string = event.currentTarget.responseText,
          url = event.currentTarget.responseURL,
          id = this.id,
          id2 = this.id2,
          hls = this.hls,
          levels;
      // responseURL not supported on some browsers (it is used to detect URL redirection)
      if (url === undefined) {
        // fallback to initial URL
        url = this.url;
      }
      stats.tload = performance.now();
      stats.mtime = new Date(event.currentTarget.getResponseHeader('Last-Modified'));
      if (string.indexOf('#EXTM3U') === 0) {
        if (string.indexOf('#EXTINF:') > 0) {
          // 1 level playlist
          // if first request, fire manifest loaded event, level will be reloaded afterwards
          // (this is to have a uniform logic for 1 level/multilevel playlists)
          if (this.id === null) {
            hls.trigger(_events2['default'].MANIFEST_LOADED, { levels: [{ url: url }], url: url, stats: stats });
          } else {
            var levelDetails = this.parseLevelPlaylist(string, url, id);
            stats.tparsed = performance.now();
            hls.trigger(_events2['default'].LEVEL_LOADED, { details: levelDetails, level: id, id: id2, stats: stats });
          }
        } else {
          levels = this.parseMasterPlaylist(string, url);
          // multi level playlist, parse level info
          if (levels.length) {
            hls.trigger(_events2['default'].MANIFEST_LOADED, { levels: levels, url: url, stats: stats });
          } else {
            hls.trigger(_events2['default'].ERROR, { type: _errors.ErrorTypes.NETWORK_ERROR, details: _errors.ErrorDetails.MANIFEST_PARSING_ERROR, fatal: true, url: url, reason: 'no level found in manifest' });
          }
        }
      } else {
        hls.trigger(_events2['default'].ERROR, { type: _errors.ErrorTypes.NETWORK_ERROR, details: _errors.ErrorDetails.MANIFEST_PARSING_ERROR, fatal: true, url: url, reason: 'no EXTM3U delimiter' });
      }
    }
  }, {
    key: 'loaderror',
    value: function loaderror(event) {
      var details, fatal;
      if (this.id === null) {
        details = _errors.ErrorDetails.MANIFEST_LOAD_ERROR;
        fatal = true;
      } else {
        details = _errors.ErrorDetails.LEVEL_LOAD_ERROR;
        fatal = false;
      }
      this.loader.abort();
      this.hls.trigger(_events2['default'].ERROR, { type: _errors.ErrorTypes.NETWORK_ERROR, details: details, fatal: fatal, url: this.url, loader: this.loader, response: event.currentTarget, level: this.id, id: this.id2 });
    }
  }, {
    key: 'loadtimeout',
    value: function loadtimeout() {
      var details, fatal;
      if (this.id === null) {
        details = _errors.ErrorDetails.MANIFEST_LOAD_TIMEOUT;
        fatal = true;
      } else {
        details = _errors.ErrorDetails.LEVEL_LOAD_TIMEOUT;
        fatal = false;
      }
      this.loader.abort();
      this.hls.trigger(_events2['default'].ERROR, { type: _errors.ErrorTypes.NETWORK_ERROR, details: details, fatal: fatal, url: this.url, loader: this.loader, level: this.id, id: this.id2 });
    }
  }]);

  return PlaylistLoader;
})();

exports['default'] = PlaylistLoader;
module.exports = exports['default'];

},{"../errors":16,"../events":17,"../utils/url":27}],23:[function(require,module,exports){
/**
 * Generate MP4 Box
*/

//import Hex from '../utils/hex';
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var MP4 = (function () {
  function MP4() {
    _classCallCheck(this, MP4);
  }

  _createClass(MP4, null, [{
    key: 'init',
    value: function init() {
      MP4.types = {
        avc1: [], // codingname
        avcC: [],
        btrt: [],
        dinf: [],
        dref: [],
        esds: [],
        ftyp: [],
        hdlr: [],
        mdat: [],
        mdhd: [],
        mdia: [],
        mfhd: [],
        minf: [],
        moof: [],
        moov: [],
        mp4a: [],
        mvex: [],
        mvhd: [],
        sdtp: [],
        stbl: [],
        stco: [],
        stsc: [],
        stsd: [],
        stsz: [],
        stts: [],
        tfdt: [],
        tfhd: [],
        traf: [],
        trak: [],
        trun: [],
        trex: [],
        tkhd: [],
        vmhd: [],
        smhd: []
      };

      var i;
      for (i in MP4.types) {
        if (MP4.types.hasOwnProperty(i)) {
          MP4.types[i] = [i.charCodeAt(0), i.charCodeAt(1), i.charCodeAt(2), i.charCodeAt(3)];
        }
      }

      MP4.MAJOR_BRAND = new Uint8Array(['i'.charCodeAt(0), 's'.charCodeAt(0), 'o'.charCodeAt(0), 'm'.charCodeAt(0)]);

      MP4.AVC1_BRAND = new Uint8Array(['a'.charCodeAt(0), 'v'.charCodeAt(0), 'c'.charCodeAt(0), '1'.charCodeAt(0)]);

      MP4.MINOR_VERSION = new Uint8Array([0, 0, 0, 1]);

      MP4.VIDEO_HDLR = new Uint8Array([0x00, // version 0
      0x00, 0x00, 0x00, // flags
      0x00, 0x00, 0x00, 0x00, // pre_defined
      0x76, 0x69, 0x64, 0x65, // handler_type: 'vide'
      0x00, 0x00, 0x00, 0x00, // reserved
      0x00, 0x00, 0x00, 0x00, // reserved
      0x00, 0x00, 0x00, 0x00, // reserved
      0x56, 0x69, 0x64, 0x65, 0x6f, 0x48, 0x61, 0x6e, 0x64, 0x6c, 0x65, 0x72, 0x00 // name: 'VideoHandler'
      ]);

      MP4.AUDIO_HDLR = new Uint8Array([0x00, // version 0
      0x00, 0x00, 0x00, // flags
      0x00, 0x00, 0x00, 0x00, // pre_defined
      0x73, 0x6f, 0x75, 0x6e, // handler_type: 'soun'
      0x00, 0x00, 0x00, 0x00, // reserved
      0x00, 0x00, 0x00, 0x00, // reserved
      0x00, 0x00, 0x00, 0x00, // reserved
      0x53, 0x6f, 0x75, 0x6e, 0x64, 0x48, 0x61, 0x6e, 0x64, 0x6c, 0x65, 0x72, 0x00 // name: 'SoundHandler'
      ]);

      MP4.HDLR_TYPES = {
        'video': MP4.VIDEO_HDLR,
        'audio': MP4.AUDIO_HDLR
      };

      MP4.DREF = new Uint8Array([0x00, // version 0
      0x00, 0x00, 0x00, // flags
      0x00, 0x00, 0x00, 0x01, // entry_count
      0x00, 0x00, 0x00, 0x0c, // entry_size
      0x75, 0x72, 0x6c, 0x20, // 'url' type
      0x00, // version 0
      0x00, 0x00, 0x01 // entry_flags
      ]);
      MP4.STCO = new Uint8Array([0x00, // version
      0x00, 0x00, 0x00, // flags
      0x00, 0x00, 0x00, 0x00 // entry_count
      ]);
      MP4.STSC = MP4.STCO;
      MP4.STTS = MP4.STCO;
      MP4.STSZ = new Uint8Array([0x00, // version
      0x00, 0x00, 0x00, // flags
      0x00, 0x00, 0x00, 0x00, // sample_size
      0x00, 0x00, 0x00, 0x00]);
      // sample_count
      MP4.VMHD = new Uint8Array([0x00, // version
      0x00, 0x00, 0x01, // flags
      0x00, 0x00, // graphicsmode
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00 // opcolor
      ]);
      MP4.SMHD = new Uint8Array([0x00, // version
      0x00, 0x00, 0x00, // flags
      0x00, 0x00, // balance
      0x00, 0x00 // reserved
      ]);

      MP4.STSD = new Uint8Array([0x00, // version 0
      0x00, 0x00, 0x00, // flags
      0x00, 0x00, 0x00, 0x01]); // entry_count

      MP4.FTYP = MP4.box(MP4.types.ftyp, MP4.MAJOR_BRAND, MP4.MINOR_VERSION, MP4.MAJOR_BRAND, MP4.AVC1_BRAND);
      MP4.DINF = MP4.box(MP4.types.dinf, MP4.box(MP4.types.dref, MP4.DREF));
    }
  }, {
    key: 'box',
    value: function box(type) {
      var payload = Array.prototype.slice.call(arguments, 1),
          size = 0,
          i = payload.length,
          result,
          view;
      // calculate the total size we need to allocate
      while (i--) {
        size += payload[i].byteLength;
      }
      result = new Uint8Array(size + 8);
      view = new DataView(result.buffer);
      view.setUint32(0, result.byteLength);
      result.set(type, 4);
      // copy the payload into the result
      for (i = 0, size = 8; i < payload.length; i++) {
        result.set(payload[i], size);
        size += payload[i].byteLength;
      }
      return result;
    }
  }, {
    key: 'hdlr',
    value: function hdlr(type) {
      return MP4.box(MP4.types.hdlr, MP4.HDLR_TYPES[type]);
    }
  }, {
    key: 'mdat',
    value: function mdat(data) {
      return MP4.box(MP4.types.mdat, data);
    }
  }, {
    key: 'mdhd',
    value: function mdhd(timescale, duration) {
      return MP4.box(MP4.types.mdhd, new Uint8Array([0x00, // version 0
      0x00, 0x00, 0x00, // flags
      0x00, 0x00, 0x00, 0x02, // creation_time
      0x00, 0x00, 0x00, 0x03, // modification_time
      timescale >> 24 & 0xFF, timescale >> 16 & 0xFF, timescale >> 8 & 0xFF, timescale & 0xFF, // timescale
      duration >> 24, duration >> 16 & 0xFF, duration >> 8 & 0xFF, duration & 0xFF, // duration
      0x55, 0xc4, // 'und' language (undetermined)
      0x00, 0x00]));
    }
  }, {
    key: 'mdia',
    value: function mdia(track) {
      return MP4.box(MP4.types.mdia, MP4.mdhd(track.timescale, track.duration), MP4.hdlr(track.type), MP4.minf(track));
    }
  }, {
    key: 'mfhd',
    value: function mfhd(sequenceNumber) {
      return MP4.box(MP4.types.mfhd, new Uint8Array([0x00, 0x00, 0x00, 0x00, // flags
      sequenceNumber >> 24, sequenceNumber >> 16 & 0xFF, sequenceNumber >> 8 & 0xFF, sequenceNumber & 0xFF]));
    }
  }, {
    key: 'minf',
    // sequence_number
    value: function minf(track) {
      if (track.type === 'audio') {
        return MP4.box(MP4.types.minf, MP4.box(MP4.types.smhd, MP4.SMHD), MP4.DINF, MP4.stbl(track));
      } else {
        return MP4.box(MP4.types.minf, MP4.box(MP4.types.vmhd, MP4.VMHD), MP4.DINF, MP4.stbl(track));
      }
    }
  }, {
    key: 'moof',
    value: function moof(sn, baseMediaDecodeTime, track) {
      return MP4.box(MP4.types.moof, MP4.mfhd(sn), MP4.traf(track, baseMediaDecodeTime));
    }

    /**
     * @param tracks... (optional) {array} the tracks associated with this movie
     */
  }, {
    key: 'moov',
    value: function moov(tracks) {
      var i = tracks.length,
          boxes = [];

      while (i--) {
        boxes[i] = MP4.trak(tracks[i]);
      }

      return MP4.box.apply(null, [MP4.types.moov, MP4.mvhd(tracks[0].timescale, tracks[0].duration)].concat(boxes).concat(MP4.mvex(tracks)));
    }
  }, {
    key: 'mvex',
    value: function mvex(tracks) {
      var i = tracks.length,
          boxes = [];

      while (i--) {
        boxes[i] = MP4.trex(tracks[i]);
      }
      return MP4.box.apply(null, [MP4.types.mvex].concat(boxes));
    }
  }, {
    key: 'mvhd',
    value: function mvhd(timescale, duration) {
      var bytes = new Uint8Array([0x00, // version 0
      0x00, 0x00, 0x00, // flags
      0x00, 0x00, 0x00, 0x01, // creation_time
      0x00, 0x00, 0x00, 0x02, // modification_time
      timescale >> 24 & 0xFF, timescale >> 16 & 0xFF, timescale >> 8 & 0xFF, timescale & 0xFF, // timescale
      duration >> 24 & 0xFF, duration >> 16 & 0xFF, duration >> 8 & 0xFF, duration & 0xFF, // duration
      0x00, 0x01, 0x00, 0x00, // 1.0 rate
      0x01, 0x00, // 1.0 volume
      0x00, 0x00, // reserved
      0x00, 0x00, 0x00, 0x00, // reserved
      0x00, 0x00, 0x00, 0x00, // reserved
      0x00, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x40, 0x00, 0x00, 0x00, // transformation: unity matrix
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, // pre_defined
      0xff, 0xff, 0xff, 0xff // next_track_ID
      ]);
      return MP4.box(MP4.types.mvhd, bytes);
    }
  }, {
    key: 'sdtp',
    value: function sdtp(track) {
      var samples = track.samples || [],
          bytes = new Uint8Array(4 + samples.length),
          flags,
          i;
      // leave the full box header (4 bytes) all zero
      // write the sample table
      for (i = 0; i < samples.length; i++) {
        flags = samples[i].flags;
        bytes[i + 4] = flags.dependsOn << 4 | flags.isDependedOn << 2 | flags.hasRedundancy;
      }

      return MP4.box(MP4.types.sdtp, bytes);
    }
  }, {
    key: 'stbl',
    value: function stbl(track) {
      return MP4.box(MP4.types.stbl, MP4.stsd(track), MP4.box(MP4.types.stts, MP4.STTS), MP4.box(MP4.types.stsc, MP4.STSC), MP4.box(MP4.types.stsz, MP4.STSZ), MP4.box(MP4.types.stco, MP4.STCO));
    }
  }, {
    key: 'avc1',
    value: function avc1(track) {
      var sps = [],
          pps = [],
          i,
          data,
          len;
      // assemble the SPSs

      for (i = 0; i < track.sps.length; i++) {
        data = track.sps[i];
        len = data.byteLength;
        sps.push(len >>> 8 & 0xFF);
        sps.push(len & 0xFF);
        sps = sps.concat(Array.prototype.slice.call(data)); // SPS
      }

      // assemble the PPSs
      for (i = 0; i < track.pps.length; i++) {
        data = track.pps[i];
        len = data.byteLength;
        pps.push(len >>> 8 & 0xFF);
        pps.push(len & 0xFF);
        pps = pps.concat(Array.prototype.slice.call(data));
      }

      var avcc = MP4.box(MP4.types.avcC, new Uint8Array([0x01, // version
      sps[3], // profile
      sps[4], // profile compat
      sps[5], // level
      0xfc | 3, // lengthSizeMinusOne, hard-coded to 4 bytes
      0xE0 | track.sps.length // 3bit reserved (111) + numOfSequenceParameterSets
      ].concat(sps).concat([track.pps.length // numOfPictureParameterSets
      ]).concat(pps))); // "PPS"
      //console.log('avcc:' + Hex.hexDump(avcc));
      return MP4.box(MP4.types.avc1, new Uint8Array([0x00, 0x00, 0x00, // reserved
      0x00, 0x00, 0x00, // reserved
      0x00, 0x01, // data_reference_index
      0x00, 0x00, // pre_defined
      0x00, 0x00, // reserved
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, // pre_defined
      track.width >> 8 & 0xFF, track.width & 0xff, // width
      track.height >> 8 & 0xFF, track.height & 0xff, // height
      0x00, 0x48, 0x00, 0x00, // horizresolution
      0x00, 0x48, 0x00, 0x00, // vertresolution
      0x00, 0x00, 0x00, 0x00, // reserved
      0x00, 0x01, // frame_count
      0x13, 0x76, 0x69, 0x64, 0x65, 0x6f, 0x6a, 0x73, 0x2d, 0x63, 0x6f, 0x6e, 0x74, 0x72, 0x69, 0x62, 0x2d, 0x68, 0x6c, 0x73, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, // compressorname
      0x00, 0x18, // depth = 24
      0x11, 0x11]), // pre_defined = -1
      avcc, MP4.box(MP4.types.btrt, new Uint8Array([0x00, 0x1c, 0x9c, 0x80, // bufferSizeDB
      0x00, 0x2d, 0xc6, 0xc0, // maxBitrate
      0x00, 0x2d, 0xc6, 0xc0])) // avgBitrate
      );
    }
  }, {
    key: 'esds',
    value: function esds(track) {
      return new Uint8Array([0x00, // version 0
      0x00, 0x00, 0x00, // flags

      0x03, // descriptor_type
      0x17 + track.config.length, // length
      0x00, 0x01, //es_id
      0x00, // stream_priority

      0x04, // descriptor_type
      0x0f + track.config.length, // length
      0x40, //codec : mpeg4_audio
      0x15, // stream_type
      0x00, 0x00, 0x00, // buffer_size
      0x00, 0x00, 0x00, 0x00, // maxBitrate
      0x00, 0x00, 0x00, 0x00, // avgBitrate

      0x05 // descriptor_type
      ].concat([track.config.length]).concat(track.config).concat([0x06, 0x01, 0x02])); // GASpecificConfig)); // length + audio config descriptor
    }
  }, {
    key: 'mp4a',
    value: function mp4a(track) {
      return MP4.box(MP4.types.mp4a, new Uint8Array([0x00, 0x00, 0x00, // reserved
      0x00, 0x00, 0x00, // reserved
      0x00, 0x01, // data_reference_index
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, // reserved
      0x00, track.channelCount, // channelcount
      0x00, 0x10, // sampleSize:16bits
      0x00, 0x00, 0x00, 0x00, // reserved2
      track.audiosamplerate >> 8 & 0xFF, track.audiosamplerate & 0xff, //
      0x00, 0x00]), MP4.box(MP4.types.esds, MP4.esds(track)));
    }
  }, {
    key: 'stsd',
    value: function stsd(track) {
      if (track.type === 'audio') {
        return MP4.box(MP4.types.stsd, MP4.STSD, MP4.mp4a(track));
      } else {
        return MP4.box(MP4.types.stsd, MP4.STSD, MP4.avc1(track));
      }
    }
  }, {
    key: 'tkhd',
    value: function tkhd(track) {
      return MP4.box(MP4.types.tkhd, new Uint8Array([0x00, // version 0
      0x00, 0x00, 0x07, // flags
      0x00, 0x00, 0x00, 0x00, // creation_time
      0x00, 0x00, 0x00, 0x00, // modification_time
      track.id >> 24 & 0xFF, track.id >> 16 & 0xFF, track.id >> 8 & 0xFF, track.id & 0xFF, // track_ID
      0x00, 0x00, 0x00, 0x00, // reserved
      track.duration >> 24, track.duration >> 16 & 0xFF, track.duration >> 8 & 0xFF, track.duration & 0xFF, // duration
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, // reserved
      0x00, 0x00, // layer
      0x00, 0x00, // alternate_group
      0x00, 0x00, // non-audio track volume
      0x00, 0x00, // reserved
      0x00, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x40, 0x00, 0x00, 0x00, // transformation: unity matrix
      track.width >> 8 & 0xFF, track.width & 0xFF, 0x00, 0x00, // width
      track.height >> 8 & 0xFF, track.height & 0xFF, 0x00, 0x00 // height
      ]));
    }
  }, {
    key: 'traf',
    value: function traf(track, baseMediaDecodeTime) {
      var sampleDependencyTable = MP4.sdtp(track);
      return MP4.box(MP4.types.traf, MP4.box(MP4.types.tfhd, new Uint8Array([0x00, // version 0
      0x00, 0x00, 0x00, // flags
      track.id >> 24, track.id >> 16 & 0XFF, track.id >> 8 & 0XFF, track.id & 0xFF])), // track_ID
      MP4.box(MP4.types.tfdt, new Uint8Array([0x00, // version 0
      0x00, 0x00, 0x00, // flags
      baseMediaDecodeTime >> 24, baseMediaDecodeTime >> 16 & 0XFF, baseMediaDecodeTime >> 8 & 0XFF, baseMediaDecodeTime & 0xFF])), // baseMediaDecodeTime
      MP4.trun(track, sampleDependencyTable.length + 16 + // tfhd
      16 + // tfdt
      8 + // traf header
      16 + // mfhd
      8 + // moof header
      8), // mdat header
      sampleDependencyTable);
    }

    /**
     * Generate a track box.
     * @param track {object} a track definition
     * @return {Uint8Array} the track box
     */
  }, {
    key: 'trak',
    value: function trak(track) {
      track.duration = track.duration || 0xffffffff;
      return MP4.box(MP4.types.trak, MP4.tkhd(track), MP4.mdia(track));
    }
  }, {
    key: 'trex',
    value: function trex(track) {
      return MP4.box(MP4.types.trex, new Uint8Array([0x00, // version 0
      0x00, 0x00, 0x00, // flags
      track.id >> 24, track.id >> 16 & 0XFF, track.id >> 8 & 0XFF, track.id & 0xFF, // track_ID
      0x00, 0x00, 0x00, 0x01, // default_sample_description_index
      0x00, 0x00, 0x00, 0x00, // default_sample_duration
      0x00, 0x00, 0x00, 0x00, // default_sample_size
      0x00, 0x01, 0x00, 0x01 // default_sample_flags
      ]));
    }
  }, {
    key: 'trun',
    value: function trun(track, offset) {
      var samples, sample, i, array;
      samples = track.samples || [];
      array = new Uint8Array(12 + 16 * samples.length);
      offset += 8 + array.byteLength;
      array.set([0x00, // version 0
      0x00, 0x0f, 0x01, // flags
      samples.length >>> 24 & 0xFF, samples.length >>> 16 & 0xFF, samples.length >>> 8 & 0xFF, samples.length & 0xFF, // sample_count
      offset >>> 24 & 0xFF, offset >>> 16 & 0xFF, offset >>> 8 & 0xFF, offset & 0xFF // data_offset
      ], 0);
      for (i = 0; i < samples.length; i++) {
        sample = samples[i];
        array.set([sample.duration >>> 24 & 0xFF, sample.duration >>> 16 & 0xFF, sample.duration >>> 8 & 0xFF, sample.duration & 0xFF, // sample_duration
        sample.size >>> 24 & 0xFF, sample.size >>> 16 & 0xFF, sample.size >>> 8 & 0xFF, sample.size & 0xFF, // sample_size
        sample.flags.isLeading << 2 | sample.flags.dependsOn, sample.flags.isDependedOn << 6 | sample.flags.hasRedundancy << 4 | sample.flags.paddingValue << 1 | sample.flags.isNonSync, sample.flags.degradPrio & 0xF0 << 8, sample.flags.degradPrio & 0x0F, // sample_flags
        sample.cts >>> 24 & 0xFF, sample.cts >>> 16 & 0xFF, sample.cts >>> 8 & 0xFF, sample.cts & 0xFF // sample_composition_time_offset
        ], 12 + 16 * i);
      }
      return MP4.box(MP4.types.trun, array);
    }
  }, {
    key: 'initSegment',
    value: function initSegment(tracks) {
      if (!MP4.types) {
        MP4.init();
      }
      var movie = MP4.moov(tracks),
          result;
      result = new Uint8Array(MP4.FTYP.byteLength + movie.byteLength);
      result.set(MP4.FTYP);
      result.set(movie, MP4.FTYP.byteLength);
      return result;
    }
  }]);

  return MP4;
})();

exports['default'] = MP4;
module.exports = exports['default'];

},{}],24:[function(require,module,exports){
/**
 * fMP4 remuxer
*/

'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _events = require('../events');

var _events2 = _interopRequireDefault(_events);

var _utilsLogger = require('../utils/logger');

var _remuxMp4Generator = require('../remux/mp4-generator');

var _remuxMp4Generator2 = _interopRequireDefault(_remuxMp4Generator);

var _errors = require('../errors');

var MP4Remuxer = (function () {
  function MP4Remuxer(observer) {
    _classCallCheck(this, MP4Remuxer);

    this.observer = observer;
    this.ISGenerated = false;
    this.PES2MP4SCALEFACTOR = 4;
    this.PES_TIMESCALE = 90000;
    this.MP4_TIMESCALE = this.PES_TIMESCALE / this.PES2MP4SCALEFACTOR;
  }

  _createClass(MP4Remuxer, [{
    key: 'destroy',
    value: function destroy() {}
  }, {
    key: 'insertDiscontinuity',
    value: function insertDiscontinuity() {
      this._initPTS = this._initDTS = this.nextAacPts = this.nextAvcDts = undefined;
    }
  }, {
    key: 'switchLevel',
    value: function switchLevel() {
      this.ISGenerated = false;
    }
  }, {
    key: 'remux',
    value: function remux(audioTrack, videoTrack, id3Track, timeOffset, contiguous) {
      // generate Init Segment if needed
      if (!this.ISGenerated) {
        this.generateIS(audioTrack, videoTrack, timeOffset);
      }
      //logger.log('nb AVC samples:' + videoTrack.samples.length);
      if (videoTrack.samples.length) {
        this.remuxVideo(videoTrack, timeOffset, contiguous);
      }
      //logger.log('nb AAC samples:' + audioTrack.samples.length);
      if (audioTrack.samples.length) {
        this.remuxAudio(audioTrack, timeOffset, contiguous);
      }
      //logger.log('nb ID3 samples:' + audioTrack.samples.length);
      if (id3Track.samples.length) {
        this.remuxID3(id3Track, timeOffset);
      }
      //notify end of parsing
      this.observer.trigger(_events2['default'].FRAG_PARSED);
    }
  }, {
    key: 'generateIS',
    value: function generateIS(audioTrack, videoTrack, timeOffset) {
      var observer = this.observer,
          audioSamples = audioTrack.samples,
          videoSamples = videoTrack.samples,
          nbAudio = audioSamples.length,
          nbVideo = videoSamples.length,
          pesTimeScale = this.PES_TIMESCALE;

      if (nbAudio === 0 && nbVideo === 0) {
        observer.trigger(_events2['default'].ERROR, { type: _errors.ErrorTypes.MEDIA_ERROR, details: _errors.ErrorDetails.FRAG_PARSING_ERROR, fatal: false, reason: 'no audio/video samples found' });
      } else if (nbVideo === 0) {
        //audio only
        if (audioTrack.config) {
          observer.trigger(_events2['default'].FRAG_PARSING_INIT_SEGMENT, {
            audioMoov: _remuxMp4Generator2['default'].initSegment([audioTrack]),
            audioCodec: audioTrack.codec,
            audioChannelCount: audioTrack.channelCount
          });
          this.ISGenerated = true;
        }
        if (this._initPTS === undefined) {
          // remember first PTS of this demuxing context
          this._initPTS = audioSamples[0].pts - pesTimeScale * timeOffset;
          this._initDTS = audioSamples[0].dts - pesTimeScale * timeOffset;
        }
      } else if (nbAudio === 0) {
        //video only
        if (videoTrack.sps && videoTrack.pps) {
          observer.trigger(_events2['default'].FRAG_PARSING_INIT_SEGMENT, {
            videoMoov: _remuxMp4Generator2['default'].initSegment([videoTrack]),
            videoCodec: videoTrack.codec,
            videoWidth: videoTrack.width,
            videoHeight: videoTrack.height
          });
          this.ISGenerated = true;
          if (this._initPTS === undefined) {
            // remember first PTS of this demuxing context
            this._initPTS = videoSamples[0].pts - pesTimeScale * timeOffset;
            this._initDTS = videoSamples[0].dts - pesTimeScale * timeOffset;
          }
        }
      } else {
        //audio and video
        if (audioTrack.config && videoTrack.sps && videoTrack.pps) {
          observer.trigger(_events2['default'].FRAG_PARSING_INIT_SEGMENT, {
            audioMoov: _remuxMp4Generator2['default'].initSegment([audioTrack]),
            audioCodec: audioTrack.codec,
            audioChannelCount: audioTrack.channelCount,
            videoMoov: _remuxMp4Generator2['default'].initSegment([videoTrack]),
            videoCodec: videoTrack.codec,
            videoWidth: videoTrack.width,
            videoHeight: videoTrack.height
          });
          this.ISGenerated = true;
          if (this._initPTS === undefined) {
            // remember first PTS of this demuxing context
            this._initPTS = Math.min(videoSamples[0].pts, audioSamples[0].pts) - pesTimeScale * timeOffset;
            this._initDTS = Math.min(videoSamples[0].dts, audioSamples[0].dts) - pesTimeScale * timeOffset;
          }
        }
      }
    }
  }, {
    key: 'remuxVideo',
    value: function remuxVideo(track, timeOffset, contiguous) {
      var view,
          i = 8,
          pesTimeScale = this.PES_TIMESCALE,
          pes2mp4ScaleFactor = this.PES2MP4SCALEFACTOR,
          avcSample,
          mp4Sample,
          mp4SampleLength,
          unit,
          mdat,
          moof,
          firstPTS,
          firstDTS,
          lastDTS,
          pts,
          dts,
          ptsnorm,
          dtsnorm,
          samples = [];
      /* concatenate the video data and construct the mdat in place
        (need 8 more bytes to fill length and mpdat type) */
      mdat = new Uint8Array(track.len + 4 * track.nbNalu + 8);
      view = new DataView(mdat.buffer);
      view.setUint32(0, mdat.byteLength);
      mdat.set(_remuxMp4Generator2['default'].types.mdat, 4);
      while (track.samples.length) {
        avcSample = track.samples.shift();
        mp4SampleLength = 0;
        // convert NALU bitstream to MP4 format (prepend NALU with size field)
        while (avcSample.units.units.length) {
          unit = avcSample.units.units.shift();
          view.setUint32(i, unit.data.byteLength);
          i += 4;
          mdat.set(unit.data, i);
          i += unit.data.byteLength;
          mp4SampleLength += 4 + unit.data.byteLength;
        }
        pts = avcSample.pts - this._initDTS;
        dts = avcSample.dts - this._initDTS;
        //logger.log('Video/PTS/DTS:' + pts + '/' + dts);
        // if not first AVC sample of video track, normalize PTS/DTS with previous sample value
        // and ensure that sample duration is positive
        if (lastDTS !== undefined) {
          ptsnorm = this._PTSNormalize(pts, lastDTS);
          dtsnorm = this._PTSNormalize(dts, lastDTS);
          mp4Sample.duration = (dtsnorm - lastDTS) / pes2mp4ScaleFactor;
          if (mp4Sample.duration < 0) {
            //logger.log('invalid sample duration at PTS/DTS::' + avcSample.pts + '/' + avcSample.dts + ':' + mp4Sample.duration);
            mp4Sample.duration = 0;
          }
        } else {
          var nextAvcDts = this.nextAvcDts,
              delta;
          // first AVC sample of video track, normalize PTS/DTS
          ptsnorm = this._PTSNormalize(pts, nextAvcDts);
          dtsnorm = this._PTSNormalize(dts, nextAvcDts);
          delta = Math.round((dtsnorm - nextAvcDts) / 90);
          // if fragment are contiguous, or delta less than 600ms, ensure there is no overlap/hole between fragments
          if (contiguous || Math.abs(delta) < 600) {
            if (delta) {
              if (delta > 1) {
                _utilsLogger.logger.log('AVC:' + delta + ' ms hole between fragments detected,filling it');
              } else if (delta < -1) {
                _utilsLogger.logger.log('AVC:' + -delta + ' ms overlapping between fragments detected');
              }
              // set DTS to next DTS
              dtsnorm = nextAvcDts;
              // offset PTS as well, ensure that PTS is smaller or equal than new DTS
              ptsnorm = Math.max(ptsnorm - delta, dtsnorm);
              _utilsLogger.logger.log('Video/PTS/DTS adjusted:' + ptsnorm + '/' + dtsnorm);
            }
          }
          // remember first PTS of our avcSamples, ensure value is positive
          firstPTS = Math.max(0, ptsnorm);
          firstDTS = Math.max(0, dtsnorm);
        }
        //console.log('PTS/DTS/initDTS/normPTS/normDTS/relative PTS : ${avcSample.pts}/${avcSample.dts}/${this._initDTS}/${ptsnorm}/${dtsnorm}/${(avcSample.pts/4294967296).toFixed(3)}');
        mp4Sample = {
          size: mp4SampleLength,
          duration: 0,
          cts: (ptsnorm - dtsnorm) / pes2mp4ScaleFactor,
          flags: {
            isLeading: 0,
            isDependedOn: 0,
            hasRedundancy: 0,
            degradPrio: 0
          }
        };
        if (avcSample.key === true) {
          // the current sample is a key frame
          mp4Sample.flags.dependsOn = 2;
          mp4Sample.flags.isNonSync = 0;
        } else {
          mp4Sample.flags.dependsOn = 1;
          mp4Sample.flags.isNonSync = 1;
        }
        samples.push(mp4Sample);
        lastDTS = dtsnorm;
      }
      if (samples.length >= 2) {
        mp4Sample.duration = samples[samples.length - 2].duration;
      }
      // next AVC sample DTS should be equal to last sample DTS + last sample duration
      this.nextAvcDts = dtsnorm + mp4Sample.duration * pes2mp4ScaleFactor;
      track.len = 0;
      track.nbNalu = 0;
      if (navigator.userAgent.toLowerCase().indexOf('chrome') > -1) {
        // chrome workaround, mark first sample as being a Random Access Point to avoid sourcebuffer append issue
        // https://code.google.com/p/chromium/issues/detail?id=229412
        samples[0].flags.dependsOn = 2;
        samples[0].flags.isNonSync = 0;
      }
      track.samples = samples;
      moof = _remuxMp4Generator2['default'].moof(track.sequenceNumber++, firstDTS / pes2mp4ScaleFactor, track);
      track.samples = [];
      this.observer.trigger(_events2['default'].FRAG_PARSING_DATA, {
        moof: moof,
        mdat: mdat,
        startPTS: firstPTS / pesTimeScale,
        endPTS: (ptsnorm + pes2mp4ScaleFactor * mp4Sample.duration) / pesTimeScale,
        startDTS: firstDTS / pesTimeScale,
        endDTS: (dtsnorm + pes2mp4ScaleFactor * mp4Sample.duration) / pesTimeScale,
        type: 'video',
        nb: samples.length
      });
    }
  }, {
    key: 'remuxAudio',
    value: function remuxAudio(track, timeOffset, contiguous) {
      var view,
          i = 8,
          pesTimeScale = this.PES_TIMESCALE,
          pes2mp4ScaleFactor = this.PES2MP4SCALEFACTOR,
          aacSample,
          mp4Sample,
          unit,
          mdat,
          moof,
          firstPTS,
          firstDTS,
          lastDTS,
          pts,
          dts,
          ptsnorm,
          dtsnorm,
          samples = [];
      /* concatenate the audio data and construct the mdat in place
        (need 8 more bytes to fill length and mdat type) */
      mdat = new Uint8Array(track.len + 8);
      view = new DataView(mdat.buffer);
      view.setUint32(0, mdat.byteLength);
      mdat.set(_remuxMp4Generator2['default'].types.mdat, 4);
      while (track.samples.length) {
        aacSample = track.samples.shift();
        unit = aacSample.unit;
        mdat.set(unit, i);
        i += unit.byteLength;
        pts = aacSample.pts - this._initDTS;
        dts = aacSample.dts - this._initDTS;
        //logger.log('Audio/PTS:' + aacSample.pts.toFixed(0));
        if (lastDTS !== undefined) {
          ptsnorm = this._PTSNormalize(pts, lastDTS);
          dtsnorm = this._PTSNormalize(dts, lastDTS);
          // we use DTS to compute sample duration, but we use PTS to compute initPTS which is used to sync audio and video
          mp4Sample.duration = (dtsnorm - lastDTS) / pes2mp4ScaleFactor;
          if (mp4Sample.duration < 0) {
            _utilsLogger.logger.log('invalid AAC sample duration at PTS:' + aacSample.pts + ':' + mp4Sample.duration);
            mp4Sample.duration = 0;
          }
        } else {
          var nextAacPts = this.nextAacPts,
              delta;
          ptsnorm = this._PTSNormalize(pts, nextAacPts);
          dtsnorm = this._PTSNormalize(dts, nextAacPts);
          delta = Math.round(1000 * (ptsnorm - nextAacPts) / pesTimeScale);
          // if fragment are contiguous, or delta less than 600ms, ensure there is no overlap/hole between fragments
          if (contiguous || Math.abs(delta) < 600) {
            // log delta
            if (delta) {
              if (delta > 1) {
                _utilsLogger.logger.log(delta + ' ms hole between AAC samples detected,filling it');
                // set PTS to next PTS, and ensure PTS is greater or equal than last DTS
              } else if (delta < -1) {
                  _utilsLogger.logger.log(-delta + ' ms overlapping between AAC samples detected');
                }
              // set DTS to next DTS
              ptsnorm = dtsnorm = nextAacPts;
            }
          }
          // remember first PTS of our aacSamples, ensure value is positive
          firstPTS = Math.max(0, ptsnorm);
          firstDTS = Math.max(0, dtsnorm);
        }
        //console.log('PTS/DTS/initDTS/normPTS/normDTS/relative PTS : ${aacSample.pts}/${aacSample.dts}/${this._initDTS}/${ptsnorm}/${dtsnorm}/${(aacSample.pts/4294967296).toFixed(3)}');
        mp4Sample = {
          size: unit.byteLength,
          cts: 0,
          duration: 0,
          flags: {
            isLeading: 0,
            isDependedOn: 0,
            hasRedundancy: 0,
            degradPrio: 0,
            dependsOn: 1
          }
        };
        samples.push(mp4Sample);
        lastDTS = dtsnorm;
      }
      //set last sample duration as being identical to previous sample
      if (samples.length >= 2) {
        mp4Sample.duration = samples[samples.length - 2].duration;
      }
      // next aac sample PTS should be equal to last sample PTS + duration
      this.nextAacPts = ptsnorm + pes2mp4ScaleFactor * mp4Sample.duration;
      //logger.log('Audio/PTS/PTSend:' + aacSample.pts.toFixed(0) + '/' + this.nextAacDts.toFixed(0));
      track.len = 0;
      track.samples = samples;
      moof = _remuxMp4Generator2['default'].moof(track.sequenceNumber++, firstDTS / pes2mp4ScaleFactor, track);
      track.samples = [];
      this.observer.trigger(_events2['default'].FRAG_PARSING_DATA, {
        moof: moof,
        mdat: mdat,
        startPTS: firstPTS / pesTimeScale,
        endPTS: this.nextAacPts / pesTimeScale,
        startDTS: firstDTS / pesTimeScale,
        endDTS: (dtsnorm + pes2mp4ScaleFactor * mp4Sample.duration) / pesTimeScale,
        type: 'audio',
        nb: samples.length
      });
    }
  }, {
    key: 'remuxID3',
    value: function remuxID3(track, timeOffset) {
      var length = track.samples.length,
          sample;
      // consume samples
      if (length) {
        for (var index = 0; index < length; index++) {
          sample = track.samples[index];
          // setting id3 pts, dts to relative time
          // using this._initPTS and this._initDTS to calculate relative time
          sample.pts = (sample.pts - this._initPTS) / this.PES_TIMESCALE;
          sample.dts = (sample.dts - this._initDTS) / this.PES_TIMESCALE;
        }
        this.observer.trigger(_events2['default'].FRAG_PARSING_METADATA, {
          samples: track.samples
        });
      }

      track.samples = [];
      timeOffset = timeOffset;
    }
  }, {
    key: '_PTSNormalize',
    value: function _PTSNormalize(value, reference) {
      var offset;
      if (reference === undefined) {
        return value;
      }
      if (reference < value) {
        // - 2^33
        offset = -8589934592;
      } else {
        // + 2^33
        offset = 8589934592;
      }
      /* PTS is 33bit (from 0 to 2^33 -1)
        if diff between value and reference is bigger than half of the amplitude (2^32) then it means that
        PTS looping occured. fill the gap */
      while (Math.abs(value - reference) > 4294967296) {
        value += offset;
      }
      return value;
    }
  }, {
    key: 'timescale',
    get: function get() {
      return this.MP4_TIMESCALE;
    }
  }]);

  return MP4Remuxer;
})();

exports['default'] = MP4Remuxer;
module.exports = exports['default'];

},{"../errors":16,"../events":17,"../remux/mp4-generator":23,"../utils/logger":26}],25:[function(require,module,exports){
"use strict";

var BinarySearch = {
    /**
     * Searches for an item in an array which matches a certain condition.
     * This requires the condition to only match one item in the array,
     * and for the array to be ordered.
     *
     * @param {Array} list The array to search.
     * @param {Function} comparisonFunction
     *      Called and provided a candidate item as the first argument.
     *      Should return:
     *          > -1 if the item should be located at a lower index than the provided item.
     *          > 1 if the item should be located at a higher index than the provided item.
     *          > 0 if the item is the item you're looking for.
     *
     * @return {*} The object if it is found or null otherwise.
     */
    search: function search(list, comparisonFunction) {
        var minIndex = 0;
        var maxIndex = list.length - 1;
        var currentIndex = null;
        var currentElement = null;

        while (minIndex <= maxIndex) {
            currentIndex = (minIndex + maxIndex) / 2 | 0;
            currentElement = list[currentIndex];

            var comparisonResult = comparisonFunction(currentElement);
            if (comparisonResult > 0) {
                minIndex = currentIndex + 1;
            } else if (comparisonResult < 0) {
                maxIndex = currentIndex - 1;
            } else {
                return currentElement;
            }
        }

        return null;
    }
};

module.exports = BinarySearch;

},{}],26:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
function noop() {}

var fakeLogger = {
  trace: noop,
  debug: noop,
  log: noop,
  warn: noop,
  info: noop,
  error: noop
};

var exportedLogger = fakeLogger;

//let lastCallTime;
// function formatMsgWithTimeInfo(type, msg) {
//   const now = Date.now();
//   const diff = lastCallTime ? '+' + (now - lastCallTime) : '0';
//   lastCallTime = now;
//   msg = (new Date(now)).toISOString() + ' | [' +  type + '] > ' + msg + ' ( ' + diff + ' ms )';
//   return msg;
// }

function formatMsg(type, msg) {
  msg = '[' + type + '] > ' + msg;
  return msg;
}

function consolePrintFn(type) {
  var func = window.console[type];
  if (func) {
    return function () {
      for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      if (args[0]) {
        args[0] = formatMsg(type, args[0]);
      }
      func.apply(window.console, args);
    };
  }
  return noop;
}

function exportLoggerFunctions(debugConfig) {
  for (var _len2 = arguments.length, functions = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
    functions[_key2 - 1] = arguments[_key2];
  }

  functions.forEach(function (type) {
    exportedLogger[type] = debugConfig[type] ? debugConfig[type].bind(debugConfig) : consolePrintFn(type);
  });
}

var enableLogs = function enableLogs(debugConfig) {
  if (debugConfig === true || typeof debugConfig === 'object') {
    exportLoggerFunctions(debugConfig,
    // Remove out from list here to hard-disable a log-level
    //'trace',
    'debug', 'log', 'info', 'warn', 'error');
    // Some browsers don't allow to use bind on console object anyway
    // fallback to default if needed
    try {
      exportedLogger.log();
    } catch (e) {
      exportedLogger = fakeLogger;
    }
  } else {
    exportedLogger = fakeLogger;
  }
};

exports.enableLogs = enableLogs;
var logger = exportedLogger;
exports.logger = logger;

},{}],27:[function(require,module,exports){
'use strict';

var URLHelper = {

  // build an absolute URL from a relative one using the provided baseURL
  // if relativeURL is an absolute URL it will be returned as is.
  buildAbsoluteURL: function buildAbsoluteURL(baseURL, relativeURL) {
    // remove any remaining space and CRLF
    relativeURL = relativeURL.trim();
    if (/^[a-z]+:/i.test(relativeURL)) {
      // complete url, not relative
      return relativeURL;
    }

    var relativeURLQuery = null;
    var relativeURLHash = null;

    var relativeURLHashSplit = /^([^#]*)(.*)$/.exec(relativeURL);
    if (relativeURLHashSplit) {
      relativeURLHash = relativeURLHashSplit[2];
      relativeURL = relativeURLHashSplit[1];
    }
    var relativeURLQuerySplit = /^([^\?]*)(.*)$/.exec(relativeURL);
    if (relativeURLQuerySplit) {
      relativeURLQuery = relativeURLQuerySplit[2];
      relativeURL = relativeURLQuerySplit[1];
    }

    var baseURLHashSplit = /^([^#]*)(.*)$/.exec(baseURL);
    if (baseURLHashSplit) {
      baseURL = baseURLHashSplit[1];
    }
    var baseURLQuerySplit = /^([^\?]*)(.*)$/.exec(baseURL);
    if (baseURLQuerySplit) {
      baseURL = baseURLQuerySplit[1];
    }

    var baseURLDomainSplit = /^((([a-z]+):)?\/\/[a-z0-9\.-]+(:[0-9]+)?\/)(.*)$/i.exec(baseURL);
    var baseURLProtocol = baseURLDomainSplit[3];
    var baseURLDomain = baseURLDomainSplit[1];
    var baseURLPath = baseURLDomainSplit[5];

    var builtURL = null;
    if (/^\/\//.test(relativeURL)) {
      builtURL = baseURLProtocol + '://' + URLHelper.buildAbsolutePath('', relativeURL.substring(2));
    } else if (/^\//.test(relativeURL)) {
      builtURL = baseURLDomain + URLHelper.buildAbsolutePath('', relativeURL.substring(1));
    } else {
      var newPath = URLHelper.buildAbsolutePath(baseURLPath, relativeURL);
      builtURL = baseURLDomain + newPath;
    }

    // put the query and hash parts back
    if (relativeURLQuery) {
      builtURL += relativeURLQuery;
    }
    if (relativeURLHash) {
      builtURL += relativeURLHash;
    }
    return builtURL;
  },

  // build an absolute path using the provided basePath
  // adapted from https://developer.mozilla.org/en-US/docs/Web/API/document/cookie#Using_relative_URLs_in_the_path_parameter
  // this does not handle the case where relativePath is "/" or "//". These cases should be handled outside this.
  buildAbsolutePath: function buildAbsolutePath(basePath, relativePath) {
    var sRelPath = relativePath;
    var nUpLn,
        sDir = '',
        sPath = basePath.replace(/[^\/]*$/, sRelPath.replace(/(\/|^)(?:\.?\/+)+/g, '$1'));
    for (var nEnd, nStart = 0; nEnd = sPath.indexOf('/../', nStart), nEnd > -1; nStart = nEnd + nUpLn) {
      nUpLn = /^\/(?:\.\.\/)*/.exec(sPath.slice(nEnd))[0].length;
      sDir = (sDir + sPath.substring(nStart, nEnd)).replace(new RegExp('(?:\\\/+[^\\\/]*){0,' + (nUpLn - 1) / 3 + '}$'), '/');
    }
    return sDir + sPath.substr(nStart);
  }
};

module.exports = URLHelper;

},{}],28:[function(require,module,exports){
/**
 * XHR based logger
*/

'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _utilsLogger = require('../utils/logger');

var XhrLoader = (function () {
  function XhrLoader(config) {
    _classCallCheck(this, XhrLoader);

    if (config && config.xhrSetup) {
      this.xhrSetup = config.xhrSetup;
    }
  }

  _createClass(XhrLoader, [{
    key: 'destroy',
    value: function destroy() {
      this.abort();
      this.loader = null;
    }
  }, {
    key: 'abort',
    value: function abort() {
      if (this.loader && this.loader.readyState !== 4) {
        this.stats.aborted = true;
        this.loader.abort();
      }
      if (this.timeoutHandle) {
        window.clearTimeout(this.timeoutHandle);
      }
    }
  }, {
    key: 'load',
    value: function load(url, responseType, onSuccess, onError, onTimeout, timeout, maxRetry, retryDelay) {
      var onProgress = arguments.length <= 8 || arguments[8] === undefined ? null : arguments[8];
      var frag = arguments.length <= 9 || arguments[9] === undefined ? null : arguments[9];

      this.url = url;
      if (frag && !isNaN(frag.byteRangeStartOffset) && !isNaN(frag.byteRangeEndOffset)) {
        this.byteRange = frag.byteRangeStartOffset + '-' + frag.byteRangeEndOffset;
      }
      this.responseType = responseType;
      this.onSuccess = onSuccess;
      this.onProgress = onProgress;
      this.onTimeout = onTimeout;
      this.onError = onError;
      this.stats = { trequest: performance.now(), retry: 0 };
      this.timeout = timeout;
      this.maxRetry = maxRetry;
      this.retryDelay = retryDelay;
      this.timeoutHandle = window.setTimeout(this.loadtimeout.bind(this), timeout);
      this.loadInternal();
    }
  }, {
    key: 'loadInternal',
    value: function loadInternal() {
      var xhr = this.loader = new XMLHttpRequest();
      xhr.onload = this.loadsuccess.bind(this);
      xhr.onerror = this.loaderror.bind(this);
      xhr.onprogress = this.loadprogress.bind(this);
      xhr.open('GET', this.url, true);
      if (this.byteRange) {
        xhr.setRequestHeader('Range', 'bytes=' + this.byteRange);
      }
      xhr.responseType = this.responseType;
      this.stats.tfirst = null;
      this.stats.loaded = 0;
      if (this.xhrSetup) {
        this.xhrSetup(xhr, this.url);
      }
      xhr.send();
    }
  }, {
    key: 'loadsuccess',
    value: function loadsuccess(event) {
      window.clearTimeout(this.timeoutHandle);
      this.stats.tload = performance.now();
      this.onSuccess(event, this.stats);
    }
  }, {
    key: 'loaderror',
    value: function loaderror(event) {
      if (this.stats.retry < this.maxRetry) {
        _utilsLogger.logger.warn(event.type + ' while loading ' + this.url + ', retrying in ' + this.retryDelay + '...');
        this.destroy();
        window.setTimeout(this.loadInternal.bind(this), this.retryDelay);
        // exponential backoff
        this.retryDelay = Math.min(2 * this.retryDelay, 64000);
        this.stats.retry++;
      } else {
        window.clearTimeout(this.timeoutHandle);
        _utilsLogger.logger.error(event.type + ' while loading ' + this.url);
        this.onError(event);
      }
    }
  }, {
    key: 'loadtimeout',
    value: function loadtimeout(event) {
      _utilsLogger.logger.warn('timeout while loading ' + this.url);
      this.onTimeout(event, this.stats);
    }
  }, {
    key: 'loadprogress',
    value: function loadprogress(event) {
      var stats = this.stats;
      if (stats.tfirst === null) {
        stats.tfirst = performance.now();
      }
      stats.loaded = event.loaded;
      if (this.onProgress) {
        this.onProgress(event, stats);
      }
    }
  }]);

  return XhrLoader;
})();

exports['default'] = XhrLoader;
module.exports = exports['default'];

},{"../utils/logger":26}]},{},[19])(19)
});
	
	function HTML5Backend(options){
		this.width = '100%';
		this.height = '100%';
		extend(this, options);

		this.video = document.createElement('VIDEO');

		if(options.poster){
			this.video.poster = options.poster;
		}
	}

	HTML5Backend.prototype = extend(Object.create(CustomObject), {
		is_ready: false,

		isSupported: function(){
			return typeof document.createElement('VIDEO').play == 'function';
		},

		isHLS: function(type){
			return ['application/x-mpegURL', 'application/vnd.apple.mpegurl'].indexOf(type)>-1;
		},

		canPlayTypeNative: function(type){
			var device = getDeviceInfo();
			if(this.isHLS(type)){
				if(device.is_android && device.version[0]>=4){
					return true;
				}
			}
			return ['maybe', 'probably'].indexOf(document.createElement('VIDEO').canPlayType(type))>-1;
		},

		canPlayType: function(type){
			if(this.canPlayTypeNative(type)){
				return true;
			}
							if(this.isHLS(type) && Hls.isSupported()){
					return true;
				}
						return false;
		},

		setSource: function(source, type){
			var self = this;

			if(this.canPlayTypeNative(type)){
				this.video.src = source;
				this.video.load();
			}
							else if(this.isHLS(type)){
					var hls = new Hls({
						fragLoadingTimeOut: 100000,
						maxBufferLength: 30
					});

					hls.loadSource(source);
					hls.attachMedia(this.video);

					hls.on(Hls.Events.ERROR, function(type, error){
						console.log(error);
						if(error.fatal){
							self.trigger('error', 201);
						}
					});

					// hls.on(Hls.Events.MANIFEST_PARSED,function() {
					// 	console.log(hls.levels);
					// });

					// hls.autoLevelCapping = 0;
				}
					},

		getElement: function(){
			return this.video;
		},

		destroy: function(){
			this.video.oncontextmenu = null;
		},

		setWidth: function(width){
			this.video.style.width = width;
		},

		setHeight: function(height){
			this.video.style.height = height;
		},

		init: function(){
			var self = this;

			this.setWidth(this.width);
			this.setHeight(this.height);

			this.initEvents();

			this.on('ready', function(){
				self.is_ready = true;
			});

			this.trigger('ready');
		},

		initEvents: function(){
			var self = this;

			// this.on('*', function(e){
			// 	if(e.type!='timeupdate'){
			// 		document.body.appendChild(html('<div>EVENT: '+e.type+'</div>'));
			// 	}
			// });

			this.video.onerror = function(){
				self.trigger('error', 201);
			};

			this.video.oncontextmenu = function(){
				event.preventDefault();
			};

			this.video.addEventListener('loadedmetadata', function(){
				self.trigger('canplay');
			});

			this.video.addEventListener('durationchange', function(){
				self.trigger('durationchange', this.duration);
			});

			this.video.addEventListener('volumechange', function(){
				self.trigger('volumechange', this.muted ? 0 : this.volume);
			});

			this.video.addEventListener('timeupdate', function(){
				var in_range = null;
				for(var i=0; i<this.buffered.length; i++){
					if(
						this.currentTime > this.buffered.start(i) &&
						this.currentTime < this.buffered.end(i)
					){
						in_range = this.duration-this.buffered.end(i)<0.5 || Math.abs(this.currentTime-this.buffered.end(i)) > 0.5;
						break;
					}
				}

				if(in_range!==null){
					if(in_range){
						if(self.is_waiting){
							self.trigger('playing');
							self.is_waiting = false;
						}
					}else{
						self.is_waiting = true;
						self.trigger('waiting');
					}
				}

				self.trigger('timeupdate', this.currentTime);
				if(this.duration && this.duration-this.currentTime<0.5){
					self.trigger('ended');
					this.pause();
					this.currentTime = 0;
				}
			});

			this.video.addEventListener('ended', function(){
				self.trigger('ended');
			});

			this.video.addEventListener('waiting', function(){
				self.trigger('waiting');
			});

			this.video.addEventListener('playing', function(){
				self.trigger('playing');
			});

			this.video.addEventListener('play', function(){
				self.trigger('play');
			});

			this.video.addEventListener('pause', function(){
				self.trigger('pause');
			});

			this.video.addEventListener('canplay', function(){
				self.trigger('canplay');
			});

			this.video.addEventListener('seeking', function(){
				self.trigger('seeking');
			});

			this.video.addEventListener('seeked', function(){
				self.trigger('seeked');
			});

			this.video.addEventListener('progress', function(){
				var res = [];
				for(var i=0; i<this.buffered.length; i++){
					res.push([this.buffered.start(i), this.buffered.end(i)]);
				}
				self.trigger('progress', res);
			});
		},

		play: function(){
			this.video.play();
		},

		pause: function(){
			this.video.pause();
		},

		getCurrentTime: function(){
			return this.video.currentTime;
		},

		getDuration: function(){
			return this.video.duration;
		},

		setCurrentTime: function(time){
			if(this.video.readyState!=HTMLMediaElement.HAVE_NOTHING){
				this.video.currentTime = Math.max(0, Math.min(this.video.duration-0.9, time));
			}
		},

		setVolume: function(value){
			value = Math.max(0, Math.min(1, value||0))
			this.video.volume = value;
			this.video.muted = !value;
		},

		getVolume: function(){
			return this.video.volume;
		},

		showDefaultUI: function(){
			this.video.controls = true;
		},

		hideDefaultUI: function(){
			this.video.controls = false;
		}

	});

	return HTML5Backend;
})();		CustomPlayer.prototype.__backends.HTML5 = HTML5Backend;			
function FlashBackend(options){
	this.flash_swf = null;
	fill(this, options);

	this.swf = document.createElement('OBJECT');
};
FlashBackend.prototype = extend(Object.create(CustomObject), {
	is_ready: false,

	_flashFn: function(fn){
		var public_way = 'window';
		var uniq = '__'+Math.random().toString(16).split('.')[1];
		window[uniq] = function(){
			fn.apply(window, arguments);
		};
		return public_way+'.'+uniq;
	},

	_setSWFProperty: function(key, value){
		if(!this.swf.vjs_setProperty){
			var self = this;
			setTimeout(function(){
				self._setSWFProperty(key, value);
			}, 0);
			return;
		}
		this.swf.vjs_setProperty(key, value);
	},

	init: function(){
		var self = this;

		this.on('ready', function(){
			self.is_ready = true;
		});
		
		this.swf.setAttribute('type', 'application/x-shockwave-flash');
		this.swf.setAttribute('width', '100%');
		this.swf.setAttribute('height', '100%');
		this.swf.setAttribute('data', this.flash_swf);
		addClass(this.swf, 'screen');

		var params = {
			wmode: 'opaque',
			allowScriptAccess: 'always',
			allowNetworking: 'all',
			quality: 'high',
			flashvars: 'readyFunction='+this._flashFn(function(){
				self.initEvents();
			}),
		};
		for(var name in params){
			var e = document.createElement('PARAM');
			e.setAttribute('name', name);
			e.setAttribute('value', params[name]);
			this.swf.appendChild(e);
		}
	},

	isSupported: function(){
		return flash_support();
	},

	canPlayType: function(type){
		return [
			'video/mp4',
			'video/flv',
			'video/x-flv',
			'video/m4v',
			'application/x-mpegURL',
		].indexOf(type) > -1;
	},

	getElement: function(){
		return this.swf;
	},

	destroy: function(){
		clearInterval(this._play_interval);
	},

	initEvents: function(){
		var self = this;
		this._setSWFProperty("eventProxyFunction", this._flashFn(function(e, type){
			switch(type){
				case 'playing':
					self.trigger('playing');
				break;
				case 'seeked':
					self.trigger('seeked');
				break;
				case 'waiting':
					self.trigger('waiting');
				break;
				case 'ended':
					self.trigger('ended');
				break;
				case 'canplay':
				case 'loadedmetadata':
					self.trigger('canplay');
				break;
				case 'play':
					self.trigger('play');
				break;
				case 'volumechange':
					self.trigger('volumechange', self.getVolume());
				break;
				case 'durationchange':
					self.trigger('durationchange', self.getDuration());
				break;
			}
		}));

		this._setSWFProperty("errorEventProxyFunction", this._flashFn(function(id, error){
			switch(error){
				case 'srcnotfound':
					self.trigger('error', 201);
				break;
				default:
					self.trigger('error', 200);
			}
		}));

		this.on('play', function(){
			self.__timeupdate = setInterval(function(){
				self.trigger('progress', [[0, self.swf.vjs_getProperty('buffered')]]);
				self.trigger('timeupdate', self.getCurrentTime());
			}, 500);
		});

		this.on(['pause', 'ended'], function(){
			clearInterval(self.__timeupdate);
		});

		this.trigger('ready');
	},

	setSource: function(source){
		this.swf.vjs_src(source);
	},

	play: function(){
		this.swf.vjs_play();
	},

	pause: function(){
		this.swf.vjs_pause();
		this.trigger('pause');
	},

	getCurrentTime: function(){
		if(this.swf.vjs_getProperty){
			return this.swf.vjs_getProperty('currentTime');
		}
		return 0;
	},

	getDuration: function(){
		if(this.swf.vjs_getProperty){
			return this.swf.vjs_getProperty('duration');
		}
		return 0;
	},

	setCurrentTime: function(time){
		this._setSWFProperty('currentTime', time);
	},

	setVolume: function(value){
		this._setSWFProperty('volume', value);
	},

	getVolume: function(value){
		return this.swf.vjs_getProperty('volume');
	},

	showDefaultUI: function(){

	},

	hideDefaultUI: function(){

	}

});		CustomPlayer.prototype.__backends.Flash = FlashBackend;	
			function FullScreenPlugin(player, options){
	var self = this;
	
	this.player = player;
	this.is_fullscreen = false;

	if(this.checkSupportFullscreen()){
		this.init();
	}
}

FullScreenPlugin.prototype = {

	init: function(){
		var self = this;

		on(document, [
			'fullscreenchange',
			'webkitfullscreenchange',
			'mozfullscreenchange',
			'msfullscreenchange'
		], function(event){
			self.player.trigger('fullscreenchange', self.checkFullscreen());
		});

		this.player.on('tray_ready', function(e, tray){
			tray.appendChild(self.getUI());
		});
	},

	getUI: function(){
		var self = this;
		var item = html(
			'<div class="fullscreen">'+
				'<svg>'+
					'<path class="on" d="M18,18V6H6v12H18z M8,16V8h8v8H8z M22,2v6h-2V4h-4V2H22z M20,16h2v6h-6v-2h4V16z M4,20h4v2H2v-6h2V20z M4,8H2V2h6v2H4V8z"/>'+
					'<path class="off" d="M18,8v2h-4V6h2v2H18z M14,14v4h2v-2h2v-2H14z M6,14v2h2v2h2v-4H6z M8,8H6v2h4V6H8 V8z M22,2v20H2V2H22z M20,4H4v16h16V4z"/>'+
				'</svg>'+
			'</div>'
		);
		var on_path = item.getElementsByClassName('on')[0];
		var off_path = item.getElementsByClassName('off')[0];

		on(item, 'click', function(){
			if(self.is_fullscreen){
				self.exitFullscreen();
			}else{
				self.requestFullscreen();
			}
		});

		this.player.on('fullscreenchange', function(e, is_fullscreen){
			self.is_fullscreen = is_fullscreen;

			if(self.is_fullscreen){
				addClass(self.player.root, 'fullscreen');

				item.title = 'Exit from Fullscreen';
				on_path.style.display = 'none';
				off_path.style.display = '';
			}else{
				removeClass(self.player.root, 'fullscreen');

				item.title = 'Fullscreen';
				on_path.style.display = '';
				off_path.style.display = 'none';
			}
		});
		this.player.trigger('fullscreenchange');

		return item;
	},

	checkFullscreen: function(){
		return (document.fullscreenElement && document.fullscreenElement !== null)
			|| document.mozFullScreen
			|| document.webkitIsFullScreen; 
	},

	checkSupportFullscreen: function(){

		if(getDeviceInfo().is_android){
			return false;
		}

		return document.body.requestFullscreen ||
			document.body.mozRequestFullScreen ||
			document.body.webkitRequestFullScreen ||
			document.body.msRequestFullscreen ||
			document.createElement('video').webkitEnterFullscreen;
	},

	requestFullscreen: function(){
		var self = this;
		var requestFullScreen = document.body.requestFullscreen ||
			document.body.mozRequestFullScreen ||
			document.body.webkitRequestFullScreen ||
			document.body.msRequestFullscreen;

		if(requestFullScreen){
			requestFullScreen.call(this.player.root);
			this.is_fullscreen = true;
		}else{
			var back_el = this.player.backend.getElement();
			if(back_el.webkitEnterFullscreen){
				this.is_fullscreen = true;
				on(back_el, 'webkitendfullscreen', function(e){
					off(back_el, e.type);
					self.is_fullscreen = false;
				})
				back_el.webkitEnterFullscreen();
			}
		}
	},

	exitFullscreen: function(){
		var exitFullscreen = document.exitFullscreen ||
			document.mozCancelFullScreen ||
			document.webkitExitFullscreen ||
			document.msExitFullscreen;

		if(exitFullscreen){
			exitFullscreen.call(document);
			this.is_fullscreen = false;
		}
	}

};		CustomPlayer.prototype.__plugins.FullScreen = FullScreenPlugin;			VASTPlugin = (function(){

		// 100 XML parsing error. 
// 101 VAST schema validation error.
// 102 VAST version of response not supported.
// 200 Trafficking error. Video player received an Ad type that it was not expecting and/or cannot display.
// 201 Video player expecting different linearity.
// 202 Video player expecting different duration.
// 203 Video player expecting different size.
// 300 General Wrapper error.
// 301 Timeout of VAST URI provided in Wrapper element, or of VAST URI provided in a subsequent Wrapper element. (URI was either unavailable or reached a timeout as defined by the video player.)
// 302 Wrapper limit reached, as defined by the video player. Too many Wrapper responses have been received with no InLine response. 
// 303 No Ads VAST response after one or more Wrappers. 
// 400 General Linear error. Video player is unable to display the Linear Ad.
// 401 File not found. Unable to find Linear/MediaFile from URI.
// 402 Timeout of MediaFile URI.
// 403 Couldn’t find MediaFile that is supported by this video player, based on the attributes of the MediaFile element.
// 405 Problem displaying MediaFile. Video player found a MediaFile with supported type but couldn’t display it. MediaFile may include: unsupported codecs, different MIME type than MediaFile@type, unsupported delivery method, etc.
// 500 General NonLinearAds error.
// 501 Unable to display NonLinear Ad because creative dimensions do not align with creative  display area (i.e. creative dimension too large).
// 502 Unable to fetch NonLinearAds/NonLinear resource.
// 503 Couldn’t find NonLinear resource with supported type.
// 600 General CompanionAds error.
// 601 Unable to display Companion because creative dimensions do not fit within Companion display area (i.e., no available space).
// 602 Unable to display Required Companion.
// 603 Unable to fetch CompanionAds/Companion resource.
// 604 Couldn’t find Companion resource with supported type.
// 900 Undefined Error.
// 901 General VPAID error.

function extendUrl(url, params){
	var t = ((new Date).getTime()/1000)|0;
	var params = extend({
		'CACHEBUSTER': t,
		'CACHE_BUSTER': t,
		'timestamp': t,
	}, params);
	map(keys(params), function(name){
		url = url.replace('['+name+']', encodeURIComponent(params[name]));
	});
	return url;
};

function firePixel(url, params){
	var pixel = new Image;
	var url = extendUrl(url, params);
	var glue = url.indexOf('?')==-1 ? '?' : '&';
	// pixel.src = url+glue+((new Date)-0);
	pixel.src = url;

	debug.log("Fire pixel", url);
}

function openWindow(url, params){
	window.open(extendUrl(url, params), '_blank');
}

function parseTrackingEvents(xml){
	var events = {};
	if(xml && xml.tagName.match(/^TrackingEvents$/i)){
		map(xml.getElementsByTagName("Tracking"), function(tracking_xml){
			var event = {};
			var name = tracking_xml.getAttribute("event");
			if(typeof events[name]==='undefined'){
				events[name] = [];
			}
			event.content = tracking_xml.textContent;
			map(tracking_xml.attributes, function(attr){
				event[attr.name] = attr.value;
			});
			events[name].push(event);
		});
	}
	return events;
}

function parseSkipOffset(str){
	str = str.trim();
	if(match = /^(\d{1,2}):(\d{1,2}):(\d{1,2})/.exec(str)){
		return {
			type: 'seconds',
			value:  parseInt(match[1])*3600 + parseInt(match[2])*60 + parseInt(match[3]),
		};
	}
	if(match = /^(\d{1,3})%$/.exec(str)){
		return {
			type: 'percent',
			value:  parseInt(match[1]),
		};
	}
}

function createBanner(type, src){
	if(type=='html'){
		elm = document.createElement('DIV');
		elm.innerHTML = src;
	}else if(type=='iframe'){
		elm = document.createElement('IFRAME');
		elm.src = src;
		elm.style.border = 'none';
		elm.scrolling = 'no';
	}else if(type=='application/x-shockwave-flash'){
		elm = document.createElement('OBJECT');
		elm.setAttribute('type', 'application/x-shockwave-flash');
		elm.setAttribute('data', src);
	}else{
		elm = document.createElement('IMG');
		elm.src = src;
	}
	return elm;
}

function processTracking(event){
	if(event && event.length){
		for(var i=0; i<event.length; i++){
			firePixel(event[i].content);
		}
	}
}function VPAIDLinear(options){
	var self = this;

	this.type;
	this.src;
	this.creative;
	extend(this, options);

	this.vpaid = null;

	this.on('vpaidevent', function(e, event, args){

		debug.log('VPAID event:', event);

		switch(event){
			case 'AdLoaded':
				self.vpaid.startAd();
			break;
			case 'AdClickThru':
				var url = args[0];
				var playerHandles = args[2];
				self.trigger('vastevent', 'clickthru', {
					click_through: url,
					no_fire_pixel: !playerHandles,
				}, self);
			break;
			case 'AdSkipped':
				self.trigger('vastevent', 'skip', {}, self);
			break;
			case 'AdStopped':
				self.trigger('vastevent', 'complete', {}, self);
			break;
			case 'AdError':
				self.trigger('vasterror', 901, args);
			break;
			case 'AdStarted':
				self.trigger('vastevent', 'start', {}, self);
			break;
			case 'AdVideoFirstQuartile':
				self.trigger('vastevent', 'firstQuartile', {}, self);
			break;
			case 'AdVideoMidpoint':
				self.trigger('vastevent', 'midpoint', {}, self);
			break;
			case 'AdVideoThirdQuartile':
				self.trigger('vastevent', 'thirdQuartile', {}, self);
			break;
			case 'AdImpression':
				self.trigger('start', self);
				self.trigger('vastevent', 'creativeView', {}, self);
			break;
		}
	});
}

VPAIDLinear.prototype = extend(Object.create(CustomObject), {

	vpaidEventsList: [
		'AdLoaded',
		'AdSkipped',
		'AdStarted',
		'AdStopped',
		'AdLinearChange',
		'AdSkippableStateChange',
		'AdSizeChange',
		'AdDurationChange',
		'AdExpandedChange',
		'AdRemainingTimeChange',
		'AdVolumeChange',
		'AdImpression',
		'AdVideoStart',
		'AdVideoFirstQuartile',
		'AdVideoMidpoint',
		'AdVideoThirdQuartile',
		'AdVideoComplete',
		'AdClickThru',
		'AdInteraction',
		'AdUserAcceptInvitation',
		'AdUserMinimize',
		'AdUserClose',
		'AdPaused',
		'AdPlaying',
		'AdLog',
		'AdError',
	],

	show: function(place, width, height, options){
		var self = this;
		var iframe = html('<iframe id="iframe" frameborder="no" scrolling="no" allowfullscreen></iframe>');
		iframe.width = width;
		iframe.height = height;
		place.appendChild(iframe);

		var _t = setTimeout(function(){
			debug.log("Timeout VPAID AdLoaded event > skip");
			self.trigger('vasterror', 900, 'Timeout VPAID AdLoaded event');
		}, options.timeout);

		this.on('vpaidevent', function(e, event){
			if(event=='AdLoaded' || event=='AdStarted' || event=='AdError'){
				clearTimeout(_t);
			}
		});

		if(this.type=='application/x-shockwave-flash'){
			this.showFlash(iframe, width, height, options);
		}else{
			this.showJS(iframe, width, height, options, iframe);
		}
	},

	showFlash: function(iframe, width, height, options){
		var self = this;
		var doc = iframe.contentDocument;
		var win = iframe.contentWindow;

		var ready_fn_name = "_custom_player_vpaid_on_ready"+Math.random().toString(16).split('.')[1];
		var error_fn_name = "_custom_player_vpaid_on_error"+Math.random().toString(16).split('.')[1];

		var subscribe = function(type, fn){
			var n = '_custom_player_vpaid_' + type + Math.random().toString(16).split('.')[1]
			iframe.contentWindow[n] = fn;
			self.vpaid.subscribe(type, n);
		}

		iframe.contentWindow[error_fn_name] = function(){
			self.trigger('vpaidevent', 'AdError');
		};

		iframe.contentWindow[ready_fn_name] = function(){
			self.vpaid = iframe.contentWindow.vpaid;

			console.log('--VPAID version:', self.vpaid.handshakeVersion('2.0'));
			console.log('getAdLinear:', self.vpaid.getAdLinear());

			subscribe('AdLoaded', function(){
				debug.log('Call "startAd" for flash VPAID application');
				self.vpaid.startAd();
			});

			map(self.vpaidEventsList, function(event){
				subscribe(event, function(args){
					self.trigger('vpaidevent', event, args);
				});
			});

			debug.log('Call "initAd" for flash VPAID application');

			self.vpaid.initAd(width, height, "normal", 500, self.creative.params.AdParameters, "");
		};

		doc.open();
		doc.write(
			'<body style="padding:0; margin:0; width:100%; height:100%;">'+
				'<object id="vpaid" type="application/x-shockwave-flash" width="100%" height="100%" data="'+options.vpaid_flash_bridge+'">'+
					'<param name="allowScriptAccess" value="always"></param>'+
					'<param name="allowNetworking" value="all"></param>'+
					'<param name="wmode" value="transparent">'+
					'<param name="flashvars" value="'+
						'onReady='+ready_fn_name+
						'&onError='+error_fn_name+
						'&src='+encodeURIComponent(this.src)+
					'"></param>'+
				'</object>'+
			'</body>'
		);
		doc.close();
	},

	showJS: function(iframe, width, height, options){
		var self = this;

		iframe.contentWindow.trigger_error = function(){
			self.trigger('vpaidevent', 'AdError', 'Can\'t load vpaid file');
		};

		iframe.contentWindow.trigger_load = function(){
			var getVPAIDAd = iframe.contentWindow.getVPAIDAd;

			if(typeof getVPAIDAd!=='function'){
				self.trigger('vasterror', 901, 'General VPAID error.', self.creative);
				return;
			}
			self.vpaid = getVPAIDAd();

			map(self.vpaidEventsList, function(event){
				self.vpaid.subscribe(function(){
					self.trigger('vpaidevent', event, arguments);
				}, event);
			});

			self.vpaid.initAd(width, height, 'normal', 500, self.creative.params, {
				slot: iframe.contentDocument.body,
			});
		};

		iframe.contentDocument.open();
		iframe.contentDocument.write(
			'<body style="margin:0; padding:0; width:100%; height:100%;">'+
				'<script src="'+this.src+'" onload="trigger_load()" onerror="trigger_error()"></script>'+
			'</body>'
		);
		iframe.contentDocument.close();
	},

	getIsSupport: function(){
		var support_types = [
			'application/javascript',
			'application/x-javascript',
		];
		if(flash_support()){
			support_types.push('application/x-shockwave-flash');
		}
		return support_types.indexOf(this.type) > -1;
	}
});


function VideoLinear(options){
	var self = this;

	this.type;
	this.src;
	this.creative;
	extend(this, options);

	this.player = null;
	
	this.use_html5 = false;
	this.use_flash = false;
}

VideoLinear.prototype = extend(Object.create(CustomObject), {

	show: function(place, width, height, options){
		var self = this;

		this.player = new CustomPlayer(place, options);

		this.player.on('error', function(e, code, message){
			self.trigger('vasterror', 400, 'General Linear error. '+message, this);
		});

		this.player.one('play', function(e){

			this.on('ended', function(){
				self.trigger('vastevent', 'complete', {}, self.creative);
				self.off('vastevent');
			});

			this.on('pause', function(){
				self.trigger('vastevent', 'pause', {}, self.creative);
			});

			this.on('resume', function(){
				self.trigger('vastevent', 'resume', {}, self.creative);
			});

			var prevous_volume;
			this.on('volumechange', function(e, volume){
				if(volume>0 && prevous_volume==0){
					self.trigger('vastevent', 'unmute', {}, self.creative);
				}
				if(volume==0 && prevous_volume!=0){
					self.trigger('vastevent', 'mute', {}, self.creative);
				}
				prevous_volume = volume;
			});

			var step = 0;
			this.on('timeupdate', function(e, time){
				var progress = time / this.getDuration() * 100;
				if(progress>0 && step==0){ step++;
					self.trigger('vastevent', 'start', {}, self.creative);
					self.trigger('vastevent', 'creativeView', {}, self.creative);
				}
				if(progress>25 && step==1){ step++;
					self.trigger('vastevent', 'firstQuartile', {}, self.creative);
				}
				if(progress>50 && step==2){ step++;
					self.trigger('vastevent', 'midpoint', {}, self.creative);
				}
				if(progress>75 && step==3){ step++;
					self.trigger('vastevent', 'thirdQuartile', {}, self.creative);
				}
			});

			self.trigger('start', self);
		});

		this.player.one('canplay', function(e){
			if(!getDeviceInfo().is_mobile){
				self.player.play();
			}
		});

		this.player.setSources([{src:this.src, type:this.type}]);
		this.player.load();
	},

	getIsSupport: function(){
		return CustomPlayer.prototype.supportMedia(this.type);
	},
	
});
function MediaFile(xml, options){

	this.creative;
	this.is_vpaid = false;
	extend(this, options);

	this.is_error = false;
	
	this.on('vasterror', function(e, code, message, source){
		this.is_error = true;
	});

	this.parse(xml);
}

MediaFile.prototype = extend(Object.create(CustomObject), {

	parse: function(xml){
		var self = this;

		var options = {
			type: xml.getAttribute('type'),
			src: xml.textContent.trim(),
			creative: this.creative,
		};

		this.is_vpaid = this.is_vpaid || (xml.getAttribute('apiFramework') || '').toLowerCase() == 'vpaid';

		if(this.is_vpaid){
			this.media = new VPAIDLinear(options);
		}else{
			this.media = new VideoLinear(options);
		}

		this.media.proxy([
			'vastevent',
			'vasterror',
			'vpaidevent',
			'done',
			'start',
		], self);
	},

	getSource: function(){
		return this.media.src;
	},

	getIsSupport: function(){
		return this.media.getIsSupport();
	},

	show: function(place, width, height, options){
		this.creative.is_vpaid = this.is_vpaid;
		this.media.show(place, width, height, options);
	},

});
function LinearCreative(xml, options){

	this.place = null;
	this.width;
	this.height;
	this.player_options = {};
	this.vpaid_options = {};
	extend(this, options);

	this.id;
	this.skipoffset = null;
	this.sequence = 1;
	this.is_vpaid = false;
	this.click_through = null;
	this.params = {};
	this.tracking = {};
	this.medias = [];

	this.is_ready = false;
	this.is_error = false;
	this.is_done = false;

	this.on('ready', function(){
		this.is_ready = true;
	});

	this.on('vasterror', function(e, code, message, source){
		this.is_error = true;
		this.trigger('error');
	});

	this.on('vastevent', function(e, event, args, source){

		debug.log('VAST event', event, JSON.stringify(args));

		switch(event){
			case 'clickthru':
				if(!args.no_fire_pixel){
					openWindow(args.click_through);
				}
			break;
			case 'skip':
			case 'complete':
				this.trigger('done');
			break;
		}
		processTracking(this.tracking[event]);
	});

	this.on('start', function(e){
		this.trigger('linearstart', this);
	});

	this.on('done', function(){
		this.is_done = true;
	});

	var self = this;
	setTimeout(function(){
		self.parse(xml);
	}, 0);
}

LinearCreative.prototype = extend(Object.create(CustomObject), {

	parse: function(xml){
		var self = this;

		this.id = xml.getAttribute('id') || null;
		this.sequence = parseInt(xml.getAttribute('sequence')) || 1;
		this.is_vpaid = (xml.getAttribute('apiFramework') || '').toLowerCase() == 'vpaid';
		this.tracking = parseTrackingEvents(xml.getElementsByTagName('TrackingEvents')[0]);

		if(ad_parameters_xml=xml.getElementsByTagName('AdParameters')[0]){
			this.params.AdParameters = ad_parameters_xml.textContent.trim();
		}

		if(skipoffset_attr=xml.getAttribute('skipoffset')){
			this.skipoffset = parseSkipOffset(skipoffset_attr);
		}

		if(clicks_xml=xml.getElementsByTagName('VideoClicks')[0]){
			if(through_xml = clicks_xml.getElementsByTagName('ClickThrough')[0]){
				this.click_through = through_xml.textContent.trim();
			}

			if(click_tracking_xml=xml.getElementsByTagName('ClickTracking')[0]){
				this.tracking.clickthru = this.tracking.clickthru || [];
				this.tracking.clickthru.push({
					event: 'clickthru',
					content: click_tracking_xml.textContent.trim(),
				});
			}
		}

		map(xml.getElementsByTagName('MediaFile'), function(media_xml){
			var media = new MediaFile(media_xml, {
				is_vpaid: self.is_vpaid,
				creative: self,
			});

			media.proxy([
				'vasterror',
				'vastevent',
				'start',
			], self);

			self.medias.push(media);
		});

		this.trigger('ready');
	},

	show: function(options){
		var self = this;

		if(this.medias.length){

			for(var i=0; i<this.medias.length; i++){
				var media = this.medias[i];
				if(media.getIsSupport()){
					this.media = media;
					break;
				}
			}
			if(this.media){
				var p = html('<div style="position:absolute; width:100%; height:100%; top:0; background:black"></div>');
				options.place.appendChild(p);
				this.on('done', function(){
					options.place.removeChild(p);
				});

				if(options.place.offsetHeight==0){
					return;
				}

				if(this.media.is_vpaid){
					debug.log('Show linear VPAID', this.media.getSource());
					this.media.show(p, options.place.offsetWidth, options.place.offsetHeight, options.vpaid_options);
				}else{
					debug.log('Show linear video', this.media.getSource());
					this.media.show(p, options.place.offsetWidth, options.place.offsetHeight, options.player_options);
				}

			}else{
				debug.log("No support any media of this creative", this.id);
				this.trigger('vasterror', 403, 'Couldn\'t find MediaFile that is supported by this video player, based on the attributes of the MediaFile element.', this);
			}
		}else{
			debug.log("Not found any media of this creative", this.id);
			this.trigger('vasterror', 400, 'General Linear error. Video player is unable to display the Linear Ad.', this);
		}
	},

	play: function(){
		this.media.media.player.play();
	},

	pause: function(){
		this.media.media.player.pause();
	},

	skip: function(){
		this.trigger('vastevent', 'skip', {}, this);
	},

	clickthru: function(url){
		this.trigger('vastevent', 'clickthru', {
			click_through: url,
		}, this);
	},

	setVolume: function(volume){
		this.media.media.player.setVolume(volume);
	},

	mute: function(){
		this.media.media.player.mute();
	},

	unmute: function(){
		this.media.media.player.unmute();
	},

});function NonLinear(xml){

	this.place;
	this.elm;

	this.width;
	this.height;
	this.is_vpaid = false;
	this.min_duration;
	this.resource;
	this.click_through;
	this.tracking = [];

	this.can_show = false;
	this.is_error = false;

	this.on('vasterror', function(e, code, message, source){
		this.is_error = true;
	});

	this.on('vastevent', function(e, event, args, source){
		if(event=='clickthru'){
			openWindow(args.click_through);
		}
		processTracking(this.tracking[event]);
	});

	this.parse(xml);
}

NonLinear.prototype = extend(Object.create(CustomObject), {

	parse: function(xml){

		this.is_vpaid = (xml.getAttribute('apiFramework') || '').toLowerCase() == 'vpaid';
		this.width = xml.getAttribute('width') || 0;
		this.height = xml.getAttribute('height') || 0;
		this.tracking = parseTrackingEvents(xml.getElementsByTagName('TrackingEvents')[0]);

		if(min_duration=xml.getAttribute('minSuggestedDuration')){
			if(m = /^(\d{1,2}):(\d{1,2}):(\d{1,2})/.exec(min_duration)){
				this.min_duration = parseInt(m[1])*3600 + parseInt(m[2])*60 + parseInt(m[3]);
			}
		}

		if(click_through_xml = xml.getElementsByTagName("NonLinearClickThrough")[0]){
			this.click_through = click_through_xml.textContent;
		}

		if(click_tracking_xml=xml.getElementsByTagName('NonLinearClickTracking')[0]){
			this.tracking.clickthru = this.tracking.clickthru || [];
			this.tracking.clickthru.push({
				event: 'clickthru',
				content: click_tracking_xml.textContent,
			});
		}

		if(!this.resource && (static_xml=xml.getElementsByTagName('StaticResource')[0])){
			var type = static_xml.getAttribute("creativeType");
			if(this.supportMedia(type)){
				this.resource = {
					type: type,
					src: static_xml.textContent.trim(),
				};
			}
		}
		if(!this.resource && (iframe_xml=xml.getElementsByTagName('IFrameResource')[0])){
			this.resource = {
				type: 'iframe',
				src: iframe_xml.textContent.trim(),
			};
		}
		if(!this.resource && (html_xml=xml.getElementsByTagName('HTMLResource')[0])){
			this.resource = {
				type: 'html',
				src: html_xml.textContent.trim(),
			};
		}

		this.can_show = !!this.resource;
	},

	show: function(place){
		var self = this;

		this.place = place;
		this.elm = html(
			'<div class="nonlinear">'+
				'<div class="close">x</div>'+
				'<div class="inner"></div>'+
			'</div>'
		);
		var close = this.elm.getElementsByClassName('close')[0];
		var inner = this.elm.getElementsByClassName('inner')[0];

		this.elm.style.width = this.width+'px';
		this.elm.style.height = this.height+'px';
		this.elm.style.right = '10px';
		this.elm.style.bottom = '70px';

		var banner = createBanner(this.resource.type, this.resource.src);
		inner.appendChild(banner);

		if(this.click_through){
			on(this.elm, 'click', function(){
				self.trigger('vastevent', 'clickthru', {
					click_through: self.click_through,
				}, self);
			})
		}

		if(this.min_duration){
			close.style.display = 'none';
			setTimeout(function(){
				close.style.display = '';
			}, this.min_duration*1000);
		}

		on(close, 'click', function(){
			self.close();
			return false;
		});

		this.place.appendChild(this.elm);
		this.trigger('vastevent', 'creativeView', {}, this);
	},

	close: function(){
		this.trigger('vastevent', 'collapse', {}, this);
		this.trigger('vastevent', 'close', {}, this);

		this.place.removeChild(this.elm);
	},

	supportMedia: function(type){
		return type!='application/x-shockwave-flash' || flash_support();
	},
});
function NonLinearCreative(xml, options){

	this.place = null;
	extend(this, options);

	this.sequence;
	this.required;
	this.banners = [];

	this.is_ready = false;
	this.is_error = false;

	this.on('ready', function(){
		this.is_ready = true;
	});

	this.on('vasterror', function(e, code, message, source){
		this.is_error = true;
	});

	var self = this;
	setTimeout(function(){
		self.parse(xml);
	}, 0);
}

NonLinearCreative.prototype = extend(Object.create(CustomObject), {

	parse: function(xml){
		var self = this;

		this.sequence = parseInt(xml.getAttribute('sequence')) || 1;

		map(xml.getElementsByTagName('NonLinear'), function(nonlinear_xml){
			var nonlinear = new NonLinear(nonlinear_xml);

			nonlinear.proxy([
				'vasterror',
				'vastevent'
			],self);

			self.banners.push(nonlinear);
		});

		this.trigger('ready');
	},

	show: function(){
		var self = this;

		if(this.banners.length == 0){
			self.trigger('vasterror', 500, 'General NonLinearAds error', self);
			return;
		}

		var current_idx = 0;
		(function(){
			var fn = arguments.callee;
			if(banner=self.banners[current_idx]){
				if(banner.can_show){
					banner.on('close', function(){
						current_idx++;
						fn();
					});
					banner.show(self.place);
				}else{
					self.trigger('vasterror', 503, 'Couldn’t find NonLinear resource with supported type.', self);
					current_idx++;
					fn();
				}
			}else{
				// done
			}
		})();
	}

});function Companion(xml){
	this.place;
	this.width;
	this.height;
	this.resource;
	this.click_through;
	this.tracking = [];

	this.is_error = false;

	this.on('vasterror', function(e, code, message, source){
		this.is_error = true;
	});

	this.on('vastevent', function(e, event, args, source){
		if(event=='clickthru'){
			openWindow(args.click_through);
		}
		processTracking(this.tracking[event]);
	});

	this.parse(xml);
}

Companion.prototype = extend(Object.create(CustomObject), {

	parse: function(xml){

		this.width = xml.getAttribute('width') || 0;
		this.height = xml.getAttribute('height') || 0;
		this.tracking = parseTrackingEvents(xml.getElementsByTagName('TrackingEvents')[0]);

		if(through_xml=xml.getElementsByTagName('CompanionClickThrough')[0]){
			this.click_through = through_xml.textContent;
		}

		if(click_tracking_xml=xml.getElementsByTagName('CompanionClickTracking')[0]){
			this.tracking.clickthru = this.tracking.clickthru || [];
			this.tracking.clickthru.push({
				event: 'clickthru',
				content: click_tracking_xml.textContent,
			});
		}

		if(!this.resource && (static_xml=xml.getElementsByTagName('StaticResource')[0])){
			var type = static_xml.getAttribute("creativeType");
			if(this.supportMedia(type)){
				this.resource = {
					type: type,
					src: static_xml.textContent.trim(),
				};
			}
		}
		if(!this.resource && (iframe_xml=xml.getElementsByTagName('IFrameResource')[0])){
			this.resource = {
				type: 'iframe',
				src: iframe_xml.textContent.trim(),
			};
		}
		if(!this.resource && (html_xml=xml.getElementsByTagName('HTMLResource')[0])){
			this.resource = {
				type: 'html',
				src: html_xml.textContent.trim(),
			};
		}

		if(this.resource && (ad_slot_id=xml.getAttribute('adSlotID'))){
			if(custom_place = document.getElementById(ad_slot_id)){
				if(this.width==custom_place.offsetWidth && this.height==custom_place.offsetHeight){
					this.place = custom_place;
				}
			}
		}
	},

	show: function(){
		var self = this;

		var elm = createBanner(this.resource.type, this.resource.src);
		elm.width = this.width;
		elm.height = this.height;

		if(this.click_through){
			elm.style.cursor = 'pointer';
			on(elm, 'click', function(){
				self.trigger('vastevent', 'clickthru', {
					click_through: self.click_through,
				}, self);
			})
		}

		this.place.innerHTML = '';
		this.place.appendChild(elm);

		self.trigger('vastevent', 'creativeView', {}, this);
	},

	supportMedia: function(type){
		return type!='application/x-shockwave-flash' || flash_support();
	},

});
function CompanionCreative(xml, options){

	this.places = [];
	extend(this, options);

	this.sequence;
	this.required;
	this.banners = [];

	this.is_ready = false;
	this.is_error = false;

	this.on('ready', function(){
		this.is_ready = true;
	});

	this.on('vasterror', function(e, code, message, source){
		this.is_error = true;
	});

	var self = this;
	setTimeout(function(){
		self.parse(xml);
	}, 0);
}

CompanionCreative.prototype = extend(Object.create(CustomObject), {

	parse: function(xml){
		var self = this;

		this.sequence = parseInt(xml.getAttribute('sequence')) || 1;
		this.required = xml.getAttribute('required') || 'any';

		if(this.required!='none'){
			map(xml.getElementsByTagName('Companion'), function(companion_xml){
				var companion = new Companion(companion_xml);

				companion.proxy([
					'vasterror',
					'vastevent'
				],self);

				self.banners.push(companion);
			});
		}
		this.trigger('ready');
	},

	show: function(){
		var self = this;

		if(this.required!='none'){

			var places = [];
			var places_elm = [];

			map(this.places, function(place){
				if(elm = document.getElementById(place.id)){
					places.push(place.width+'x'+place.height);
					places_elm.push(elm);
				}
			});

			map(this.banners, function(banner){
				if(banner.place){
					if((i = places_elm.indexOf(banner.place))>-1){
						places[i] = null;
					}
				}else{
					if((i = places.indexOf(banner.width+'x'+banner.height))>-1){
						places[i] = null;
						banner.place = places_elm[i];
					}
				}

				if(banner.place){
					banner.show();
				}else{
					self.trigger('vasterror', 601, 'Unable to display Companion because creative dimensions do not fit within Companion display area (i.e., no available space).', banner);
					if(self.required=='all'){
						self.trigger('vasterror', 602, 'Unable to display Required Companion', self);
						return false;
					}
				}
			});
		}
	},

});
function Creative(xml, options){

	this.parent = null;
	this.linear_options = {};
	this.nonlinear_options = {};
	this.companion_options = {};
	extend(this, options);

	this.type;
	this.creative;
	this.tracking = {};

	this.is_ready = false;
	this.is_error = false;
	this.is_linear_done = false;

	this.on('ready', function(){
		this.is_ready = true;
	});

	this.on('vasterror', function(e, code, message, source){
		this.is_error = true;
	});

	this.on('vastevent', function(e, event, args, source){
		processTracking(this.tracking[event]);
	});

	this.on('lineardone', function(){
		this.is_linear_done = true;
	});

	var self = this;
	setTimeout(function(){
		self.parse(xml);
	}, 0);
}

Creative.prototype = extend(Object.create(CustomObject), {

	parse: function(xml){
		var self = this;

		this.id = xml.getAttribute('id') || null;
		this.tracking = {}; // parseTrackingEvents(xml.getElementsByTagName('TrackingEvents')[0]);

		if(linear_xml = xml.getElementsByTagName('Linear')[0]){
			this.type = 'linear';
			this.creative = new LinearCreative(linear_xml, this.linear_options);
			this.creative.on(['done', 'error'], function(){
				setTimeout(function(){
					self.trigger('lineardone');
				}, 0);
			});
		}
		else if(nonlinear_xml = xml.getElementsByTagName('NonLinearAds')[0]){
			this.type = 'nonlinear';
			this.creative = new NonLinearCreative(nonlinear_xml, this.nonlinear_options);
		}
		else if(companion_xml = xml.getElementsByTagName('CompanionAds')[0]){
			this.type = 'companion';
			this.creative = new CompanionCreative(companion_xml, this.companion_options);
		}
		else {
			this.trigger('vasterror', 0, '', this);
			return;
		}

		this.creative.parent = this;

		this.creative.proxy([
			'ready',
			'vasterror',
			'vastevent',
			'linearstart',
		], self);
	},

	show: function(){
		switch(this.type){
			case 'linear':
				this.creative.show(this.linear_options);
			break;
			case 'nonlinear':
				this.creative.show(this.nonlinear_options);
			break;
			case 'companion':
				this.creative.show(this.companion_options);
			break;
		}
	},

});
function InLine(xml, options){

	this.parent = null;
	this.linear_options = {};
	this.nonlinear_options = {};
	this.companion_options = {};
	extend(this, options);

	this.error_url;
	this.impression_url;
	this.tracking = {};

	this.creatives = [];
	this.linear = [];
	this.nonlinear = [];
	this.companion = [];

	this.is_ready = false;
	this.is_error = false;
	this.is_linear_done = false;

	this.on('ready', function(){
		this.is_ready = true;
	});

	this.on('error', function(){
		this.is_error = true;
	});
	
	this.on('lineardone', function(){
		this.is_linear_done = true;
	});

	this.on('vastevent', function(e, name, args, source){
		if(name=='creativeView'){
			e.handler.remove();
			if(this.impression_url){
				firePixel(this.impression_url);
				this.trigger('vastevent', 'impression', {url:this.impression_url}, this);
			}
		}
	});

	this.on('vasterror', function(e, errno, error, source){
		if(this.error_url){
			firePixel(this.error_url, {
				'ERRORCODE': errno
			});
		}
	});

	var self = this;
	setTimeout(function(){
		self.parse(xml);
	}, 0);
}

InLine.prototype = extend(Object.create(CustomObject), {
	
	parse: function(xml){
		var self = this;

		debug.log("Parse InLine tag");

		if(error_xml=xml.getElementsByTagName('Error')[0]){
			this.error_url = error_xml.textContent.trim();
		}

		if(impression_xml=xml.getElementsByTagName('Impression')[0]){
			this.impression_url = impression_xml.textContent.trim();
		}

		if(creatives_xml = xml.getElementsByTagName('Creatives')[0]){

			var options = {
				parent: self,
				linear_options: self.linear_options,
				nonlinear_options: self.nonlinear_options,
				companion_options: self.companion_options,
			};

			map(creatives_xml.getElementsByTagName('Creative'), function(creative_xml){
				var creative = new Creative(creative_xml, options);
				self.creatives.push(creative);

				creative.on('ready', function(){
					if(creative.type=='linear'){
						self.linear.push(creative);
					}
					if(creative.type=='nonlinear'){
						self.nonlinear.push(creative);
					}
					if(creative.type=='companion'){
						self.companion.push(creative);
					}
					if(every(self.creatives, function(a){return a.is_ready || a.is_error})){
						self.trigger('ready');
					}
				});

				creative.proxy([
					'vasterror',
					'vastevent',
					'linearstart',
				], self);
			});

			this.linear.sort(function(a, b){return a.sequence - b.sequence});
			this.nonlinear.sort(function(a, b){return a.sequence - b.sequence});
			this.companion.sort(function(a, b){return a.sequence - b.sequence});
		}
	},

	start: function(){
		var self = this;
		this.on('lineardone', function(){
			self.startNonLinear();
		});
		this.startCompanion();
		this.startLinear();
	},

	startLinear: function(){
		var self = this;
		var current_idx = 0;

		(function(){
			var fn = arguments.callee;
			if(creative = self.linear[current_idx]){
				creative.on('lineardone', function(){
					current_idx++;
					fn();
				});
				creative.show();
			}else{
				self.trigger('lineardone');
			}
		})();
	},

	startNonLinear: function(){
		if(this.nonlinear.length==0){
			debug.log("This creative haven't any nonlinear creatives");
		}
		map(this.nonlinear, function(creative){
			creative.show();
		});
	},

	startCompanion: function(){
		if(this.companion.length==0){
			debug.log("This creative haven't any companion creatives");
		}
		map(this.companion, function(creative){
			creative.show();
		});
	},
});function Wrapper(xml, options){

	this.parent = null;
	this.linear_options = {};
	this.nonlinear_options = {};
	this.companion_options = {};
	extend(this, options);

	this.vast;
	this.error_url;
	this.impression_url;
	this.trackings = {
		'linear': {},
		'nonlinear': {},
		'companion': {},
	};

	this.on('ready', function(){
		this.is_ready = true;
	});
	this.on('error', function(){
		this.is_error = true;
	});
	this.on('lineardone', function(){
		this.is_linear_done = true;
	});

	this.on('vastevent', function(e, name, args, source){
		if(name=='creativeView'){
			e.handler.remove();
			if(this.impression_url){
				firePixel(this.impression_url);
				this.trigger('vastevent', 'impression', {url:this.impression_url}, this);
			}
		}
	});

	this.on('vastevent', function(e, event, args, source){
		if(source instanceof LinearCreative){
			processTracking(this.trackings['linear'][event]);
		}
		if(source instanceof NonLinearCreative){
			processTracking(this.trackings['nonlinear'][event]);
		}
		if(source instanceof CompanionCreative){
			processTracking(this.trackings['companion'][event]);
		}
	});

	this.on('vasterror', function(e, errno, error, source){
		if(this.error_url){
			firePixel(this.error_url, {
				'ERRORCODE': errno
			});
		}
	});

	var self = this;
	setTimeout(function(){
		self.parse(xml);
	}, 0);
}

Wrapper.prototype = extend(Object.create(CustomObject), {
	
	parse: function(xml){
		var self = this;
		var url = xml.getElementsByTagName("VASTAdTagURI")[0].textContent;

		debug.log("Parse Wrapper tag");

		if(error_xml=xml.getElementsByTagName('Error')[0]){
			this.error_url = error_xml.textContent.trim();
		}

		if(impression_xml=xml.getElementsByTagName('Impression')[0]){
			this.impression_url = impression_xml.textContent.trim();
		}

		this.vast = new VAST(url, {
			parent: this,
			linear_options: this.linear_options,
			nonlinear_options: this.nonlinear_options,
			companion_options: this.companion_options,
		});

		if(creatives_xml = xml.getElementsByTagName('Creatives')[0]){
			map(creatives_xml.getElementsByTagName('Creative'), function(creative_xml){
				if(linear_xml = xml.getElementsByTagName('Linear')[0]){
					self.trackings['linear'] = parseTrackingEvents(linear_xml.getElementsByTagName('TrackingEvents')[0]);
				}
				if(nonlinear_xml = xml.getElementsByTagName('NonLinearAds')[0]){
					self.trackings['nonlinear'] = parseTrackingEvents(nonlinear_xml.getElementsByTagName('TrackingEvents')[0]);
				}
				if(companion_xml = xml.getElementsByTagName('CompanionAds')[0]){
					self.trackings['companion'] = parseTrackingEvents(companion_xml.getElementsByTagName('TrackingEvents')[0]);
				}
			});
		}

		this.vast.proxy([
			'ready',
			'error',
			'vastevent',
			'vasterror',
			'lineardone',
			'linearstart',
		], self);
	},

	start: function(){
		this.vast.start();
	},

	startLinear: function(){
		this.vast.startLinear();
	},

	startCompanion: function(){
		this.vast.startCompanion();
	},

	startNonLinear: function(){
		this.vast.startNonLinear();
	},

});
function Ad(xml, options){

	this.parent = null;
	this.linear_options = {};
	this.nonlinear_options = {};
	this.companion_options = {};
	extend(this, options);

	this.id;
	this.sequence;

	this.is_ready = false;
	this.is_error = false;
	this.is_linear_done = false;
	this.is_wrapper = false;

	this.on('ready', function(){
		this.is_ready = true;
	});
	this.on('error', function(){
		this.is_error = true;
	});
	this.on('lineardone', function(){
		this.is_linear_done = true;
	});

	var self = this;
	setTimeout(function(){
		self.parse(xml);
	}, 0);
}

Ad.prototype = extend(Object.create(CustomObject), {

	parse: function(xml){
		var self = this;

		this.id = xml.getAttribute('id') || null;
		this.sequence = parseInt(xml.getAttribute('sequence')) || 1;

		var options = {
			parent: this,
			linear_options: self.linear_options,
			nonlinear_options: self.nonlinear_options,
			companion_options: self.companion_options,
		};

		if(wrapper_xml=xml.getElementsByTagName('Wrapper')[0]){
			this.inline = new Wrapper(wrapper_xml, options);
		}else if(inline_xml=xml.getElementsByTagName('InLine')[0]){
			this.inline = new InLine(inline_xml, options);
		}else{
			this.trigger('error');
		}

		this.inline.proxy([
			'ready',
			'linearstart',
			'lineardone',
			'error',
			'vastevent',
			'vasterror'
		], self);
	},

	start: function(){
		this.inline.start();
	},

	startLinear: function(){
		this.inline.startLinear();
	},

	startCompanion: function(){
		this.inline.startCompanion();
	},

	startNonLinear: function(){
		this.inline.startNonLinear();
	},

});
function VAST(url, options){
	var self = this;

	this.parent = null;
	this.timeout = 7000;
	this.linear_options = {
		player_options: {},
		vpaid_options: {
			timeout: 10000,
		},
	};
	this.nonlinear_options = {};
	this.companion_options = {};
	extend(this, options);

	this.url = extendUrl(url, {
		'URL': location.href,
		'CONTAINER_WIDTH': this.linear_options.width,
		'CONTAINER_HEIGHT': this.linear_options.height,
	});

	this.ads = [];

	this.is_ready = false;
	this.is_error = false;
	this.is_linear_done = false;

	this.on('ready', function(){
		this.is_ready = true;
	});
	this.on('error', function(e, code, message){
		debug.log("ERROR in VAST", this.url, code, message);
		this.is_error = true;
	});
	this.on('vasterror', function(e, code, message){
		debug.log("ERROR in VAST", this.url, code, message);
	});
	this.on('lineardone', function(){
		debug.log("End linear procees for VAST", this.url);
		this.is_linear_done = true;
	});

	// setTimeout(function() {
		self.load(self.url);
	// }, 0);
}

VAST.prototype = extend(Object.create(CustomObject), {

	load: function(url){
		var self = this;
		var xhr = null;

		debug.log('Load VAST tag:', url);

		var _t;

		if(this.timeout){
			_t = setTimeout(function(){
				debug.log("Timeout load", url);
				self.trigger('error', 301, 'Timeout of VAST URI '+url);
				xhr.abort();
			}, this.timeout);
		}

		xhr = load(url, function(success, xhr){
			clearTimeout(_t);

			if(success){
				if(xhr.status==0){
					debug.log('Can not load VAST tag');
					self.trigger('error', 902, 'Can not load VAST tag');
					return;
				}
				if(!xhr.responseXML || !xhr.responseXML.documentElement){
					debug.log('XML parsing error');
					self.trigger('error', 100, 'XML parsing error');
					return;
				}

				map(xhr.responseXML.documentElement.getElementsByTagName('Ad'), function(ad_xml){
					var ad = new Ad(ad_xml, {
						parent: self,
						linear_options: self.linear_options,
						nonlinear_options: self.nonlinear_options,
						companion_options: self.companion_options,
					});
					
					ad.on('ready', function(){
						if(every(self.ads, function(a){return a.is_ready || a.is_error})){
							self.trigger('ready');
						}
					});

					ad.proxy([
						'linearstart',
						'vastevent',
						'vasterror',
						'error'
					], self);

					self.ads.push(ad);
				});
				if(self.ads.length){
					self.ads.sort(function(a, b){return a.sequence - b.sequence});
				}else{
					debug.log('No Ads in VAST tag');
					self.trigger('error', 903, 'No Ads in VAST tag');
				}
			}else{
				debug.log('Can not load VAST tag');
				self.trigger('error', 902, 'Can not load VAST tag');
			}
		});

		if(!xhr){
			clearTimeout(_t);
			debug.log('Browser can not make ajax requests');
			self.trigger('error', 904, 'Browser can not make ajax requests');
		}
	},

	start: function(){
		var self = this;
		this.on('lineardone', function(){
			self.startNonLinear();
		});
		this.startCompanion();
		this.startLinear();
	},

	startLinear: function(){
		var self = this;
		var current_idx = 0;

		debug.log("Process linear for VAST:", this.url);

		(function(){
			var fn = arguments.callee;
			if(ad = self.ads[current_idx]){
				ad.on('lineardone', function(){
					current_idx++;
					fn();
				});
				ad.startLinear();
			}else{
				if(!self.is_linear_done){
					self.trigger('lineardone');
				}
			}
		})();
	},

	startCompanion: function(){
		debug.log("Process companion for VAST:", this.url);

		map(this.ads, function(ad){
			ad.startCompanion();
		});
	},

	startNonLinear: function(){
		debug.log("Process nonlinear for VAST:", this.url);

		map(this.ads, function(ad){
			ad.startNonLinear();
		});
	},

});	(function(){
		var s = document.createElement('STYLE');
		s.innerHTML = '.Ad {position: absolute;width: 100%;height: 100%;top: 0;z-index: 1000;}.Ad .ad-info {position: absolute;right: 5px;vertical-align: middle;top: 10px;color: #fff;font-size: 13pt;z-index: 10;background: rgba(0,0,0,0.5);padding: 5px 10px;}.Ad .ad-info .ad-link{color: #fff;border-bottom: 1px dashed #fff;text-decoration: none;cursor: pointer;}.Ad .ad-skip {position: absolute;display: table;right: 5px;bottom: 70px;padding: 5px;background: rgba(0,0,0,0.4);cursor: pointer;z-index: 10;}.Ad .ad-skip  > .message {display: table-cell;color: #fff;vertical-align: middle;text-align: center;font-size: 12pt;padding-right: 10px;}.Ad .ad-skip > img {display: table-cell;height: 60px;}.customPlayer > .nonlinear {position: absolute;z-index: 1000;}.customPlayer > .nonlinear .close {position: absolute;right: 0;top: 0;width: 15px;height: 15px;cursor: pointer;color: red;z-index: 1;text-align: center;}.customPlayer > .nonlinear .close:hover {text-decoration: underline;}.customPlayer > .nonlinear .inner {position: absolute;left: 0;top: 0;cursor: pointer;}';
		document.head.appendChild(s);
	})();
function AdControls(player, options){

	this.click_through = null;
	this.skipoffset = null;
	extend(this, options);

	this.player = player;

	this.info = html(
		'<div class="ad-info">'+
			'<span>'+
				'<span class="ad-link">Visit advertiser\'s site</span>'+
				'<span style="margin:0 10px">&bull;</span>'+
			'</span>'+
			'<span class="timer"></span>'+
		'</div>'
	);
	this.skip = html(
		'<div class="ad-skip">'+
			'<div class="message"></div>'+
		'</div>'
	);

	this.ctrl = new Controls(this.player, {
		progress: {
			readonly: true,
		},
		timer: {
			show: false,
		}
	});
	this.ctrl.proxy([
		'play',
		'pause',
		'volumechange',
		'mute',
		'unmute',
	], this);

	this.init();
}

AdControls.prototype = extend(Object.create(CustomObject), {

	getElement: function(){
		return this.ctrl.getElement();
	},

	init: function(){
		var self = this;
		var player = this.player;
		var timer = this.info.getElementsByClassName('timer')[0];
		var link = this.info.firstChild;
		var skip = this.skip;

		var root = this.ctrl.getElement();
		root.appendChild(this.info);
		root.appendChild(this.skip);

		player.on('timeupdate', function(event, time){
			timer.innerHTML = 'Ad. '+self.ctrl.formatTime(self.ctrl.duration - time);
		});

		if(this.click_through){
			on(link, 'click', function(){
				self.trigger('clickthru', self.click_through);
				return false;
			});
		}else{
			link.style.display = 'none';
		}

		this.skipoffset = {
			type: 'seconds',
			value: 3,
		};

		if(this.skipoffset){
			var offset = null;
			if(this.skipoffset.type=='seconds'){
				offset = this.skipoffset.value;
			}
			if(this.skipoffset.type=='percent'){
				offset = self.ctrl.duration / 100 * this.skipoffset.value;
			}
			if(offset){
				var message = skip.getElementsByClassName('message')[0];

				player.on('timeupdate', function(event, time){
					if(time>offset){
						event.handler.remove();

						message.innerHTML = "Skip to video";

						on(skip, 'click', function(event){
							self.trigger('skip');
							return false;
						});
					}else{
						message.innerHTML = 'You can skip<br>to video<br>in '+parseInt(offset-time);
					}
				});
			}
		}else{
			skip.style.display = 'none';
		}

	},

});
	function VASTPlugin(player, options){
		var self = this;

		this.player = player;
		this.conf = {
			debug: false,
			vpaid_flash_bridge: 'vpaid_bridge.swf',
			schedule: [],
			companion_places: [],
			onvastevent: function(){},
			onvasterror: function(){},
		};
		fill(this.conf, options);

		if(this.conf.debug){
			debug.on();
		}

		this.ad_place = html('<div class="Ad"></div>');
		this.queue = [];

		map(this.conf.schedule, function(rule){
			var rule = fill({
				offset: 'pre',
				tag: null,
				onvastevent: function(){},
				onvasterror: function(){},
			}, rule);

			if(typeof rule.tag==='function'){
				rule.tag = rule.tag();
			}

			if(rule.offset=='pre'){
				self.player.one('play', function(event){
					self.processVast(rule);
				})
			}
			if(rule.offset=='post'){
				self.player.on('timeupdate', function(event, time){
					if((self.player.getDuration()-time)<=2){
						event.handler.remove();
						self.processVast(rule);
					}
				})
			}
			if(m = /^(\d+)$/.exec(rule.offset)){
				var t = m[1]|0;
				self.player.on('timeupdate', function(event, time){
					if(time > t){
						event.handler.remove();
						self.processVast(rule);
					}
				})
			}
			if(m = /^(\d+)%$/.exec(rule.offset)){
				var o = m[1]|0;
				self.player.on('timeupdate', function(event){
					if(self.player.getProgress() > o){
						event.handler.remove();
						self.processVast(rule);
					}
				})
			}
		})
	};
	VASTPlugin.prototype = {
		processVast: function(rule){
			var self = this;

			var vast = new VAST(rule.tag, {
				linear_options: {
					place: this.ad_place,
					player_options: {
						cookieKeyVolume: this.player.conf.cookieKeyVolume,
						flash_swf: this.player.conf.backend_options.flash_swf,
						plugins: {
							BigMode: this.player.conf.plugins.BigMode,
							// FullScreen: this.player.conf.plugins.FullScreen,
						}
					},
					vpaid_options: {
						vpaid_flash_bridge: self.conf.vpaid_flash_bridge,
					}
				},
				nonlinear_options: {
					place: this.player.root,
				},
				companion_options: {
					places: this.conf.companion_places,
				},
			});

			vast.on('vasterror', function(e){
				self.conf.onvasterror();
				rule.onvasterror();
			});

			vast.on('vastevent', function(e, vastevent, args, source){
				self.conf.onvastevent(vastevent, args, source);
				rule.onvastevent(vastevent, args, source);
			});
			
			vast.on('linearstart', function(e, creative){
				self.initControls(creative);
			});

			var process_current_tag = function(){
				var current_vast = self.queue[0];

				if(current_vast && !current_vast.is_error){

					self.player.root.appendChild(self.ad_place);

					current_vast.on(['lineardone', 'error'], function(){
						self.player.root.removeChild(self.ad_place);

						self.queue.shift();
						process_current_tag();
					});

					if(current_vast.is_ready){
						current_vast.start();
					}else{
						current_vast.on('ready', function(){
							this.start();
						});
					}
				}else{
					self.player.trigger('vast_linear_ad_done');
					self.player.play();
				}
			};

			vast.on('error', function(e, code, message, source){
				console.error(code, message, source);
			});

			this.queue.push(vast);

			if(this.queue.length==1){
				this.player.pause();
				self.player.trigger('vast_start_ad');

				process_current_tag();
			}
		},

		initControls: function(creative){
			var self = this;

			if(!creative.is_vpaid){
				var player = creative.media.media.player;

				var controls = new AdControls(player, {
					click_through: creative.click_through,
					skipoffset: creative.skipoffset,
				});

				controls.on([
					'play',
					'pause',
					'skip',
					'mute',
					'unmute',
				], function(event){
					creative[event.type]();
				});

				controls.on('clickthru', function(e, url){
					creative.clickthru(url);
				});

				controls.on('volumechange', function(e, volume){
					creative.setVolume(volume);
					self.player.setVolume(volume);
				});

				player.root.appendChild(controls.getElement());
			}
		},

	};

	return VASTPlugin;
})();		CustomPlayer.prototype.__plugins.VAST = VASTPlugin;			function HQPlugin(player, options){
	this.player = player;
	this.conf = {
		hq: false,
	};
	fill(this.conf, options);

	this.can_hq = false;
	this.hq = !!this.conf.hq;
	this.btn = html(
		'<div class="hq" style="width: 32px;">'+
			'<svg>'+
				'<path transform="translate(-104, 0)" d="M114.1,3.7h3.7v13.6h-3.7v-5.5h-4.3v5.5h-3.7V3.7h3.7v5h4.3V3.7z M133.8,20.5h-4.6l-2.4-3l0,0v0l0,0c-2.1,0-3.8-0.6-4.9-1.8c-1.1-1.2-1.7-2.9-1.7-5.2c0-2.3,0.6-4,1.7-5.2c1.1-1.2,2.8-1.8,4.9-1.8c2.2,0,3.8,0.6,4.9,1.8c1.1,1.2,1.7,2.9,1.7,5.2c0,3.1-1,5.1-2.9,6.2L133.8,20.5z M129.6,10.5c0-1.4-0.2-2.4-0.7-3c-0.5-0.6-1.1-1-2-1c-1.8,0-2.8,1.3-2.8,4c0,2.6,0.9,3.9,2.7,3.9c0.9,0,1.6-0.3,2.1-1C129.3,12.8,129.6,11.8,129.6,10.5z"/>'+
			'</svg>'+
		'</div>'
	);

	var self = this;
	this.player.on('tray_ready', function(e, tray){
		if(tray.lastChild && tray.lastChild.className=='fullscreen'){
			tray.insertBefore(self.getUI(), tray.lastChild);
		}else{
			tray.appendChild(self.getUI());
		}
	});

	this.init();
}
HQPlugin.prototype = {

	init: function(){
		var self = this;

		this.origin_setSources = this.player.setSources;
		this.player.setSources = this.setSources.bind(this);

		on(this.btn, 'click', function(){
			self.setHQ(!self.hq);
		});
	},

	getUI: function(){
		return this.btn;
	},

	setSources: function(sources){
		var self = this;
		this.sources = sources;
		map(sources, function(s){ self.can_hq = self.can_hq || s.hq; });
		this.setHQ(this.can_hq ? this.hq : false);
		this.player;
	},

	setHQ: function(hq){
		this.hq = !!hq;

		if(this.can_hq){
			this.btn.style.display = null;
		}else{
			this.btn.style.display = 'none';
		}

		if(this.hq){
			this.btn.style.opacity = 1;
		}else{
			this.btn.style.opacity = 0.5;
		}

		this.applySourceHQ(hq);
	},

	applySourceHQ: function(){
		var self = this;

		var allow_sources = this.sources.filter(function(a){
			return typeof a.hq==='undefined' || a.hq==self.hq;
		});

		if(this.player.is_start_load){
			var has_playing = this.player.is_playing;
			var progress = this.player.getProgress();

			this.player.one('canplay', function(e){
				this.setProgress(progress);
				if(has_playing){
					this.play();
				}
			});

			this.origin_setSources.call(this.player, allow_sources);
			this.player.load();
		}else{
			this.origin_setSources.call(this.player, allow_sources);
		}
	}
};		CustomPlayer.prototype.__plugins.HQ = HQPlugin;			function BigModePlugin(player, options){
	var self = this;

	this.player = player;
	this.conf = {
		bigClass: 'big',
		target: document.body,
	};
	fill(this.conf, options);

	this.can_hq = false;
	this.hq = !!this.conf.hq;
	this.btn = html(
		'<div class="big">'+
			'<svg>'+
				'<path d="M22,11.4l-3-3l-3.1,3.1l-3.3-3.3L15.7,5l-3-3H22V11.4z M8.3,19l3,3H2v-9.4l3,3l3.2-3.2l3.3,3.3L8.3,19z"/>'+
				'<path d="M12.5,2.1l3,3L18.7,2L22,5.3l-3.1,3.1l3,3h-9.4V2.1z M5.2,15.5l-3-3h9.4v9.4l-3-3L5.3,22L2,18.7L5.2,15.5z"/>'+
			'</svg>'+
		'</div>'
	);

	this.player.on('tray_ready', function(e, tray){

		if(tray.lastChild && tray.lastChild.className=='fullscreen'){
			tray.insertBefore(this.btn, tray.lastChild);
		}else{
			tray.appendChild(this.btn);
		}

		var paths = this.btn.getElementsByTagName('path');

		if(hasClass(self.conf.target, self.conf.bigClass)){
			paths[0].style.display = 'none';
			paths[1].style.display = '';
		}else{
			paths[1].style.display = 'none';
			paths[0].style.display = '';
		}

		on(this.btn, 'click', function(){
			if(hasClass(self.conf.target, self.conf.bigClass)){
				removeClass(self.conf.target, self.conf.bigClass);
				paths[1].style.display = 'none';
				paths[0].style.display = '';
			}else{
				addClass(self.conf.target, self.conf.bigClass);
				paths[0].style.display = 'none';
				paths[1].style.display = '';
			}
		});

	}, this);

}		CustomPlayer.prototype.__plugins.BigMode = BigModePlugin;			function IconPlugin(player, options){
	var self = this;

	this.conf = {
		src: null,
		href: null,
		title: null,
		width: null,
		height: null,
	};
	this.player = player;
	fill(this.conf, options);

	if(!this.conf.src) return;

	this.icon = html('<a target="_blank"></a>');

	this.icon.style.position = 'absolute';
	this.icon.style.zIndex = 200;
	this.icon.style.top = '1%';
	this.icon.style.right = '1%';
	this.icon.style.opacity = 0.5;
	this.icon.style.display = 'none';

	if(this.conf.href) this.icon.href = this.conf.href;
	if(this.conf.title) this.icon.title = this.conf.title;

	this.img = new Image;
	this.img.src = this.conf.src;

	if(this.conf.width) this.img.width = this.conf.width;
	if(this.conf.height) this.img.height = this.conf.height;

	this.icon.appendChild(this.img);
	this.player.root.appendChild(this.icon);

	this.player.on('play', function(){
		self.icon.style.display = '';
	});

	on(this.icon, 'click', function(){
		self.player.pause();
	});

	on(this.icon, 'mouseover', function(){
		this.style.opacity = 1;
	});

	on(this.icon, 'mouseout', function(){
		this.style.opacity = 0.5;
	});
}		CustomPlayer.prototype.__plugins.Icon = IconPlugin;	
		
	return function(place, options){
		var options = extend({
			allow_backends: ["HTML5","Flash"],
			controls: {},
		}, options);

		var player = new CustomPlayer(place, options);

		if(options.controls){

			var ctrl = new Controls(player, fill({
				useMobileFallback: true,
				poster: options.poster,
			}, options.controls));

			ctrl.on([
				'play',
				'pause',
				'mute',
				'unmute',
			], function(e){
				player[e.type]();
			});

			ctrl.on('positionchange', function(e, position){
				player.setProgress(position*100);
			});

			ctrl.on('volumechange', function(e, volume){
				player.setVolume(volume);
			});

			if(player._plugins.FullScreen){
				
				ctrl.on('fullscreentoggle', function(){
					var fs = player._plugins.FullScreen;
					if(fs.is_fullscreen){
						fs.exitFullscreen();
					}else{
						fs.requestFullscreen();
					}
				});

				ctrl.on('exitfullscreen', function(){
					player._plugins.FullScreen.exitFullscreen();
				});
			}

			place.appendChild(ctrl.getElement());
			
		}

		return player;
	}
})();

window.CustomPlayer.version = 'a870ccc.1461338651';