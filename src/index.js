import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry.js"
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader';

/* ------------ CONSTS ------------ */
const loader = new GLTFLoader();
const clock = new THREE.Clock();
let renderer
renderer = new THREE.WebGLRenderer( { antialias: true, logarithmicDepthBuffer: true, } );
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

var time = 0.0;
var container = document.querySelector( '#scene-container' );
let camera;
let controls;
let scene;
let models = [];
let mixers = [];
function init() {
	const fov = 35; // fov = Field Of View
	const aspect = container.clientWidth / container.clientHeight;
	const near = 1;
	const far = 30000;

	camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 10000 );
	camera.position.set( -6524, 13698, -14240 );
	controls = new OrbitControls( camera, renderer.domElement );

	controls.update();

	scene = new THREE.Scene();
	scene.background = new THREE.Color( 'skyblue' );

	controls.enableDamping = true
	controls.target.set(0, 1, 0)

	const ambientLight = new THREE.AmbientLight( 0xffffff, 1 );
	scene.add( ambientLight );
	const light = new THREE.DirectionalLight( 0xffffff, 0.5 );
	light.position.set( 10, 10, 10 );
	scene.add( ambientLight, light );
	const light2 = new THREE.DirectionalLight( 0xffffff, 0.5 );
	light2.position.set( 0, 10, -10 );
	scene.add( ambientLight, light2 );


	//Fox
	LoadGLB('./src/assets/fox.glb', 0, [0,0,0], [1,1,1]);
	//Ground
	loader.load( './src/assets/i_try2.glb', function ( glb ) {
		const pos = new THREE.Vector3(0,0,0)
		const tempScale = new THREE.Vector3(100,100,100)
		glb.scene.scale.copy(tempScale)
		glb.scene.position.copy(pos)
		
		scene.add(glb.scene)
	}, undefined, function ( error ) {
		console.error( error );
	} );


	//handle updates for animations
	renderer.setAnimationLoop( () => {
		update();
		render();
	});


	
}

function animate() {
	controls.update();
	
	renderer.render( scene, camera );
};






const LoadGLB = (mesh, id, position, scale) =>{
	console.log(mesh)
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

		if(scale.length != 0){
			model.scale.set(scale[0],scale[1],scale[2])
		}

		models.push(model);
		console.log(model)
		scene.add( model );

	}, undefined, function ( error ) {
		console.error( error );
	} );

		//handle updates for animations
		renderer.setAnimationLoop( () => {	
			update();
			render();
		});
}


function update() {
	// Get the time since the last animation frame.
	const delta = clock.getDelta();
	time += delta;
	console.log(camera.position)
	// Iterate through and update the animation mixers for each object in the
	// scene.
	for ( const mixer of mixers ) {
		if (mixer.start == undefined || mixer.duration == undefined) {
		  mixer.mixer.update(delta);
		}
		else {
		  var newTime = time - mixer.start;
		  var iterations = Math.floor(newTime/mixer.duration);
		  newTime = newTime - iterations*mixer.duration + mixer.start;
		  mixer.mixer.setTime(newTime);
		}
	}

}

$( document ).ready(function() {
	init()
	window.addEventListener( 'resize', onWindowResize );
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