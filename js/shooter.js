
// Ca c'est juste un truc qui preload toutes le assets

var queue = new createjs.LoadQueue();
queue.on("fileload", handleFileLoad);// La je lui donne les fonctions a exectuer quand il load un fichier .on("fileload")
queue.on("complete", handleComplete); // En particulier quand il a fini de load toutes les asset je
                                      //lance le jeu voir function HandleComplete line 23
queue.loadManifest([{
        id: "bunny",
        src: "./assets/bunny.png"
    }])// ca ac'est la seul asset du jeu pour l'instant l'image du bunny

queue.load() // on start la le loader

var images = {} // je crée un objet vide ou je vais foutre toutes les images pour pouvoir y acceder plus tard
function handleFileLoad(o) { // A chaque fois que jload une image je l'ajoute a l'objet images

    if (o.item.type === "image") { // si l'objet loaded est image(apres yaura des fichier sons etc)
        images[o.item.id] = o.result // o.result c'est l'image en question du coup la après images["bunny"] ca me pointe vers l'image bunny
    }
}

function handleComplete(ev) { // Quand il a tout load je start le jeu ac la fonction init()
    init()
}

class Game { // c'est une classe game c'est lengine en gros qui vas gerer toutes les unit objets etc
    constructor(stage) {
        this.stage = stage //stage c'est l'écran de jeu en gros
        this.canvas = stage.canvas //canvas c'est lobjet html qui contient l'écran de jeu
        this.objects = [] // je fais une liste vide dans laquelle je vais metre tous les objets du jeu
        this.ids = 0
    }
    add(object) {  // a chaque fois qu'un objet s'initialise il va s'ajouter a l'engine avec cette fonction
        object.id = this.ids
        this.ids += 1
        if (object.bmp) this.stage.addChildAt(object.bmp, object.id)
        this.objects.push(object)
    }
    remove(object) { //ca c'est quand un objet die/disparait tu fait game.remove(objet)
        if (object.bmp) this.stage.removeChildAt(object.id) // ca ca vire l'image du screen(du stage donc)
        this.objects = this.objects.filter(o => o.id !== object.id) // ca ca vire l'objet de la liste d'objets
    }
}

class GameObject { // classe de base pour tous les game objects
    constructor(game, x, y, image, options) { // le constructor il se lance quand tu crée la classe quand tu fait new GameObject(bal,bla,bla)
        this.bmp = new createjs.Bitmap(images[image]) // Bitmap ca crée un sprite qui saffiche et qui a pour image ce que tu luis dit
                                                      // engros ce qui est dans images la c'est des sources, et tu les copie sur un bitmap et c'est l'image de ton unit
        this.bmp.x = x                      // ca set les coordinées ou le GameObject apparait
        this.bmp.y = y
        if (options.size) this.resize(options.size[0], options.size[1]) // XXX: si j'ai déclaré une size ca le resize, sinon le bitmap fait la taille de l'image source
        this.rect = this.bmp.getTransformedBounds()   // ca c'est la boite qui contient l'objects pour les collisions etc
                                                    // les attributs c'est rect.x, rect.y la position de l'iamge et rect.width, rect.height sa taille
        this.game = game                        // je met un pointer vers l'engine dans l'objet si j'en ai besoin plus tard
        game.add(this) // et donc ca ca ajoute l'objet au jeu, l'image va s'afficher etc...
    }

    // NOTE : Donc la si tu fait new GameObject(game,10,10,"bunny") ca va créer un game object qui a pour image images["bunny"] a la position (10,10)
    resize(width, height) { // XXX :  tu peux ignorer
        var imgW = this.bmp.image.width
        var imgH = this.bmp.image.height
        this.bmp.scaleX = width / imgW
        this.bmp.scaleY = height / imgH
    }

}

class Unit extends GameObject { // J'etend la classe GameObject, c'est la classe parente pour toutes les "unit" = les objets qui bougent
    constructor(game, x, y, image, options)  {
        super(game, x, y, image, options) // super ca appelle le constructor de la classe parente
        // this._position = new Vector(x, y)
        // this._destination = new Vector(x, y)
        this._moving = false
        this.speed = options.speed ? options.speed : 0 // ca defini la speed de l'unit, en gros le point d'interrogation la il cehck si options.speed existe
                                                      // si options.speed existe(= j'ai précisé une speed dans la creation de l'unit) bah ça mais this.speed = ça
                                                      // sinon ca met la valeur par defaut, j'ai choisi 0
      // en gros cette ligne c'est une facon abrevié de marquer:
      // if (options.speed existe) this.speed = options.speed
      // else this.speed = 0
    }
    update() { //la fonction update qui va etre appelée à chaque frame
      this.rect.x = this.bmp.x //j'update la position du rect
      this.rect.y = this.bmp.y
    }
    die() { //si l'unit die j'appelle this.game.remove pour l'enlever du jeu
        this.game.remove(this)
    }
    set speed(val) { // XXX : oublie ces trucs pour l'instant sauf si tu sais ce que c'est les setter getters
        this._speed = val
        this._maxStep = Math.sqrt(Math.pow(val, 2) * 2)
    }
    get speed() {
        return this._speed
    }
}
// NOTE : Donc voila pour l'instant une Unit c'est juste un GameObject avec une speed et qui update la position de son rect a sa position reelle

class Player extends Unit { // classe Player c'est la calsse du joueur
    constructor(game, x, y, options = {}) {
        super(game, x, y, "bunny", options) // Pour l'instant il a l'image bunny donc tu vois je call le constructor de Unit qui va call le constructor de GameObject avec image = "bunny"
        this.moving =   {}   // new objet qui aura pour attribut moving.up, moving.left etc quand tu press les key

    }

    update() { // donc a chaue frame il va call l'update de Unit puis selon les key pressed il va modif la position du bitmap (= sa position)
        super.update() // NOTE: dis moi quand t'es sur ce truc jtexpliquerai en direct c plus simple
        if (this.moving.up) this.bmp.y = (this.bmp.y - this.speed <= 0) ? 0 : this.bmp.y - this.speed
        if (this.moving.down) this.bmp.y = (this.bmp.y + this.speed >= this.game.canvas.height - this.rect.height)
        ? this.game.canvas.height - this.rect.height : this.bmp.y + this.speed
        if (this.moving.left) this.bmp.x = (this.bmp.x - this.speed <= 0) ? 0 : this.bmp.x - this.speed
        if (this.moving.right) this.bmp.x = (this.bmp.x + this.speed >= this.game.canvas.width - this.rect.width) ? this.game.canvas.width - this.rect.width : this.bmp.x + this.speed

    }
    move(dir) { // CF NOTE
        this.moving[dir] = true
    }
    stopMove(dir) {
        this.moving[dir] = false
    }
}

function init() { // Quand on a fini de load les asset on call cette function
    canvas = document.querySelector(".game-screen") // document c'est la page html bref il chope la balise que j'ai appelé class="game-screen"
    stage = new createjs.Stage(canvas); // Et il fout le stage(le screen donc) dedans
    game = new Game(stage) // j'instantie l'engine

    stage.on("stagemousedown", handleMouseDown) // la fonction a execute quand le joueur click
    document.onkeydown = handleKeyDown //les fonctions a execute quand le joueur press une key ou arrete de la press
    document.onkeyup = handleKeyUp // j'aurais pu mettre stage.on("onkeydown", handleKeyDown) la c une ptite diff te prend pas la tete avec

    player = new Player(game, 50, 50, {
        speed: 5,
        // size: [50, 100]
    }) // je crée un new player avec options.speed = 5


    createjs.Ticker.setFPS(60); //le ticker c un truc qui va tick a chaue frame donc comme j'ai set fps a 60 tout les 1/60 secondes il va tick
    createjs.Ticker.addEventListener("tick", tickHandler); //la fonction a execute a chaque tick

    function tickHandler(e) {
        // console.log(e)
        game.objects.map(o => o.update()) // il parcourt tous les objets du jeu et les update
        stage.update(); //il refresh l'image affichée sur le stage si tu fais pas ca les images vont pas bouger
    }

    function handleMouseDown(e) {
        // pour l'instant il se passe rien quand tu click j'ai viré le ptite movement
    }

    function handleKeyDown(key) {

        if (key.code === "KeyW") { // selon la key press ca dit au player de move dans cette direction tant que la key est press
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

    function handleKeyUp(key) { // et donc la ca dit au player de stop move dans la direction de la key quand la keyUp quand ta'rrete d'appuyer dessus
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
