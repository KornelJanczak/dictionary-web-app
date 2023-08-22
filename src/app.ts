// Decorator
function AutoBind(_: any, _2: any, descriptior: PropertyDescriptor) {
  const originalMethod = descriptior.value;
  const adjDescriptor: PropertyDescriptor = {
    configurable: true,
    enumerable: false,
    get() {
      const boundFn = originalMethod.bind(this);
      return boundFn;
    },
  };
  return adjDescriptor;
}

//  Dicitionary Type
enum ProjectConfig {
  API_KEY = "https://api.dictionaryapi.dev/api/v2/entries/en/",
}

enum FontOptions {
  SANS_SERIF = "sans-serif",
  SERIF = "serif",
  MONO = "monospace",
}

// Meanings Types
interface Meanings {
  partOfSpeech: string;
  synonyms: [];
  definitions: [];
  definition: string;
}

// String or object property
interface StringOrObject {
  [key: string]: string | {};
}

// Word Object
class Dicitionary {
  constructor(
    public word: string,
    public phonetic: string,
    public phonetics: [],
    public meanings: [],
    public sourceUrls: [],
    public mp3: StringOrObject | undefined
  ) {}
}

// App State
class AppState {
  private static instance: AppState;
  dicitionary = {} as Dicitionary;
  font = FontOptions.SANS_SERIF;

  private constructor() {}

  // Create instatnce of state
  static getInstance() {
    if (this.instance) {
      return this.instance;
    }
    this.instance = new AppState();
    return this.instance;
  }

  // load Data
  async loadData(url: string) {
    try {
      const data = await this.getJSON(url);
      this.mapData(data);
    } catch (err) {
      console.log(err);
    }
  }

  // Get data from API
  private async getJSON(url: string) {
    try {
      const res = await fetch(url);
      const [data] = await res.json();
      if (!res.ok || !data) throw new Error(`${res.status}`);
      console.log(data);
      return data;
    } catch (err) {
      console.log(err);
    }
  }

  // Map data
  private mapData(data: Dicitionary) {
    const newDicitonary = new Dicitionary(
      data.word,
      data.phonetic,
      data.phonetics,
      data.meanings,
      data.sourceUrls,
      data.phonetics.find((item) => (item as StringOrObject).audio)
    );
    console.log(newDicitonary);
    this.dicitionary = newDicitonary;
  }
}

const appState = AppState.getInstance();

// AppMarkup
class AppMarkup {
  private parentElement: HTMLDivElement = document.querySelector(
    ".main-section"
  )! as HTMLDivElement;

  constructor() {
    this.addAudioHandler();
  }

  // Render Markup
  render(data: Dicitionary) {
    const markup = this.generateMarkup(data);
    console.log(data);
    this.clear();
    this.parentElement.insertAdjacentHTML("beforeend", markup);
  }

  private addAudioHandler() {
    this.parentElement.addEventListener("click", this.playAudio);
  }

  @AutoBind
  private playAudio(e: Event) {
    const target = e.target as HTMLButtonElement;
    if (!target.closest(".play-audio")) return;
    const mp3 = new Audio(target.parentElement?.dataset.audio);
    mp3.play();
  }

  private clear() {
    this.parentElement.innerHTML = "";
  }

  private generateMarkup(data: Dicitionary): string {
    return `
    <div class="head-box">
    <h1 class="main-word">${data.word}</h1>
    <span class="word-tag">${data.phonetic ? data.phonetic : ""}
    </span>
    <button class="play-audio" data-audio="${data?.mp3?.audio}">
      <img
        src="../starter-code/assets/images/icon-play.svg"
        alt="play-img"
        class="play-img"
      />
    </button>
    </div>
      ${data.meanings.map(this.generateWordMeaning).join("")}
    <footer>
    <span class="text-light t-source">Source</span>
      ${data.sourceUrls.map(this.generateSource).join("")}
    </footer>
    `;
  }

  private generateWordMeaning<T extends Meanings>(result: T): string {
    return `
    <div class="info-box">
      <p class="text-header">${result.partOfSpeech}</p>
      <span class="text-light">Meaning</span>
      <ul class="ul-info-list">
          ${result.definitions
            .map(
              (definiton: T) =>
                `<li class="li-info-item">${definiton.definition}</li>`
            )
            .join("")}
      </ul>
      <span class="text-light synonyms">
        ${0 === result.synonyms.length ? "" : "Synonyms"}
        <strong class="syn-content">${result.synonyms.map(
          (synom: T) => ` ${synom}`
        )}</strong>
      </span>
    </div>
`;
  }

  private generateSource(e: string): string {
    return `
     <span id="source">
          ${e}
        </span>
        <a href="${e}">
          <img
            src="../starter-code/assets/images/icon-new-window.svg"
            alt="new-window"
            class="new-window"
          />
        </a>  
        `;
  }
}

// AppInput class
class AppInput {
  formElement: HTMLFormElement;
  inputElement: HTMLInputElement;

  constructor() {
    this.formElement = document.querySelector(".input-box")! as HTMLFormElement;
    this.inputElement = document.querySelector(
      ".search-input"
    )! as HTMLInputElement;

    this.loadWord();
  }

  // Add Handler to form
  @AutoBind
  private async addEventHandler(e: Event) {
    try {
      e.preventDefault();
      const word = this.getWord().trim();
      const URL = `${ProjectConfig.API_KEY}${word}`;
      await appState.loadData(URL);
      appMarkup.render(appState.dicitionary);
      this.inputClear();
    } catch (err) {
      console.error(err);
    }
  }

  // Load word
  private loadWord() {
    this.formElement.addEventListener("submit", this.addEventHandler);
  }

  // Get Word From input
  private getWord() {
    const inputValue = this.inputElement.value.toLowerCase();
    return inputValue;
  }

  // Clear Input
  private inputClear() {
    this.inputElement.value = "";
  }
}

class AppOptions {
  protected options = document.querySelector(
    ".font-select"
  )! as HTMLSpanElement;

  constructor() {
    this.addOptionsHandler();
  }

  addOptionsHandler() {
    window.addEventListener("click", this.darkTheme);
    this.options.addEventListener("click", this.changeFont);
  }

  private darkTheme() {
    const target = document.getElementById("switch-17")! as HTMLInputElement;
    target.id === "switch-17" && target.checked
      ? document.body.classList.add("dark-theme")
      : document.body.classList.remove("dark-theme");
  }

  private changeFont(e: Event) {
    const optionList = document.querySelector(
      ".option-list"
    )! as HTMLUListElement;
    optionList.classList.toggle("hidde");
    const target = e.target as HTMLLIElement;
    if (!target.closest(".option-list")) return;
    const font = target.dataset.font;
    const body = document.querySelector("body")! as HTMLBodyElement;
    if (font === "serif") appState.font = FontOptions.SERIF;
    if (font === "sans-serif") appState.font = FontOptions.SANS_SERIF;
    if (font === "monospace") appState.font = FontOptions.MONO;
    body.style.fontFamily = appState.font;
  }
}

const appOptions = new AppOptions();
const appInput = new AppInput();
const appMarkup = new AppMarkup();
