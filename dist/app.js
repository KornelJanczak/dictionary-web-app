"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
function AutoBind(_, _2, descriptior) {
    const originalMethod = descriptior.value;
    const adjDescriptor = {
        configurable: true,
        enumerable: false,
        get() {
            const boundFn = originalMethod.bind(this);
            return boundFn;
        },
    };
    return adjDescriptor;
}
var ProjectConfig;
(function (ProjectConfig) {
    ProjectConfig["API_KEY"] = "https://api.dictionaryapi.dev/api/v2/entries/en/";
})(ProjectConfig || (ProjectConfig = {}));
var FontOptions;
(function (FontOptions) {
    FontOptions["SANS_SERIF"] = "sans-serif";
    FontOptions["SERIF"] = "serif";
    FontOptions["MONO"] = "monospace";
})(FontOptions || (FontOptions = {}));
class Dicitionary {
    constructor(word, phonetic, phonetics, meanings, sourceUrls, mp3) {
        this.word = word;
        this.phonetic = phonetic;
        this.phonetics = phonetics;
        this.meanings = meanings;
        this.sourceUrls = sourceUrls;
        this.mp3 = mp3;
    }
}
class AppState {
    constructor() {
        this.dicitionary = {};
        this.font = FontOptions.SANS_SERIF;
    }
    static getInstance() {
        if (this.instance) {
            return this.instance;
        }
        this.instance = new AppState();
        return this.instance;
    }
    loadData(url) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const data = yield this.getJSON(url);
                this.mapData(data);
            }
            catch (err) {
                console.log(err);
            }
        });
    }
    getJSON(url) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const res = yield fetch(url);
                const [data] = yield res.json();
                if (!res.ok || !data)
                    throw new Error(`${res.status}`);
                console.log(data);
                return data;
            }
            catch (err) {
                console.log(err);
            }
        });
    }
    mapData(data) {
        const newDicitonary = new Dicitionary(data.word, data.phonetic, data.phonetics, data.meanings, data.sourceUrls, data.phonetics.find((item) => item.audio));
        console.log(newDicitonary);
        this.dicitionary = newDicitonary;
    }
}
const appState = AppState.getInstance();
class AppMarkup {
    constructor() {
        this.parentElement = document.querySelector(".main-section");
        this.addAudioHandler();
    }
    render(data) {
        const markup = this.generateMarkup(data);
        console.log(data);
        this.clear();
        this.parentElement.insertAdjacentHTML("beforeend", markup);
    }
    addAudioHandler() {
        this.parentElement.addEventListener("click", this.playAudio);
    }
    playAudio(e) {
        var _a;
        const target = e.target;
        if (!target.closest(".play-audio"))
            return;
        const mp3 = new Audio((_a = target.parentElement) === null || _a === void 0 ? void 0 : _a.dataset.audio);
        mp3.play();
    }
    clear() {
        this.parentElement.innerHTML = "";
    }
    generateMarkup(data) {
        var _a;
        return `
    <div class="head-box">
    <h1 class="main-word">${data.word}</h1>
    <span class="word-tag">${data.phonetic ? data.phonetic : ""}
    </span>
    <button class="play-audio" data-audio="${(_a = data === null || data === void 0 ? void 0 : data.mp3) === null || _a === void 0 ? void 0 : _a.audio}">
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
    generateWordMeaning(result) {
        return `
    <div class="info-box">
      <p class="text-header">${result.partOfSpeech}</p>
      <span class="text-light">Meaning</span>
      <ul class="ul-info-list">
          ${result.definitions
            .map((definiton) => `<li class="li-info-item">${definiton.definition}</li>`)
            .join("")}
      </ul>
      <span class="text-light synonyms">
        ${0 === result.synonyms.length ? "" : "Synonyms"}
        <strong class="syn-content">${result.synonyms.map((synom) => ` ${synom}`)}</strong>
      </span>
    </div>
`;
    }
    generateSource(e) {
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
__decorate([
    AutoBind
], AppMarkup.prototype, "playAudio", null);
class AppInput {
    constructor() {
        this.formElement = document.querySelector(".input-box");
        this.inputElement = document.querySelector(".search-input");
        this.loadWord();
    }
    addEventHandler(e) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                e.preventDefault();
                const word = this.getWord().trim();
                const URL = `${ProjectConfig.API_KEY}${word}`;
                yield appState.loadData(URL);
                appMarkup.render(appState.dicitionary);
                this.inputClear();
            }
            catch (err) {
                console.error(err);
            }
        });
    }
    loadWord() {
        this.formElement.addEventListener("submit", this.addEventHandler);
    }
    getWord() {
        const inputValue = this.inputElement.value.toLowerCase();
        return inputValue;
    }
    inputClear() {
        this.inputElement.value = "";
    }
}
__decorate([
    AutoBind
], AppInput.prototype, "addEventHandler", null);
class AppOptions {
    constructor() {
        this.options = document.querySelector(".font-select");
        this.addOptionsHandler();
    }
    addOptionsHandler() {
        window.addEventListener("click", this.darkTheme);
        this.options.addEventListener("click", this.changeFont);
    }
    darkTheme() {
        const target = document.getElementById("switch-17");
        target.id === "switch-17" && target.checked
            ? document.body.classList.add("dark-theme")
            : document.body.classList.remove("dark-theme");
    }
    changeFont(e) {
        const optionList = document.querySelector(".option-list");
        optionList.classList.toggle("hidde");
        const target = e.target;
        if (!target.closest(".option-list"))
            return;
        const font = target.dataset.font;
        const body = document.querySelector("body");
        if (font === "serif")
            appState.font = FontOptions.SERIF;
        if (font === "sans-serif")
            appState.font = FontOptions.SANS_SERIF;
        if (font === "monospace")
            appState.font = FontOptions.MONO;
        body.style.fontFamily = appState.font;
    }
}
const appOptions = new AppOptions();
const appInput = new AppInput();
const appMarkup = new AppMarkup();
//# sourceMappingURL=app.js.map