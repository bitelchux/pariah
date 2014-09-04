$.Fire = function(x, y, o) {
  this.x = x;
  this.y = y;
  this.w = 24;
  this.h = 24;
  this.a = 0.55; /* Acceleration */
  this.maxS = 6.00; /* Max speed */
  this.dx = this.dy = 0;
  this.bounds = {};
  this.anim = {x:19, y:18};
  this.ts = $.util.byId('tileset');
  this.angle = 0;
  this.mana = 5;

  // Type and attack
  this.t = $.PW.F.v;
  this.attack = $.util.randInt(8, 12);

  /* Determine direction */
  if (o === 'l') {
    this.dirX = -1;
    this.dirY = 0;
  } else if (o === 'r') {
    this.dirX = 1;
    this.dirY = 0;
  } else if (o === 'd') {
    this.dirX = 0;
    this.dirY = 1;
  } else if (o === 'u') {
    this.dirX = 0;
    this.dirY = -1;
  }

  this.update = function(i) {
    var self = this;
    this.angle = (this.angle + 15) % 360;
    this.dx += this.a * this.dirX;
    this.dy += this.a * this.dirY;
    this.dx = $.util.range(this.dx, -this.maxS, this.maxS);
    this.dy = $.util.range(this.dy, -this.maxS, this.maxS);

    this.x += this.dx;
    this.y += this.dy;

    this.bounds = {
      b: this.y + this.h,
      t: this.y,
      l: this.x,
      r: this.x + this.w
    };

    // Check collision with enemies
    $.enemies.forEach(function(e) {
      if ($.collide.rect(self, e)) {
        e.damage(self);
        self.die(i);
      }
    });

    // Check for wall collisions
    $.walls.forEach(function(w) {
      if ($.collide.rect(self, w)) {
        self.die(i);
      }
    });

    // Check world boundaries
    if ((this.x + this.w) > $.ww || this.x < 0)
      this.die(i);
    if ((this.y + this.h) > $.wh || this.y < 0)
      this.die(i);
  };

  this.render = function(tx, ty) {
    $.ctxfg.save();
    $.ctxfg.translate(tx + (this.w/2), ty + (this.h/2));
    $.ctxfg.rotate(this.angle / 180 * Math.PI);
    $.ctxfg.scale(2.0, 2.0);
    $.ctxfg.drawImage(this.ts, this.anim.x, this.anim.y, this.w/2, this.h/2, -this.w/4, -this.h/4, this.w/2, this.h/2);
    $.ctxfg.restore();
  };

  this.die = function(i) {
    $.powerGrp.splice(i, 1);
  };
};


$.Earth = function(x, y, w, h, o) {
  this.w = 36;
  this.h = 36;
  this.a = 0.7; /* Acceleration */
  this.maxS = 6.00; /* Max speed */
  this.dy = 0;
  this.bounds = {};
  this.dirX = 0;
  this.dirY = 1;
  this.x1 = this.x2 = 0; /* Action range for the block */
  this.ctime = Date.now();
  this.t = $.PW.E.v;
  this.attack = $.util.randInt(26, 36);
  this.mana = 40;

  /* Determine direction */
  if (o === 'l') {
    this.y = y - (h * 3.5);
    this.x = x - (w * 2) - this.w;
    this.y1 = y;
  } else if (o === 'r') {
    this.y = y - (h * 3.5);
    this.x = x + (3 * w);
    this.y1 = y;
  } else if (o === 'd') {
    this.y = y - (h * 3);
    this.x = x + (w / 2) - (this.w / 2);
    this.y1 = y + h + (h / 2);
  } else if (o === 'u') {
    this.y = y - (h * 5);
    this.x = x + (w / 2) - (this.w / 2);
    this.y1 = y - (h / 2) - this.h;
  }
  this.y2 = this.y1 + h + (h / 4);

  /* Calculate shadow coordinates and control points*/
  this.sx1 = this.x;
  this.sx2 = this.x + this.w;
  this.sy1 = this.y2 - (this.h / 4);
  this.sy2 = this.sy1;
  this.cpx1 = this.sx1 + 8;
  this.cpx2 = this.sx2 - 8;
  this.cpy1 = this.sy2 - 8;
  this.cpy2 = this.sy2 + 8;

  this.update = function(i) {
    var elapsed = Date.now() - this.ctime;
    this.ctime = Date.now();
    //this.dy += this.a * this.dirY;
    this.dy += (this.a * (elapsed * elapsed)) / 2;
    this.dy = $.util.range(this.dy, -this.maxS, this.maxS);

    this.y += this.dy;

    this.bounds = {
      b: this.y + this.h,
      t: this.y,
      l: this.x,
      r: this.x + this.w
    };

    // Check collision with enemies
    var self = this;
    $.enemies.forEach(function(e) {
      if ($.collide.rect(self, e)) {
        e.damage(self);
      }
    });

    /* Check action range */
    if ((this.y + this.h) > this.y2)
      this.die(i);
  };

  this.render = function(tx, ty) {
    var s1 = $.cam.transCoord({x: this.sx1, y: this.sy1, bounds:{r:0, b:0}});
    var s2 = $.cam.transCoord({x: this.sx2, y: this.sy2, bounds:{r:0, b:0}});
    var cp1 = $.cam.transCoord({x: this.cpx1, y: this.cpy1, bounds:{r:0, b:0}});
    var cp2 = $.cam.transCoord({x: this.cpx2, y: this.cpy2, bounds:{r:0, b:0}});

    /* Render shadow */
    $.ctxfg.save();
    $.ctxfg.beginPath();
    $.ctxfg.fillStyle = 'rgba(18, 18, 18, 0.35)';
    $.ctxfg.moveTo(s1.x, s1.y);
    $.ctxfg.bezierCurveTo(cp1.x, cp1.y, cp2.x, cp1.y, s2.x, s2.y);
    $.ctxfg.bezierCurveTo(cp2.x, cp2.y, cp1.x, cp2.y, s1.x, s1.y);
    $.ctxfg.fill();
    $.ctxfg.restore();

    /* Render stone */
    $.ctxfg.save();
    $.ctxfg.fillStyle = 'hsla(28, 65%, 42%, 1)';
    $.ctxfg.fillRect(tx, ty, this.w, this.h);
    $.ctxfg.restore();
  };

  this.die = function(i) {
    $.powerGrp.splice(i, 1);
  };
};


$.Water = function(x ,y, w, h, a) {
  this.w = 20;
  this.h = 20;
  this.vw = 2 * Math.PI;
  this.a = a * Math.PI / 180;
  this.d = 35;
  this.r = 10; /* Radius */
  this.x = x;
  this.y = y;
  this.lifetime = 6000; /* Milliseconds */
  this.ctime = Date.now();
  this.bounds = {};
  this.mana = 20;

  // Type and attack
  this.t = $.PW.W.v;
  this.attack = $.util.randInt(3, 6);

  this.update = function(i) {
    var elapsed = Date.now() - this.ctime;
    this.ctime = Date.now();
    this.lifetime -= elapsed;

    if (this.lifetime <= 0)
      this.die(i);

    this.cx = $.hero.x + ($.hero.w / 2);
    this.cy = $.hero.y + ($.hero.h / 2);
    this.a += this.vw * elapsed / 1000;
    this.x = this.cx + (this.d * Math.cos(this.a));
    this.y = this.cy + (this.d * Math.sin(this.a));

    this.bounds = {
      b: this.y + this.h,
      t: this.y,
      l: this.x,
      r: this.x + this.w
    };

    // Check collision with enemies
    var self = this;
    $.enemies.forEach(function(e) {
      if ($.collide.rect(self, e)) {
        var a = e.damage(self);
        if (a !== null && a !== 0) $.hero.heal(a);
      }
    });
  };

  this.render = function(tx, ty) {
    $.ctxfg.save();
    $.ctxfg.fillStyle = 'rgba(0, 115, 255, 0.3)';
    $.ctxfg.beginPath();
    $.ctxfg.arc(tx, ty, this.r, 0, (2 * Math.PI), false);
    $.ctxfg.fill();
    var x_ = tx - 11;
    var y_ = ty - 11;
    $.ctxfg.fillStyle = 'hsla(190, 90%, 76%, 0.59)';
    $.ctxfg.fillRect(x_ + 7, y_ + 7, 8, 8);
    $.ctxfg.fillStyle = 'hsl(190, 90%, 76%)';
    $.ctxfg.fillRect(x_ + 4, y_ + 10, 14, 2);
    $.ctxfg.fillRect(x_ + 10, y_ + 4, 2, 14);
    $.ctxfg.fillRect(x_ + 10, y_, 2, 2);
    $.ctxfg.fillRect(x_ + 3, y_ + 3, 2, 2);
    $.ctxfg.fillRect(x_ + 17, y_ + 3, 2, 2);
    $.ctxfg.fillRect(x_, y_ + 10, 2, 2);
    $.ctxfg.fillRect(x_ + 20, y_ + 10, 2, 2);
    $.ctxfg.fillRect(x_ + 3, y_ + 17, 2, 2);
    $.ctxfg.fillRect(x_ + 17, y_ + 17, 2, 2);
    $.ctxfg.fillRect(x_ + 10, y_ + 20, 2, 2);
    $.ctxfg.restore();
  };

  this.die = function(i) {
    $.powerGrp.splice(i, 1);
    $.hero.shield = false;
  };
};

$.Air = function(x, y, o) {
  this.x = x;
  this.y = y;
  this.w = 24;
  this.h = 24;
  this.a = 0.55; /* Acceleration */
  this.maxS = 6.00; /* Max speed */
  this.dx = this.dy = 0;
  this.bounds = {};
  this.mana = 5;

  this.t = $.PW.A.v;
  this.attack = $.util.randInt(7, 10);

  /* Determine direction */
  if (o === 'l') {
    this.dirX = -1;
    this.dirY = 0;
  } else if (o === 'r') {
    this.dirX = 1;
    this.dirY = 0;
  } else if (o === 'd') {
    this.dirX = 0;
    this.dirY = 1;
  } else if (o === 'u') {
    this.dirX = 0;
    this.dirY = -1;
  }

  this.update = function(i) {
    this.dx += this.a * this.dirX;
    this.dy += this.a * this.dirY;
    this.dx = $.util.range(this.dx, -this.maxS, this.maxS);
    this.dy = $.util.range(this.dy, -this.maxS, this.maxS);

    this.x += this.dx;
    this.y += this.dy;

    this.bounds = {
      b: this.y + this.h,
      t: this.y,
      l: this.x,
      r: this.x + this.w
    };

    // Check collision with enemies
    var self = this;
    $.enemies.forEach(function(e) {
      if ($.collide.rect(self, e)) {
        e.damage(self);
        self.die(i);
      }
    });

    /* Check for collisions */
    $.walls.forEach(function(w) {
      if ($.collide.rect(self, w)) {
        self.die(i);
      }
    });

    /* Check world boundaries */
    if ((this.x + this.w) > $.ww || this.x < 0)
      this.die(i);
    if ((this.y + this.h) > $.wh || this.y < 0)
      this.die(i);

  };

  this.render = function(tx, ty) {
    $.ctxfg.save();
    $.ctxfg.fillStyle = 'hsla(207, 100%, 83%, 1)';
    $.ctxfg.fillRect(tx, ty, this.w, this.h);
    $.ctxfg.restore();
  };

  this.die = function(i) {
    $.powerGrp.splice(i, 1);
  };
};
