import '/src/style.scss'
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/addons/loaders/DRACOLoader.js";

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
        day:"textures/walls.webp"
    },
    Table: {
        day:"textures/Table.webp"
    },
    Piano: {
        day:"textures/Piano-specific.webp"
    },
    PC: {
        day:"textures/PC.webp"
    },
    Mis: {
        day:"textures/Miscellaneous.webp"
    },
    Chair: {
        day:"textures/Chair.webp"
    },
    botton: {
        day:"textures/Buttons.webp"
    },
    Button: {
        day:"textures/Pc_final.webp"
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

loader.load("models/room.glb", (glb)=>{
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
camera.position.z = 5;

const renderer = new THREE.WebGLRenderer({canvas:canvas, antialias: true});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

const controls = new OrbitControls(camera, renderer.domElement);
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
    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;
    renderer.render(scene, camera);
    requestAnimationFrame(render);
}

render();
