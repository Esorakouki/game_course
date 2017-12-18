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
  
Monster = function(){
  
  this.runningCycle = 0;
  
  this.mesh = new THREE.Group();
  this.body = new THREE.Group();

  var yellowMat = new THREE.MeshLambertMaterial ({
    color: 0xfdd276, 
    shading:THREE.FlatShading
  });

  var pinkMat = new THREE.MeshLambertMaterial ({
    color: 0xe0877e,//0xe0a79f, 
    shading:THREE.FlatShading
  });

  var redMat = new THREE.MeshLambertMaterial ({
    color: 0x630d15, 
    shading:THREE.FlatShading
  });

  var whiteMat = new THREE.MeshLambertMaterial ({
    color: 0xffffff, 
    shading:THREE.FlatShading
  });

  var blackMat = new THREE.MeshLambertMaterial ({
    color: 0x111111, 
    shading:THREE.FlatShading
  });
  var brownMat = new THREE.MeshLambertMaterial ({
    color: 0x2e2019,//0x4b342a, 
    shading:THREE.FlatShading
  });

  var lightBrownMat = new THREE.MeshLambertMaterial ({
    color: 0x664f4a, 
    shading:THREE.FlatShading
  });

  this.handHeight = 10;
  this.bodyHeight = 80;
  this.armHeight = ((this.bodyHeight * 3/5) - this.handHeight)/2 ;
  this.faceHeight = 30;
  this.shouldersPosition = new THREE.Vector3(0,this.armHeight*2 + this.handHeight, 0);
  this.isAttacking = false;
  this.isFootReplacing = false;
  this.isBlinking = false;
  this.footUsed = "left";
  this.transferPower = {x:0,y:0};

  var torsoGeom = new THREE.CubeGeometry(20,20,30, 1);
  this.torso = new THREE.Mesh(torsoGeom, brownMat);
  
  // head
  this.head = new THREE.Group();
  
  var faceGeom = new THREE.BoxGeometry(30,this.faceHeight,30);
  this.face = new THREE.Mesh(faceGeom,brownMat);
  this.face.geometry.applyMatrix(new THREE.Matrix4().makeTranslation(0,this.faceHeight/2,0));
  this.face.geometry.applyMatrix(new THREE.Matrix4().makeRotationY(Math.PI/4));

  var whiskerGeom = new THREE.BoxGeometry(16, .2,.2);
  
    this.whisker1 = new THREE.Mesh(whiskerGeom, lightBrownMat);
    this.whisker1.geometry.applyMatrix(new THREE.Matrix4().makeTranslation(-7,0,0));
    this.whisker1.position.set(-6,8,18);
    this.whisker1.rotation.z = Math.PI/12;
  
    this.whisker2 = this.whisker1.clone();
    this.whisker2.position.y = 6;
    
    this.whisker3 = this.whisker1.clone();
    this.whisker3.position.y = 4;
  
    this.whisker4 = this.whisker1.clone();
    this.whisker4.rotation.z = Math.PI - Math.PI/12;
    this.whisker4.position.x = -this.whisker1.position.x;
  
    this.whisker5 = this.whisker4.clone();
    this.whisker5.position.y = this.whisker2.position.y;
  
    this.whisker6 = this.whisker4.clone();
    this.whisker6.position.y = this.whisker3.position.y;
  
    this.head.add(this.whisker1);
    this.head.add(this.whisker2);
    this.head.add(this.whisker3);
    this.head.add(this.whisker4);
    this.head.add(this.whisker5);
    this.head.add(this.whisker6);
  
    // ears
    var rightEarGeom = new THREE.CylinderGeometry(0,8, 8, 3,1);
    rightEarGeom.applyMatrix(new THREE.Matrix4().makeTranslation(0,4,0));
    var leftEarGeom = rightEarGeom.clone();
  
    rightEarGeom.applyMatrix(new THREE.Matrix4().makeRotationY(1));
    rightEarGeom.applyMatrix(new THREE.Matrix4().makeScale(1,1,.7));
  
    leftEarGeom.applyMatrix(new THREE.Matrix4().makeRotationY(-1));
    leftEarGeom.applyMatrix(new THREE.Matrix4().makeScale(1,1,.7));
    
    
    
    var skewMatrixRightEar = new THREE.Matrix4().set(   1,    0.0,     0.0,    0,
                                                        0,    1,        0,    0,
                                                        -0.5,    0.0,     1,    0,
                                                        0,    0,        0,    1 );
  
    
    var skewMatrixLeftEar = new THREE.Matrix4().set(    1,    -.5,     0,    0,
                                                        0,    1,        0,    0,
                                                        0,    0.0,     1,    0,
                                                        0,    0,        0,    1 );
  
    this.rightEar = new THREE.Mesh(rightEarGeom, brownMat);
    this.rightEar.position.y = this.faceHeight;
    this.rightEar.position.x = -14;
    this.rightEar.position.z = -1.7;  
    
    this.leftEar = new THREE.Mesh(leftEarGeom, brownMat);
    this.leftEar.position.x = -this.rightEar.position.x;
    this.leftEar.position.z = this.rightEar.position.z;
    this.leftEar.position.y = this.rightEar.position.y;
  
  
    var rightEarInsideGeom = rightEarGeom.clone();
    rightEarInsideGeom.applyMatrix(new THREE.Matrix4().makeScale(.5, .5, .5));
    this.rightEarInside = new THREE.Mesh(rightEarInsideGeom, pinkMat);
    this.rightEarInside.position.y = .5;
    this.rightEarInside.position.x = 1;
    this.rightEarInside.position.z = 2;
  
    this.rightEar.add(this.rightEarInside);
  
    var LeftEarInsideGeom = leftEarGeom.clone();
    LeftEarInsideGeom.applyMatrix(new THREE.Matrix4().makeScale(.5, .5, .5));
    this.leftEarInside = new THREE.Mesh(LeftEarInsideGeom, pinkMat);
    this.leftEarInside.position.y = .5;
    this.leftEarInside.position.x = -1;
    this.leftEarInside.position.z = 2;
  
    this.leftEar.add(this.leftEarInside);
  
    // Eyes
    var eyeGeom = new THREE.BoxGeometry(12,12, 1);
    this.rightEye = new THREE.Mesh(eyeGeom, whiteMat);
    this.rightEye.position.set(-12,20, 10);
    this.rightEye.rotation.y = -Math.PI/4;
  
    this.leftEye = this.rightEye.clone();
    this.leftEye.position.x = -this.rightEye.position.x;
    this.leftEye.rotation.y = Math.PI/4;
  
    // Iris
    var irisGeom = new THREE.BoxGeometry(4,4,2);
    this.rightIris = new THREE.Mesh(irisGeom, brownMat);
    this.rightIris.position.x = 2;
    this.rightIris.position.y = -2;
    this.rightIris.position.z = .5;
  
    this.leftIris = this.rightIris.clone();
    this.leftIris.position.x = -this.rightIris.position.x;
  
    this.rightEye.add(this.rightIris);
    this.leftEye.add(this.leftIris);
  
    // nose
    var noseGeom = new THREE.CylinderGeometry(3,0,4,4)
    noseGeom.applyMatrix(new THREE.Matrix4().makeTranslation(0,-2,-4));
  
    var skewMatrixNose = new THREE.Matrix4().set(   1,    0,     0,    0,
                                                    0,    1,     0,    0,
                                                    0,    -.7,     1,    1.4,
                                                    0,    0,     0,    1 );
  
    noseGeom.applyMatrix(skewMatrixNose);
    this.nose = new THREE.Mesh(noseGeom, pinkMat);
    this.nose.position.z = 24;
    this.nose.position.y =14.1;
  
  
    // cheeks
    var cheeksGeom = new THREE.CylinderGeometry(8,8,14,4);
    cheeksGeom.applyMatrix(new THREE.Matrix4().makeScale(1,1,1.4));
    this.cheeks = new THREE.Mesh(cheeksGeom, brownMat);
    this.cheeks.position.set(0, 7, 13 );
  
    // mouth
    var mouthGeom = cheeksGeom.clone();//new THREE.BoxGeometry(4,2,4);
    mouthGeom.applyMatrix(new THREE.Matrix4().makeTranslation(0,-4,0));
    mouthGeom.applyMatrix(new THREE.Matrix4().makeScale(.5,.2,.5));
    this.mouth = new THREE.Mesh(mouthGeom, brownMat);
    
  
    // tongue
    var tongueGeom = mouthGeom.clone();
    tongueGeom.applyMatrix(new THREE.Matrix4().makeScale(.8,1,.8));
    this.tongue = new THREE.Mesh(tongueGeom, pinkMat);
    this.tongue.position.set(0, .5, 0); 
    this.mouth.add(this.tongue);
  
    this.mouth.rotation.x = Math.PI/4;
    this.mouth.position.set(0, 1.5, 18); 
  
    
    this.head.add(this.face);
    this.head.add(this.rightEar);
    this.head.add(this.leftEar);
    this.head.add(this.rightEye);
    this.head.add(this.leftEye);
    this.head.add(this.nose);
    this.head.add(this.cheeks);
    this.head.add(this.mouth);
    
    this.head.position.x = 0;
    this.head.position.y = this.bodyHeight-15 -60;
    this.head.position.z = 35;
  
  /* var headGeom = new THREE.CubeGeometry(20,20,40, 1);
  headGeom.applyMatrix(new THREE.Matrix4().makeTranslation(0,0,20));
  this.head = new THREE.Mesh(headGeom, blackMat);
  this.head.position.z = 12;
  this.head.position.y = 2;
  
  var mouthGeom = new THREE.CubeGeometry(10,4,20, 1);
  mouthGeom.applyMatrix(new THREE.Matrix4().makeTranslation(0,-2,10));
  this.mouth = new THREE.Mesh(mouthGeom, blackMat);
  this.mouth.position.y = -8;
  this.mouth.rotation.x = .4;
  this.mouth.position.z = 4;
  
  this.heroHolder = new THREE.Group();
  this.heroHolder.position.z = 20;
  this.mouth.add(this.heroHolder);
  
  var toothGeom = new THREE.CubeGeometry(2,2,1,1);
  
  toothGeom.vertices[1].x-=1;
  toothGeom.vertices[4].x+=1;
  toothGeom.vertices[5].x+=1;
  toothGeom.vertices[0].x-=1;
  
  for(var i=0; i<3; i++){
    var toothf = new THREE.Mesh(toothGeom, whiteMat);
    toothf.position.x = -2.8 + i*2.5;
    toothf.position.y = 1;
    toothf.position.z = 19;
    
    var toothl = new THREE.Mesh(toothGeom, whiteMat);
    toothl.rotation.y = Math.PI/2;
    toothl.position.z = 12 + i*2.5;
    toothl.position.y = 1;
    toothl.position.x = 4;
    
    var toothr = toothl.clone();
    toothl.position.x = -4;
    
    this.mouth.add(toothf);
    this.mouth.add(toothl);
    this.mouth.add(toothr);
  }
  
  var tongueGeometry = new THREE.CubeGeometry(6,1,14);
  tongueGeometry.applyMatrix(new THREE.Matrix4().makeTranslation(0,0,7));
  
  this.tongue = new THREE.Mesh(tongueGeometry, pinkMat);
  this.tongue.position.z = 2;
  this.tongue.rotation.x = -.2;
  this.mouth.add(this.tongue);
  
  var noseGeom = new THREE.CubeGeometry(4,4,4, 1);
  this.nose = new THREE.Mesh(noseGeom, pinkMat);
  this.nose.position.z = 39.5;
  this.nose.position.y = 9;
  this.head.add(this.nose);
  
  this.head.add(this.mouth);
  
  var eyeGeom = new THREE.CubeGeometry(2,3,3);
  
  this.eyeL = new THREE.Mesh(eyeGeom, whiteMat);
  this.eyeL.position.x = 10;
  this.eyeL.position.z = 5;
  this.eyeL.position.y = 5;
  this.eyeL.castShadow = true;
  this.head.add(this.eyeL);
  
  var irisGeom = new THREE.CubeGeometry(.6,1,1);
  
  this.iris = new THREE.Mesh(irisGeom, blackMat);
  this.iris.position.x = 1.2;
  this.iris.position.y = -1;
  this.iris.position.z = 1;
  this.eyeL.add(this.iris);
  
  this.eyeR = this.eyeL.clone();
  this.eyeR.children[0].position.x = -this.iris.position.x;
  this.eyeR.position.x = -this.eyeL.position.x;
  this.head.add(this.eyeR);
  
  
  var earGeom = new THREE.CubeGeometry(8, 6, 2, 1);
  earGeom.vertices[1].x-=4;
  earGeom.vertices[4].x+=4;
  earGeom.vertices[5].x+=4;
  earGeom.vertices[5].z-=2;
  earGeom.vertices[0].x-=4;
  earGeom.vertices[0].z-=2;

 
  earGeom.applyMatrix(new THREE.Matrix4().makeTranslation(0,3,0));
  
  this.earL = new THREE.Mesh(earGeom, blackMat);
  this.earL.position.x = 6;
  this.earL.position.z = 1;
  this.earL.position.y = 10;
  this.earL.castShadow = true;
  this.head.add(this.earL);
  
  this.earR = this.earL.clone();
  this.earR.position.x = -this.earL.position.x;
  this.earR.rotation.z = -this.earL.rotation.z;
  this.head.add(this.earR);
  
  var eyeGeom = new THREE.CubeGeometry(2,4,4); */
  
  var tailGeom = new THREE.CylinderGeometry(7, 3, 30, 4, 1);
  tailGeom.applyMatrix(new THREE.Matrix4().makeTranslation(0,10,0));
  tailGeom.applyMatrix(new THREE.Matrix4().makeRotationX(-Math.PI/2));
  tailGeom.applyMatrix(new THREE.Matrix4().makeRotationZ(Math.PI/4));
  
  this.tail = new THREE.Mesh(tailGeom, brownMat);
  this.tail.position.z = -10;
  this.tail.position.y = 4;
  this.torso.add(this.tail);
  
  
  var pawGeom = new THREE.CylinderGeometry(3,0,20);
  pawGeom.applyMatrix(new THREE.Matrix4().makeTranslation(0,-5,0));
  this.pawFL = new THREE.Mesh(pawGeom, brownMat);
  this.pawFL.position.y = -7.5;
  this.pawFL.position.z = 8.5;
  this.pawFL.position.x = 5.5;
  this.torso.add(this.pawFL);
  
  this.pawFR = this.pawFL.clone();
  this.pawFR.position.x = - this.pawFL.position.x;
  this.torso.add(this.pawFR);
  
  this.pawBR = this.pawFR.clone();
  this.pawBR.position.z = - this.pawFL.position.z;
  this.torso.add(this.pawBR);
  
  this.pawBL = this.pawBR.clone();
  this.pawBL.position.x = this.pawFL.position.x;
  this.torso.add(this.pawBL);
  
  this.mesh.add(this.body);
  this.torso.add(this.head);
  this.body.add(this.torso);
  
  this.torso.castShadow = true;
  this.head.castShadow = true;
  this.pawFL.castShadow = true;
  this.pawFR.castShadow = true;
  this.pawBL.castShadow = true;
  this.pawBR.castShadow = true;
  
  this.body.rotation.y = Math.PI/2;

  this.mesh.traverse( function ( object ) {
    if ( object instanceof THREE.Mesh ) {
      object.castShadow = true;
      object.receiveShadow = true;
    }
  } );
}

Cat = function(){
    this.threeGroup = new THREE.Group();
    
    var yellowMat = new THREE.MeshLambertMaterial ({
      color: 0xfdd276, 
      shading:THREE.FlatShading
    });
  
    var pinkMat = new THREE.MeshLambertMaterial ({
      color: 0xe0877e,//0xe0a79f, 
      shading:THREE.FlatShading
    });
  
    var redMat = new THREE.MeshLambertMaterial ({
      color: 0x630d15, 
      shading:THREE.FlatShading
    });
  
    var whiteMat = new THREE.MeshLambertMaterial ({
      color: 0xffffff, 
      shading:THREE.FlatShading
    });
  
    var blackMat = new THREE.MeshLambertMaterial ({
      color: 0x111111, 
      shading:THREE.FlatShading
    });
    var brownMat = new THREE.MeshLambertMaterial ({
      color: 0x2e2019,//0x4b342a, 
      shading:THREE.FlatShading
    });
  
    var lightBrownMat = new THREE.MeshLambertMaterial ({
      color: 0x664f4a, 
      shading:THREE.FlatShading
    });
  
    this.handHeight = 10;
    this.bodyHeight = 80;
    this.armHeight = ((this.bodyHeight * 3/5) - this.handHeight)/2 ;
    this.faceHeight = 30;
    this.shouldersPosition = new THREE.Vector3(0,this.armHeight*2 + this.handHeight, 0);
    this.isAttacking = false;
    this.isFootReplacing = false;
    this.isBlinking = false;
    this.footUsed = "left";
    this.transferPower = {x:0,y:0};
    
    
    // body
  
    this.body = new THREE.Group();
  
    // torso
  
    var torsoGeom = new THREE.CubeGeometry(26,26,this.bodyHeight,1);
    //var torsoGeom = new THREE.CylinderGeometry(0, 26 ,this.bodyHeight,3,1);
    this.torso = new THREE.Mesh(torsoGeom,brownMat);
    this.torso.geometry.applyMatrix(new THREE.Matrix4().makeRotationY(Math.PI/3));
    this.torso.geometry.applyMatrix(new THREE.Matrix4().makeTranslation(0,-this.bodyHeight/2,0));
    
    // chest
  
    var chestGeom = new THREE.CylinderGeometry(6,0, 17, 3);
    chestGeom.applyMatrix(new THREE.Matrix4().makeRotationY(Math.PI/3));
    chestGeom.applyMatrix(new THREE.Matrix4().makeScale(1,1,.3));
    this.chest = new THREE.Mesh(chestGeom, whiteMat);
    this.chest.position.set(0,-30,1);
  
    // head
    this.head = new THREE.Group();
  
    var faceGeom = new THREE.BoxGeometry(30,this.faceHeight,30);
    this.face = new THREE.Mesh(faceGeom,brownMat);
    this.face.geometry.applyMatrix(new THREE.Matrix4().makeTranslation(0,this.faceHeight/2,0));
    this.face.geometry.applyMatrix(new THREE.Matrix4().makeRotationY(Math.PI/4));
  
  
    // scarf
    var scarfGeom = new THREE.CylinderGeometry(10,9,9,10, 1);
    this.scarf1 = new THREE.Mesh(scarfGeom, redMat);
    this.scarf1.material.side = THREE.DoubleSide;
    this.scarf1.position.y = -2;
    this.scarf1.position.z = 0;
    this.scarf1.rotation.z = .4;
    this.scarf1.rotation.y = Math.PI/3;
    
    this.scarf2 = this.scarf1.clone();
    this.scarf2.scale.set(.9,.7,.9);
    this.scarf2.position.y = -17;
    this.scarf2.rotation.z = -.2;
  
    var scarfGeom2 = new THREE.BoxGeometry(50,2,10);
    this.scarf3 = new THREE.Mesh(scarfGeom2, redMat);
    this.scarf3.geometry.applyMatrix(new THREE.Matrix4().makeTranslation(25,0,0));
    this.scarf3.position.set(3,-15,2);
    this.scarf3.rotation.y = 1.2;
    this.scarf3.rotation.z = -1;
  
    
    this.head.add(this.scarf1);
    this.torso.add(this.scarf2);
    this.torso.add(this.scarf3);
    this.torso.add(this.chest);
  
    
    var skewMatrixBody = new THREE.Matrix4();
    skewMatrixBody.set(   1,    0,    0,    0,
                          0,    1,    0,    0,
                          0,    0.20,    1,    0,
                          0,    0,    0,    1  );
    
  
    this.torso.geometry.applyMatrix(skewMatrixBody);
    this.chest.geometry.applyMatrix(skewMatrixBody);
    
  
    this.body.add(this.torso);
    this.body.position.y = this.bodyHeight;
  
    
    // Whiskers
    var whiskerGeom = new THREE.BoxGeometry(16, .2,.2);
  
    this.whisker1 = new THREE.Mesh(whiskerGeom, lightBrownMat);
    this.whisker1.geometry.applyMatrix(new THREE.Matrix4().makeTranslation(-7,0,0));
    this.whisker1.position.set(-6,8,18);
    this.whisker1.rotation.z = Math.PI/12;
  
    this.whisker2 = this.whisker1.clone();
    this.whisker2.position.y = 6;
    
    this.whisker3 = this.whisker1.clone();
    this.whisker3.position.y = 4;
  
    this.whisker4 = this.whisker1.clone();
    this.whisker4.rotation.z = Math.PI - Math.PI/12;
    this.whisker4.position.x = -this.whisker1.position.x;
  
    this.whisker5 = this.whisker4.clone();
    this.whisker5.position.y = this.whisker2.position.y;
  
    this.whisker6 = this.whisker4.clone();
    this.whisker6.position.y = this.whisker3.position.y;
  
    this.head.add(this.whisker1);
    this.head.add(this.whisker2);
    this.head.add(this.whisker3);
    this.head.add(this.whisker4);
    this.head.add(this.whisker5);
    this.head.add(this.whisker6);
  
    // ears
    var rightEarGeom = new THREE.CylinderGeometry(0,8, 8, 3,1);
    rightEarGeom.applyMatrix(new THREE.Matrix4().makeTranslation(0,4,0));
    var leftEarGeom = rightEarGeom.clone();
  
    rightEarGeom.applyMatrix(new THREE.Matrix4().makeRotationY(1));
    rightEarGeom.applyMatrix(new THREE.Matrix4().makeScale(1,1,.7));
  
    leftEarGeom.applyMatrix(new THREE.Matrix4().makeRotationY(-1));
    leftEarGeom.applyMatrix(new THREE.Matrix4().makeScale(1,1,.7));
    
    
    
    var skewMatrixRightEar = new THREE.Matrix4().set(   1,    0.0,     0.0,    0,
                                                        0,    1,        0,    0,
                                                        -0.5,    0.0,     1,    0,
                                                        0,    0,        0,    1 );
  
    
    var skewMatrixLeftEar = new THREE.Matrix4().set(    1,    -.5,     0,    0,
                                                        0,    1,        0,    0,
                                                        0,    0.0,     1,    0,
                                                        0,    0,        0,    1 );
  
    this.rightEar = new THREE.Mesh(rightEarGeom, brownMat);
    this.rightEar.position.y = this.faceHeight;
    this.rightEar.position.x = -14;
    this.rightEar.position.z = -1.7;  
    
    this.leftEar = new THREE.Mesh(leftEarGeom, brownMat);
    this.leftEar.position.x = -this.rightEar.position.x;
    this.leftEar.position.z = this.rightEar.position.z;
    this.leftEar.position.y = this.rightEar.position.y;
  
  
    var rightEarInsideGeom = rightEarGeom.clone();
    rightEarInsideGeom.applyMatrix(new THREE.Matrix4().makeScale(.5, .5, .5));
    this.rightEarInside = new THREE.Mesh(rightEarInsideGeom, pinkMat);
    this.rightEarInside.position.y = .5;
    this.rightEarInside.position.x = 1;
    this.rightEarInside.position.z = 2;
  
    this.rightEar.add(this.rightEarInside);
  
    var LeftEarInsideGeom = leftEarGeom.clone();
    LeftEarInsideGeom.applyMatrix(new THREE.Matrix4().makeScale(.5, .5, .5));
    this.leftEarInside = new THREE.Mesh(LeftEarInsideGeom, pinkMat);
    this.leftEarInside.position.y = .5;
    this.leftEarInside.position.x = -1;
    this.leftEarInside.position.z = 2;
  
    this.leftEar.add(this.leftEarInside);
  
    // Eyes
    var eyeGeom = new THREE.BoxGeometry(12,12, 1);
    this.rightEye = new THREE.Mesh(eyeGeom, whiteMat);
    this.rightEye.position.set(-12,20, 10);
    this.rightEye.rotation.y = -Math.PI/4;
  
    this.leftEye = this.rightEye.clone();
    this.leftEye.position.x = -this.rightEye.position.x;
    this.leftEye.rotation.y = Math.PI/4;
  
    // Iris
    var irisGeom = new THREE.BoxGeometry(4,4,2);
    this.rightIris = new THREE.Mesh(irisGeom, brownMat);
    this.rightIris.position.x = 2;
    this.rightIris.position.y = -2;
    this.rightIris.position.z = .5;
  
    this.leftIris = this.rightIris.clone();
    this.leftIris.position.x = -this.rightIris.position.x;
  
    this.rightEye.add(this.rightIris);
    this.leftEye.add(this.leftIris);
  
    // nose
    var noseGeom = new THREE.CylinderGeometry(3,0,4,4)
    noseGeom.applyMatrix(new THREE.Matrix4().makeTranslation(0,-2,-4));
  
    var skewMatrixNose = new THREE.Matrix4().set(   1,    0,     0,    0,
                                                    0,    1,     0,    0,
                                                    0,    -.7,     1,    1.4,
                                                    0,    0,     0,    1 );
  
    noseGeom.applyMatrix(skewMatrixNose);
    this.nose = new THREE.Mesh(noseGeom, pinkMat);
    this.nose.position.z = 24;
    this.nose.position.y =14.1;
  
  
    // cheeks
    var cheeksGeom = new THREE.CylinderGeometry(8,8,14,4);
    cheeksGeom.applyMatrix(new THREE.Matrix4().makeScale(1,1,1.4));
    this.cheeks = new THREE.Mesh(cheeksGeom, brownMat);
    this.cheeks.position.set(0, 7, 13 );
  
    // mouth
    var mouthGeom = cheeksGeom.clone();//new THREE.BoxGeometry(4,2,4);
    mouthGeom.applyMatrix(new THREE.Matrix4().makeTranslation(0,-4,0));
    mouthGeom.applyMatrix(new THREE.Matrix4().makeScale(.5,.2,.5));
    this.mouth = new THREE.Mesh(mouthGeom, brownMat);
    
  
    // tongue
    var tongueGeom = mouthGeom.clone();
    tongueGeom.applyMatrix(new THREE.Matrix4().makeScale(.8,1,.8));
    this.tongue = new THREE.Mesh(tongueGeom, pinkMat);
    this.tongue.position.set(0, .5, 0); 
    this.mouth.add(this.tongue);
  
    this.mouth.rotation.x = Math.PI/4;
    this.mouth.position.set(0, 1.5, 18); 
  
    
    this.head.add(this.face);
    this.head.add(this.rightEar);
    this.head.add(this.leftEar);
    this.head.add(this.rightEye);
    this.head.add(this.leftEye);
    this.head.add(this.nose);
    this.head.add(this.cheeks);
    this.head.add(this.mouth);
    
    this.head.position.y = this.bodyHeight-15;
    this.head.position.z = -5;
    //this.head.scale.set(0.4,0.4,0.4);
  
  
    // shoulders
    this.rightShoulder = new THREE.Group();
    this.leftShoulder = new THREE.Group();
  
    this.rightShoulder.position.set(-6, this.shouldersPosition.y, 0);
    this.leftShoulder.position.set(6, this.shouldersPosition.y, 0);
  
  
    // arms
    var armGeom = new THREE.CylinderGeometry(4, 6, this.armHeight+5,4);
    armGeom.applyMatrix(new THREE.Matrix4().makeRotationY(Math.PI/4));
    armGeom.applyMatrix(new THREE.Matrix4().makeTranslation(0, -this.armHeight/2, 0));
  
    this.rightArm = new THREE.Mesh(armGeom,brownMat);
    this.rightShoulder.add(this.rightArm);
  
    this.leftArm = this.rightArm.clone();
    this.leftShoulder.add(this.leftArm);
    
    // forearms
  
    var foreArmGeom = new THREE.CylinderGeometry(6, 7, this.armHeight,4);
    foreArmGeom.applyMatrix(new THREE.Matrix4().makeRotationY(Math.PI/4));
    foreArmGeom.applyMatrix(new THREE.Matrix4().makeTranslation(0, -this.armHeight/2, 0));
  
  
    this.rightForeArm = new THREE.Mesh(foreArmGeom,brownMat);
    this.rightForeArm.position.y = -this.armHeight;
    this.rightArm.add(this.rightForeArm);
  
    this.leftForeArm = this.rightForeArm.clone();
    this.leftArm.add(this.leftForeArm);
  
    // foot = front foot
    var footGeom = new THREE.BoxGeometry(10,10,10);
    this.rightFoot = new THREE.Mesh(footGeom, whiteMat);
    this.rightFoot.geometry.applyMatrix(new THREE.Matrix4().makeTranslation(0,0,0));
    this.rightFoot.position.set(0,-this.armHeight-5,0);
    this.rightForeArm.add(this.rightFoot);
    this.leftFoot = this.rightFoot.clone();
    this.leftForeArm.add(this.leftFoot);
  
    //footPad
    var footPadGeom = new THREE.BoxGeometry(8,2,8);
    this.rightFootPad = new THREE.Mesh(footPadGeom, pinkMat);
    this.rightFootPad.position.y = -4.5;
    this.rightFoot.add(this.rightFootPad)
  
    this.leftFootPad = this.rightFootPad.clone();
    this.leftFoot.add(this.leftFootPad)
  
    // knees
    var kneeGeom = new THREE.BoxGeometry(8,30,30);
    kneeGeom.applyMatrix(new THREE.Matrix4().makeTranslation(0,15,0));
    
    this.rightKnee = new THREE.Mesh(kneeGeom, brownMat);
    this.rightKnee.rotation.y = -Math.PI/6;
    this.rightKnee.position.x = -14;
    this.rightKnee.position.z = -12;
  
    this.leftKnee = this.rightKnee.clone();
    this.leftKnee.rotation.y = -this.rightKnee.rotation.y;
    this.leftKnee.position.x = -this.rightKnee.position.x;
  
    // legs = back legs
    var legGeom = new THREE.BoxGeometry(12,6,4);
    this.rightLeg = new THREE.Mesh(legGeom, whiteMat);
    this.rightLeg.position.set(0,3,17);
    this.rightKnee.add(this.rightLeg);
  
    this.leftLeg = this.rightLeg.clone();
    this.leftKnee.add(this.leftLeg);
  
    // tail
  
    this.tail = new THREE.Group();
    this.tail.position.z = -36;
    this.tail.position.y = 5;
  
    var p = this.tail;
    var currentY = 0;
    var curentRot = 0;
    var segHeight = 8;
    var recScale = 1.15;
  
    this.tailNSegs = 8 ;
    this.tailSegements = [];
  
    var tailSegGeom = new THREE.CylinderGeometry(5, 4, segHeight, 4);
    tailSegGeom.applyMatrix(new THREE.Matrix4().makeTranslation(0,segHeight/2,0));
    
    
    for (var i = 0; i<this.tailNSegs ; i++){
      var mat = (i<this.tailNSegs-1)? brownMat : whiteMat;
      var tg = tailSegGeom.clone();
      var s = Math.pow(recScale, i);
      tg.applyMatrix(new THREE.Matrix4().makeScale(s, s, s));
      var t = new THREE.Mesh(tg,mat);
      currentRot = (i==0)? - Math.PI/2 : currentRot/(i*i*i);
      t.position.y = currentY;
      t.rotation.x = currentRot;
      p.add(t);
      p = t;
      currentY = (segHeight-2)*s; 
      currentRot = 
      this.tailSegements.push(t);
    }
  
    // stripes Head
  
    var stripeGeom = new THREE.CylinderGeometry(2,0, 15,4);
    var stripe0 = new THREE.Mesh(stripeGeom, lightBrownMat);
    stripe0.rotation.y = -Math.PI/4;
    stripe0.position.x = -1.5;
    stripe0.position.y = 22;
    stripe0.position.z = 18.5;
  
    var stripe1 = stripe0.clone();
    stripe1.position.x = -stripe0.position.x;
    stripe1.rotation.y = -stripe0.rotation.y;
  
    
  
    var stripeGeom2 = new THREE.BoxGeometry(8,2,10);
    var stripe2 = new THREE.Mesh(stripeGeom2, lightBrownMat);
    stripe2.rotation.y = Math.PI/4;
    stripe2.position.x = 15.6;
    stripe2.position.y = 8;
    stripe2.position.z = -1;
  
    var stripe3 = stripe2.clone();
    stripe3.position.y = 4;
  
    var stripe4 = stripe2.clone();
    stripe4.rotation.y = -Math.PI/4;
    stripe4.position.x = -stripe2.position.x;
  
    var stripe5 = stripe4.clone();
    stripe5.position.y = stripe3.position.y;
  
  
    var stripeGeom3 = new THREE.BoxGeometry(1.6,1,10);
    var stripe6 = new THREE.Mesh(stripeGeom3, lightBrownMat);
    stripe6.position.x = -2.1;
    stripe6.position.z = 15;
    stripe6.position.y = 30;
  
    var stripe7 = stripe6.clone();
    stripe7.position.x = -stripe6.position.x;
  
  
    this.head.add(stripe0);
    this.head.add(stripe1);
    this.head.add(stripe2);
    this.head.add(stripe3);
    this.head.add(stripe4);
    this.head.add(stripe5);
    this.head.add(stripe6);
    this.head.add(stripe7);
  
    
    // stripes Knee
  
    var stripe9 = stripe2.clone();
    //stripe9.scale.y = 2;
    stripe9.rotation.y = 0;
    stripe9.position.y = 16;
    stripe9.position.x = -1;
    stripe9.position.z = 11;
  
    var stripe10 = stripe9.clone();
    stripe10.position.y = 22;
    stripe10.position.x = 1;
  
    var stripe11 = stripe9.clone();
    stripe11.position.y = 28;
  
    this.rightKnee.add(stripe9);
    this.rightKnee.add(stripe10);
    this.rightKnee.add(stripe11);
  
    var stripe12 = stripe9.clone();
    stripe12.position.x = -1;
  
    var stripe13 = stripe12.clone();
    stripe13.position.y = stripe10.position.y;
    stripe13.position.x = 1;
  
    var stripe14 = stripe12.clone();
    stripe14.position.y = stripe11.position.y;
  
    this.leftKnee.add(stripe12);
    this.leftKnee.add(stripe13);
    this.leftKnee.add(stripe14);
  
    this.threeGroup.add(this.body);
    this.threeGroup.add(this.head);
    this.rightShoulder.rotation.x = Math.PI;
    this.leftShoulder.rotation.x = Math.PI;
    this.threeGroup.add(this.rightShoulder);
    this.threeGroup.add(this.leftShoulder);
  
    this.threeGroup.add(this.rightKnee);
    this.threeGroup.add(this.leftKnee);
    this.threeGroup.add(this.tail);
  
    
    this.threeGroup.traverse( function ( object ) {
      if ( object instanceof THREE.Mesh ) {
        object.castShadow = true;
        object.receiveShadow = true;
      }
    } );
}
Monster.prototype.run = function(){
    //this.leftArm.rotation.z = -Math.PI/8;
    //this.leftShoulder.position.x = -100;
    //TweenMax.to(this.leftArm.rotation, speed, {y:-Math.PI/8, ease:Back.easeOut} );
    /* var shoulder,arm, foreArm, foot;
    if (side == "right"){
      shoulder = this.rightShoulder;
      arm = this.rightArm;
      foreArm = this.rightForeArm;
      foot = this.rightFoot;
    }else{
      shoulder = this.leftShoulder;
      arm = this.leftArm;
      foreArm = this.leftForeArm;
      foot = this.leftFoot;
    }
    var ease = ease || Back.easeOut;
  
    var tFootAngle = Math.min (-angles.beta, Math.PI*1.5) ;
  
    TweenMax.to(shoulder.rotation, speed, {y:angles.theta, ease:ease} );
    TweenMax.to(arm.rotation, speed, {x:angles.alpha, ease:ease} );
    TweenMax.to(foreArm.rotation, speed, {x:angles.beta, ease:ease, onComplete:callBack} );
    TweenMax.to(foot.rotation, speed, {x:tFootAngle, ease:ease} ); */
}

function createHero() {
    /* hero = new Dragon();
    hero.threegroup.rotation.y = Math.PI/2;
    hero.threegroup.position.set(0,10,10);
    hero.threegroup.scale.set(0.2,0.2,0.2);
    scene.add(hero.threegroup); */
    //hero.nod();

    /* hero = new Cat();
    hero.threeGroup.rotation.y = Math.PI/2;
    hero.threeGroup.position.set(0,0,-50);
    hero.threeGroup.scale.set(0.2,0.2,0.2);
    scene.add(hero.threeGroup); */
    hero = new Monster();
    hero.mesh.scale.set(0.4,0.4,0.4);
    hero.mesh.position.z = 50;
    scene.add(hero.mesh);
}

function createBall() {
    ball = new Ball();
    ball.threeGroup.scale.set(0.2,0.2,0.2);
    ball.threeGroup.position.set(10,6,0);
    scene.add(ball.threeGroup);
  }
  
  // BALL RELATED CODE
  
  
  var woolNodes = 10,
      woolSegLength = 2,
      gravity = -.8,
      accuracy =1;
  
  
  Ball = function(){
  
      var redMat = new THREE.MeshLambertMaterial ({
          color: 0x630d15, 
          shading:THREE.FlatShading
      });
  
      var stringMat = new THREE.LineBasicMaterial({
          color: 0x630d15,
          linewidth: 3
      });
  
      this.threeGroup = new THREE.Group();
      this.ballRay = 8;
  
      this.verts = [];
  
      // string
      var stringGeom = new THREE.Geometry();
  
      for (var i=0; i< woolNodes; i++	){
          var v = new THREE.Vector3(0, -i*woolSegLength, 0);
          stringGeom.vertices.push(v);
  
          var woolV = new WoolVert();
          woolV.x = woolV.oldx = v.x;
          woolV.y = woolV.oldy = v.y;
          woolV.z = 0;
          woolV.fx = woolV.fy = 0;
          woolV.isRootNode = (i==0);
          woolV.vertex = v;
          if (i > 0) woolV.attach(this.verts[(i - 1)]);
          this.verts.push(woolV);
          
      }
        this.string = new THREE.Line(stringGeom, stringMat);
  
        // body
        var bodyGeom = new THREE.SphereGeometry(this.ballRay, 5,4);
      this.body = new THREE.Mesh(bodyGeom, redMat);
        this.body.position.y = -woolSegLength*woolNodes;
  
        var wireGeom = new THREE.TorusGeometry( this.ballRay, .5, 3, 10, Math.PI*2 );
        this.wire1 = new THREE.Mesh(wireGeom, redMat);
        this.wire1.position.x = 1;
        this.wire1.rotation.x = -Math.PI/4;
  
        this.wire2 = this.wire1.clone();
        this.wire2.position.y = 1;
        this.wire2.position.x = -1;
        this.wire1.rotation.x = -Math.PI/4 + .5;
        this.wire1.rotation.y = -Math.PI/6;
  
        this.wire3 = this.wire1.clone();
        this.wire3.rotation.x = -Math.PI/2 + .3;
  
        this.wire4 = this.wire1.clone();
        this.wire4.position.x = -1;
        this.wire4.rotation.x = -Math.PI/2 + .7;
  
        this.wire5 = this.wire1.clone();
        this.wire5.position.x = 2;
        this.wire5.rotation.x = -Math.PI/2 + 1;
  
        this.wire6 = this.wire1.clone();
        this.wire6.position.x = 2;
        this.wire6.position.z = 1;
        this.wire6.rotation.x = 1;
  
        this.wire7 = this.wire1.clone();
        this.wire7.position.x = 1.5;
        this.wire7.rotation.x = 1.1;
  
        this.wire8 = this.wire1.clone();
        this.wire8.position.x = 1;
        this.wire8.rotation.x = 1.3;
  
        this.wire9 = this.wire1.clone();
        this.wire9.scale.set(1.2,1.1,1.1);
        this.wire9.rotation.z = Math.PI/2;
        this.wire9.rotation.y = Math.PI/2;
        this.wire9.position.y = 1;
        
        this.body.add(this.wire1);
        this.body.add(this.wire2);
        this.body.add(this.wire3);
        this.body.add(this.wire4);
        this.body.add(this.wire5);
        this.body.add(this.wire6);
        this.body.add(this.wire7);
        this.body.add(this.wire8);
        this.body.add(this.wire9);
  
        this.threeGroup.add(this.string);
      this.threeGroup.add(this.body);
  
      this.threeGroup.traverse( function ( object ) {
      if ( object instanceof THREE.Mesh ) {
        object.castShadow = true;
        object.receiveShadow = true;
      }});
  
  }

WoolVert = function(){
	this.x = 0;
	this.y = 0;
	this.z = 0;
	this.oldx = 0;
	this.oldy = 0;
	this.fx = 0;
	this.fy = 0;
	this.isRootNode = false;
	this.constraints = [];
	this.vertex = null;
}

Constraint = function(p1, p2) {
    this.p1 = p1;
    this.p2 = p2;
    this.length = woolSegLength;
  };


WoolVert.prototype.attach = function(point) {
    this.constraints.push(new Constraint(this, point));
  };

function updateFloorRotation(){
    floorRotation += delta*.03 * speed;
    floorRotation = floorRotation%(Math.PI*2);
    floor.rotation.z = floorRotation;
  }

function loop(){
    delta = clock.getDelta();
    updateFloorRotation();
    hero.run();
    
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
    createBall();
    loop();
    
}