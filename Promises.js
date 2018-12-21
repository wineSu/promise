/**
 * 模拟Promise功能
 * Promises 防止和原生的冲突
 */
 class Promises{
 	constructor(resolver){
 		if(resolver && typeof resolver !== 'function'){ 
 			//resolver 只接受函数
 			throw new Error('Promise resolver is not a function')
 		}
		//当前promise对象的状态
		this.state = 'PENDING';
		//当前promise对象的数据（成功或失败）
		this.data = 'UNDEFINED';
		//当前promise对象注册的回调队列
		this.callbackQueue=[];
		//执行resove()或reject()方法
		if(resolver){
			executeResolver.call(this, resolver)
		}
 	}
 	
 	then(){
 		
 	}
 }
