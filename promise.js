/**
 * 不是很标准的写法  能实现简单的基本需求 可以then内部返回promise
 * @param {Object} fn
 */
function Promises(fn) {
    var state = 'pending',
        value = null,
        callbacks = [];

    this.then = function (onFulfilled, onRejected) {
        return new Promises(function (resolve, reject) {
            handle({
                onFulfilled: onFulfilled || null,
                onRejected: onRejected || null,
                resolve: resolve,
                reject: reject
            });
        });
    };

    function handle(callback) {
    	
        if (state === 'pending') {
	        callbacks.push(callback);
	        return;
	    }
	    var cb = state === 'fulfilled' ? callback.onFulfilled : callback.onRejected,
	        ret;
	    if (cb === null) {
	        cb = state === 'fulfilled' ? callback.resolve : callback.reject;
	        cb(value);
	        return;
	    }
	    if(typeof cb === 'string' || typeof cb === 'number'){
	    	return callback.resolve(value);
	    }
	    try {
	        ret = cb(value);
	        callback.resolve(ret);
	    } catch (e) {
	        callback.reject(e);
	    } 
    }

    function resolve(newValue) {
        if (newValue && (typeof newValue === 'object' || typeof newValue === 'function')) {
            var then = newValue.then;
            if (typeof then === 'function') {
                then.call(newValue, resolve, reject);
                return;
            }
        }
        state = 'fulfilled';
        value = newValue;
        execute();
    }

    function reject(reason) {
        state = 'rejected';
        value = reason;
        execute();
    }

    function execute() {
        setTimeout(function () {
            callbacks.forEach(function (callback) {
                handle(callback);
            });
        }, 0);
    }

    fn(resolve, reject);
}