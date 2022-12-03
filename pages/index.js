import Head from 'next/head';
import Image from 'next/image';
import buildspaceLogo from '../assets/buildspace-logo.png';
import { useState,useMemo} from 'react';

const Home = () => {
  const [userInput, setUserInput] = useState('');
  const [apiOutput, setApiOutput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [Name, setName] = useState(null);
  const [Tag, setTag] = useState(null);
  const [baseText,setBaseText] = useState();
  

  const generateName = async () => {
    setIsGenerating(true);
    if(!Name) {
    const response = await fetch('/api/getName', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userInput }),
    });
  
    const data = await response.json();
    const { output } = data;
    console.log("OpenAI replied Name...", output.text)
    setName(`${output.text}`);}
    setIsGenerating(false);
  }

useMemo(() => {if (!Name) {generateName()}},[]);

  const generateTag = async () => {
    setIsGenerating(true);
    if (Name){
      console.log("NAME", Name)
    const response = await fetch('/api/getTag', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ Name }),
    });
  
    const data = await response.json();
    const { output } = data;
    console.log("OpenAI replied Tag...", output.text)
    
    setTag(`${output.text}`)}
    setIsGenerating(false);
  }
  const getTag = useMemo(() => {
  if (Name) {generateTag()}}, [Name]);

const basePromptPrefix = 
`This is an ask me anything chat between User and ${Name}.

Description: ${Tag}

Goal: User should guess with whom the User is chatting. 

Constraint: ${Name} never tells information that can be used to identify ${Name} 

Setting: ${Name} truthfully answers Users questions. 

Result: If User mentions in a Question or Sentence ${Name}'s name, ${Name} answers "Congrats, you found me!"

User Question: 
`

const callGenerateEndpoint = async () => {
  setIsGenerating(true);
  const textInput = `${basePromptPrefix}${userInput}\n ${Name}:`
  console.log(textInput);
  setBaseText(textInput);
  const response = await fetch('/api/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ textInput }),
  });

  const data = await response.json();
  const { output } = data;
  console.log("OpenAI replied...", output.text)
  setBaseText(`${baseText}${output.text}`);
  setApiOutput(`${output.text}`);
  setIsGenerating(false);
}
 
  const onUserChangedText = (event) => {
    setUserInput(event.target.value);
  };

  return (
    <div className="root">
      <Head>
        <title>GPT-3 Writer | Who Am I?</title>
      </Head>
      <div className="container">
        <div className="header">
          <div className="header-title">
            <h1>Who Am I?</h1>
          </div>
          <div className="header-subtitle">
            <h2>Ask questions, and guess who you are talking to.</h2>
          </div>
        </div>
        <div className="prompt-container">
  <textarea
    placeholder="start typing here"
    className="prompt-box"
    value={userInput}
    onChange={onUserChangedText}
  />
  <div className="prompt-buttons">
  <a
    className={isGenerating ? 'generate-button loading' : 'generate-button'}
    onClick={callGenerateEndpoint}
  >
    <div className="generate">
    {isGenerating ? <span className="loader"></span> : <p>Ask</p>}
    </div>
  </a>
</div>
  {/* New code I added here */}
  {apiOutput && (
  <div className="output">
    <div className="output-header-container">
      <div className="output-header">
        <h3>Response:</h3>
      </div>
    </div>
    <div className="output-content">
      <p>{apiOutput}</p>
    </div>
  </div>
)}
</div>
      </div>
      <div className="badge-container grow">
        <a
          href="https://buildspace.so/builds/ai-writer"
          target="_blank"
          rel="noreferrer"
        >
          <div className="badge">
            <Image src={buildspaceLogo} alt="buildspace logo" />
            <p>build with buildspace</p>
          </div>
        </a>
      </div>
    </div>
  );
};

export default Home;
