import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry.js"
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader';
import DetectCollision from './detect-collision'
/* ------------ CONSTS ------------ */

let stars = []
let models = [];
let textModels = []
const group = new THREE.Group();
//add utils
let camera, scene, renderer, controls;
let container = document.querySelector( '#scene-container' );
const mixers = [];
// const scene = new THREE.Scene()
const loader = new GLTFLoader();
const clock = new THREE.Clock();
const fontLoader = new FontLoader();

// const renderer = new THREE.WebGLRenderer()
let earthColision = false;
let modelAnimation = false
let time = 0.0;
let simSpeed = 1.0;
let flag = true
let backgroundRate = 2
let wsad = false
let zRate = -0.1
let xRate = 0.02
var keyW = false;
var keyA = false;
var keyS = false;
var keyD = false;
let state = 0;
let afterStart = false;
let force = 0;
let planetCollsion = 0;
let mass = 4;


function init() {
  	const fov = 35; 
	const aspect = container.clientWidth / container.clientHeight;
	const near = 0.1;
	const far = 5000;

	//Add camera
	camera = new THREE.PerspectiveCamera( fov, aspect, near, far );
	camera.position.set(0,0,150);
	controls = new OrbitControls( camera, container );

	//Add Scene
	scene = new THREE.Scene();
	scene.background = new THREE.Color( 'black' );


	// add controls so you can click and drag to move around
	controls.enableDamping = true
	controls.target.set(0, 0, 0)

	//Set light sources
	const ambientLight = new THREE.AmbientLight( 0xffffff, 1 );
	scene.add( ambientLight );
	const light = new THREE.DirectionalLight( 0xffffff, 0.5 );
	light.position.set( 10, 10, 10 );
	scene.add( ambientLight, light );
	const light2 = new THREE.DirectionalLight( 0xffffff, 0.5 );
	light2.position.set( 0, 10, -10 );
	scene.add( ambientLight, light2 );

	renderer = new THREE.WebGLRenderer( { antialias: true, logarithmicDepthBuffer: true, } );
	renderer.setSize( window.innerWidth, window.innerHeight );
	document.body.appendChild( renderer.domElement );
	LoadSpaceBackground()
	
	//load spaceShip
	LoadModel('./assets/spaceship8.glb', 0, [0,-1,140],[]);

	renderer.setAnimationLoop( () => {
		//I dont want this always running! the style changes. Find a way to do it only once
		document.getElementById("before-load").style.visibility = "hidden"
		document.getElementById("after-load").style.visibility = "visible"
		const delta = clock.getDelta();
		time += delta
		Update(delta, time)
	});
}


/* ------------ LOADERS ------------ */
function LoadPlanets() {
	//earth pos = [-10,10,120]
	LoadModel('./assets/earth.glb', 2, [-100,10,120], []);
	LoadText("Projects", [-38, 15, 120], [0,0.2,0])
	//moon pos = [-10,10,120]
	LoadModel('./assets/moon.glb', 2, [-80,20,120], [0.045,0.045,0.045]);
	LoadText("Experience", [15, 27, 120], [0,-0.2,0])
	//planet Education pos = [-10,10,120]
	LoadModel('./assets/moon.glb', 2, [-20,40,120], [0.045,0.045,0.045]);
	LoadText("Education", [-25, 47, 120], [0,-0.2,0])
	//planet Skills pos = [-10,10,120]
	LoadModel('./assets/moon.glb', 2, [20,55,120], [0.045,0.045,0.045]);
	LoadText("Toggle Euclidian Physics!", [8, 61, 120], [0,-0.2,0])
	//instructions
	LoadText("Press Enter Over The Planets", [0,0,120], [0,-0.3,0])
	LoadText("WSAD For Controls", [-30,0,120], [0,0.2,0])
	LoadText("Hold Shift To Go Fast", [-30,-5,120], [0,0.2,0])
	//Words Above Earth
}



function LoadText(text, position, rotation){
	let textGeo;
	fontLoader.load( 'fonts/font1.typeface.json', function ( font ) {

		textGeo = new TextGeometry(text, {
			font: font,
			size: 2,
			height: 1,
			curveSegments: 1,
			bevelEnabled: true,
			bevelThickness: 0.1,
			bevelSize: 0.1,
			bevelOffset: 0,
			bevelSegments: 1
		} );
		var material = new THREE.MeshBasicMaterial({color: 0xffffff});
		textGeo = new THREE.Mesh(textGeo, material); 
		textGeo.position.x = position[0]
		textGeo.position.y = position[1]
		textGeo.position.z = position[2]
		textGeo.rotation.x = rotation[0]
		textGeo.rotation.y = rotation[1]
		textGeo.rotation.z = rotation[2]
		scene.add(textGeo)
		textModels.push(textGeo)
		console.log(textGeo.position)
	} );
		return textModels.length - 1
	



		


}
function LoadSpaceBackground(){

  for(let i = 0; i < 6000; i++){
    const geometry = new THREE.SphereGeometry( 0.05, 20, 20 )
    const material = new THREE.MeshBasicMaterial( {color: 0xffffff} );
    const sphere = new THREE.Mesh( geometry, material );
    sphere.position.set(Math.random() * 400 - 200, Math.random() * 400 - 200, Math.random() * 400 - 200);
    stars.push(sphere)
    scene.add( sphere );
  }
  render()
}

function LoadModel(mesh, id, position, scale){

	loader.load( mesh, function ( glb ) {
		const model = glb.scene.children[0]
		model.position.x = position[0];
		model.position.y = position[1];
		model.position.z = position[2];
		const pos = new THREE.Vector3(position[0], position[1], position[2])
		const tempScale = new THREE.Vector3(scale[0], scale[1], scale[2])
		glb.scene.scale.copy(tempScale)

		const animation = glb.animations[0];
		
		if (!(typeof animation === "undefined")) {
		  const mixer = new THREE.AnimationMixer( model );
		  mixers.push( {id: id, mixer: mixer, start: 0, duration: glb.duration} );
		let action = mixer.clipAction(animation);
			action.play();
		}

		group.add(model);
		group.position.copy(pos);
		model.rotation.y = 0;
		model.rotation.z = 1.85;
		model.rotation.x = 0;
		if(scale.length != 0){
			model.scale.set(scale[0],scale[1],scale[2])
		}

		models.push(model);
		scene.add( model );

	}, undefined, function ( error ) {
		console.error( error );
	} );
}

let isEarthTextLoaded
let earthTextIndexes = []
function LoadEarthText(){
	if(!isEarthTextLoaded){
		LoadText("Drone Physics Simulation", [-73,15,120],[0,0.4,0])
		LoadText("Small Satilite Research Lab", [-75,10,120], [0,0.4,0])
		LoadText("Raspberry Pi Projects", [-68,5,120], [0,0.4,0])
		LoadText("[Enter]", [-50,0,120], [0,0.4,0])
		isEarthTextLoaded = true
	}

}

let isMoonTextLoaded
function LoadMoonText(){
	if(!isMoonTextLoaded){
		LoadText("- Application Developer at", [30,35,120],[0,-0.4,0])
		LoadText("  Open Systems Technologies", [30,30,120], [0,-0.4,0])
		LoadText("- TA For Program Design and", [30,25,120], [0,-0.4,0])
		LoadText("  Development [CSCI 3081w]", [30,20,120], [0,-0.4,0])
		LoadText("- Overnight Climbing Director", [30,15,120],[0,-0.4,0])
		LoadText("  At YMCA Camp Ihduhapi", [30,10,120], [0,-0.4,0])
		LoadText("  [Enter]", [30,5,120], [0,-0.4,0])
		isMoonTextLoaded = true
	}

}

let isYellowTextLoaded
function LoadYellowText(){
	if(!isMoonTextLoaded){
		LoadText("- Graduating December 2022", [-60,50,120],[0,-0.4,0])
		LoadText("- Majoring in Computer Science", [-60,45,120],[0,-0.4,0])
		LoadText("- Minor in Chinese Language ", [-60,40,120], [0,-0.4,0])
		LoadText("  and Literature", [-60,35,120], [0,-0.4,0])
		LoadText("  [Enter]", [-60,30,120], [0,-0.4,0])
		isYellowTextLoaded = true
	}

}


/* ------------ ANIMATIONS ------------ */

function AnimatePlanets(time) {
	//earth
	models[1].position.y = 10 + (0.5 * Math.cos(time)) 
	models[1].rotation.y += 0.005

	//mars
	models[2].position.y = 20 + (0.5 * Math.cos(time)) 
	models[2].rotation.y += 0.005

	models[3].position.y = 40 + (0.5 * Math.cos(time)) 
	models[3].rotation.y += 0.005

	models[4].position.y = 55 + (0.5 * Math.cos(time)) 
	models[4].rotation.y += 0.005

	//text
	for(let i = 0; i < textModels.length; i++){
		textModels[i].position.y = textModels[i].position.y + (0.005 * Math.cos(time))
		textModels[i].lookAt( camera.position );
	}

}
function AnimatePlanetsIntoPosition(dt){
	//earth
	if(models[1] != undefined){
		if(models[1].position.x < -35 ){
			models[1].position.x += 0.9
			models[1].rotation.y += 0.005
		}
	if(models[2] != undefined){
		if(models[2].position.x < 20 ){
			models[2].position.x += 0.9
			models[2].rotation.y += 0.005
		}
	}
}

}
function AnimateBackground(){
	for(let i = 0; i < stars.length; i++){
	  stars[i].position.z += backgroundRate
	  if(stars[i].position.z > 400) {
		stars[i].position.set(Math.random() * 400 - 200, Math.random() * 400 - 200, Math.random() * 400 - 200);
	  }
	}
  }

function AnimateRocketToInitialPosition(){
	
	models[0].translateZ(zRate)
	models[0].rotation.x += xRate
	if(backgroundRate > 0) {
		backgroundRate -= 0.03
	} 
	
	if(models[0].position.z < 63){
		zRate = 0;
	}

	if(models[0].rotation.x > 1.5){
		state = 2
		
	}
	camera.position.y += 0.05
	camera.position.z += 0.7
	document.getElementById("after-load").style.transform = 'translateY(-1000px)'
	container.zIndex = "10";

}

let neverTurn = false
function RotateRocket(){
	if(models[0] != undefined) {
		if(modelAnimation){
			models[0].rotation.z = 1.8
			neverTurn = true
		} else {
			if(!neverTurn){
				models[0].rotation.z += 0.01	
			}
			
		}
		
	} 
}

document.getElementById("interactive-btn").addEventListener('click', () => {
	state = 1;
	LoadPlanets()
})

/* ------------ UTILS ------------ */

window.addEventListener("keydown", onKeyDown, false);
window.addEventListener("keyup", onKeyUp, false);

addEventListener('load', (event) => {
	init()
	window.addEventListener( 'resize', onWindowResize );
	
	try {
		
	}
	catch(excetion) {
		alert(excetion)
	}
});



function onWindowResize() {
	// set the aspect ratio to match the new browser window aspect ratio
	camera.aspect = window.innerWidth / window.innerHeight;
  
	// update the camera's frustum
	camera.updateProjectionMatrix();
  
	// update the size of the renderer AND the canvas
	renderer.setSize(window.innerWidth, window.innerHeight);
  }

  function render() {
	renderer.render( scene, camera );
}


/* ------------ PHYSICS ------------ */

let xForce = 0;
let yForce = 0;
let zForce = 0;
let yVelocity = 0;
let xVelocity = 0;
let zeroVelocity = false;
function Update(dt, time){
	
	
	if(state == 0 ) {
		RotateRocket()
		AnimateBackground()
	}
	else if(state == 1){
		AnimateRocketToInitialPosition()
		AnimatePlanetsIntoPosition(dt)
	}
	else if(state == 2){

		AnimatePlanetsIntoPosition(dt)
		// console.log("ship x = " + models[0].position.x)
		// console.log("ship y = " + models[0].position.y)
		planetCollsion = DetectCollision(models[0].position.x, models[0].position.y)

		if(planetCollsion == 1){
			if(!isEarthTextLoaded){
				LoadEarthText()
			}
		}
		if(planetCollsion == 2){
			if(!isMoonTextLoaded){
				LoadMoonText()
			}
		}
		if(planetCollsion == 3){
			if(!isYellowTextLoaded){
				LoadYellowText()
			}
		}
		if(planetCollsion == 0){
			if(isEarthTextLoaded){
				for(let i = 0; i < 4; i++){
					scene.remove(textModels[textModels.length - i - 1])
				}
			} 
			if(isMoonTextLoaded){
				for(let i = 0; i < 7; i++){
					scene.remove(textModels[textModels.length - i - 1])
				}
			}
			if(isYellowTextLoaded){
				for(let i = 0; i < 5; i++){
					scene.remove(textModels[textModels.length - i - 1])
				}
			}  
			isEarthTextLoaded = false
			isMoonTextLoaded = false
			isYellowTextLoaded = false
		}
		if(planetCollsion != 0){
			console.log(planetCollsion)
			
		}
		HandleWSAD()
		AnimatePlanets(time)
		// camera.position.y = camera.position.y + yVelocity * dt;
		// models[0].position.y = models[0].position.y + yVelocity * dt;
        // yVelocity = yVelocity + ( yForce / mass ) * dt;

		// camera.position.x = camera.position.x + xVelocity * dt;
		// models[0].position.x = models[0].position.x + xVelocity * dt;
        // xVelocity = xVelocity + ( xForce / mass ) * dt;

		if(zeroVelocity){	
			yVelocity = 0;
			xVelocity = 0;
			xForce = 0;
			yForce = 0;
		}

		if(models[0] != undefined){
			// const dir = new THREE.Vector3(0,-1.75,0);
			// const pos = new THREE.Vector3();
			// pos.addVectors(dir, models[0].position);
			// let vector = new THREE.Vector3( 0, 1, 0 );
			// vector = models[0].worldToLocal(vector);
	
			// const adjustedDirVector = models[0].localToWorld(new THREE.Vector3(0,0,0)).add(dir);
			// models[0].lookAt(adjustedDirVector);
			
		}


	} 

	render();
}


/* ------------ CONTROLS ------------ */

function onKeyDown(event) {
	var keyCode = event.keyCode;

	switch (keyCode) {
	  case 68: //d
		keyD = true;
		break;
	  case 83: //s
		keyS = true;
		break;
	  case 65: //a
		keyA = true;
		break;
	  case 87: //w
		keyW = true;
		break;
		case 16:
		speed = 0.8;
		break;
	case 32:
		zeroVelocity = true
		break

		
	}
  }
  
  function onKeyUp(event) {
	var keyCode = event.keyCode;
  
	switch (keyCode) {
	  case 68: //d
		keyD = false;
		break;
	  case 83: //s
		keyS = false;
		break;
	  case 65: //a
		keyA = false;
		break;
	  case 87: //w
		keyW = false;
		break;
		case 32:
		zeroVelocity = false
		break
		case 16:
		speed = 0.2;
	}
  }
let speed = 0.2
function HandleWSAD(){
	
	if (keyW == true) {
		// if(yForce < 3){
		// 	yForce += 0.1
		// }
		// console.log(yForce)
		models[0].position.y += speed
		camera.position.y += speed
		
		
		if(keyD){

			models[0].rotation.y = -1
			models[0].position.x += speed
			camera.position.x += speed
		} if(keyA){

			models[0].rotation.y = 1
			camera.position.x -= speed
			models[0].position.x -= speed
			
		} if( !keyA && !keyD) {
			models[0].rotation.y = 0
		}
		
	}

	else if (keyS == true) {
		// if(yForce > -3){
		// 	yForce -= 0.2
		// }
		// console.log(yForce)
		models[0].position.y -= speed
		camera.position.y -= speed
		// models[0].rotation.y = -3

		if(keyD){

			models[0].rotation.y = -2.3
			models[0].position.x += speed
			camera.position.x += speed
		} if(keyA){

			models[0].rotation.y = 2.3
			models[0].position.x -= speed
			camera.position.x -= speed
		} if( !keyA && !keyD) {
			models[0].rotation.y = -3.1
			
		}
		
	}
	else if (keyA == true) {
		// if(xForce > -3){
		// 	xForce -= 0.2
		// }
		// console.log(xForce)
		models[0].position.x -= speed
		camera.position.x -= speed
		models[0].rotation.y = 1.5
	}
	else if (keyD == true) {
		// if(xForce < 3){
		// 	xForce += 0.2
		// }
		// console.log(xForce)
		models[0].position.x += speed
		camera.position.x += speed
		models[0].rotation.y = -1.5
	}
}

window.onscroll = function (e) {  
	if(e.detail > 0) {
		//scroll down
		console.log('Down');
	}else {
		//scroll up
		console.log('Up');
	} 
	} 

