import React, { Component } from 'react';
import Particles from 'react-particles-js';
import Navigation from './components/Navigation/Navigation';
import Signin from './components/Signin/Signin';
import FaceRecognition from './components/FaceRecognition/FaceRecognition';
import Logo from './components/Logo/Logo';
import ImageLinkForm from './components/ImageLinkForm/ImageLinkForm';
import Rank from './components/Rank/Rank';
import './App.css';
import Clarifai from 'clarifai';

const app = new Clarifai.App({
 apiKey: 'e0c4fcc518b04ca0a216fbe011862e06'
});

const particlesOptions = {
  particles: {
    number: {
      value:30,
      density: {
        enable: true,
        value_area:800
      }
    }
  }
}

class App extends Component {
  constructor()
  {
    super();
    this.state = {
      input:'',
      imageUrl:'',
      box:{}
    }
  }
  calculateFaceLocation = (data) => {
    console.log("here",data);
    const clarifaiFace = data.outputs[0].data.regions[0].region_info.bounding_box;
    const image = document.getElementById('inputImage');
    const width = Number(image.width);
    const height = Number(image.height);
    console.log("returning")
    return{
      leftCol:clarifaiFace.left_col * width,
      topRow:clarifaiFace.top_row * height,
      rightCol:width - (clarifaiFace.right_col * width),
      bottomRow:height - (clarifaiFace.bottom_row * height),
    }
  }
  displayFaceBox = (box) => {
    console.log("box",box);
    this.setState({box:box});
  }
  onInputChange = (event) => {
    console.log("made it",event.target.value);
      this.setState({input:event.target.value});
  }

  onButtonSubmit = () => {
    console.log("test");
    this.setState({imageUrl:this.state.input})
    app.models.predict(
      "a403429f2ddf4b49b307e318f00e528b", 
      this.state.input).then(response => this.displayFaceBox(this.calculateFaceLocation(response)))
      .catch(err => console.log(err));
    
  }
  render() {
    return (
      <div className="App">     
          <Particles className='particles'
            params={
              particlesOptions
            }
          />
        <Navigation />
        <Logo />
        <Rank />
        <ImageLinkForm 
        onInputChange={this.onInputChange} 
        onButtonSubmit={this.onButtonSubmit} />
        <FaceRecognition box={this.state.box} imageUrl={this.state.imageUrl} />
      </div>
    );
  }
}

export default App;
