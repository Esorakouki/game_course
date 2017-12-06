//THREEJS　RELATED VARIABLES

var scene,
    camera, fieldOfView, aspectRatio, nearPlane, farPlane,
    render,
    container,
    controls;
var delta = 0;
var floorRadius = 200;
var speed = 6;
var distance = 0;
var level = 1;
var levelInterval;
var levelUpdateFreq = 3000;
var initSpeed = 5;
var maxSpeed = 48;
var monsterPos = .65;
var monsterPosTarget = .65;
var floorRotation = 0;
var collisionObstacle = 10;
var collisionBonus = 20;
var gameStatus = "play";
var cameraPosGame = 160;
var cameraPosGameOver = 260;
var monsterAcceleration = 0.004;
var malusClearColor = 0xb44b39;
var malusClearAlpha = 0;

//SCREEN & MOUSE VARIBLES

var height, width, windowHalfX, windowHalfY,
    mousePos = {
        x: 0,
        y: 0
    };


function createScene() {
    height = window.innerHeight;
    width = window.innerWidth;

    scene = new THREE.Scene();

    scene.fog = new THREE.Fog(0xd6eae6, 160, 350);
    aspectRatio = width / height;
    fieldOfView = 50;
    nearPlane = 1;
    farplane = 2000;
    camera = new THREE.PerspectiveCamera(
        fieldOfView,
        aspectRatio,
        nearPlane,
        farPlane
    );

    camera.position.x = 0;
    camera.position.z = cameraPosGame;
    camera.position.y - 100;
    camera.lookAt(new THREE.Vector3(0, 30, 0))

    renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true
    });
    renderer.setPixelRatio(window.devicePixelRatio); 
    renderer.setClearColor(malusClearColor, malusClearAlpha);

    renderer.setSize(width, height);
    renderer.shadowMap.enabled = true;

    container = document.getElementById('world');
    container.appendChild(renderer.domElement);

    window.addEventListener('resize', handleWindowResize, false);
    //document.addEventListener('mousedown', handleMouseDown, false);
    //document.addEventListener("touchend", handleMouseDown, false);
}

function handleWindowResize() {
    height = window.innerHeight;
    width = window.innerWidth;
    renderer.setSize(width, height);
    camera.aspectRatio = width / height;
    camera.updateProjectionMatrix();
}

// LIGHTS

function createLights() {
    hemisphereLight　= new THREE.HemisphereLight(0xffffff, .9);

    //ambientLight = new THREE.AmbientLight(0xdc8874, .5);

    shadowLight = new THREE.DirectionalLight(0xffffff, 1);
    shadowLight.position.set(-30, 40, 20);
    shadowLight.castShadow = true;
    shadowLight.shadow.camera.left = -400;
    shadowLight.shadow.camera.right = 400;
    shadowLight.shadow.camera.top = 400;
    shadowLight.shadow.camera.bottom = -400;
    shadowLight.shadow.camera.near = 1;
    shadowLight.shadow.camera.far = 2000;
    shadowLight.shadow.mapSize.width = 2048;
    shadowLight.shadow.mapSize.height = 2048;

    scene.add(hemisphereLight);
    scene.add(shadowLight);
    //scene.add(ambientLight);
}

function createFloor() {
    floorShadow = new THREE.Mesh(new THREE.SphereGeometry(floorRadius, 50, 50), new THREE.MeshPhongMaterial({
        color: 0x7abf8e,
        specular: 0x000000,
        shininess: 1,
        transparent: true,
        opacity: 5
    }));
    floorShadow.receiveShadow = true;

    floorGrass = new THREE.Mesh(new THREE.SphereGeometry(floorRadius-.5, 50, 50), new THREE.MeshBasicMaterial({
        color: 0x7abf8e
    }));
    floorGrass.receiveShadow = false;

    floor = new THREE.Group();
    floor.position.y = -floorRadius;

    floor.add(floorShadow);
    floor.add(floorGrass);
    scene.add(floor);

}

window.addEventListener('load', init, false);

function init() {
    createScene();
    createLights();
    createFloor();
    //createObjects();
}