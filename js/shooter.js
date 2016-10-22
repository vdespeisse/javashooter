var queue = new createjs.LoadQueue();
queue.on("fileload", handleFileLoad);
queue.on("complete", handleComplete);
queue.loadManifest([{
        id: "bunny",
        src: "./assets/bunny.png"
    }])
    // queue.loadFile("assets/bunny.png")

queue.load()

var images = {}

function handleFileLoad(o) {

    if (o.item.type === "image") {
        images[o.item.id] = o.result
    }
}

function handleComplete(ev) {
    console.log(images["bunny"])
    init()
}
// initializing the stage

// setTimeout(init, 3000)

class Game {
    constructor(stage) {
        this.stage = stage
        this.canvas = stage.canvas
        this.objects = []
        this.ids = 0
    }
    add(object) {
        object.id = this.ids
        this.ids += 1
        if (object.bmp) this.stage.addChildAt(object.bmp, object.id)
        this.objects.push(object)
    }
    remove(object) {
        if (object.bmp) this.stage.removeChildAt(object.id)
        this.objects = this.objects.filter(o => o.id !== object.id)
    }
}

class GameObject {

    constructor(game, x, y, image, options) {
        this.bmp = new createjs.Bitmap(images[image])
        this.bmp.x = x
        this.bmp.y = y
        if (options.size) this.resize(options.size[0], options.size[1])
        this.rect = this.bmp.getTransformedBounds()
        console.log(this.rect)
        this.game = game
        game.add(this)

    }
    resize(width, height) {
        var imgW = this.bmp.image.width
        var imgH = this.bmp.image.height
        this.bmp.scaleX = width / imgW
        this.bmp.scaleY = height / imgH
    }

}

class Unit extends GameObject {
    constructor(game, x, y, image, options)  {
        super(game, x, y, image, options)
        this._position = new Vector(x, y)
        this._destination = new Vector(x, y)
        this._moving = false
        this.speed = options.speed ? options.speed : 0
    }
    update() {
        if (this._moving) this.move()
    }
    die() {
        this.game.remove(this)
    }
    move() {


        var d = distance(this._destination, this._position)
        if (d <= this._maxStep) {
            this._position.x = this._destination.x
            this._position.y = this._destination.y
            this._moving = false
            this.updatePos()
            return
        }

        var vector = normalize(this._destination.substract(this._position))

        this._position.x += vector.x * this._speed
        this._position.y += vector.y * this._speed
        this.updatePos()
    }

    updatePos() {
        this.bmp.x = this._position.x
        this.bmp.y = this._position.y
    }
    set destination(val) {
        this._destination = new Vector(val[0], val[1])
        this._moving = true
    }
    set speed(val) {
        this._speed = val
        this._maxStep = Math.sqrt(Math.pow(val, 2) * 2)
    }
    get speed() {
        return this._speed
    }

}

class Bunny extends Unit {
    constructor(game, x, y, options = {}) {
        super(game, x, y, "bunny", options)
        this.moving =   {}

    }

    update() {
        super.update()
        if (this.moving.up) this.bmp.y = (this.bmp.y - this.speed <= 0) ? 0 : this.bmp.y - this.speed
        if (this.moving.down) this.bmp.y = (this.bmp.y + this.speed >= this.game.canvas.height - this.rect.height)
        ? this.game.canvas.height - this.rect.height : this.bmp.y + this.speed
        if (this.moving.left) this.bmp.x = (this.bmp.x - this.speed <= 0) ? 0 : this.bmp.x - this.speed
        if (this.moving.right) this.bmp.x = (this.bmp.x + this.speed >= this.game.canvas.width - this.rect.width) ? this.game.canvas.width - this.rect.width : this.bmp.x + this.speed

    }
    move(dir) {
        this.moving[dir] = true
    }
    stopMove(dir) {
        this.moving[dir] = false
    }
}

function init() {
    //find canvas and load images, wait for last image to load
    canvas = document.querySelector(".game-screen")
    stage = new createjs.Stage(canvas);
    game = new Game(stage)
    stage.on("stagemousedown", handleMouseDown)
    document.onkeydown = handleKeyDown
    document.onkeyup = handleKeyUp
        // console.log(images["bunny"])
    console.log(stage)

    // bu = new createjs.Bitmap(images["bunny"])
    // console.log(bu)
    // stage.addChild(bu)

    player = new Bunny(game, 50, 50, {
        speed: 5,
        // size: [50, 100]
    })


    createjs.Ticker.setFPS(60);
    createjs.Ticker.addEventListener("tick", tickHandler);

    function tickHandler(e) {
        // console.log(e)
        game.objects.map(o => o.update())
        stage.update();
    }

    function handleMouseDown(e) {


        player.bmp.x += 10

    }

    function handleKeyDown(key) {
        // TODO : OnKeydown : move and keep moving until key up
        if (key.code === "KeyW") {
            player.move("up")

            return
        }
        if (key.code === "KeyS") {
            player.move("down")
            return
        }
        if (key.code === "KeyA") {
            player.move("left")
            return
        }
        if (key.code === "KeyD") {
            player.move("right")
            return
        }
    }

    function handleKeyUp(key) {
        if (key.code === "KeyW") {
            player.stopMove("up")
        }
        if (key.code === "KeyS") {
            player.stopMove("down")
            return
        }
        if (key.code === "KeyA") {
            player.stopMove("left")
            return
        }
        if (key.code === "KeyD") {
            player.stopMove("right")
            return
        }
    }
}
