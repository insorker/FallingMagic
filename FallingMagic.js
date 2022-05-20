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
    constructor(color, movable, velocity, density) {
        this.color = color;
        this.movable = movable;
        this.velocity = velocity;
        this.density = density;
    }

    // choose a random color to draw
    static draw(x, y) {
        let eleColor = ElementInstance[eles[x][y]].color;
        let random = Math.floor(Math.random() * eleColor[eleColor.length - 1][1]);

        for (let i = 0; i < eleColor.length; i++) {
            if (random < eleColor[i][1]) {
                ctx.fillStyle = eleColor[i][0];
                ctx.fillRect(x * eleSize, y * eleSize, eleSize, eleSize);
                break;
            }
        }
    }

    // exchange two pixel's position
    static exchange(x1, y1, x2, y2) {
        // if (eles[x1][y1] == eles[x2][y2]) {
        //     // same element
        //     return false;
        // }
        if (x1 != x2 || y1 != y2) {
            // different element && different position
            [eles[x1][y1], eles[x2][y2]] = [eles[x2][y2], eles[x1][y1]];
            return true;
        }

        // not reachable
        return false;
    }

    static exchangeAndDraw(x1, y1, x2, y2) {
        Element.exchange(x1, y1, x2, y2);
        // if exchange not happened, draw still to change color
        Element.draw(x1, y1);
        Element.draw(x2, y2);
    }

    static isMovable(x, y, nex, ney) {
        // check boundary
        if (nex < 0 || nex >= eleWidth ||
            ney < 0 || ney >= eleHeight) { return false; }
        
        // check empty
        if (eles[nex][ney] != 0) {
            // whether next element can move
            if (ElementInstance[eles[nex][ney]].movable == false) { return false; }
            // compare density
            if (ElementInstance[eles[x][y]].density >
                ElementInstance[eles[nex][ney]].density) { return true; }

            return false;
        }
        
        return true;
    }
}

class Empty extends Element {
    constructor() {
        super([['#ffffff', 1]], false, 0, 0);
    }
}

class Liquid extends Element {
    constructor(color, velociry, density) {
        super(color, true, velociry, density);
    }

    move(x, y) {
        let v = this.velocity;
        let oldx = x, oldy = y;

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
    constructor(color, velociry, density) {
        super(color, true, velociry, density);
    }

    move(x, y) {
        let v = this.velocity;
        let oldx = x, oldy = y;
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
    constructor() {
        super([['#2486b9', 1]], 4, 1);
    }
}

class Sand extends Solid {
    constructor() {
        super([['#f9c116', 1]], true, 1, 1.2);
    }
}

class Stone extends Solid {
    constructor() {
        super([['#0f1423', 1]], false, 1, 10);
    }
}

class Steam extends Gas {
    constructor() {
        super([['#8abcd1', 1], ['#eeeeee', 2]], 8, 0.5);
    }
}

class Snow extends Solid {
    constructor() {
        super([['#baccd9', 1]], true, 3, 0.8);
    }

    move(x, y) {
        let v = this.velocity;
        let oldx = x, oldy = y;
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
        eles[i][50] = 3;
    }

    var update = () => {
        if (frame % 1 == 0) {
            eles[10][10] = 1;
            eles[100][10] = 2;
            eles[50][10] = 4;
            eles[60][10] = 5;
        }
        else if (frame == 60) {
            frame = 0;
        }

        for (let j = eleHeight - 1; j >= 0; j--) {
            for (let i = eleWidth - 1; i >= 0; i--) {
                if (eles[i][j] != 0) {
                    ElementInstance[eles[i][j]].move(i, j);
                }
            }
        }

        frame++;
        requestAnimationFrame(update)
    }
    requestAnimationFrame(update)
}

window.onload = run;