class Vector {
  constructor(x,y){
    this.x = x
    this.y = y
  }

  substract(vec) {

    return new Vector(this.x - vec.x,this.y - vec.y)
  }
}


function normalize(vec) {
  var l = Math.sqrt(vec.x*vec.x+ vec.y*vec.y)
  return new Vector(vec.x/l,vec.y/l)
}

function distance(a,b) {
  // console.log(Math.pow((b.x-a.x),2))
  // console.log(Math.sqrt(Math.pow((b.x-a.x),2)+Math.pow((b.y-a.y),2)))
  return Math.sqrt(Math.pow((b.x-a.x),2)+Math.pow((b.y-a.y),2))
}

class a {
  constructor(string){
    this.text = string
  }
}
class b extends a {
  constructor(string){
    super(string)
  }
}

class c extends b {
  constructor(){
    super("well")
  }
}
