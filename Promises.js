/**
 * 模拟Promise功能
 * Promises 防止和原生的冲突
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

		//根据异步结果来触发成功或失败（resolve， reject）
		try{
			resolver(this._resolve.bind(this), this._reject.bind(this))
		} catch(e){
			this._reject(e)
		}

 	}
 	
 	_resolve(val){
 		setTimeout(()=>{
			if(this.state !== PENDING){
				return;
			}
			this.state = FULFILLED;
            this.data = val;
            
            // 依次执行成功队列中的函数，并清空队列
		    const runFulfilled = (value) => {
		      let cb;
		      while (cb = this.onFulfilledQueue.shift()) {
		        cb(value)
		      }
		    }
		    // 依次执行失败队列中的函数，并清空队列
		    const runRejected = (error) => {
		      let cb;
		      while (cb = this.onRejectedQueue.shift()) {
		        cb(error)
		      }
		    }
		    
		    if (val instanceof Promises) {
	          val.then(value => {
	            this.data = value
	            runFulfilled(value)
	          }, err => {
	            this.data = err
	            runRejected(err)
	          })
	        } else {
	          this.data = val
	          runFulfilled(val)
	        }
		})
 	}
 	
 	_reject (err) {
      setTimeout(()=>{
		if(this.state !== PENDING){
			return;
		}
		this.state = REJECTED;
		this.data = err;
		let cb;
        while (cb = this.onRejectedQueue.shift()) {
          cb(err)
        }
	 })
    }
 	
 	then(onFulfilled, onRejected){

		const {data, state} = this;

 		return new Promises((onFulfilledNext, onRejectedNext) => {

 			// 封装一个成功时执行的函数
	        let fulfilled = value => {
	          try {
	            if (typeof onFulfilled !== 'function') {
	              onFulfilledNext(value)
	            } else {
	              let res = onFulfilled(value);
	              if (res instanceof Promises) {
	                // 如果当前回调函数返回MyPromise对象，必须等待其状态改变后在执行下一个回调
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
	        
	        // 封装一个失败时执行的函数
	        let rejected = error => {
	          try {
	            if (typeof onRejected !== 'function') {
	              onRejectedNext(error)
	            } else {
	                let res = onRejected(error);
	                if (res instanceof Promises) {
	                  // 如果当前回调函数返回MyPromise对象，必须等待其状态改变后在执行下一个回调
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
 	
 }
