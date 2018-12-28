import Entity from './entity.js';
import {loadJSON, loadSpriteSet} from '../loaders.js';
import {CollidesWithEntities, SpawnsFromBlock, Collectable} from '../traits.js';


export function loadFlower() {
  return loadJSON('/js/specifications/entities/flower.json')
  .then(entitySpec => Promise.all([
    loadSpriteSet(entitySpec),
    entitySpec
  ]))
  .then(([animSpriteSet, entitySpec]) => {
    return createFlowerFactory(animSpriteSet, entitySpec);
  });
}


function createFlowerFactory(animSpriteSet, entitySpec) {
  const animFrameSelector = animSpriteSet.animations.get('flower');

  function drawFlower(context, camera) {
    animSpriteSet.draw(animFrameSelector(this.lifetime),
      context, this.pos.x - camera.xPos, this.pos.y);
  }

  return () => {
    const flower = new Entity(16, 16);

    entitySpec.audio.forEach(audio => {
      flower.audio.set(audio.name, new Audio(`/js/music/effects/${audio.file}.wav`));
    });

    // mass and tile collision traits after done spawning from block
    flower.addTrait(new SpawnsFromBlock());
    flower.addTrait(new CollidesWithEntities());
    flower.addTrait(new Collectable(1000, 'collectItem'));

    flower.draw = drawFlower;

    return flower;
  }
}
