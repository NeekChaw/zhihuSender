const Tag =require('../Tag')

class Del extends Tag{
  constructor(str,tagName='del'){
    super(str,tagName)
    this.handleContent=this.handleContent.bind(this,'','')
  }

  beforeMerge(){
    return "~~"
  }

  afterMerge(){
    return "~~"
  }

  slimContent(str){
    return str.replace(/^(\n\s*)+/,'').replace(/(\n\s*)+$/,'')
  }


  execMerge(gapBefore='',gapAfter=''){
    return super.execMerge(gapBefore,gapAfter)
  }

}


module.exports=Del

