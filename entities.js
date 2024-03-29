/*------------------- 
a player entity
-------------------------------- */
var PlayerEntity = me.ObjectEntity.extend({
 
    /* -----
 
    constructor
 
    ------ */
 
    init: function(x, y, settings) {
        // call the constructor
        this.parent(x, y, settings);
 
        // set the default horizontal & vertical speed (accel vector)
        this.setVelocity(3, 15);
 
        // set the display to follow our position on both axis
        me.game.viewport.follow(this.pos, me.game.viewport.AXIS.BOTH);
 
    },
 
		 /* -----
		update the player pos
		------ */
		update: function() {
		 
			if (me.input.isKeyPressed('left'))
			{
				// flip the sprite on horizontal axis
				this.flipX(true);
				// update the entity velocity
				this.vel.x -= this.accel.x * me.timer.tick;
			}
			else if (me.input.isKeyPressed('right'))
			{
				// unflip the sprite
				this.flipX(false);
				// update the entity velocity
				this.vel.x += this.accel.x * me.timer.tick;
			}
			else
			{
				this.vel.x = 0;
			}
			if (me.input.isKeyPressed('jump'))
			{   
				if (!this.jumping && !this.falling) 
				{
					// set current vel to the maximum defined value
					// gravity will then do the rest
					this.vel.y = -this.maxVel.y * me.timer.tick;
					// set the jumping flag
					this.jumping = true;
					me.audio.play("jump");
				}
			}
		 
		 
			// check & update player movement
			this.updateMovement();
		 
			// check for collision
			var res = me.game.collide(this);
		 
			if (res) {
				// if we collide with an enemy
				if (res.obj.type == me.game.ENEMY_OBJECT) {
					// check if we jumped on it
					if ((res.y > 0) && ! this.jumping) {
						// bounce (force jump)
						this.falling = false;
						this.vel.y = -this.maxVel.y * me.timer.tick;
						// set the jumping flag
						this.jumping = true;
						me.audio.play("stomp");
		 
					} else {
						// let's flicker in case we touched an enemy
						this.flicker(45);
					}
				}
			}
		 
			// update animation if necessary
			if (this.vel.x!=0 || this.vel.y!=0) {
				// update objet animation
				this.parent(this);
				return true;
			}
			// else inform the engine we did not perform
			// any update (e.g. position, animation)
			return false;       
		 
		}
 
});

/*----------------
 a Coin entity
------------------------ */
var CoinEntity = me.CollectableEntity.extend({
    // extending the init function is not mandatory
    // unless you need to add some extra initialization
    init: function(x, y, settings) {
        // call the parent constructor
        this.parent(x, y, settings);
    },
 
    // this function is called by the engine, when
    // an object is touched by something (here collected)
    onCollision: function() {
        // do something when collected
        me.game.HUD.updateItemValue("score", 250);
        me.audio.play("cling");
        this.collidable = false;
		// remove it
		me.game.remove(this);
	}
 
});

/* --------------------------
an enemy Entity
------------------------ */
var EnemyEntity = me.ObjectEntity.extend({
    init: function(x, y, settings) {
        // define this here instead of tiled
        settings.image = "wheelie_right";
        settings.spritewidth = 64;
 
        // call the parent constructor
        this.parent(x, y, settings);
 
        this.startX = x;
        this.endX = x + settings.width - settings.spritewidth;
        // size of sprite
 
        // make him start from the right
        this.pos.x = x + settings.width - settings.spritewidth;
        this.walkLeft = true;
 
        // walking & jumping speed
        this.setVelocity(4, 6);
 
        // make it collidable
        this.collidable = true;
        // make it a enemy object
        this.type = me.game.ENEMY_OBJECT;
 
    },
 
    // call by the engine when colliding with another object
    // obj parameter corresponds to the other object (typically the player) touching this one
    onCollision: function(res, obj) {
 
        // res.y >0 means touched by something on the bottom
        // which mean at top position for this one
        if (this.alive && (res.y > 0) && obj.falling) {
            this.flicker(45);
        }
    },
 
    // manage the enemy movement
    update: function() {
        // do nothing if not visible
        if (!this.visible)
            return false;
 
        if (this.alive) {
            if (this.walkLeft && this.pos.x <= this.startX) {
                this.walkLeft = false;
            } else if (!this.walkLeft && this.pos.x >= this.endX) {
                this.walkLeft = true;
            }
            // make it walk
            this.flipX(this.walkLeft);
            this.vel.x += (this.walkLeft) ? -this.accel.x * me.timer.tick : this.accel.x * me.timer.tick;
                 
        } else {
            this.vel.x = 0;
        }
         
        // check and update movement
        this.updateMovement();
         
        // update animation if necessary
        if (this.vel.x!=0 || this.vel.y!=0) {
            // update objet animation
            this.parent(this);
            return true;
        }
        return false;
    }
});

/*-------------- 
a score HUD Item
--------------------- */
 
var ScoreObject = me.HUD_Item.extend({
    init: function(x, y) {
        // call the parent constructor
        this.parent(x, y);
        // create a font
        this.font = new me.BitmapFont("32x32_font", 32);
    },
 
    /* -----
 
    draw our score
 
    ------ */
    draw: function(context, x, y) {
        this.font.draw(context, this.value, this.pos.x + x, this.pos.y + y);
    }
 
});