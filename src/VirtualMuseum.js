// VirtualMuseum.js
import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls';

const VirtualMuseum = () => {
  const mountRef = useRef(null);

  useEffect(() => {
    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
        75, // FOV
        window.innerWidth / window.innerHeight, // Aspect Ratio
        0.1, // Near clipping plane
        1000 // Far clipping plane
    );

    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    mountRef.current.appendChild(renderer.domElement);

    const controls = new PointerLockControls(camera, document.body);

    // Event listener for locking the pointer and starting controls
    document.addEventListener('click', () => {
        controls.lock();
    }, false);
    
    // Optional: Event listener for unlocking the pointer
    controls.addEventListener('unlock', () => {
        // You can run some logic when the pointer is unlocked if necessary
    });
    

    // Creating planes for the museum
    /*const floorGeometry = new THREE.PlaneGeometry(10, 10);
    const wallGeometry = new THREE.PlaneGeometry(10, 4);

    const floorMaterial = new THREE.MeshStandardMaterial({ color: 0x9e9e9e });
    const wallMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });

    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2; // Rotate the floor to lie flat

    const backWall = new THREE.Mesh(wallGeometry, wallMaterial);
    backWall.position.z = -5;
    backWall.position.y = 2;

    const leftWall = new THREE.Mesh(wallGeometry, wallMaterial);
    leftWall.rotation.y = Math.PI / 2; // Rotate the wall to be perpendicular to the back wall
    leftWall.position.x = -5;
    leftWall.position.y = 2;


    // Add more walls as needed, and then add them to the scene
    scene.add(floor);
    scene.add(backWall);
    scene.add(leftWall);*/
    // ... add other walls and a ceiling
    // First, load the textures using THREE.TextureLoader
    const textureLoader = new THREE.TextureLoader();

    const whiteWallTexture = textureLoader.load('wallTexture.jpg');
    const marbleFloorTexture = textureLoader.load('marbleTexture.jpg');

    // Ensure the textures are repeated correctly on the surfaces
    whiteWallTexture.wrapS = whiteWallTexture.wrapT = THREE.RepeatWrapping;
    marbleFloorTexture.wrapS = marbleFloorTexture.wrapT = THREE.RepeatWrapping;

    // Optionally set the repeat for the textures if they are tiled
    whiteWallTexture.repeat.set(8, 4); // Repeat 4 times on each wall
    marbleFloorTexture.repeat.set(16, 16); // Repeat 4 times on the floor

    // Create materials with these textures
    const wallMaterial = new THREE.MeshStandardMaterial({ map: whiteWallTexture
                                                        , side: THREE.DoubleSide });
    const floorMaterial = new THREE.MeshStandardMaterial({ map: marbleFloorTexture });



    const floorGeometry = new THREE.PlaneGeometry(50,50); 
    //const floorMaterial = new THREE.MeshStandardMaterial({ color: 0x9e9e9e });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2; // Rotate the floor to lie flat
    scene.add(floor);

    // Solid walls layout 
    const wallSegments = [
        // Back wall
        { size: [10, 4], position: [0, 2, -5], rotationY: 0 },
        // Left wall
        { size: [10, 4], position: [-5, 2, 0], rotationY: Math.PI / 2 },
        { size: [10, 4], position: [-5, 2, -10], rotationY: Math.PI / 2 },
        //right wall
        { size: [10, 4], position: [7, 2, 0], rotationY: Math.PI / 2 },    
        // corridor    
        { size: [10, 4], position: [7, 2, -10], rotationY: Math.PI / 2 },      
        { size: [10, 4], position: [5, 2, -10], rotationY: Math.PI / 2 },
        // big room
        { size: [10, 4], position: [0, 2, -15], rotationY: 0 },
        { size: [10, 4], position: [-10, 2, -15], rotationY: 0 },
        { size: [10, 4], position: [-15, 2, -20], rotationY: Math.PI / 2 },
        { size: [10, 4], position: [0, 2, -25], rotationY: 0 },
        { size: [10, 4], position: [-10, 2, -25], rotationY: 0 },
        { size: [10, 4], position: [10, 2, -25], rotationY: 0 },
        { size: [10, 4], position: [20, 2, -25], rotationY: 0 },        
        { size: [10, 4], position: [15, 2, -20], rotationY: Math.PI / 2 },
        { size: [8, 4], position: [11, 2, -15], rotationY: 0 },
    ];
    
    // Hidden passages layout
    const hiddenSegments = [
        { size: [2, 4], position: [0, 2, -5], rotationY: 0 }
    ];
    
    // Function to create a wall mesh
    function createWall(segment) {
        const geometry = new THREE.PlaneGeometry(...segment.size);
        /*const material = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: segment.hidden ? 0 : 1, // Make hidden passages transparent
        });*/
        const wall = new THREE.Mesh(geometry, wallMaterial);
        wall.position.set(...segment.position);
        wall.rotation.y = segment.rotationY;
        wall.userData.isPassage = segment.hidden; // Mark hidden passages
    
        return wall;
    }
    
    // Create and add walls to the scene
    const walls = wallSegments.map(segment => createWall(segment));
    const hiddenPassages = hiddenSegments.map(segment => {
        segment.hidden = true; // Mark as hidden
        return createWall(segment);
    });
    
    // Then add these to the scene
    walls.forEach(wall => scene.add(wall));
    hiddenPassages.forEach(passage => scene.add(passage));
  
    

    // Initialize a raycaster and a collision vector
    const raycaster = new THREE.Raycaster();
    const collisionVector = new THREE.Vector3();

    const loader = new THREE.TextureLoader();

    loader.load('dali1.jpg', function (texture) {
        const artworkGeometry = new THREE.PlaneGeometry(2, 2);
        const artworkMaterial = new THREE.MeshBasicMaterial({ map: texture });
        const artwork = new THREE.Mesh(artworkGeometry, artworkMaterial);
        
        artwork.position.set(0, 2, -4.95); // Slightly in front of the back wall
        scene.add(artwork);
    });

    loader.load('dali1-3.webp', function (texture) {
        const artworkGeometry = new THREE.PlaneGeometry(2, 2);
        const artworkMaterial = new THREE.MeshBasicMaterial({ map: texture });
        const artwork = new THREE.Mesh(artworkGeometry, artworkMaterial);
        
        artwork.position.set(0, 2, -14.95); // Slightly in front of the back wall
        scene.add(artwork);
    });



    const ambientLight = new THREE.AmbientLight(0xffffff); // Soft white light
    scene.add(ambientLight);

    const spotlight = new THREE.SpotLight(0xffffff);
    spotlight.position.set(0, 5, 0);
    spotlight.angle = Math.PI / 4;
    spotlight.penumbra = 0.05;
    spotlight.decay = 2;
    spotlight.distance = 50;

    scene.add(spotlight);

    // moving logic
    let moveForward = false;
    let moveLeft = false;
    let moveBackward = false;
    let moveRight = false;

    const onKeyDown = function (event) {
    switch (event.code) {
        case 'ArrowUp':
            case 'KeyW':
                moveForward = true;
        break;
        case 'ArrowLeft':
            case 'KeyA':
                moveLeft = true;
        break;
        case 'ArrowDown':
            case 'KeyS':
                moveBackward = true;
        break;
        case 'ArrowRight':
            case 'KeyD':
                moveRight = true;
        break;
        // Add more keys if you need additional controls
    }
    };

    const onKeyUp = function (event) {
    switch (event.code) {
        case 'ArrowUp':
            case 'KeyW':
                moveForward = false;
        break;
        case 'ArrowLeft':
            case 'KeyA':
                moveLeft = false;
        break;
        case 'ArrowDown':
            case 'KeyS':
                moveBackward = false;
        break;
        case 'ArrowRight':
            case 'KeyD':
                moveRight = false;
        break;
    }
    };

    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);



    camera.position.z = 5;
    camera.position.y = 2;
    const clock = new THREE.Clock();
    const velocity = new THREE.Vector3();
    const direction = new THREE.Vector3();
    const speed = 500; // Speed of the movement
    const collisionDistance = 1.5;

    ////////////////////// Animation loop ///////////////////
    const animate = function () {
        requestAnimationFrame(animate);
        
        const delta = clock.getDelta(); // Calculate the time difference since last frame
        const collisions = [];

        // Check in the direction the camera is facing
        collisionVector.set(0, 0, -1).applyQuaternion(camera.quaternion);
        
        // Update the raycaster to check in the front of the camera
        raycaster.set(camera.position, collisionVector);

        //console.log([floor, backWall, leftWall]);
        // Calculate objects intersecting the picking ray (add your bounding boxes to this list)
        const intersects = raycaster.intersectObjects([...walls]);
        const passages = raycaster.intersectObjects([...hiddenPassages]);

        // If we have an intersection and it's close, we have a collision
        if (intersects.length > 0 && intersects[0].distance < collisionDistance) {
            // Handle collision - this is where you would prevent movement or respond otherwise
            collisions.push(intersects[0]); 
        }
        if (passages.length > 0 && passages[0].distance < collisionDistance) {
            // Handle collision - this is where you would prevent movement or respond otherwise
            collisions.pop(); 
        }
        //if (intersects.length > 0 && intersects[0].distance < collisionDistance )

        
        // Update controls, animations, or any dynamic elements of your scene
        if (controls.isLocked === true) {
            direction.z = Number(moveForward) - Number(moveBackward);
            direction.x = Number(moveRight) - Number(moveLeft);
            direction.normalize(); // this ensures consistent movements in all directions
            
            velocity.z = -direction.z * speed * delta;
            velocity.x = -direction.x * speed * delta;
            
            if( collisions.length === 0) {
                controls.moveRight(-velocity.x * delta);
                controls.moveForward(-velocity.z * delta);
            }
        }
        
        renderer.render(scene, camera);
    }; 
    

    animate();

    // Handle window resize 
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    // Clean up
    return () => {
      window.removeEventListener('resize', handleResize);
      mountRef.current.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={mountRef} />;
};

export default VirtualMuseum;
