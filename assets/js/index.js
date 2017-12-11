//THREEJS　RELATED VARIABLES

var scene,
    camera, fieldOfView, aspectRatio, nearPlane, farPlane,elf,
    render,
    container,
    controls,
    clock;
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
    clock = new THREE.Clock();
    
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
    //hemisphereLight　= new THREE.HemisphereLight(0xffffff, .9);
    globalLight　= new THREE.AmbientLight(0xffffff, .9);
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

    scene.add(globalLight);
    scene.add(shadowLight);
    //scene.add(ambientLight);
}

function createFloor() {
    floorShadow = new THREE.Mesh(new THREE.SphereGeometry(floorRadius, 50, 50), new THREE.MeshPhongMaterial({
        color: 0x7abf8e,
        specular: 0x000000,
        shininess: 1,
        transparent: true,
        opacity: .5
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

//hero

Dragon = function() {
    this.tailAmplitude = 3;
    this.tailAngle = 0;
    this.tailSpeed = .07;
  
    this.wingAmplitude = Math.PI / 8;
    this.wingAngle = 0;
    this.wingSpeed = 0.1
    this.isSneezing = false;
  
    this.threegroup = new THREE.Group(); // this is a sort of container that will hold all the meshes and will be added to the scene;
  
    // Materials
    var greenMat = new THREE.MeshLambertMaterial({
      color: 0x5da683,
      shading: THREE.FlatShading
    });
    var lightGreenMat = new THREE.MeshLambertMaterial({
      color: 0x95c088,
      shading: THREE.FlatShading
    });
  
    var yellowMat = new THREE.MeshLambertMaterial({
      color: 0xfdde8c,
      shading: THREE.FlatShading
    });
  
    var redMat = new THREE.MeshLambertMaterial({
      color: 0xcb3e4c,
      shading: THREE.FlatShading
    });
  
    var whiteMat = new THREE.MeshLambertMaterial({
      color: 0xfaf3d7,
      shading: THREE.FlatShading
    });
  
    var brownMat = new THREE.MeshLambertMaterial({
      color: 0x874a5c,
      shading: THREE.FlatShading
    });
  
    var blackMat = new THREE.MeshLambertMaterial({
      color: 0x403133,
      shading: THREE.FlatShading
    });
    var pinkMat = new THREE.MeshLambertMaterial({
      color: 0xd0838e,
      shading: THREE.FlatShading
    });
  
    // body
    this.body = new THREE.Group();
    this.belly = makeCube(greenMat, 30, 30, 40, 0, 0, 0, 0, 0, Math.PI / 4);
  
    // Wings
    this.wingL = makeCube(yellowMat, 5, 30, 20, 15, 15, 0, -Math.PI / 4, 0, -Math.PI / 4);
    this.wingL.geometry.applyMatrix(new THREE.Matrix4().makeTranslation(0, 15, 10));
    this.wingR = this.wingL.clone();
    this.wingR.position.x = -this.wingL.position.x;
    this.wingR.rotation.z = -this.wingL.rotation.z;
  
    // pike body
    var pikeBodyGeom = new THREE.CylinderGeometry(0, 10, 10, 4, 1);
    this.pikeBody1 = new THREE.Mesh(pikeBodyGeom, greenMat);
    this.pikeBody1.scale.set(.2, 1, 1);
    this.pikeBody1.position.z = 10;
    this.pikeBody1.position.y = 26;
  
    this.pikeBody2 = this.pikeBody1.clone();
    this.pikeBody2.position.z = 0
    this.pikeBody3 = this.pikeBody1.clone();
    this.pikeBody3.position.z = -10;
  
    // tail
    this.tail = new THREE.Group();
    this.tail.position.z = -20;
    this.tail.position.y = 10;
  
    var tailMat = new THREE.LineBasicMaterial({
      color: 0x5da683,
      linewidth: 5
    });
  
    var tailGeom = new THREE.Geometry();
    tailGeom.vertices.push(
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0, 5, -10),
      new THREE.Vector3(0, -5, -20),
      new THREE.Vector3(0, 0, -30)
    );
  
    this.tailLine = new THREE.Line(tailGeom, tailMat);
  
    // pike
    var pikeGeom = new THREE.CylinderGeometry(0, 10, 10, 4, 1);
    pikeGeom.applyMatrix(new THREE.Matrix4().makeRotationX(-Math.PI / 2));
    this.tailPike = new THREE.Mesh(pikeGeom, yellowMat);
    this.tailPike.scale.set(.2, 1, 1);
    this.tailPike.position.z = -35;
    this.tailPike.position.y = 0;
  
    this.tail.add(this.tailLine);
    this.tail.add(this.tailPike);
  
    this.body.add(this.belly);
    this.body.add(this.wingL);
    this.body.add(this.wingR);
    this.body.add(this.tail);
    this.body.add(this.pikeBody1);
    this.body.add(this.pikeBody2);
    this.body.add(this.pikeBody3);
  
    // head
    this.head = new THREE.Group();
  
    // head face
    this.face = makeCube(greenMat, 60, 50, 80, 0, 25, 40, 0, 0, 0);
    
    
    // head horn
    var hornGeom = new THREE.CylinderGeometry(0, 6, 10, 4, 1);
    this.hornL = new THREE.Mesh(hornGeom, yellowMat);
    this.hornL.position.y = 55;
    this.hornL.position.z = 10;
    this.hornL.position.x = 10;
  
    this.hornR = this.hornL.clone();
    this.hornR.position.x = -10;
  
    // head ears
    this.earL = makeCube(greenMat, 5, 10, 20, 32, 42, 2, 0, 0, 0);
    this.earL.geometry.applyMatrix(new THREE.Matrix4().makeTranslation(0, 5, -10));
    this.earL.geometry.applyMatrix(new THREE.Matrix4().makeRotationX(Math.PI / 4));
    this.earL.geometry.applyMatrix(new THREE.Matrix4().makeRotationY(-Math.PI / 4));
  
    this.earR = makeCube(greenMat, 5, 10, 20, -32, 42, 2, 0, 0, 0);
    this.earR.geometry.applyMatrix(new THREE.Matrix4().makeTranslation(0, 5, -10));
    this.earR.geometry.applyMatrix(new THREE.Matrix4().makeRotationX(Math.PI / 4));
    this.earR.geometry.applyMatrix(new THREE.Matrix4().makeRotationY(Math.PI / 4));
  
    // head mouth
    this.mouth = new THREE.Group();
    this.mouth.position.z = 50;
    this.mouth.position.y = 3;
    this.mouth.rotation.x = 0//Math.PI / 8;
  
    // head mouth jaw
    this.jaw = makeCube(greenMat, 30, 10, 30, 0, -5, 15, 0, 0, 0);
    this.mouth.add(this.jaw);
  
    // head mouth tongue
    this.tongue = makeCube(redMat, 20, 10, 20, 0, -3, 15, 0, 0, 0);
    this.mouth.add(this.tongue);
    
    // head smile
    var smileGeom = new THREE.TorusGeometry( 6, 2, 2, 10, Math.PI );
    this.smile = new THREE.Mesh(smileGeom, blackMat);
    this.smile.position.z = 82;  
    this.smile.position.y = 5;
    this.smile.rotation.z = -Math.PI;
    
  
    // head cheek
    this.cheekL = makeCube(lightGreenMat, 4, 20, 20, 30, 18, 55, 0, 0, 0);
    this.cheekR = this.cheekL.clone();
    this.cheekR.position.x = -this.cheekL.position.x;
    
    //head spots
    this.spot1 = makeCube(lightGreenMat, 2, 2, 2, 20, 16, 80, 0, 0, 0);
    
    this.spot2 = this.spot1.clone();
    this.spot2.position.x = 15;
    this.spot2.position.y = 14;
    
    this.spot3 = this.spot1.clone();
    this.spot3.position.x = 16;
    this.spot3.position.y = 20;
    
    this.spot4 = this.spot1.clone();
    this.spot4.position.x = 12;
    this.spot4.position.y = 18;
    
      
    this.spot5 = this.spot1.clone();
    this.spot5.position.x = -15;
    this.spot5.position.y = 14;
    
    this.spot6 = this.spot1.clone();
    this.spot6.position.x = -14;
    this.spot6.position.y = 20;
    
    this.spot7 = this.spot1.clone();
    this.spot7.position.x = -19;
    this.spot7.position.y = 17;
    
    this.spot8 = this.spot1.clone();
    this.spot8.position.x = -11;
    this.spot8.position.y = 17;
    
    
    // head eye
    this.eyeL = makeCube(whiteMat, 10, 22, 22, 27, 34, 18, 0, 0, 0);
    this.eyeR = this.eyeL.clone();
    this.eyeR.position.x = -27;
  
    // head iris
    this.irisL = makeCube(brownMat, 10, 12, 12, 28, 30, 24, 0, 0, 0);
    this.irisR = this.irisL.clone();
    this.irisR.position.x = -this.irisL.position.x;
  
    // head nose
    this.noseL = makeCube(blackMat, 5, 5, 8, 5, 40, 77, 0, 0, 0);
    this.noseR = this.noseL.clone();
    this.noseR.position.x = -this.noseL.position.x;
  
    this.head.position.z = 30;
    this.head.add(this.face);
    this.head.add(this.hornL);
    this.head.add(this.hornR);
    this.head.add(this.earL);
    this.head.add(this.earR);
    this.head.add(this.mouth);
    this.head.add(this.eyeL);
    this.head.add(this.eyeR);
    this.head.add(this.irisL);
    this.head.add(this.irisR);
    this.head.add(this.noseL);
    this.head.add(this.noseR);
    this.head.add(this.cheekL);
    this.head.add(this.cheekR);
    this.head.add(this.smile);
    /*
    this.head.add(this.spot1);
    this.head.add(this.spot2);
    this.head.add(this.spot3);
    this.head.add(this.spot4);
    this.head.add(this.spot5);
    this.head.add(this.spot6);
    this.head.add(this.spot7);
    this.head.add(this.spot8);
    */
    // legs
    this.legFL = makeCube(greenMat, 20, 10, 20, 20, -30, 15, 0, 0, 0);
    this.legFR = this.legFL.clone();
    this.legFR.position.x = -30;
    this.legBL = this.legFL.clone();
    this.legBL.position.z = -15;
    this.legBR = this.legBL.clone();
    this.legBR.position.x = -30;
  
    this.threegroup.add(this.body);
    this.threegroup.add(this.head);
    this.threegroup.add(this.legFL);
    this.threegroup.add(this.legFR);
    this.threegroup.add(this.legBL);
    this.threegroup.add(this.legBR);
    //this.threegroup.add(this.pike);
  
    this.threegroup.traverse(function(object) {
      if (object instanceof THREE.Mesh) {
        object.castShadow = true;
        object.receiveShadow = true;
      }
    });
  }

function makeCube(mat, w, h, d, posX, posY, posZ, rotX, rotY, rotZ) {
    var geom = new THREE.BoxGeometry(w, h, d);
    var mesh = new THREE.Mesh(geom, mat);
    mesh.position.x = posX;
    mesh.position.y = posY;
    mesh.position.z = posZ;
    mesh.rotation.x = rotX;
    mesh.rotation.y = rotY;
    mesh.rotation.z = rotZ;
    return mesh;
}
  

function createHero() {
    hero = new Dragon();
    hero.threegroup.rotation.y = Math.PI/2;
    hero.threegroup.position.set(0,10,10);
    hero.threegroup.scale.set(0.2,0.2,0.2);
    scene.add(hero.threegroup);
    //hero.nod();
}

function updateFloorRotation(){
    floorRotation += delta*.03 * speed;
    floorRotation = floorRotation%(Math.PI*2);
    floor.rotation.z = floorRotation;
  }

function loop(){
    delta = clock.getDelta();
    updateFloorRotation();
    
   /*  if (gameStatus == "play"){
      
      if (hero.status == "running"){
        hero.run();
      }
      updateDistance();
      updateMonsterPosition();
      updateCarrotPosition();
      updateObstaclePosition();
      checkCollision();
    }  */
    render();  
    requestAnimationFrame(loop);
}

function render() {
    renderer.render(scene, camera);
}

window.addEventListener('load', init, false);

function init() {
    createScene();
    createLights();
    createFloor();
    createFirs();
    createHero();
    loop();
    
}