/**
 * 模拟Promise功能
 * Promises 防止和原生的冲突
 */
 class Promises{
 	
 	constructor(resolver){
 		
 		//resolver 只接受函数
 		if(resolver && typeof resolver !== 'function'){ 
 			throw new Error('Promises resolver must be a function')
 		}
 		
		//当前promise对象的状态
		this.state = 'PENDING';
		//当前promise对象的数据（成功或失败）
		this.data = 'UNDEFINED';
		//当前promise对象注册的回调队列
		this.callbackQueue=[];
		
		//根据异步结果来触发成功或失败（resolve， reject）
		this.executeResolver(resolver)

 	}
 	
 	then(){
 		
 	}
 	
 	executeResolver(resolver){

 		//只允许resolve执行一次 then(//里面为非return操作 run once).then(//ignore)...
 		let called = false;
		
		/**
		 * 成功处理
		 */
		let onSuccessFun = value => {
			if(called){
				return false;
			}
			called = true
		}
		
		/**
		 * 失败处理
		 */
		let onErrorFun = err => {
			if(called){
				return false;
			}
			called = true
		}
		
		try{
			/**
			 * new 调用的时候
			 * new Promises(function (resolve, reject) {
			        resolve(11); //异步成功触发
			        reject('error') //异步失败触发
			    });
			    resolver --> function (resolve) {
			        resolve(11);
			    }
			         调用  resolver(onSuccessFun, onErrorFun)
			        resolve --> onSuccessFun
			        reject --> onErrorFun
			          调用 onSuccessFun --> resolve(11); 形参value --> 实参11
			        onErrorFun --> reject('error'); 形参value --> 实参'error'
			 */
			resolver(onSuccessFun, onErrorFun)
		}catch(e){
			onError(e)
		}
		
 	}
 	
 }
