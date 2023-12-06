class Playcard {
  constructor(image, cell, id, open) {
    this.image = image;
    this.cell = cell;
    this.id = id;
    this.open = open;
  }

  toggleCard() {
    this.open ? (this.open = false) : (this.open = true);
  }
}

export default Playcard;
