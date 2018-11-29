import Entity from './entity.js';
import {loadSpriteSet} from './loaders.js';
import {Trait, CollidesWithTiles, HasMass, AIWalk, Killable} from './traits.js';


const Walking = Symbol('walking');
const StationaryInShell = Symbol('stationaryInShell');
const Sliding = Symbol('sliding');


export function loadKoopa() {
  return loadSpriteSet('/js/animations/koopa.json', 16, 24)
  .then(createKoopaFactory);
}


class Behaviour extends Trait {
  constructor() {
    super('behaviour');

    this.state = Walking;
    this.timeInShell = 0;
    this.inShellDuration = 5;
    this.collisionDisabledTime = 0;
    this.collisionDisabledDuration = 0.1; // Need to tweak the length of this
    this.walkSpeed = 30;                  // This really comes from AIWalk initialisation, make property of Koopa?
    this.shellPushSpeed = 150;
  }

  entityCollision(us, them) {
    if (us.killable && us.killable.dead)
      return;

    if (this.state === Walking)
      this.handleWalkingCollision(us, them);
    else if (this.state === StationaryInShell)
      this.handleStationaryInShellCollision(us, them);
    else if (this.state === Sliding)
      this.handleSlidingCollision(us, them);
    else
      console.log("Unhandled Koopa state:", this.state);    // remove debugging in release version?
  }

  update(us, deltaTime) {
    if (this.state === Walking)
      return;

    if (this.state === StationaryInShell) {
      this.timeInShell +=deltaTime;
    }
    else if (this.state === Sliding) {
      this.timeInShell = 0;
      if (!us.entityCollisionEnabled)
        this.collisionDisabledTime -= deltaTime;
    }

    if (this.collisionDisabledTime <= 0)
      us.entityCollisionEnabled = true;
    
    if (this.timeInShell > this.inShellDuration)
      this.comeOutOfShell(us);
  }

  handleWalkingCollision(us, them) {
    if (!them.stomper)
      return;
    
    const theyJumpedOnUs = (them.vel.y > us.vel.y);
    if (theyJumpedOnUs) {
      this.goIntoShell(us);
      them.stomper.bounce(them, us);
    }
    else {
      if (them.killable)
        them.killable.kill(0);
    }
  }

  handleStationaryInShellCollision(us, them) {
    if (!them.stomper)
      return;
        
    const theyJumpedIntoUsFromBelow = (them.vel.y < 0);
    if (theyJumpedIntoUsFromBelow) {
      if (them.killable)
        them.killable.kill(0);
    }
    else
      this.startSliding(us, them);
  }

  handleSlidingCollision(us, them) {
    const theyJumpedOnUs = (them.vel.y > us.vel.y);
    if (theyJumpedOnUs && them.stomper) {
      this.stopSliding(us)
      them.stomper.bounce(them, us);
    }
    else {
      if (them.killable) {
        if (them.stomper)
          them.killable.kill(0);     // treat Mario differently
        else {
          them.killable.kill(2, true);
          them.entityCollisionEnabled = false;
          them.vel.y = -150;
          them.aiWalk.speed = 150 * Math.sign(us.vel.x);
          if (them.collidesWithTiles)
            them.collidesWithTiles.enabled = false;
        }
      }
    }
  }

  shellPushDirection(us, them) {
    return (them.collisionBox.right > us.collisionBox.right) ? -1 : 1;
  }

  startSliding(us, them) {
    us.aiWalk.enable();
    us.aiWalk.speed = this.shellPushDirection(us, them) * this.shellPushSpeed;

    this.state = Sliding;
    this.collisionDisabledTime = this.collisionDisabledDuration;
    us.entityCollisionEnabled = false;
  }

  stopSliding(us) {
    us.aiWalk.disable();
    this.state = StationaryInShell;
  }

  goIntoShell(us) {
    us.aiWalk.disable();
    this.state = StationaryInShell;
  }

  comeOutOfShell(us) {
    us.aiWalk.enable();
    us.aiWalk.speed = this.walkSpeed;   // Do Koopas always come out of shell and go to the right?
    this.timeInShell = 0;
    this.state = Walking;
  }
}


function createKoopaFactory(animSpriteSet) {
  const walkAnimFrameSelector = animSpriteSet.animations.get('walk');
  const wakeAnimFrameSelector = animSpriteSet.animations.get('wake');

  function selectAnimFrame(koopa) {
    if (koopa.killable.dead)
      return 'shell';
    
    if (koopa.behaviour.state === StationaryInShell || koopa.behaviour.state === Sliding) {
      if (koopa.behaviour.timeInShell > 3)
        return wakeAnimFrameSelector(koopa.behaviour.timeInShell);
      
      return 'shell';
    }
    
    return walkAnimFrameSelector(koopa.lifetime);
  }

  function drawKoopa(context, camera) {
    animSpriteSet.draw(selectAnimFrame(this), context,
      this.pos.x - camera.pos.x, this.pos.y - camera.pos.y, this.vel.x < 0);
  }

  return () => {
    const koopa = new Entity(16, 24);
    koopa.collisionBox.yOffset = 8;

    koopa.addTrait(new AIWalk(30));
    koopa.addTrait(new Killable());
    koopa.addTrait(new Behaviour());
    koopa.addTrait(new CollidesWithTiles());
    koopa.addTrait(new HasMass());

    koopa.draw = drawKoopa;

    return koopa;
  }
}
