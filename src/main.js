import '/src/style.scss'
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/addons/loaders/DRACOLoader.js";
import GUI from 'lil-gui';

const gui = new GUI()
gui.hide()

const canvas = document.querySelector("#experience-canvas")
const sizes = {
    height: window.innerHeight,
    width: window.innerWidth
}

const textureLoader = new THREE.TextureLoader()

const loader = new GLTFLoader()

const dracoLoader = new DRACOLoader()
dracoLoader.setDecoderPath('/draco/')
loader.setDRACOLoader( dracoLoader )

const textureMap = {
    Walls: {
        day:"/public/textures/walls.webp"
    },
    Table: {
        day:"/public/textures/Table.webp"
    },
    Piano: {
        day:"/public/textures/Piano-specific.webp"
    },
    PC: {
        day:"/public/textures/PC.webp"
    },
    Mis: {
        day:"/public/textures/Miscellaneous.webp"
    },
    Chair: {
        day:"/public/textures/Chair.webp"
    },
    botton: {
        day:"/public/textures/Buttons.webp"
    },
    Button: {
        day:"/public/textures/Pc_final.webp"
    }
}

const loadedTextures = {
    day:{}
}
Object.entries(textureMap).forEach(([key, paths]) => {
    const dayTexture = textureLoader.load(
        paths.day,
        undefined,
        undefined,
        (err) => {
            console.error(`Failed to load texture: ${paths.day}`, err);
        }
    );
    dayTexture.flipY = false
    dayTexture.colorSpace = THREE.SRGBColorSpace
    loadedTextures.day[key] = dayTexture
})

loader.load("/public/models/room-v1.glb", (glb)=>{
    glb.scene.traverse(child=>{
        if(child.isMesh){
            console.log(`Found mesh: ${child.name}`);
            if (!child.geometry.attributes.uv) {
                console.warn(`${child.name} has no UVs!`);
            }
            Object.keys(textureMap).forEach(key=>{
                if(child.name.includes(key)){
                    const material = new THREE.MeshBasicMaterial({
                        map:loadedTextures.day[key],
                        transparent: false, // 👈 Important if black issue might be alpha-related
                        alphaTest: 0.01      // 👈 Optional: helps avoid fully transparent pixels
                    })
                    console.log(`Applying texture '${key}' to mesh '${child.name}'`);

                    child.material = material
                }
            })
            if (child.material.map){
                child.material.map.minFilter = THREE.LinearFilter
            }
        }
    })
    scene.add(glb.scene)
})


const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, sizes.width / sizes.height, 0.1, 1000);

const cameraFolder = gui.addFolder('Camera Position');

const cameraPosition = {
  x: camera.position.x,
  y: camera.position.y,
  z: camera.position.z
};

cameraFolder.add(cameraPosition, 'x').listen();
cameraFolder.add(cameraPosition, 'y').listen();
cameraFolder.add(cameraPosition, 'z').listen();
cameraFolder.open();


const renderer = new THREE.WebGLRenderer({canvas:canvas, antialias: true});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));


const controls = new OrbitControls(camera, renderer.domElement);
camera.position.set(-13, 12, 13)
controls.target.set(0, 5, 0);
camera.lookAt(controls.target)
controls.enableDamping = true
controls.dampingFactor = 0.05

window.addEventListener('resize', () => {
    sizes.width = window.innerWidth;
    sizes.height = window.innerHeight;
    camera.aspect = sizes.width / sizes.height;
    camera.updateProjectionMatrix();
    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

function render() {
    controls.update();
    renderer.render(scene, camera);

    // cameraPosition.x = camera.position.x;
    // cameraPosition.y = camera.position.y;
    // cameraPosition.z = camera.position.z;

    requestAnimationFrame(render);

}

render();
