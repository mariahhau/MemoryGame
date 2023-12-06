import Playcard from "./Playcard.js";

let gameCards;
let cardsOpen;
let remaining = 5;
let number = 5;

/**
 * Creates HTML for the game start menu
 */
const startMenu = function () {
  gameCards = new Array();
  cardsOpen = [];
  let form = document.querySelector("form");

  if (document.querySelector("form") == null) {
    form = document.createElement("form");
    form.innerHTML = `
    <h1>Muistipeli 🐶</h1>
    <h2>Valitse korttien lukumäärä:</h2>
    <form>  
        <fieldset>
            <div class="radiobutton">
              <input type="radio" id="r10" value="5" name="numCards" />
              <label for="r10">10</label>
            </div>
            <div class="radiobutton">
              <input type="radio" id="r16" value="8" name="numCards" checked/>
              <label for="r14">16</label>
            </div>
            <div class="radiobutton">
              <input type="radio" id="r24" value="12" name="numCards" />
              <label for="r18">24</label>
            </div>
            <button class=newGame type="submit">Aloita peli</button>

        </fieldset>
    </form>
    `;

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      number = document.querySelector('input[name="numCards"]:checked').value;
      remaining = number;
      form.style["display"] = "none";
      startGame();
    });
    document.body.appendChild(form);
  }

  form.style["display"] = "block";
};

/**
 * Shuffles array elements in random order. Modifies the array in-place.
 * @param {Array} arr
 * @returns reference to the same array
 */
const shuffle = (arr) => {
  return arr.sort(() => Math.random() - 0.5);
};

/**
 * Fetches random dog pictures from 'https://dog.ceo/api/breeds/image/random'
 * and creates two Playcard instances for each picture, and
 * places them into the array passed as a parameter.
 * @param {Array<Playcard>} array Empty array to store Playcard objects
 * @param {number} number Number of unique pictures
 *
 */
const createPlayCards = async function (array, number) {
  if (number > 12) return;

  let test = 0;
  let dogCount = 0;
  let index = 0;
  let indexes = [];

  for (let i = 0; i < number * 2; i++) {
    indexes.push(i);
  }

  shuffle(indexes);

  while (dogCount < number && test < 30) {
    test++;
    let jsn = "";
    try {
      let response = await fetch("https://dog.ceo/api/breeds/image/random");
      jsn = await response.json();
      await fetch(jsn.message.toString());
    } catch (error) {
      console.log("Error: ", error.message);
      continue;
    }

    let url = jsn.message.toString();
    let found = false;
    array.every((card) => {
      found = card.image == url;
      if (found == true) {
        return false;
      } else {
        return true;
      }
    });

    if (!found) {
      const imageUrl = jsn.message.toString();
      const card = new Playcard(
        imageUrl,
        "card" + indexes[index++],
        dogCount,
        false
      );
      const cardCopy = new Playcard(
        imageUrl,
        "card" + indexes[index++],
        dogCount,
        false
      );
      array.push(card, cardCopy);
      dogCount++;
    }
  }
};

/**
 * Creates an <ul> elemenent that contains 2*numberOfPics <li> elements that represent playcards
 * @param {number} numberOfPics Number of unique picture cards
 */
const createGameBoard = function (numberOfPics) {
  const grid = document.createElement("ul");
  grid.classList.add("grid", `size${numberOfPics}`);
  document.body.appendChild(grid);
  for (let i = 0; i < numberOfPics * 2; i++) {
    const cardElem = document.createElement("li");
    cardElem.classList.add("card");
    const id = "card" + i;
    cardElem.setAttribute("id", id);
    grid.appendChild(cardElem);
  }
};

/**
 * Starts new game
 */
const startGame = function () {
  createGameBoard(number);
  createPlayCards(gameCards, number).then(() => {
    setCardFunctionality(gameCards);
  });
};

/**
 * Sets images and event listeners to playcards
 * @param {Array<Playcard>} cards
 */
const setCardFunctionality = function (cards) {
  const playcards = document.querySelectorAll(".card");

  //Set dog pictures
  playcards.forEach((cell, i) => {
    const img = document.createElement("img");
    const card = cards.find((element) => {
      return element.cell == "card" + i;
    });
    img.src = card.image;
    cell.appendChild(img);

    // Set outline when cell is hovered
    cell.addEventListener("mouseenter", () => {
      cell.style.outline = "3px solid white";
      cell.style["background-color"] = "hsla(323, 49%, 26%, 0.50)";
    });

    // Remove outline when cell is exited
    cell.addEventListener("mouseleave", () => {
      cell.style.outline = "";
      cell.style["background-color"] = "hsla(323, 49%, 26%, 0.75)";
    });

    // Prevent dragging of ghost image
    cell.addEventListener(
      "dragstart",
      function (event) {
        event.dataTransfer.setDragImage(cell, -99999, -99999);
      },
      false
    );

    // Open card on click
    cell.addEventListener("click", (event) => {
      clickCard(event, cell, card);
    });
  });
};

/**Function for opening a card
 *
 * @param {*} event
 * @param {*} cell
 * @param {*} card
 */
const clickCard = function (event, cell, card) {
  const image = cell.querySelector("img");

  if (image != null) {
    if (cardsOpen.length == 0) {
      cardsOpen.push(card);
      card.toggleCard();
      toggleOpacity(image);
    } else if (cardsOpen.length == 1 && !card.open) {
      cardsOpen.push(card);
      card.toggleCard();
      toggleOpacity(image);
    }

    //If 2 cards are open, check if they are a pair
    if (cardsOpen.length >= 2) {
      let win = false;
      document.querySelector(".grid").style["pointer-events"] = "none";

      if (cardsOpen[0].id == cardsOpen[1].id) {
        win = true;
      }

      cardsOpen.forEach((card) => {
        card.toggleCard();
      });
      const cell2 = document.getElementById(cardsOpen[0].cell);
      cardsOpen.pop();
      cardsOpen.pop();

      if (!win) {
        setTimeout(() => {
          toggleOpacity(image);
          toggleOpacity(cell2.querySelector("img"));
          document.querySelector(".grid").style["pointer-events"] = "auto";
        }, "2000");
      } else {
        setTimeout(() => {
          remaining--;
          cell.classList.add("found");
          cell2.classList.add("found");
          document.querySelector(".grid").style["pointer-events"] = "auto";

          if (remaining == 0) {
            document.querySelector(".grid").remove();
            //document.querySelector(".container").remove();
            showAnimation();
            setTimeout(() => {
              document.querySelector(".animation").remove();
              startMenu();
            }, 5000);
          }
        }, "1000");
      }
    }
  }
};
/**
 * Toggles the opacity of an HTML <img> element between 0 and 100
 * @param {HTMLImageElement} image
 */
const toggleOpacity = (image) => {
  image.style.opacity == 100
    ? (image.style.opacity = 0)
    : (image.style.opacity = 100);
};

/**
 * Function to show dog pictures when the game ends
 */
const showAnimation = function () {
  const div = document.createElement("div");
  div.classList.add("animation");
  if (number > 8) {
    div.classList.add("animation12");
    div.style["max-width"] = "calc(6 * var(--cardWidth))";
    document.documentElement.style.setProperty("--cardsAlign", 6);
  } else if (number == 8) {
    div.classList.add("animation8");
  } else {
    div.classList.add("animation5");
  }

  for (let i = 0; i < gameCards.length; i = i + 2) {
    let image = document.createElement("img");
    image.src = gameCards[i].image;
    image.classList.add("show");
    image.style.animationDelay = `0.${i}s`;
    image.style.border = "4px solid white";
    image.style.opacity = 100;
    div.appendChild(image);
  }

  document.body.appendChild(div);
};

//Start
startMenu();
