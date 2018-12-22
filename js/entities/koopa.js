import Entity from './entity.js';
import {loadJSON, loadSpriteSet} from '../loaders.js';
import {Trait, CollidesWithTiles, CollidesWithEntities, HasMass, SimpleAI, Killable} from '../traits.js';


const Walking = Symbol('walking');
const StationaryInShell = Symbol('stationaryInShell');
const Sliding = Symbol('sliding');


export function loadKoopa() {
  return loadJSON('/js/specifications/entities/koopa.json')
  .then(entitySpec => Promise.all([
    loadSpriteSet(entitySpec),
    entitySpec
  ]))
  .then(([animSpriteSet, entitySpec]) => {
    return createKoopaFactory(animSpriteSet, entitySpec);
  });
}


class Behaviour extends Trait {
  constructor() {
    super('behaviour');

    this.state = Walking;
    this.timeInShell = 0;
    this.inShellDuration = 5;
    this.walkSpeed = 30;        // This really comes from AIWalk initialisation, make property of Koopa?
    this.slidingSpeed = 150;
  }

  tileCollision(entity, side, tileCollidedWith, candidateCollisionTiles) {
    if (side !== 'left' && side !== 'right')
      return;
    
    if (this.state === Sliding)
      entity.playAudio('bump');
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
    }
    
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
      if (them.scoresPoints) {
        them.scoresPoints.pointsScored += 100;
        them.scoresPoints.hudAnimations.push({
          type: 'score',
          points: '100',
          xPos: us.collisionBox.left + 2,
          yPos: us.collisionBox.top - us.height,
          frame: 0
        });
      }
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
    else {
      this.startSliding(us, them);
      if (them.scoresPoints) {
        them.scoresPoints.pointsScored += 500;
        them.scoresPoints.hudAnimations.push({
          type: 'score',
          points: '500',
          xPos: us.collisionBox.left + 2,
          yPos: us.collisionBox.top - us.height,
          frame: 0
        })
      }
      us.playAudio('shellImpact');
    }
  }

  handleSlidingCollision(us, them) {
    const theyJumpedOnUs = (them.vel.y > us.vel.y);
    if (theyJumpedOnUs && them.stomper) {
      this.stopSliding(us)
      them.stomper.bounce(them, us);
    }
    else if (them.killable) {
      if (them.stomper)
        them.killable.kill(0);     // treat Mario differently
      else {
        them.killable.kill(2, true);
        them.collidesWithEntities.enabled = false;
        them.vel.y = -150;
        them.aiWalk.speed = 150 * Math.sign(us.vel.x);
        if (them.collidesWithTiles)
          them.collidesWithTiles.enabled = false;
        us.playAudio('shellImpact');
      }
    }
  }

  shellPushDirection(us, them) {
    return (them.collisionBox.right > us.collisionBox.right) ? -1 : 1;
  }

  startSliding(us, them) {
    us.aiWalk.enable();
    us.aiWalk.speed = this.shellPushDirection(us, them) * this.slidingSpeed;

    this.state = Sliding;
    them.collidesWithEntities.disableTemporarily(0.2);
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


function createKoopaFactory(animSpriteSet, entitySpec) {
  const walkAnimFrameSelector = animSpriteSet.animations.get('walk');
  const wakeAnimFrameSelector = animSpriteSet.animations.get('wake');

  function selectAnimFrame(koopa) {
    if (koopa.killable.dead)
      return 'shell';
    
    if (koopa.behaviour.state === StationaryInShell || koopa.behaviour.state === Sliding) {
      if (koopa.behaviour.timeInShell > 3)
        return wakeAnimFrameSelector(koopa.behaviour.timeInShell);
      else
        return 'shell';
    }
    
    return walkAnimFrameSelector(koopa.lifetime);
  }

  function drawKoopa(context, camera) {
    animSpriteSet.draw(selectAnimFrame(this), context,
      this.pos.x - camera.xPos, this.pos.y, this.vel.x < 0);
  }

  return () => {
    const koopa = new Entity(16, 24);
    koopa.collisionBox.yOffset = 8;

    entitySpec.audio.forEach(audio => {
      koopa.audio.set(audio.name, new Audio(`/js/music/effects/${audio.file}.wav`));
    });

    koopa.addTrait(new SimpleAI(30));
    koopa.addTrait(new Killable());
    koopa.addTrait(new Behaviour());
    koopa.addTrait(new CollidesWithTiles());
    koopa.addTrait(new HasMass());
    koopa.addTrait(new CollidesWithEntities());

    koopa.draw = drawKoopa;

    return koopa;
  }
}
