/**
 * 模拟Promise功能
 * Promises 防止和原生的冲突
 * [2.3.3. ++]测试失败！！
 */

const PENDING = 'PENDING'
const FULFILLED = 'FULFILLED'
const REJECTED = 'REJECTED'

class Promises{
 	
 	constructor(resolver){
 		
 		//resolver 只接受函数
 		if(resolver && typeof resolver !== 'function'){ 
 			throw new Error('Promises resolver must be a function')
 		}
 		
		//当前promise对象的状态
		this.state = PENDING;
		
		//当前promise对象的数据（成功或失败）
		this.data = undefined;
		
		//当前promise对象注册的回调队列
		this.onFulfilledQueue=[];
		this.onRejectedQueue=[];
		
		this.executeResolver(resolver)

 	}
 	
 	executeResolver(resolver){
 		let flag = false;
 		
 		let onSuccess = val => {
 			if(flag){
 				return false;
 			}
 			flag = true;
 			this.executeCallback('resolve', val);
 		}
 		
 		let onError = err => {
 			if(flag){
 				return false;
 			}
 			flag = true;
 			this.executeCallback('reject', err);
 		}
 		
 		try{
 			resolver(onSuccess,onError)
 		}catch(e){
 			onError(e)
 		}
 		
 	}
 	
 	executeCallback(type, val){
 		setTimeout(()=>{
 			let isResolve = type === 'resolve';
	 		this.state = isResolve ? FULFILLED : REJECTED;
	 		this.data = val;
	 		
	 		// 依次执行成功队列中的函数，并清空队列
		    const runFulfilled = (value) => {
		      let callback;
		      while (callback = this.onFulfilledQueue.shift()) {
		        callback(value)
		      }
		    }
	 		
	 		// 依次执行失败队列中的函数，并清空队列
		    const runRejected = (error) => {
		      let callback;
		      while (callback = this.onRejectedQueue.shift()) {
		        callback(error)
		      }
		    }
		   	
		   	//成功处理
	 		if(isResolve){
			    //返回一个promise对象
			    if (val instanceof Promises) {
		          val.then(value => {
		            this.data = value
		            runFulfilled(value)
		          }, err => {
		            this.data = err
		            runRejected(err)
		          })
		        } else {
		          runFulfilled(val)
		        }
	 		}else{
	 			//失败处理
	 			runRejected(val)
	 		}
 		})
 	}
 	
 	then(onFulfilled, onRejected){
 		
 		//状态已经发生改变并且参数不是函数时
		if (typeof onFulfilled !== 'function' && this.state === FULFILLED ||
			typeof onRejected !== 'function' && this.state === REJECTED) {
			return this;
		}

		const {data, state} = this;

 		return new Promises((onFulfilledNext, onRejectedNext) => {

 			// 成功时执行的函数
	        let fulfilled = value => {
	          try {
	            if (typeof onFulfilled !== 'function') {
	              onFulfilledNext(value)
	            } else {
	              let res = onFulfilled(value);
	              if (res instanceof Promises) {
	                // 如果当前回调函数返回Promises对象，必须等待其状态改变后在执行下一个回调
	                res.then(onFulfilledNext, onRejectedNext)
	              } else {
	                //否则会将返回结果直接作为参数，传入下一个then的回调函数，并立即执行下一个then的回调函数
	                onFulfilledNext(res)
	              }
	            }
	          } catch (err) {
	            // 如果函数执行出错，新的Promise对象的状态为失败
	            onRejectedNext(err)
	          }
	        }
	        
	        // 失败时执行的函数
	        let rejected = error => {
	          try {
	            if (typeof onRejected !== 'function') {
	              onRejectedNext(error)
	            } else {
	                let res = onRejected(error);
	                if (res instanceof Promises) {
	                  // 如果当前回调函数返回Promises对象，必须等待其状态改变后在执行下一个回调
	                  res.then(onFulfilledNext, onRejectedNext)
	                } else {
	                  //否则会将返回结果直接作为参数，传入下一个then的回调函数，并立即执行下一个then的回调函数
	                  onFulfilledNext(res)
	                }
	            }
	          } catch (err) {
	            // 如果函数执行出错，新的Promise对象的状态为失败
	            onRejectedNext(err)
	          }
	        }

 			switch (state){
	 			case PENDING :
	 				this.onFulfilledQueue.push(fulfilled);
	 				this.onRejectedQueue.push(rejected);
	 			break
	 			
	 			case FULFILLED:
	 				fulfilled(data)
	 			break
	 			
	 			case REJECTED:
	 				onRejected(data)
	 			break
	 			
	 			default:
	 			break
	 		}

  		});
  		
 	}
 	
 	// 添加catch方法
    catch (onRejected) {
      return this.then(undefined, onRejected)
    }
    
    // 添加静态resolve方法
    static resolve (value) {
      // 如果参数是Promises实例，直接返回这个实例
      if (value instanceof Promises) return value
      return new Promises(resolve => resolve(value))
    }
    
    // 添加静态reject方法
    static reject (value) {
      return new Promises((resolve ,reject) => reject(value))
    }
    
    // 添加静态all方法
    static all (list) {
      return new Promises((resolve, reject) => {
        /**
         * 返回值的集合
         */
        let values = []
        let count = 0
        for (let [i, p] of list.entries()) {
          // 数组参数如果不是Promises实例，先调用Promises.resolve
          this.resolve(p).then(res => {
            values[i] = res
            count++
            // 所有状态都变成fulfilled时返回的Promises状态就变成fulfilled
            if (count === list.length) resolve(values)
          }, err => {
            // 有一个被rejected时返回的Promises状态就变成rejected
            reject(err)
          })
        }
      })
    }
    
    // 添加静态race方法
    static race (list) {
      return new Promises((resolve, reject) => {
        for (let p of list) {
          // 只要有一个实例率先改变状态，新的Promises的状态就跟着改变
          this.resolve(p).then(res => {
            resolve(res)
          }, err => {
            reject(err)
          })
        }
      })
    }
    
    finally (cb) {
      return this.then(
        value  => Promises.resolve(cb()).then(() => value),
        reason => Promises.resolve(cb()).then(() => { throw reason })
      );
    }
	
	static deferred(){
	  let dfd = {}
	  dfd.promise = new Promises(function(resolve, reject) {
	    dfd.resolve = resolve;
	    dfd.reject = reject;
	  })
	  return dfd
	}
}

//module.exports = Promises