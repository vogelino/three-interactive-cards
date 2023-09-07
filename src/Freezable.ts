export class Freezable {
  private hasBeenFrozen: boolean = false;

  public freeze() {
    this.hasBeenFrozen = true;
  }

  public unfreeze() {
    this.hasBeenFrozen = false;
  }

  get isFrozen() {
    return this.hasBeenFrozen;
  }
}
