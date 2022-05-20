// canvas and context
var cvs = document.getElementById("canvas");
var ctx = cvs.getContext("2d");

// take elements as a 2d array
const eleSize = 6;
const eleWidth = Math.ceil(cvs.width / eleSize);
const eleHeight = Math.ceil(cvs.height / eleSize);
var eles = new Array(eleWidth).fill(0).map(
    () => new Array(eleHeight).fill(0));

class Element {
    constructor(x, y, color, movable, velocity, density) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.movable = movable;
        this.velocity = velocity;
        this.density = density;
    }

    setXY(x, y) {
        [this.x, this.y] = [x, y];
    }

    // choose a random color to draw
    draw() {
        let random = Math.floor(Math.random() * this.color[this.color.length - 1][1]);

        for (let i = 0; i < this.color.length; i++) {
            if (random < this.color[i][1]) {
                ctx.fillStyle = this.color[i][0];
                ctx.fillRect(this.x * eleSize, this.y * eleSize, eleSize, eleSize);
                break;
            }
        }
    }

    // exchange two pixel's position
    static exchange(x1, y1, x2, y2) {
        if (x1 != x2 || y1 != y2) {
            // different element && different position
            [eles[x1][y1], eles[x2][y2]] = [eles[x2][y2], eles[x1][y1]];
            eles[x1][y1].setXY(x1, y1);
            eles[x2][y2].setXY(x2, y2);
            return true;
        }

        // not reachable
        return false;
    }

    static exchangeAndDraw(x1, y1, x2, y2) {
        Element.exchange(x1, y1, x2, y2);
        // if exchange not happened, draw still to change color
        eles[x1][y1].draw();
        eles[x2][y2].draw();
    }

    static isMovable(x, y, nex, ney) {
        // check boundary
        if (nex < 0 || nex >= eleWidth ||
            ney < 0 || ney >= eleHeight) { return false; }
        
        // whether next element can move
        if (eles[nex][ney].movable == false) { return false; }
        
        // compare density
        if (eles[x][y].density >
            eles[nex][ney].density) { return true; }

        return false;
    }
}

class Empty extends Element {
    constructor(x, y) {
        super(x, y, [['#ffffff', 1]], true, 0, 0);
    }
}

class Liquid extends Element {
    constructor(x, y, color, velociry, density) {
        super(x, y, color, true, velociry, density);
    }

    move() {
        let v = this.velocity;
        let x = this.x, y = this.y;
        let oldx = this.x, oldy = this.y;

        if (Element.isMovable(oldx, oldy, x, y + 1)) {
            // go down
            while (v && Element.isMovable(oldx, oldy, x, y + 1)) {
                y += 1;
                v -= 1;
            }
        }
        else {
            // go left or right
            let dir = Math.floor(Math.random() * 2);
            if (dir == 0) { dir = -1; }

            while (v && Element.isMovable(oldx, oldy, x + dir, y)) {
                x += dir;
                v -= 1;
            }
        }

        Element.exchangeAndDraw(x, y, oldx, oldy);
    }
}

class Solid extends Element {
    constructor(x, y, color, movable, velociry, density) {
        super(x, y, color, movable, velociry, density);
    }

    move() {
        if (this.movable == false) {
            this.draw();
            return;
        }

        let v = this.velocity;
        let x = this.x, y = this.y;
        let oldx = this.x, oldy = this.y;

        if (Element.isMovable(oldx, oldy, x, y + 1)) {
            // go down
            while (v && Element.isMovable(oldx, oldy, x, y + 1)) {
                y += 1;
                v -= 1;
            }
        }
        else {
            // go down left or down right
            let dir = Math.floor(Math.random() * 2);
            if (dir == 0) { dir = -1; }

            while (v && Element.isMovable(oldx, oldy, x + dir, y + 1)) {
                x += dir;
                y += 1;
                v -= 1;
            }
        }

        Element.exchangeAndDraw(x, y, oldx, oldy);
    }
}

class Gas extends Element {
    constructor(x, y, color, velociry, density) {
        super(x, y, color, true, velociry, density);
    }

    move() {
        let v = this.velocity;
        let x = this.x, y = this.y;
        let oldx = this.x, oldy = this.y;
        let dir = Math.floor(Math.random() * 3) - 1;

        if (Element.isMovable(oldx, oldy, x + dir, y - 1)) {
            // go up left or up right
            while (v && Element.isMovable(oldx, oldy, x + dir, y - 1)) {
                x += dir;
                y -= 1;
                v -= 1;
            }
        }
        else {
            // just go horizontally
            while (v && Element.isMovable(oldx, oldy, x + dir, y)) {
                x += dir;
                v -= 1;
            }
        }

        Element.exchangeAndDraw(x, y, oldx, oldy);
    }
}

class Water extends Liquid {
    constructor(x, y) {
        super(x, y, [['#2486b9', 1]], 4, 1);
    }
}

class Sand extends Solid {
    constructor(x, y) {
        super(x, y, [['#f9c116', 1]], true, 1, 1.2);
    }
}

class Stone extends Solid {
    constructor(x, y) {
        super(x, y, [['#0f1423', 1]], false, 1, 10);
    }
}

class Steam extends Gas {
    constructor(x, y) {
        super(x, y, [['#8abcd1', 1], ['#eeeeee', 2]], 8, 0.5);
    }
}

class Snow extends Solid {
    constructor(x, y) {
        super(x, y, [['#baccd9', 1]], true, 3, 0.8);
    }

    move() {
        let v = this.velocity;
        let x = this.x, y = this.y;
        let oldx = this.x, oldy = this.y;
        let dir = Math.floor(Math.random() * 3) - 1;

        if (Element.isMovable(oldx, oldy, x + dir, y + 1)) {
            // go up left or up right
            while (v && Element.isMovable(oldx, oldy, x + dir, y + 1)) {
                x += dir;
                y += 1;
                v -= 1;
            }
        }
        else {
            // just go horizontally
            while (v && Element.isMovable(oldx, oldy, x + dir, y)) {
                x += dir;
                v -= 1;
            }
        }

        Element.exchangeAndDraw(x, y, oldx, oldy);
    }
}

function run() {
    // === initialize
    let frame = 1;
    for (let i = 0; i < eles.length; i++) {
        for (let j = 0; j < eles[0].length; j++) {
            eles[i][j] = new Empty(i, j);
        }
    }
    // initialize ===

    for (let i = 10; i <= 110; i++) {
        eles[i][50] = new Stone(i, 50);
    }

    var update = () => {
        if (frame % 1 == 0) {
            eles[10][10] = new Water(10, 10);
            eles[100][10] = new Sand(100, 10);
            eles[50][10] = new Steam(50, 10);
            eles[60][10] = new Snow(60, 10);
        }
        else if (frame == 60) {
            frame = 0;
        }

        for (let j = eleHeight - 1; j >= 0; j--) {
            for (let i = eleWidth - 1; i >= 0; i--) {
                if (!(eles[i][j] instanceof Empty)) {
                    // === do something
                    eles[i][j].move(i, j);
                    // do something ===
                }
            }
        }

        frame++;
        requestAnimationFrame(update)
    }
    requestAnimationFrame(update)
}

window.onload = run;