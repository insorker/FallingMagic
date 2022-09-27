/* 
 * World is defined as a bunch of pysical rules, which can be applied to instances of 
 * Element and its subclasses. With elements, World can perform a lively world on the
 * html5 canvas.
 * 
 * You can customize your own world by extending World. APIs to be implemented are 
 * shown below (more details and rules can be found in the comments of functions).
 */
class World {
    dirx = [0, 1, 0, -1];
    diry = [1, 0, -1, 0];

    constructor(canvas) {
        // canvas and context
        this.cvs = canvas;
        this.ctx = this.cvs.getContext("2d");
        this.pen = undefined;

        // global arguments
        this.eleSize = 5;
        this.eleWidth = Math.ceil(this.cvs.width / this.eleSize);
        this.eleHeight = Math.ceil(this.cvs.height / this.eleSize);

        // take elements as a 2d array
        // layout of elements is drawn below
        /*              eleWidth
         *           .---- j ---> x
         *           |
         * eleHeight i  ele[i][j] <=> ele[y][x]
         *           |
         *           \/
         *           y
         */
        this.eles = new Array(this.eleHeight).fill(0).map(
            () => new Array(this.eleWidth).fill(0));
        this.eleAccess = new Array(this.eleHeight).fill(true).map(
            () => new Array(this.eleWidth).fill(true));
    }

    /*
     * rebuild the world
     */
    rebuild(world) {
        for (let i = 0; i < this.eleHeight; i++) {
            for (let j = 0; j < this.eleWidth; j++) {
                this.eles[i][j] = new Empty(world, j, i);
                this.setAccess(j, i, true);
            }
        }

        this.ctx.clearRect(0, 0, this.cvs.width, this.cvs.height);
    }

    /*
     * step per frame
     */
    step() {
        for (let i = 0; i < this.eleHeight; i++) {
            for (let j = 0; j < this.eleWidth; j++) {
                if (!(this.eles[i][j] instanceof Empty)) {
                    // === do something
                    this.eles[i][j].move();
                    // do something ===
                }
            }
        }

        // clear access state
        this.clearEleAccess();
    }

    /*
     * get element at (x, y)
     */
    getEle(x, y) {
        return this.eles[y][x];
    }

    /*
     * set element at (x, y)
     */
    setEle(ele) {
        let x = ele.x, y = ele.y;

        if (!this.isOutOfBounds(x, y)) {
            this.eles[y][x] = ele;
            this.drawEle(x, y);
            this.setAccess(x, y, false);
        }
    }

    /*
     * set access state
     */
    setAccess(x, y, bool) {
        this.eleAccess[y][x] = bool;
    }

    /*
     * get access state
     */
    getAccess(x, y) {
        return this.eleAccess[y][x];
    }

    /*
     * clear access state
     */
    clearEleAccess() {
        for (let i = 0; i < this.eleHeight; i++) {
            for (let j = 0; j < this.eleWidth; j++) {
                this.setAccess(j, i, true);
            }
        }
    }

    /*
     * draw one element
     */
    drawEle(x, y) {
        this.ctx.fillStyle = this.getEle(x, y).getColor();
        this.ctx.fillRect(x * this.eleSize, y * this.eleSize,
            this.eleSize, this.eleSize);
    }

    /*
     * whether (x, y) is out of bounds
     */
    isOutOfBounds(x, y) {
        if (x < 0 || x >= this.eleWidth ||
            y < 0 || y >= this.eleHeight)
                return true;
        return false;
    }

    /*
     * whether (sx, sy, nx, ny) is accessible
     */
    isAccessible(sx, sy, nx, ny) {
        if (this.isOutOfBounds(nx, ny))
            return false;

        if (!this.eleAccess[sy][sx] ||
            !this.eleAccess[ny][nx])
            return false;
            
        return true;
    }

    /*
     * whether eles[sx][sy] can move to eles[nx][ny]
     */
    isMovable(sx, sy, nx, ny, horizontal=false) {
        if (!this.isAccessible(sx, sy, nx, ny))
            return false;

        if (this.eles[ny][nx].movable == false)
            return false;

        if (this.eles[ny][nx].type == 'Solid')
            return false;
        
        if (horizontal) {
            return true;
        }
        else {
            if (this.eles[sy][sx].density >
                this.eles[ny][nx].density)
                return true;
        }
        
        return false;
    }

    /*
     * swap eles[x1][y1] and eles[x2][y2] without checking 
     * and draw after swap finished
     */
    swap(x1, y1, x2, y2) {
        if (x1 == x2 && y1 == y2) {
            this.drawEle(x1, y1);
            return;
        }

        [this.eles[y1][x1], this.eles[y2][x2]] =
            [this.eles[y2][x2], this.eles[y1][x1]];
        this.eles[y1][x1].setPos(x1, y1);
        this.eles[y2][x2].setPos(x2, y2);

        this.setAccess(x1, y1, false);
        this.setAccess(x2, y2, false);

        this.drawEle(x1, y1);
        this.drawEle(x2, y2);
    }

    // === reaction
    combustible(sx, sy, nx, ny) {
        if (!this.isAccessible(sx, sy, nx, ny))
            return false;

        if (this.eles[ny][nx].combustible)
            return true;
        
        return false;
    }

    volatile(sx, sy, nx, ny) {
        if (!this.isAccessible(sx, sy, nx, ny))
            return false;

        if (this.eles[ny][nx].volatile)
            return true;
        
        return false;
    }

    liquefiable(sx, sy, nx, ny) {
        if (!this.isAccessible(sx, sy, nx, ny))
            return false;
        
        if (this.eles[ny][nx].liquefiable)
            return true;
        
        return false;
    }
    // reaction ===
}

/*
 * Element is defined as eles in World. It's running under the pysical rules in World.
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
     * The rule of how to set color is that we take a random number, traverse the array 
     * to find whether a number is less than the random number. If so, set the comparable
     * color.
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
    moveStraight(x, y, dist, dx, dy, horizontal) {
        let sx = x, sy = y;
        while (dist && this.world.isMovable(sx, sy, x + dx, y + dy, horizontal)) {
            x += dx, y += dy;
            dist--;
        }
        return [x, y, dist];
    }

    moveUp(x, y, dist) {
        return this.moveStraight(x, y, dist, 0, -1, false);
    }

    moveDown(x, y, dist) {
        return this.moveStraight(x, y, dist, 0, 1, false);
    }

    moveLeft(x, y, dist) {
        return this.moveStraight(x, y, dist, -1, 0, true);
    }

    moveRight(x, y, dist) {
        return this.moveStraight(x, y, dist, 1, 0, true);
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
    constructor(world, x, y, movable, velocity, density, inertialResistance) {
        super(world, x, y, movable, velocity, density);

        this.type = 'Solid';
        this.isFreeFalling = true;
        this.inertialResistance = inertialResistance;
    }

    moveDown(x, y, dist) {
        let sx = x, sy = y;
        while (dist && this.world.isMovable(sx, sy, x, y + 1, false)) {
            if (Math.random() < this.inertialResistance) {
                if (!this.world.isOutOfBounds(x + 1, y) &&
                    this.world.eles[y][x + 1].type == 'Solid') {
                    this.world.eles[y][x + 1].isFreeFalling = true;
                }
                if (!this.world.isOutOfBounds(x - 1, y) &&
                    this.world.eles[y][x - 1].type == 'Solid') {
                    this.world.eles[y][x - 1].isFreeFalling = true;
                }
            }

            y += 1;
            dist--;
        }
        return [x, y, dist];
    }

    move() {
        if (this.movable == false) return;

        let v = this.velocity;
        let x = this.x, y = this.y;

        if (this.world.isMovable(x, y, x, y + 1))
            this.isFreeFalling = true;
        else if (this.isFreeFalling == false)
            return;

        [x, y, v] = this.moveDown(x, y, v);
        if (v) {
            let leftOrRight = Math.floor(Math.random() * 2);
            if (leftOrRight) {
                [x, y, v] = this.moveLeft(x, y, v);
            }
            else {
                [x, y, v] = this.moveRight(x, y, v);
            }
            
            if (!this.world.isMovable(x, y, x, y + 1)) {
                this.isFreeFalling = false;
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

        this.volatile = true;
    }
}

class Oil extends Liquid {
    constructor(world, x, y) {
        super(world, x, y, 4, 0.9);

        this.colorArray = [
            ['#7c5136', 1]
        ];
        this.setColor();

        this.combustible = true;
    }
}

class Sand extends Solid {
    constructor(world, x, y) {
        super(world, x, y, true, 4, 1.2, 0.5);

        this.colorArray = [
            ['#f9c116', 2],
            ['#d6a01d', 3]
        ];
        this.setColor();
    }
}

class Stone extends Solid {
    constructor(world, x, y) {
        super(world, x, y, false, 4, 10, 0.5);

        this.colorArray = [
            ['#0f1423', 1]
        ];
        this.setColor();

        this.isFreeFalling = false;
    }
}

class Snow extends Solid {
    constructor(world, x, y) {
        super(world, x, y, true, 4, 0.8, 0.7);

        this.colorArray = [
            ['#baccd9', 1]
        ];
        this.setColor();

        this.liquefiable = true;
    }
}

class Wood extends Solid {
    constructor(world, x, y) {
        super(world, x, y, false, 4, 10, 0.5);

        this.colorArray = [
            ['#806332', 1],
            ['#553b18', 2],
        ];
        this.setColor();

        this.isFreeFalling = false;
        this.combustible = true;
    }
}

class Marble extends Solid {
    constructor(world, x, y) {
        super(world, x, y, false, 4, 10, 0.5);

        this.colorArray = [
            ['#474747', 1],
            ['#565555', 2],
            ['#777777', 3],
        ];
        this.setColor();

        this.isFreeFalling = false;
    }
}

class Steam extends Gas {
    constructor(world, x, y) {
        super(world, x, y, 4, 0.5);

        this.colorArray = [
            ['#cdd1d3', 1]
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
                if (this.world.combustible(x, y, nx, ny)) {
                    this.world.setEle(new Fire(this.world, nx, ny));
                    return;
                }
                // e.g. water
                else if (this.world.volatile(x, y, nx, ny)) {
                    this.world.setEle(new Steam(this.world, nx, ny));
                    this.live = 0;
                    return;
                }
                // e.g. snow
                else if (this.world.liquefiable(x, y, nx, ny)) {
                    this.world.setEle(new Water(this.world, nx, ny));
                    this.live = 0;
                    return;
                }
            }
        }
        
        this.setFlame();
        this.world.drawEle(this.x, this.y);
    }
}
// level two ===