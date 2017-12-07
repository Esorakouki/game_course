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

// Materials
var blackMat = new THREE.MeshPhongMaterial({
    color: 0x100707,
    shading:THREE.FlatShading,
  });
  
var brownMat = new THREE.MeshPhongMaterial({
    color: 0xb44b39,
    shininess:0,
    shading:THREE.FlatShading,
  });

var greenMat = new THREE.MeshPhongMaterial({
    color: 0x7abf8e,
    shininess:0,
    shading:THREE.FlatShading,
  });
  
  var pinkMat = new THREE.MeshPhongMaterial({
    color: 0xdc5f45,//0xb43b29,//0xff5b49,
    shininess:0,
    shading:THREE.FlatShading,
  });
  
  var lightBrownMat = new THREE.MeshPhongMaterial({
    color: 0xe07a57,
    shading:THREE.FlatShading,
  });
  
  var whiteMat = new THREE.MeshPhongMaterial({
    color: 0xa49789, 
    shading:THREE.FlatShading,
  });
  var skinMat = new THREE.MeshPhongMaterial({
    color: 0xff9ea5,
    shading:THREE.FlatShading
  });


// OTHER VARIABLES

var PI = Math.PI;

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

    /* _floor = new CustomMesh.PlaneMesh(1600,1600,12, 0x7abf8e);
    var vertices = _floor.geometry.vertices;
    for (var i=0; i<vertices.length; i++) {
        var v = vertices[i];
        v.x += Math2.rangeRandom(-10,-10);
        v.y += Math2.rangeRandom(-10,10);
        v.z += Math2.rangeRandom(-10,10);
    }
    _floor.geometry.verticesNeedUpdate = true;
    _floor.geometry.colorsNeedUpdate = true;
    //
    //this.mesh.geometry.computeVertexNormals();
    _floor.rotation.x = -Math.PI / 2
    scene.add(_floor); */
}

var firs = new THREE.Group();

function createFirs() {
    var nTrees = 100;
    for (var i=0; i<nTrees; i++) {
        var phi = i*(Math.PI*2)/nTrees;
        var theta = Math.PI/2;
        theta += (Math.random()>.05)? .25 + Math.random()*.3 : - .35 -  Math.random()*.1;
        
        var fir = new Tree();
        fir.mesh.position.x = Math.sin(theta)*Math.cos(phi)*floorRadius;
        fir.mesh.position.y = Math.sin(theta)*Math.sin(phi)*(floorRadius-10);
        fir.mesh.position.z = Math.cos(theta)*floorRadius; 
        
        var vec = fir.mesh.position.clone();
        var axis = new THREE.Vector3(0,1,0);
        fir.mesh.quaternion.setFromUnitVectors(axis, vec.clone().normalize());
        floor.add(fir.mesh);
    } 
}

// TREE

Tree = function(){
	this.mesh = new THREE.Object3D();
	this.trunc = new Trunc();
	this.mesh.add(this.trunc.mesh);
}


Trunc = function(){
  var truncHeight = 50 + Math.random()*150;
  var topRadius = 1+Math.random()*5;
  var bottomRadius = 5+Math.random()*5;
  var mats = [blackMat, brownMat, pinkMat, whiteMat, greenMat, lightBrownMat, pinkMat];
  var matTrunc = blackMat;//mats[Math.floor(Math.random()*mats.length)];
  var nhSegments = 3;//Math.ceil(2 + Math.random()*6);
  var nvSegments = 3;//Math.ceil(2 + Math.random()*6);
  var geom = new THREE.CylinderGeometry(topRadius,bottomRadius,truncHeight, nhSegments, nvSegments);
  geom.applyMatrix(new THREE.Matrix4().makeTranslation(0,truncHeight/2,0));
  
  this.mesh = new THREE.Mesh(geom, matTrunc);
  
  for (var i=0; i<geom.vertices.length; i++){
    var noise = Math.random() ;
    var v = geom.vertices[i];
    v.x += -noise + Math.random()*noise*2;
    v.y += -noise + Math.random()*noise*2;
    v.z += -noise + Math.random()*noise*2;
    
    geom.computeVertexNormals();
    
    // FRUITS
    
    if (Math.random()>.7){
      var size = Math.random()*3;
      var fruitGeometry = new THREE.CubeGeometry(size,size,size,1);
      var matFruit = mats[Math.floor(Math.random()*mats.length)];
      var fruit = new THREE.Mesh(fruitGeometry, matFruit);
      fruit.position.x = v.x;
      fruit.position.y = v.y+3;
      fruit.position.z = v.z;
      fruit.rotation.x = Math.random()*Math.PI;
      fruit.rotation.y = Math.random()*Math.PI;
      
      this.mesh.add(fruit);
    }
    
    // BRANCHES
    
    if (Math.random()>.5 && v.y > 10 && v.y < truncHeight - 10){
      var h = 3 + Math.random()*5;
      var thickness = .2 + Math.random();
      
      var branchGeometry = new THREE.CylinderGeometry(thickness/2, thickness, h, 3, 1);
      branchGeometry.applyMatrix(new THREE.Matrix4().makeTranslation(0,h/2,0));
      var branch = new THREE.Mesh(branchGeometry, matTrunc);
      branch.position.x = v.x;
      branch.position.y = v.y;
      branch.position.z = v.z;
      
      var vec = new THREE.Vector3(v.x, 2, v.z);
      var axis = new THREE.Vector3(0,1,0);
      branch.quaternion.setFromUnitVectors(axis, vec.clone().normalize());
      
      
      this.mesh.add(branch);
    }
    
  }
  
  
  this.mesh.castShadow = true;
}

/* function createObjects() {
    var loader = new THREE.ObjectLoader();
    loader.load('./scene.js', function(object) {
        object.traverse( function( node ) { 
            if ( node instanceof THREE.Mesh ) { 
                node.castShadow = true; 
                node.receiveShadow = true;
            } 
        });
        scene.add( object );
        world = scene.getObjectByName( "planet", true );

        aeroplane = scene.getObjectByName( "aero", true );                    
        
        light = scene.getObjectByName( "spot", true );
        light.castShadow = true;
        //light.shadowCameraVisible = true;
        light.shadowCameraNear = 5;
        light.shadowCameraFar = 700;
        light.shadowCameraFov = 90;

        light.shadowBias = 0.0005;
        if(SCREEN_WIDTH > 1400){
            light.shadowDarkness = .65;
        }else{
            light.shadowDarkness = .20;
        }

        light.shadowMapWidth = 2048;
        light.shadowMapHeight = 2048;
        light.shadowMapType = THREE.PCFSoftShadowMap;
        console.log(object);
    });
} */

function render() {
    renderer.render(scene, camera);
}

window.addEventListener('load', init, false);

function init() {
    createScene();
    createLights();
    createFloor();
    createFirs();
    render();
    //createObjects();
}