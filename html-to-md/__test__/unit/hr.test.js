const Hr=require( '../../src/tags/hr')

describe('test <hr></hr> tag',()=>{
  it('self-close',()=>{
    let hr=new Hr("<hr />")
    expect(hr.execMerge()).toBe("\n---\n")
  })
})