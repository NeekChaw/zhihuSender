import H1 from '../../src/tags/h1'


describe('test <h1></h1> tag',()=>{
  it('no nest',()=>{
    let h1=new H1("<h1>javascript</h1>")
    expect(h1.execMerge()).toBe("\n# javascript\n")
  })

  it('can nest',()=>{
    let h1=new H1("<h1><strong><i>strong and italic</i></strong></h1>")
    expect(h1.execMerge()).toBe("\n# ***strong and italic***\n")
  })

  it('can nest-2',()=>{
    let h1=new H1("<h1 class=\"line\" data-line=\"174\"><a href=\"https://github.com/markdown-it/markdown-it-sub\">Subscript</a> / <a href=\"https://github.com/markdown-it/markdown-it-sup\">Superscript</a></h1>")
    expect(h1.execMerge()).toBe("\n" +
      "# [Subscript](https://github.com/markdown-it/markdown-it-sub) / [Superscript](https://github.com/markdown-it/markdown-it-sup)\n")
  })
})