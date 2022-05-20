/* 
 * World is defined as a bunch of pysical rules, which can be applied to instances of 
 * Class Elements and its subclasses. Also it can draw the result on a canvas.
 * 
 * You can customize your own world, but must implement the APIs below (more details 
 * and rules can be found in the comments of functions).
 *   isMovable(sx, sy, ex, ey)
 *   swap(x1, y1, x2, y2)
 */
class World {
    constructor(canvasName) {
        // canvas and context
        this.cvs = document.getElementById(canvasName);
        this.ctx = this.cvs.getContext("2d");

        // global arguments
        this.eleSize = 6;
        this.eleWidth = Math.ceil(this.cvs.width / this.eleSize);
        this.eleHeight = Math.ceil(this.cvs.height / this.eleSize);

        // take elements as a 2d array
        this.eles = new Array(this.eleHeight).fill(0).map(
            () => new Array(this.eleWidth).fill(0));
    }

    /*
     * build the world
     */
    build(world) {
        for (let i = 0; i < this.eleHeight; i++) {
            for (let j = 0; j < this.eleWidth; j++) {
                this.eles[i][j] = new Empty(world, j, i);
            }
        }
    }

    /*
     * step per frame
     */
    step() {
        // move
        for (let i = this.eleHeight - 1; i >= 0; i--) {
            for (let j = this.eleWidth - 1; j >= 0; j--) {
                if (!(this.eles[i][j] instanceof Empty)) {
                    // === do something
                    this.eles[i][j].move();
                    // do something ===
                }
            }
        }

        // draw
        this.draw();
    }

    /*
     * draw canvas
     */
    draw() {
        for (let i = this.eleHeight - 1; i >= 0; i--) {
            for (let j = this.eleWidth - 1; j >= 0; j--) {
                if (!(this.eles[i][j] instanceof Empty)) {
                    this.ctx.fillStyle = this.eles[i][j].color;
                    this.ctx.fillRect(j * this.eleSize, i * this.eleSize,
                        this.eleSize, this.eleSize);
                }
            }
        }
    }

    /*
     * if [x, y] is out of bounds
     */
    isOutOfBounds(x, y) {
        if (x < 0 || x >= this.eleWidth ||
            y < 0 || y >= this.eleHeight)
            return true;
        return false;
    }

    /*
     * if eles[sx][sy] can move to eles[nx][ny]
     */
    isMovable(sx, sy, nx, ny) {
        if (this.isOutOfBounds(nx, ny))
            return false;
        
        if (this.eles[ny][nx].movable == false)
            return false;

        if (this.eles[sy][sx].density >
            this.eles[ny][nx].density)
            return true;
        
        return false;
    }

    /*
     * swap ele[x1][y1] and ele[x2][y2] without checking
     */
    swap(x1, y1, x2, y2) {
        if (x1 == x2 && y1 == y2) return;

        [this.eles[y1][x1], this.eles[y2][x2]] =
            [this.eles[y2][x2], this.eles[y1][x1]];
        this.eles[y1][x1].setPos(x1, y1);
        this.eles[y2][x2].setPos(x2, y2);
    }
}

/*
 * Element is defined as eles in Class World. It's running under the pysical rules
 * in World.
 * Each class extends Element should implement functions below
 *   move(isMovable, swap)
 */
class Element {
    constructor(world, x, y, movable, velocity, density) {
        this.world = world;
        this.x = x;
        this.y = y;
        this.movable = movable;
        this.velocity = velocity;
        this.density = density;

        this.setColor([
            ['#ffffff', 1],
        ]);
    }

    /*
     * set position
     */
    setPos(x, y) {
        [this.x, this.y] = [x, y];
    }

    /*
     *  set color
     */
    setColor(colorArray) {
        let random = Math.floor(Math.random() * colorArray[colorArray.length - 1][1]);
        
        for (let i = 0; i < colorArray.length; i++) {
            if (random < colorArray[i][1]) {
                this.color = colorArray[i][0];
                return;
            }
        }

        // error
        console.assert(false, "setColor error");
    }

    /*
     * move dist length straight with step length dx and dy
     */
    moveStraight(x, y, dist, dx, dy) {
        let sx = x, sy = y;
        while (this.world.isMovable(sx, sy, x + dx, y + dy) && dist) {
            x += dx, y += dy;
            dist--;
        }
        return [x, y, dist];
    }

    moveUp(x, y, dist) {
        return this.moveStraight(x, y, dist, 0, -1);
    }

    moveDown(x, y, dist) {
        return this.moveStraight(x, y, dist, 0, 1);
    }

    moveLeft(x, y, dist) {
        return this.moveStraight(x, y, dist, -1, 0);
    }

    moveRight(x, y, dist) {
        return this.moveStraight(x, y, dist, 1, 0);
    }
}

class Empty extends Element {
    constructor(world, x, y) {
        super(world, x, y, true, 0, 0);
    }

    move() { }
}

class Liquid extends Element {
    constructor(world, x, y, velociry, density) {
        super(world, x, y, true, velociry, density);
    }

    move() {
        let v = this.velocity;
        let x = this.x, y = this.y;

        [x, y, v] = this.moveDown(x, y, v);
        if (v) {
            let leftOrRight = Math.floor(Math.random() * 2);
            if (leftOrRight)
                [x, y, v] = this.moveLeft(x, y, v);
            else
                [x, y, v] = this.moveRight(x, y, v);
        }

        this.world.swap(this.x, this.y, x, y);
    }
}

// class Solid extends Element {
//     constructor(x, y, color, movable, velociry, density) {
//         super(x, y, color, movable, velociry, density);
//     }

//     move() {
//         if (this.movable == false) {
//             this.draw();
//             return;
//         }

//         let v = this.velocity;
//         let x = this.x, y = this.y;
//         let oldx = this.x, oldy = this.y;

//         if (Element.isMovable(oldx, oldy, x, y + 1)) {
//             // go down
//             while (v && Element.isMovable(oldx, oldy, x, y + 1)) {
//                 y += 1;
//                 v -= 1;
//             }
//         }
//         else {
//             // go down left or down right
//             let dir = Math.floor(Math.random() * 2);
//             if (dir == 0) { dir = -1; }

//             while (v && Element.isMovable(oldx, oldy, x + dir, y + 1)) {
//                 x += dir;
//                 y += 1;
//                 v -= 1;
//             }
//         }

//         Element.exchangeAndDraw(x, y, oldx, oldy);
//     }
// }

// class Gas extends Element {
//     constructor(x, y, color, velociry, density) {
//         super(x, y, color, true, velociry, density);
//     }

//     move() {
//         let v = this.velocity;
//         let x = this.x, y = this.y;
//         let oldx = this.x, oldy = this.y;
//         let dir = Math.floor(Math.random() * 3) - 1;

//         if (Element.isMovable(oldx, oldy, x + dir, y - 1)) {
//             // go up left or up right
//             while (v && Element.isMovable(oldx, oldy, x + dir, y - 1)) {
//                 x += dir;
//                 y -= 1;
//                 v -= 1;
//             }
//         }
//         else {
//             // just go horizontally
//             while (v && Element.isMovable(oldx, oldy, x + dir, y)) {
//                 x += dir;
//                 v -= 1;
//             }
//         }

//         Element.exchangeAndDraw(x, y, oldx, oldy);
//     }
// }

// class Magic extends Element {
//     constructor(x, y, color, velociry, density) {
//         super(x, y, color, true, velociry, density);
//     }

//     move() {
//         let 
//     }
// }

class Water extends Liquid {
    constructor(world, x, y) {
        super(world, x, y, 4, 1);

        this.setColor([
            ['#2486b9', 1]
        ]);
    }
}

// class Sand extends Solid {
//     constructor(x, y) {
//         super(x, y, [['#f9c116', 1]], true, 1, 1.2);
//     }
// }

// class Stone extends Solid {
//     constructor(x, y) {
//         super(x, y, [['#0f1423', 1]], false, 1, 10);
//     }
// }

// class Steam extends Gas {
//     constructor(x, y) {
//         super(x, y, [['#8abcd1', 1], ['#eeeeee', 2]], 8, 0.5);
//     }
// }

// class Snow extends Solid {
//     constructor(x, y) {
//         super(x, y, [['#baccd9', 1]], true, 3, 0.8);
//     }

//     move() {
//         let v = this.velocity;
//         let x = this.x, y = this.y;
//         let oldx = this.x, oldy = this.y;
//         let dir = Math.floor(Math.random() * 3) - 1;

//         if (Element.isMovable(oldx, oldy, x + dir, y + 1)) {
//             // go up left or up right
//             while (v && Element.isMovable(oldx, oldy, x + dir, y + 1)) {
//                 x += dir;
//                 y += 1;
//                 v -= 1;
//             }
//         }
//         else {
//             // just go horizontally
//             while (v && Element.isMovable(oldx, oldy, x + dir, y)) {
//                 x += dir;
//                 v -= 1;
//             }
//         }

//         Element.exchangeAndDraw(x, y, oldx, oldy);
//     }
// }

function run() {
    let world = new World('canvas');
    world.build();
    
    let frame = 0;
    var update = () => {
        if (frame == 60) frame = 0;

        world.eles[10][10] = new Water(world, 10, 10);
        world.step();

        frame++;
        requestAnimationFrame(update)
    }
    requestAnimationFrame(update)
}

window.onload = run;