import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"

/* ------------ CONSTS ------------ */

let stars = []
let models = [];
const group = new THREE.Group();
//add utils
let camera, scene, renderer, controls;
let container = document.querySelector( '#scene-container' );
const mixers = [];
// const scene = new THREE.Scene()
const loader = new GLTFLoader();
const clock = new THREE.Clock();
// const renderer = new THREE.WebGLRenderer()
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

let afterStart = false;
let force = 0;

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
	LoadModel('./assets/spaceship8.glb', 0, [0,-1,70],1);

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

function LoadSpaceBackground(){

  for(let i = 0; i < 6000; i++){
    const geometry = new THREE.SphereGeometry( 0.05, 20, 20 )
    const material = new THREE.MeshBasicMaterial( {color: 0xffffff} );
    const sphere = new THREE.Mesh( geometry, material );
    sphere.position.set(Math.random() * 400 - 300, Math.random() * 400 - 300, Math.random() * 400 - 300);
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
		models.push(model);
		scene.add( group );

	}, undefined, function ( error ) {
		console.error( error );
	} );
}



/* ------------ ANIMATIONS ------------ */

function AnimateBackground(){
	for(let i = 0; i < stars.length; i++){
	  stars[i].position.z += backgroundRate
	  if(stars[i].position.z > 400) {
		stars[i].position.set(Math.random() * 400 - 300, Math.random() * 400 - 300, Math.random() * 400 - 300);
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
		modelAnimation = false
		afterStart = true
	}
	camera.position.y += 0.05
	camera.position.z += 0.05
	document.getElementById("after-load").style.transform = 'translateY(-800px)'
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
	modelAnimation = true;
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
	if(modelAnimation){
		AnimateRocketToInitialPosition()
	}
	else if(afterStart){
		HandleWSAD()
		
		camera.position.y = camera.position.y + yVelocity * dt;
		models[0].position.y = models[0].position.y + yVelocity * dt;
        yVelocity = yVelocity + ( yForce / mass ) * dt;

		camera.position.x = camera.position.x + xVelocity * dt;
		models[0].position.x = models[0].position.x + xVelocity * dt;
        xVelocity = xVelocity + ( xForce / mass ) * dt;

		if(zeroVelocity){	
			yVelocity = 0;
			xVelocity = 0;
			xForce = 0;
			yForce = 0;
		}

		if(models[0] != undefined){
			const dir = new THREE.Vector3();
			const pos = new THREE.Vector3(models[0].position.x,  models[0].position.y ,models[0].position.z );
			
			
	
			let vector = new THREE.Vector3( 0, 1, 0 );
			vector = models[0].worldToLocal(vector);
	
			const adjustedDirVector = models[0].localToWorld(new THREE.Vector3(0,1.75,0)).add(dir);
			models[0].lookAt(adjustedDirVector);
			// models[0].rotation.z = 1.75
		}


	} else if(!afterStart) {
		RotateRocket()
		AnimateBackground()
	}

	render();
}


/* ------------ CONTROLS ------------ */

function onKeyDown(event) {
	var keyCode = event.keyCode;
	console.log(keyCode)
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
	case 32:
		zeroVelocity = true

		
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
	}
  }

function HandleWSAD(){
	if (keyW == true) {
		if(yForce < 3){
			yForce += 0.1
		}
		console.log(yForce)
		
	}
	if (keyA == true) {
		if(xForce > -3){
			xForce -= 0.2
		}
		console.log(xForce)
	}
	if (keyS == true) {
		if(yForce > -3){
			yForce -= 0.2
		}
		console.log(yForce)
		
	}
	if (keyD == true) {
		if(xForce < 3){
			xForce += 0.2
		}
		console.log(xForce)
	}
}

