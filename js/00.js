import * as THREE from 'three';		
// import v from '../glsl/00v.glsl'

let renderer, scene, camera, plane;
let uniforms;


init();
render();
// animate();
function getProgram (url) {
    let xhr = new XMLHttpRequest();

    xhr.open('GET', url, false);

    try {
    xhr.send();
    if (xhr.status != 200) {
        console.log(`Error ${xhr.status}: ${xhr.statusText}`);
    } else {
        return xhr.response;
    }
    } catch(err) { // instead of onerror
        console.log("Request failed");
    }
}
function init() {

    camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 10000 );
    camera.position.set(0,0,30)
    // camera.up = new THREE.Vector3(0,0,1)
    scene = new THREE.Scene();
    scene.background = new THREE.Color( 0x050505 );

    uniforms = {
        't': { value: 1.0 }					
    };				
    let vProgram = getProgram("http://127.0.0.1:5500/glsl/00v.glsl")
    let fProgram = getProgram("http://127.0.0.1:5500/glsl/00f.glsl")
    const shaderMaterial = new THREE.ShaderMaterial( {

        uniforms: uniforms,        
        vertexShader: vProgram,        
        fragmentShader: fProgram,
        wireframe: true
    } );				

    const geometry = new THREE.PlaneGeometry(10,10,1,1);				
    console.log(geometry.toJSON())
    plane = new THREE.Mesh( geometry, shaderMaterial );
    scene.add( plane );

    renderer = new THREE.WebGLRenderer();
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    document.body.appendChild( renderer.domElement );		

    window.addEventListener( 'resize', onWindowResize );
    
}

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
    render()
}

function animate() {
    requestAnimationFrame( animate );
    render();
}

function render() {

    const time = Date.now() * 0.01;
    uniforms[ 't' ].value = time;
    renderer.render( scene, camera );

}