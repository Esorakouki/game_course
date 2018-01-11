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

var mousePos = { x: 0, y: 0 },
    oldMousePos = {x:0, y: 0},
    ballWallDepth = 28;

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
    document.addEventListener('mousemove', handleMouseMove, false);
    document.addEventListener('mousedown', handleMouseDown, false);
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

function handleMouseMove(event) {
  mousePos = {x:event.clientX, y:event.clientY};
}

function handleMouseDown(event){
  if (gameStatus == "play") ball.jump();
  else if (gameStatus == "readyToReplay"){
    replay();
  }
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

Monster.prototype.run = function(){
  var s = Math.min(speed,maxSpeed);
  this.runningCycle += delta * s * .7;
  this.runningCycle = this.runningCycle % (Math.PI*2);
  var t = this.runningCycle;

  this.pawFR.rotation.x = Math.sin(t)*Math.PI/4;
  this.pawFR.position.y = -5.5 - Math.sin(t);
  this.pawFR.position.z = 7.5 + Math.cos(t);

  this.pawFL.rotation.x = Math.sin(t+.4)*Math.PI/4;
  this.pawFL.position.y = -5.5 - Math.sin(t+.4);
  this.pawFL.position.z = 7.5 + Math.cos(t+.4);

  this.pawBL.rotation.x = Math.sin(t+2)*Math.PI/4;
  this.pawBL.position.y = -5.5 - Math.sin(t+3.8);
  this.pawBL.position.z = -7.5 + Math.cos(t+3.8);

  this.pawBR.rotation.x = Math.sin(t+2.4)*Math.PI/4;
  this.pawBR.position.y = -5.5 - Math.sin(t+3.4);
  this.pawBR.position.z = -7.5 + Math.cos(t+3.4);

  this.torso.rotation.x = Math.sin(t)*Math.PI/8;
  this.torso.position.y = 3-Math.sin(t+Math.PI/2)*3;

  //this.head.position.y = 5-Math.sin(t+Math.PI/2)*2;
  this.head.rotation.x = -.1+Math.sin(-t-1)*.4;
  this.mouth.rotation.x = .2 + Math.sin(t+Math.PI+.3)*.4;

  this.tail.rotation.x = .2 + Math.sin(t-Math.PI/2);

  //this.eyeR.scale.y = .5 + Math.sin(t+Math.PI)*.5;
}

Monster.prototype.sit = function(){
  var sp = 1.2;
  var ease = Power4.easeOut;
  var _this = this;
  TweenMax.to(this.torso.rotation, sp, {x:-1.3, ease:ease});
  TweenMax.to(this.torso.position, sp, {y:-5, ease:ease, onComplete:function(){
    _this.nod();
    gameStatus = "readyToReplay";
  }});
  
  TweenMax.to(this.head.rotation, sp, {x:Math.PI/3, y :-Math.PI/3, ease:ease});
  TweenMax.to(this.tail.rotation, sp, {x:2, y:Math.PI/4, ease:ease});
  TweenMax.to(this.pawBL.rotation, sp, {x:-.1, ease:ease});
  TweenMax.to(this.pawBR.rotation, sp, {x:-.1, ease:ease});
  TweenMax.to(this.pawFL.rotation, sp, {x:1, ease:ease});
  TweenMax.to(this.pawFR.rotation, sp, {x:1, ease:ease});
  TweenMax.to(this.mouth.rotation, sp, {x:.3, ease:ease});
  TweenMax.to(this.eyeL.scale, sp, {y:1, ease:ease});
  TweenMax.to(this.eyeR.scale, sp, {y:1, ease:ease});
  
  //TweenMax.to(this.body.rotation, sp, {y:Math.PI/4});
  
}

function createCat() {
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
  cat = new Monster();
  cat.mesh.scale.set(0.4,0.4,0.4);
  cat.mesh.position.z = 50;
  scene.add(cat.mesh);
  updateCatPosition();
}

function updateCatPosition() {
  cat.run();
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
    hero.mesh.position.z = 20;
    scene.add(hero.mesh);
}

function createBall() {
  ball = new Ball();
  ball.threeGroup.scale.set(0.4,0.4,0.4);
  ball.threeGroup.position.set(10,6,50);
  scene.add(ball.threeGroup);
}
  
  // BALL RELATED CODE
  
  
var woolNodes = 10,
    woolSegLength = 2,
    gravity = -.8,
    accuracy =1;


Ball = function(){
  this.status = "running";
  this.runningCycle = 0;

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
      woolV.z = 50;
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

  //this.threeGroup.add(this.string);
  this.threeGroup.add(this.body);

  this.threeGroup.traverse( function ( object ) {
  if ( object instanceof THREE.Mesh ) {
    object.castShadow = true;
    object.receiveShadow = true;
  }});
}

Ball.prototype.run = function() {
  var s = Math.min(speed,maxSpeed);
  
  this.runningCycle += delta * s * .7;
  this.runningCycle = this.runningCycle % (Math.PI*2);
  var t = this.runningCycle;
  //this.body.rotateZ(Math.sin(t) * Math.PI/4);
  this.body.rotation.z += .1;
}

Ball.prototype.jump = function(){
  if (this.status == "jumping") return;
  this.status = "jumping";
  var _this = this;
  var totalSpeed = 10 / speed;
  var jumpHeight = 45;
  
  //TweenMax.to(this.earL.rotation, totalSpeed, {x:"+=.3", ease:Back.easeOut});
  //TweenMax.to(this.earR.rotation, totalSpeed, {x:"-=.3", ease:Back.easeOut});
  
  //TweenMax.to(this.pawFL.rotation, totalSpeed, {x:"+=.7", ease:Back.easeOut});
  //TweenMax.to(this.pawFR.rotation, totalSpeed, {x:"-=.7", ease:Back.easeOut});
  //TweenMax.to(this.pawBL.rotation, totalSpeed, {x:"+=.7", ease:Back.easeOut});
  //TweenMax.to(this.pawBR.rotation, totalSpeed, {x:"-=.7", ease:Back.easeOut});
  
  //TweenMax.to(this.tail.rotation, totalSpeed, {x:"+=1", ease:Back.easeOut});
  
  //TweenMax.to(this.mouth.rotation, totalSpeed, {x:.5, ease:Back.easeOut});
  
  TweenMax.to(this.threeGroup.position, totalSpeed/2, {y:jumpHeight, ease:Power2.easeOut});
  TweenMax.to(this.threeGroup.position, totalSpeed/2, {y:6, ease:Power4.easeIn, delay:totalSpeed/2, onComplete: function(){
    //t = 0;
    _this.status="running";
  }});
  
}

WoolVert = function(){
	this.x = 0;
	this.y = 0;
	this.z = 50;
	this.oldx = 0;
	this.oldy = 0;
	this.fx = 0;
	this.fy = 0;
	this.isRootNode = false;
	this.constraints = [];
	this.vertex = null;
}


WoolVert.prototype.update = function(){
	var wind = 0;//.1+Math.random()*.5;
  	this.add_force(wind, gravity);

  	nx = this.x + ((this.x - this.oldx)*.9) + this.fx;
  	ny = this.y + ((this.y - this.oldy)*.9) + this.fy;
  	this.oldx = this.x;
  	this.oldy = this.y;
  	this.x = nx;
  	this.y = ny;

  	this.vertex.x = this.x;
  	this.vertex.y = this.y;
  	this.vertex.z = this.z;

  	this.fy = this.fx = 0
}

WoolVert.prototype.attach = function(point) {
  this.constraints.push(new Constraint(this, point));
};

WoolVert.prototype.add_force = function(x, y) {
  this.fx += x;
  this.fy += y;
};

Constraint = function(p1, p2) {
  this.p1 = p1;
  this.p2 = p2;
  this.length = woolSegLength;
};

Wool = function() {
  this.angle = 0;
  var redMat = new THREE.MeshLambertMaterial ({
    color: 0x630d15, 
    shading:THREE.FlatShading
});

this.threeGroup = new THREE.Group();
this.ballRay = 8;

// body
var bodyGeom = new THREE.SphereGeometry(this.ballRay, 5,4);
this.body = new THREE.Mesh(bodyGeom, redMat);
this.body.position.y = -woolSegLength*woolNodes;

var wireGeom = new THREE.TorusGeometry( this.ballRay, .5, 3, 10, Math.PI*2 );
this.wire1 = new THREE.Mesh(wireGeom, redMat);
this.wire1.position.x = 1;
this.wire1.rotation.x = -Math.PI/4;

this.wire2 = this.wire1.clone();
this.wire2.position.y = 13;
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

//this.threeGroup.add(this.body);
this.threeGroup.add(this.wire1);
this.threeGroup.add(this.wire2);
this.threeGroup.add(this.wire3);
this.threeGroup.add(this.wire4);
this.threeGroup.add(this.wire5);
this.threeGroup.add(this.wire6);
this.threeGroup.add(this.wire7);
this.threeGroup.add(this.wire8);
this.threeGroup.add(this.wire9);

this.threeGroup.traverse( function ( object ) {
if ( object instanceof THREE.Mesh ) {
  object.castShadow = true;
  object.receiveShadow = true;
}});
}

function createWool(){
  wool = new Wool();
  scene.add(wool.threeGroup);
  wool.threeGroup.scale.set(0.4,0.4,0.4)
  wool.threeGroup.position.set(40,12,50);
}

BonusParticles = function(){
  this.mesh = new THREE.Group();
  var bigParticleGeom = new THREE.CubeGeometry(10,10,10,1);
  var smallParticleGeom = new THREE.CubeGeometry(5,5,5,1);
  this.parts = [];
  for (var i=0; i<10; i++){
    var partPink = new THREE.Mesh(bigParticleGeom, pinkMat);
    var partGreen = new THREE.Mesh(smallParticleGeom, greenMat);
    partGreen.scale.set(.5,.5,.5);
    this.parts.push(partPink);
    this.parts.push(partGreen);
    this.mesh.add(partPink);
    this.mesh.add(partGreen);
  }
}

BonusParticles.prototype.explose = function(){
  var _this = this;
  var explosionSpeed = .5;
  for(var i=0; i<this.parts.length; i++){
    var tx = -50 + Math.random()*100;
    var ty = -50 + Math.random()*100;
    var tz = -50 + Math.random()*100;
    var p = this.parts[i];
    p.position.set(0,0,0);
    p.scale.set(1,1,1);
    p.visible = true;
    var s = explosionSpeed + Math.random()*.5;
    TweenMax.to(p.position, s,{x:tx, y:ty, z:tz, ease:Power4.easeOut});
    TweenMax.to(p.scale, s,{x:.01, y:.01, z:.01, ease:Power4.easeOut, onComplete:removeParticle, onCompleteParams:[p]});
  }
}

function removeParticle(p){
  p.visible = false;
}

function updateFloorRotation(){
    floorRotation += delta*.03 * speed;
    floorRotation = floorRotation%(Math.PI*2);
    floor.rotation.z = floorRotation;
  }

function updateDistance() {
  distance += delta * speed;
  var d = distance / 2;
  //fieldDistance.inn
}

function loop(){
    delta = clock.getDelta();
    updateFloorRotation();
    //hero.run();
    
    if (gameStatus == "play"){
      
      if (ball.status == "running"){
        ball.run();
      }

      //ball.run();
      updateDistance();
      updateCatPosition();
      //updateCarrotPosition();
      //updateObstaclePosition();
      //checkCollision();
    } 
    render();
    //var ballPos = getBallPos();
    //var ballPos = {x: 0, y:0, z: 75};
    //ball.update(ballPos.x,ballPos.y , ballPos.z + 75);
    //ball.receivePower(hero.transferPower);
    //hero.interactWithBall(ball.body.position);  
    requestAnimationFrame(loop);
}

function render() {
    renderer.render(scene, camera);
}

window.addEventListener('load', init, false);

function init() {
    gameStatus = 'play';
    createScene();
    createLights();
    createFloor();
    createFirs();
    createCat();
    createBall();
    createWool();
    loop();
    
}

function resetGame(){
  scene.add(hero.mesh);
  hero.mesh.rotation.y = Math.PI/2;
  hero.mesh.position.y = 0;
  hero.mesh.position.z = 0;
  hero.mesh.position.x = 0;

  monsterPos = .56;
  monsterPosTarget = .65;
  speed = initSpeed;
  level = 0;
  distance = 0;
  carrot.mesh.visible = true;
  obstacle.mesh.visible = true;
  gameStatus = "play";
  hero.status = "running";
  hero.nod();
  audio.play();
  updateLevel();
  levelInterval = setInterval(updateLevel, levelUpdateFreq);
}

function initUI(){
  fieldDistance = document.getElementById("distValue");
  fieldGameOver = document.getElementById("gameoverInstructions");
  
}