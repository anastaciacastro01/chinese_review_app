import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import {AppLayout, ActionArea} from './layouts/AppLayout';
import {Scrollbox} from './layouts/Scrollbox';

let CHINESE_DICT = null;
let readyToConfirm = false;

const Page = ({name, description, actionAreaContent}) => {
  return (
    <AppLayout>
      <h1>{description}</h1>
      <ActionArea>
        {actionAreaContent}
      </ActionArea>
    </AppLayout>
  );
}

const FullPageLayout = ({children}) => {
  return (
    <div id="FullPageLayout" className="FullPageLayout">
      {children}
    </div>
  );
};

class ChineseApp extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      pages: {
        landingPage: null,
        uploadDictPage: null,
        uploadWordsPage: null,
        inputWordPage: null,
        matchDefinitionsPage: null,
        confirmationPage: null,
      },
      currentPage: null, 
      wordInput: null,
      possibleDefinitions: null,
      chosen: new Map(),
    };
  }

  setUserInputState(userInput) {
    this.setState({
      wordInput: userInput,
    }, () => {
      this.setDefinitionsState();
    });
  }

  setDefinitionsState() {
    for(let words of CHINESE_DICT.keys()) {
      if(words.includes(this.state.wordInput)){
        this.setState({
          possibleDefinitions: CHINESE_DICT.get(words),
        }, () => {
          this.renderMatchDefinitionsPage();
        });
        break;
      }
    }
  }

  addDefinition(chosenPinyin, chosenDefs) {
    readyToConfirm = false;
    const currentChosen = this.state.chosen;
    let currentChosenDefs = [];
    if(this.state.chosen.get(this.state.wordInput)){
      currentChosenDefs = this.state.chosen.get(this.state.wordInput)[1];
    }
    currentChosenDefs.push(chosenDefs);
    currentChosen.set(this.state.wordInput, [chosenPinyin, currentChosenDefs]);
    this.setState({
      chosen: currentChosen,
    }, () => {
      readyToConfirm = true;
    });
  }

  renderLandingPage() {
    this.setState({
      currentPage:
      <Page 
        name = "Landing"
        description = "would you like to upload words or practice?"
        actionAreaContent = {
          <>
          <button onClick = {() => {
            this.renderUploadDictPage();
          }}>
          upload
          </button>
          <button disabled>practice</button>
          </>
       }
      />,
    });
  }

  renderUploadDictPage() {
    this.setState({
      currentPage:
        <Page
          name = "Upload Dict Page"
          description = "upload the dictionary file"
          actionAreaContent = {
            <>
              <input type="file" id="dictInput" />
              <button className="autoEnter" onClick = {() => {
                uploadChineseDict();
                this.renderUploadWordsPage();
              }}> 
                next
              </button>
            </>
          }
        />,
    });
  }

  renderUploadWordsPage() {
    this.setState({
      currentPage:
        <Page 
          name = "Upload Words Page"
          description = "upload words here!"
          actionAreaContent = {
            <>
              <button className="autoEnter" onClick = {() => {
                this.renderInputWordPage();
              }}>
                input word here
              </button>
              <button onClick = {() => {
                while (!readyToConfirm) {
                }
                this.renderConfirmationPage();
              }} id="goToConfirmation">
                done
              </button>
            </>
          }
        />,
    });
  }

  renderInputWordPage() {
    this.setState({
      currentPage:
        <Page 
          name = "Input Word Page"
          description = "input word here!"
          actionAreaContent = {
            <>
              <button onClick = {() => {
                this.renderUploadWordsPage();
              }}>
                &larr;
              </button>
              <input id="wordInput" type="text" autoComplete="off"/>
              <button className="autoEnter" onClick = {() => {
                const userInput = document.getElementById("wordInput").value;
                if(userInput) {
                  this.setUserInputState(userInput);
                }
              }}>
                next
              </button>
            </>
          }
        />,
    });
  }

  renderMatchDefinitionsPage() {
    this.setState({
      currentPage:
        <Page 
          name = "Match Definitions Page"
          description = "which definition(s) best match(es) your word?"
          actionAreaContent = {
            <>
              <Scrollbox
                rowType = "checkbox"
                content = {() => {
                  let pinyinDefs = this.state.possibleDefinitions;
                  let pinyinList = pinyinDefs[0];
                  let defsList = pinyinDefs[1];
                 
                  // TODO: figure out an other option w/o repeating this
                  defsList.push('add definition');
                  return defsList;
                }}
                >
              </Scrollbox>
              <button onClick = {() => {
                this.renderInputWordPage();
              }}>
                &larr;
              </button>
              <button className="autoEnter" onClick = {() => {
                let possibleDefs = document.getElementsByClassName("defOption");
                let pinyinDefs = this.state.possibleDefinitions;
                let pinyinList = pinyinDefs[0];

                for(let def of possibleDefs) {
                  if(def.checked) {
                    if(def.name == "add definition") {
                      let otherOption = document.getElementById("otherOption").value;
                      this.addDefinition(pinyinList, otherOption);
                    } else {
                      this.addDefinition(pinyinList, def.name);
                    }
                  }
                }
                this.renderUploadWordsPage()
              }}>
                next
              </button>
            </>
          }
        />,
    });
  }

  renderConfirmationPage() {
    this.setState({
      currentPage:
        <Page 
          name = "Confirmation Page"
          description = "here are the words you want to upload"
          actionAreaContent = {
            <>
            <Scrollbox
              rowType = "checkbox"
              content = {() => {
                return getChosenWordDefArray(this.state.chosen);
              }}>
            </Scrollbox>
            <button onClick = {() => {
              this.renderUploadWordsPage();
            }}>
              &larr;
            </button>
            <button onClick = {() => {
              this.renderDownloadFilesPage();
            }}>
              done
            </button>
            </>
          }
        />,
    });
  }

  renderDownloadFilesPage() {
    this.setState({
      currentPage:
        <Page
          name = "Download File Page"
          description = "click the links to download the vocab file"
          actionAreaContent = {
            <>
            <button onClick = {() => {
              let fileText = "";
              let chosenArray = getChosenWordDefArray(this.state.chosen);
              for(let wordDefPair of chosenArray){
                fileText += wordDefPair[0];
                for(let def of wordDefPair[1][1]) {
                  fileText += def;
                }
                fileText += "\n";
              }

              this.renderFileDownloadLink(fileText, "chinEngLink");
            }}>
              Chinese-English
            </button>
            <a id="chinEngLink" download="chinEng.txt">English-Chinese</a>
            <button onClick = {() => {
              let fileText = "// between term and definition: ': '";
              fileText += "\n";
              fileText += "// between cards: ' \\n'";
              fileText += "\n"
              let chosenArray = getChosenWordDefArray(this.state.chosen);
              for(let wordDefPair of chosenArray){
                fileText += wordDefPair[0];
                for(let pinyin of wordDefPair[1][0]) {
                  fileText += pinyin;
                }
                fileText += "\n";
              }

              this.renderFileDownloadLink(fileText, "chinPinyinLink");
            }}>
              Chinese-Pinyin
            </button>
            <a id="chinPinyinLink" download="chinPinyin.txt">Chinese-Pinyin</a>
            </>
          }
        />,
    });
  }

  renderFileDownloadLink(fileText, linkId) {
    let textFile = null;
    let makeTextFile = (text) => {
      let data = new Blob([text], {type: 'text/plain'});

      if (textFile !== null) {
        window.URL.revokeObjectURL(textFile);
      }

      textFile = window.URL.createObjectURL(data);
      return textFile;
    };
    let link = document.getElementById(linkId);
    link.href = makeTextFile(fileText);
    link.style.display = 'block';
    this.setState({
      state: this.state,
    });
  }

  componentDidUpdate() {
    let wordInput = document.getElementById("wordInput");
    if(wordInput) {
      wordInput.focus();
    }
  }

  render() {
    if(!this.state.currentPage){
      this.renderLandingPage();
    }

    return (
      <FullPageLayout>
        {this.state.currentPage}
      </FullPageLayout>
    );
  } 
}

function uploadChineseDict(){
  var fr = new FileReader();

  CHINESE_DICT = new Map();

  fr.onload = function() {
    let lines = fr.result.replace(/\r/g, "").split(/\n/);
    for(let line of lines) {
      if(!(line[0]=="#")) {
        let firstSplit = line.split("[");
        let words = firstSplit[0].split(/(\s+)/).filter(e => e.trim().length > 0);
        let secondSplit = firstSplit[1].split("]");
        let pinyin = secondSplit[0].split(/(\s+)/).filter(e => e.trim().length > 0);
        let definitions = secondSplit[1].split("/").filter(e => e.trim().length > 0);
        let pinyinDefsArray = [pinyin, definitions];
        CHINESE_DICT.set(words, pinyinDefsArray);
      }
    }
  };

  fr.readAsText(document.getElementById("dictInput").files[0]);
}

function getChosenWordDefArray(chosenMap) {
  let chosenArray = [];
  for (let key of chosenMap.keys()) {
    let wordDefArray = [];
    wordDefArray.push(key + ": ");

    let chosenPinyinDefArray = chosenMap.get(key);
    let pinyinArray = chosenPinyinDefArray[0];
    let defArray = chosenPinyinDefArray[1];

    let pinyinString = pinyinArray.join(' ') + ' ';

    let formattedDefArray = [];
    for(let i = 0; i < defArray.length; i++) {
      let def = defArray[i];
      if(i == defArray.length - 1) {
        formattedDefArray.push(def);
      } else {
        formattedDefArray.push(def + "; ");
      }
    }

    wordDefArray.push([pinyinString, formattedDefArray]);
    chosenArray.push(wordDefArray);
  }

  return chosenArray;
}

ReactDOM.render(
  <ChineseApp />,
  document.getElementById('root')
);
