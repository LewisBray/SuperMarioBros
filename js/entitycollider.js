export default class EntityCollider {
  constructor(entities) {
    this.entities = entities;
  }

  check(subject) {
    this.entities.forEach(candidate => {
      if (subject === candidate)
        return;
      
      if (!candidate.collidesWithEntities.enabled)    // don't need to check subject as check won't get...
        return;                                       // ...called from trait if entity collision disabled

      if (subject.collisionBox.overlaps(candidate.collisionBox)) {
        subject.collideWithEntity(candidate);
        candidate.collideWithEntity(subject);
      }
    });
  }
}
