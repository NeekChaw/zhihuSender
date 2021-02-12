import Blockquote from '../../src/tags/blockquote'
const {tagSpaceNum}=require('../options')

describe("test <blockquote></blockquote> tag",()=>{

  it('no nest',()=>{
    let blockquote=new Blockquote("<blockquote>\n" +
      "<p>This is <strong>quote</strong>…</p>\n" +
      "</blockquote>")
    expect(blockquote.execMerge()).toBe("\n" +
      ">This is **quote**…\n")
  })


  it('nest ul',()=>{
    let blockquote=new Blockquote("<blockquote>\n" +
      "<ul>\n" +
      "<li>sdfs</li>\n" +
      "<li>sdfsdf</li>\n" +
      "<li>sdfsaf</li>\n" +
      "</ul>\n" +
      "</blockquote>")
    expect(blockquote.execMerge()).toBe("\n" +
      ">* "+' '.repeat(tagSpaceNum-2)+"sdfs\n" +
      ">* "+' '.repeat(tagSpaceNum-2)+"sdfsdf\n" +
      ">* "+' '.repeat(tagSpaceNum-2)+"sdfsaf\n")
  })

  it('nest blockquote',()=>{
    let blockquote=new Blockquote("<blockquote>\n" +
      "<p>Blockquotes can also be nested…</p>\n" +
      "<blockquote>\n" +
      "<p>…by using additional greater-than signs right next to each other…</p>\n" +
      "<blockquote>\n" +
      "<p>…or with spaces between arrows.</p>\n" +
      "</blockquote>\n" +
      "</blockquote>\n" +
      "</blockquote>")

    expect(blockquote.execMerge()).toBe("\n" +
      ">Blockquotes can also be nested…\n" +
      ">\n" +
      ">>…by using additional greater-than signs right next to each other…\n" +
      ">>\n" +
      ">>>…or with spaces between arrows.\n")
  })
})

