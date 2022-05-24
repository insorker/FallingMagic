/* 
 * World is defined as a bunch of pysical rules, which can be applied to instances of 
 * Class Elements and its subclasses. Also it can draw the result on a canvas.
 * 
 * You can customize your own world by extending Class World. APIs to be implemented 
 * are shown below (more details and rules can be found in the comments of functions).
 */
class World {
    dirx = [0, 1, 0, -1];
    diry = [1, 0, -1, 0];

    constructor(canvasName) {
        // canvas and context
        this.cvs = document.getElementById(canvasName);
        this.ctx = this.cvs.getContext("2d");
        this.pen = undefined;

        // global arguments
        this.eleSize = 6;
        this.eleWidth = Math.ceil(this.cvs.width / this.eleSize);
        this.eleHeight = Math.ceil(this.cvs.height / this.eleSize);

        // take elements as a 2d array
        this.eles = new Array(this.eleHeight).fill(0).map(
            () => new Array(this.eleWidth).fill(0));
        this.eleVisited = new Array(this.eleHeight).fill(false).map(
            () => new Array(this.eleWidth).fill(false));
    }

    /*
     * build the world
     */
    build(world) {
        for (let i = 0; i < this.eleHeight; i++) {
            for (let j = 0; j < this.eleWidth; j++) {
                this.eles[i][j] = new Empty(world, j, i);
                this.setVisited(j, i);
            }
        }
    }

    /*
     * set element at (x, y)
     */
    setEle(ele) {
        let x = ele.x, y = ele.y;

        if (!this.isOutOfBounds(x, y)) {
            this.eles[y][x] = ele;
            this.drawEle(x, y);

            this.setVisited(x, y, true);
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

        // draw all elements can be very slow
        // this.drawCanvas();

        // clear visit state
        this.clearEleVisited();
    }

    /*
     * draw canvas
     */
    drawCanvas() {
        for (let i = this.eleHeight - 1; i >= 0; i--) {
            for (let j = this.eleWidth - 1; j >= 0; j--) {
                this.drawEle(j, i);
            }
        }
    }

    /*
     * draw one element
     */
    drawEle(x, y) {
        this.ctx.fillStyle = this.eles[y][x].getColor();
        this.ctx.fillRect(x * this.eleSize, y * this.eleSize,
            this.eleSize, this.eleSize);
    }

    clear(x, y, radius) {
        // for (let i = x - radius; i <=  x + radius; i++) {
        //     for (let j = y - radius; j <= y + radius; j++) {

        //     }
        // }
    }

    setVisited(x, y, bool) {
        this.eleVisited[y][x] = bool;
    }

    clearEleVisited() {
        for (let i = this.eleHeight - 1; i >= 0; i--) {
            for (let j = this.eleWidth - 1; j >= 0; j--) {
                this.eleVisited[i][j] = false;
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
        
        if (this.eleVisited[sy][sx] ||
            this.eleVisited[ny][nx])
            return false;

        if (this.eles[ny][nx].movable == false)
            return false;

        if (this.eles[sy][sx].type == 'Solid' &&
            this.eles[ny][nx].type == 'Solid')
            return false;

        if (this.eles[sy][sx].density >
            this.eles[ny][nx].density)
            return true;
        
        return false;
    }

    /*
     * swap eles[x1][y1] and eles[x2][y2] without checking 
     * and draw after swap
     */
    swap(x1, y1, x2, y2) {
        // if (x1 == x2 && y1 == y2) return;

        [this.eles[y1][x1], this.eles[y2][x2]] =
            [this.eles[y2][x2], this.eles[y1][x1]];
        this.eles[y1][x1].setPos(x1, y1);
        this.eles[y2][x2].setPos(x2, y2);

        this.drawEle(x1, y1);
        this.drawEle(x2, y2);

        this.setVisited(x1, y1, true);
        this.setVisited(x2, y2, true);
    }

    // === reaction
    isCombustible(sx, sy, nx, ny) {
        if (this.isOutOfBounds(nx, ny))
            return false;
        
        if (this.eleVisited[sy][sx] ||
            this.eleVisited[ny][nx])
            return false;

        if (this.eles[ny][nx].combustible)
            return true;
        
        return false;
    }

    isVolatile(sx, sy, nx, ny) {
        if (this.isOutOfBounds(nx, ny))
            return false;
        
        if (this.eleVisited[sy][sx] ||
            this.eleVisited[ny][nx])
            return false;

        if (this.eles[ny][nx].volatile)
            return true;
        
        return false;
    }

    // diffuse(sx, sy) {
    //     for (let i = 0; i < 4; i++) {
    //         let nx = sx + World.dirx[i], ny = sy + World.diry[i];
    //         if (this.isMovable(x, y, nx, ny)) {

    //         }
    //     }
    // }
    // reaction ===
}

/*
 * Element is defined as eles in Class World. It's running under the pysical rules
 * in World.
 * Each class extends Element should implement functions below
 * - move()
 */
class Element {
    constructor(world, x, y, movable, velocity, density) {
        this.world = world;
        this.x = x;
        this.y = y;
        this.movable = movable;
        this.velocity = velocity;
        this.density = density;
        this.type = undefined;
        this.colorArray = [
            ['#ffffff', 1],
        ];

        this.setColor();
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
    setColor() {
        let random = Math.floor(Math.random() * 
            this.colorArray[this.colorArray.length - 1][1]);
        
        for (let i = 0; i < this.colorArray.length; i++) {
            if (random < this.colorArray[i][1]) {
                return this.color = this.colorArray[i][0];
            }
        }

        // error
        console.assert(false, "setColor error");
        return -1;
    }

    /*
     * get color
     */
    getColor() {
        return this.color;
    }

    /*
     * move dist length straight with step length dx and dy
     */
    moveStraight(x, y, dist, dx, dy) {
        let sx = x, sy = y;
        while (dist && this.world.isMovable(sx, sy, x + dx, y + dy)) {
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

// === level one
class Empty extends Element {
    constructor(world, x, y) {
        super(world, x, y, true, 0, -1);

        this.type = 'Empty';
    }

    move() { }
}

class Liquid extends Element {
    constructor(world, x, y, velocity, density) {
        super(world, x, y, true, velocity, density);

        this.type = 'Liquid';
        this.volatile = true;
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

class Solid extends Element {
    constructor(world, x, y, movable, velocity, density) {
        super(world, x, y, movable, velocity, density);

        this.type = 'Solid';
        this.isFreeFalling = true;
    }

    // +++ inertialResistance
    // constructor(world, x, y, movable, velocity, density, inertialResistance) {
    //     super(world, x, y, movable, velocity, density);

    //     this.inertialResistance = inertialResistance;
    // }

    // moveDown(x, y, dist) {
    //     let sx = x, sy = y;
    //     while (dist && this.world.isMovable(sx, sy, x, y + 1)) {
    //         y += 1;
    //         dist--;
    //     }
    //     return [x, y, dist];
    // }
    // inertialResistance +++

    move() {
        if (this.movable == false) return;

        let v = this.velocity;
        let x = this.x, y = this.y;
        if (this.world.isMovable(x, y, x, y + 1))
            this.isFreeFalling = true;
        else {
            if (!this.world.isMovable(x, y, x - 1, y + 1) &&
                !this.world.isMovable(x, y, x + 1, y + 1)) {
                    this.isFreeFalling = false;
                }
        }
        if (this.isFreeFalling == false) return;

        [x, y, v] = this.moveDown(x, y, v);
        if (v) {
            let leftOrRight = Math.floor(Math.random() * 2);
            if (leftOrRight) {
                if (this.world.isMovable(x, y, x - 1, y + 1)) {
                    [x, y, ] = this.moveLeft(x, y, 1);
                    [x, y, v] = this.moveDown(x, y, v);
                }
            }
            else {
                if (this.world.isMovable(x, y, x + 1, y + 1)) {
                    [x, y, ] = this.moveRight(x, y, 1);
                    [x, y, v] = this.moveDown(x, y, v);
                }
            }
        }

        this.world.swap(this.x, this.y, x, y);
    }
}

class Gas extends Element {
    constructor(world, x, y, velocity, density) {
        super(world, x, y, true, velocity, density);

        this.dispear = false;
        this.type = 'Gas';
    }

    getColor() {
        return this.setColor();
    }

    move() {
        let v = this.velocity;
        let x = this.x, y = this.y;

        [x, y, v] = this.moveUp(x, y, v);
        if (v == this.velocity) {
            if (this.dispear) {
                this.world.setEle(new Empty(this.world, this.x, this.y));
                return;
            }
            else {
                let leftOrRight = Math.floor(Math.random() * 2);
                if (leftOrRight)
                    [x, y, v] = this.moveLeft(x, y, v);
                else
                    [x, y, v] = this.moveRight(x, y, v);
            }
        }

        this.world.swap(this.x, this.y, x, y);
    }
}

class Magic extends Element {
    constructor(world, x, y, movable) {
        super(world, x, y, movable, 0, 0);

        this.type = 'Magic';
    }
}
// level one ===

// === level two
class Water extends Liquid {
    constructor(world, x, y) {
        super(world, x, y, 4, 1.0);

        this.colorArray = [
            ['#2486b9', 1]
        ];
        this.setColor();
    }
}

class Sand extends Solid {
    constructor(world, x, y) {
        super(world, x, y, true, 1, 1.2);

        this.colorArray = [
            ['#f9c116', 2],
            ['#d6a01d', 3]
        ];
        this.setColor();
    }
}

class Stone extends Solid {
    constructor(world, x, y) {
        super(world, x, y, false, 1, 10);

        this.colorArray = [
            ['#0f1423', 1]
        ];
        this.setColor();

        this.isFreeFalling = false;
    }
}

class Steam extends Gas {
    constructor(world, x, y) {
        super(world, x, y, 2, 0.5);

        this.colorArray = [
            ['#cdd1d3', 1]
        ];
        this.setColor();
    }
}

class Snow extends Solid {
    constructor(world, x, y) {
        super(world, x, y, true, 2, 0.8);

        this.colorArray = [
            ['#baccd9', 1]
        ];
        this.setColor();
    }
}

class Fire extends Magic {
    constructor(world, x, y) {
        super(world, x, y, true);

        this.colorArray = [
            ['#eccb83', 1],
            ['#e07e38', 2]
        ];
        this.setColor();

        this.velocity = 2;
        this.live = 120;
        this.duration = 6;
    }

    getColor() {
        return this.setColor();
    }

    die() {
        if (this.live == 0) {
            this.world.setEle(new Empty(this.world, this.x, this.y));
            return true;
        }

        this.live--;
        return false;
    }

    setFlame() {
        // let v = this.velocity;
        // let x = this.x, y = this.y;
        // [x, y, v] = this.moveUp(x, y, v);

        // let flame = new Fire(this.world, x, y);
        // flame.live = 0;

        // this.world.setEle(flame);
    }

    move() {
        if (this.die()) return;
        
        let x = this.x, y = this.y;

        if (this.live % this.duration == 0) {
            for (let i = 0; i < 4; i++) {
                let nx = x + this.world.dirx[i], ny = y + this.world.diry[i];
                // e.g. wood
                if (this.world.isCombustible(x, y, nx, ny)) {
                    this.world.setEle(new Fire(this.world, nx, ny));
                    return;
                }
                // e.g. water
                else if (this.world.isVolatile(x, y, nx, ny)) {
                    this.world.setEle(new Steam(this.world, nx, ny));
                    this.live = 0;
                    return;
                }
            }
        }
        
        this.setFlame();
        this.world.drawEle(this.x, this.y);
    }
}

class Wood extends Solid {
    constructor(world, x, y) {
        super(world, x, y, false, 1, 10);

        this.colorArray = [
            ['#806332', 1],
            ['#553b18', 2],
        ];
        this.setColor();

        this.isFreeFalling = false;
        this.combustible = true;
    }
}
// level two ===