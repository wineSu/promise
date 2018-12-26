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
		this.data = null;
		
		//当前promise对象注册的回调队列
		this.onFulfilledQueue=[];
		this.onRejectedQueue=[];
		
		//根据异步结果来触发成功或失败（resolve， reject）
		this.executeResolver(resolver)

 	}
 	
 	then(onFulfilled, onRejected){
		
		const {data, state} = this;
 		
 		//内部返回一个promise
 		return new Promises((onFulfilledNext, onRejectedNext) => {
 			
 			let fulfilled = value => {
		      try {
		        if (typeof onFulfilled !== 'function') {
		          onFulfilledNext(value)
		        } else {
		          let res = onFulfilled(value);
		          console.log(res)
		          if (res instanceof Promises) {
		            // 如果当前回调函数返回promise对象，继续下一轮then操作
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
 			
 			switch(state){
	 			case PENDING :
	 				this.onFulfilledQueue.push(onFulfilled);
	 				this.onRejectedQueue.push(onRejected);
	 			break;
	 			
	 			case FULFILLED:
	 				fulfilled(data)
	 			break;
	 			
	 			case REJECTED:
	 				onRejected(data)
	 			break;
	 			
	 			default:
	 			break;
	 		}
 			
  		});
  		
 	}
 	
 	executeResolver(resolver){

		/**
		 * 成功处理
		 */
		let onSuccessFun = value => {
			
			this.executeCallback('resolve', value)
			
		}
		
		/**
		 * 失败处理
		 */
		let onErrorFun = err => {
			
			this.executeCallback('reject', err)
			
		}
		
		try{
			resolver(onSuccessFun, onErrorFun)
		}catch(e){
			onErrorFun(e)
		}
		
 	}
 	
 	executeCallback(type, val){

		//确保resolve或reject命令唯一
		if(this.state !== PENDING){
			return false;
		}

		let isResolve = type === 'resolve';

		this.state = isResolve ? FULFILLED : REJECTED;
		this.data = val;
		
 	}
 	
 	
 }
