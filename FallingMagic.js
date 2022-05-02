// canvas and context
var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");

// take elements ad a 2d array
var elements = new Array(canvas.width).fill(0).map(() => new Array(canvas.height).fill(0));
const ElementSize = 3;
const elewith = Math.ceil(canvas.width / ElementSize);
const eleheight = Math.ceil(canvas.height / ElementSize);

class Element {
    constructor(color, movable, velocity, density) {
        // unit size 
        this.size = 5;
        // element type
        // this.type = type;
        this.color = color;
        this.movable = movable;
        this.velocity = velocity;
        this.density = density;
    }

    static draw(x, y) {
        let elecolor = ElementInstance[elements[x][y]].color;
        let rancolor = Math.floor(Math.random() * elecolor[0][1]) + elecolor[0][0];
        let color = elecolor[elecolor.length - 1][0];

        for (let i = 1; i < elecolor.length; i++) {
            if (rancolor < elecolor[i][1]) {
                color = elecolor[i][0];
                break;
            }
        }

        ctx.fillStyle = color;
        ctx.fillRect(x * ElementSize, y * ElementSize, ElementSize, ElementSize);
    }

    static exchange(x1, y1, x2, y2) {
        if (x1 != x2 || y1 != y2) {
            let tmp = elements[x1][y1];
            elements[x1][y1] = elements[x2][y2];
            Element.draw(x1, y1);
            elements[x2][y2] = tmp;
            Element.draw(x2, y2);
        }
        else {
            Element.draw(x1, y1);
        }
    }

    isMovable(x, y, nex, ney) {
        // check boundary
        if (nex < 0 || nex >= elewith ||
            ney < 0 || ney >= eleheight) { return false; }
        // check empty
        if (elements[nex][ney] != 0) {
            // check whether next element can move
            if (ElementInstance[elements[nex][ney]].movable == false) { return false; }
            // compare density
            if (ElementInstance[elements[x][y]].density >
                ElementInstance[elements[nex][ney]].density) { return true; }

            return false;
        }
        
        return true;
    }
}

class Empty extends Element {
    constructor() {
        super([[0, 1], ['#ffffff', 1], ], false, 0, 0);
    }
}

class Liquid extends Element {
    constructor(color, velociry, density) {
        super(color, true, velociry, density);
    }

    move(x, y) {
        let v = this.velocity;
        let oldx = x, oldy = y;

        if (this.isMovable(oldx, oldy, x, y + 1)) {
            // go down
            while (v && this.isMovable(oldx, oldy, x, y + 1)) {
                y += 1;
                v -= 1;
            }
        }
        else {
            // go left or right
            let dir = Math.floor(Math.random() * 2);
            if (dir == 0) { dir = -1; }

            while (v && this.isMovable(oldx, oldy, x + dir, y)) {
                x += dir;
                v -= 1;
            }
        }

        Element.exchange(x, y, oldx, oldy);
    }
}

class Solid extends Element {
    constructor(color, movable, velociry, density) {
        super(color, movable, velociry, density);
    }

    move(x, y) {
        if (this.movable == false) {
            Element.draw(x, y);
            return;
        }

        let v = this.velocity;
        let oldx = x, oldy = y;

        if (this.isMovable(oldx, oldy, x, y + 1)) {
            // go down
            while (v && this.isMovable(oldx, oldy, x, y + 1)) {
                y += 1;
                v -= 1;
            }
        }
        else {
            // go down left or down right
            let dir = Math.floor(Math.random() * 2);
            if (dir == 0) { dir = -1; }

            while (v && this.isMovable(oldx, oldy, x + dir, y + 1)) {
                x += dir;
                y += 1;
                v -= 1;
            }
        }

        Element.exchange(x, y, oldx, oldy);
    }
}

class Gas extends Element {
    constructor(color, velociry, density) {
        super(color, true, velociry, density);
    }

    move(x, y) {
        let v = this.velocity;
        let oldx = x, oldy = y;
        let dir = Math.floor(Math.random() * 3) - 1;

        if (this.isMovable(oldx, oldy, x + dir, y - 1)) {
            // go up left or up right
            while (v && this.isMovable(oldx, oldy, x + dir, y - 1)) {
                x += dir;
                y -= 1;
                v -= 1;
            }
        }
        else {
            // just go horizontally
            while (v && this.isMovable(oldx, oldy, x + dir, y)) {
                x += dir;
                v -= 1;
            }
        }

        Element.exchange(x, y, oldx, oldy);
    }
}

class Water extends Liquid {
    constructor() {
        super([[0, 1], ['#2486b9', 1], ], 4, 1);
    }
}

class Sand extends Solid {
    constructor() {
        super([[0, 1], ['#f9c116', 1], ], true, 1, 1.2);
    }
}

class Stone extends Solid {
    constructor() {
        super([[0, 1], ['#0f1423', 1], ], false, 1, 10);
    }
}

class Steam extends Gas {
    constructor() {
        super([[0, 20], ['#8abcd1', 19], ['#eeeeee', 20]], 8, 0.5);
    }
}

class Snow extends Solid {
    constructor() {
        super([[0, 1], ['#baccd9', 1], ], true, 3, 0.8);
    }

    move(x, y) {
        let v = this.velocity;
        let oldx = x, oldy = y;
        let dir = Math.floor(Math.random() * 3) - 1;

        if (this.isMovable(oldx, oldy, x + dir, y + 1)) {
            // go up left or up right
            while (v && this.isMovable(oldx, oldy, x + dir, y + 1)) {
                x += dir;
                y += 1;
                v -= 1;
            }
        }
        else {
            // just go horizontally
            while (v && this.isMovable(oldx, oldy, x + dir, y)) {
                x += dir;
                v -= 1;
            }
        }

        Element.exchange(x, y, oldx, oldy);
    }
}

const ElementInstance = [
    /* 0 */ new Empty(),
    /* 1 */ new Water(),
    /* 2 */ new Sand(),
    /* 3 */ new Stone(),
    /* 4 */ new Steam(),
    /* 5 */ new Snow(),
]

function run() {
    let frame = 1;

    for (let i = 10; i <= 110; i++) {
        elements[i][50] = 3;
    }

    var update = () => {
        if (frame % 10 == 0) {
            elements[10][10] = 1;
            elements[100][10] = 2;
            elements[50][10] = 4;
            elements[60][10] = 5;
        }
        else if (frame == 60) {
            frame = 0;
        }

        for (let j = eleheight; j >= 0; j--) {
            for (let i = elewith; i >= 0; i--) {
                if (elements[i][j] != 0) {
                    ElementInstance[elements[i][j]].move(i, j);
                }
            }
        }

        frame++;
        requestAnimationFrame(update)
    }
    requestAnimationFrame(update)
}

window.onload = run;