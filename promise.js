function Promises(fn) {
    var state = 'pending',
        value = null,
        callbacks = [];

    this.then = function (onFulfilled) {
    	
        return new Promises(function (resolve) {

            handle({
                onFulfilled: onFulfilled || null,
                resolve: resolve
            });
        });
    };

    function handle(callback) {
		console.log(state)
        if (state === 'pending') {
            callbacks.push(callback);
            return;
        }

        //如果then中没有传递任何东西
        if(!callback.onFulfilled) {
            callback.resolve(value);
            return;
        }

        var ret = callback.onFulfilled(value);

        callback.resolve(ret);
    }

    
    function resolve(newValue) {

        if (newValue && (typeof newValue === 'object' || typeof newValue === 'function')) {
            var then = newValue.then;

            if (typeof then === 'function') {
                then.call(newValue, resolve);
                return;
            }
        }
        state = 'fulfilled';
        value = newValue;

        setTimeout(function () {
			
            callbacks.forEach(function (callback) {
                handle(callback);
            });
        }, 0);
    }

    fn(resolve);
}