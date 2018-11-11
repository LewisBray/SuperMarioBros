export default class EntityCollider {
  constructor(entities) {
    this.entities = entities;
  }

  check(subject) {
    this.entities.forEach(candidate => {
      if (subject === candidate)
        return;

      if (subject.collisionBox.overlaps(candidate.collisionBox)) {
        subject.collideWithEntity(candidate);
        candidate.collideWithEntity(subject);
      }
    })
  }
}
