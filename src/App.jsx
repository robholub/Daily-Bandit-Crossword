import React, { useState, useEffect, useCallback, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, enableIndexedDbPersistence } from 'firebase/firestore';

// --- Firebase Initialization ---
const firebaseConfigStr = typeof __firebase_config !== 'undefined' ? __firebase_config : "{}";
const firebaseConfig = JSON.parse(firebaseConfigStr);
let app, auth, db;

try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  
  // Enable Offline Support (Crucial for PWA)
  enableIndexedDbPersistence(db).catch((err) => {
    console.warn("Offline persistence could not be enabled in this environment.", err);
  });
} catch (e) {
  console.warn("Firebase setup skipped. Running in pure offline mode.", e);
}

const appId = typeof __app_id !== 'undefined' ? __app_id : 'bandit-crossword';


// --- Procedural Realistic 3D Mascot Component (Header) ---
const ThreeRaccoon = () => {
  const canvasRef = useRef(null);
  const rendererRef = useRef(null);
  const frameRef = useRef(null);

  useEffect(() => {
    const initThree = () => {
      if (!canvasRef.current || rendererRef.current || !window.THREE) return;

      const THREE = window.THREE;
      const width = 100;
      const height = 100;

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
      camera.position.z = 4;
      camera.position.y = 0;

      const renderer = new THREE.WebGLRenderer({ canvas: canvasRef.current, alpha: true, antialias: true });
      renderer.setSize(width, height);
      renderer.outputEncoding = THREE.sRGBEncoding;
      rendererRef.current = renderer;

      const raccoonGroup = new THREE.Group();

      const generateFurMap = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 512; canvas.height = 512;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#888888';
        ctx.fillRect(0, 0, 512, 512);
        for(let i=0; i<30000; i++) {
          ctx.fillStyle = Math.random() > 0.5 ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)';
          const x = Math.random() * 512;
          const y = Math.random() * 512;
          ctx.fillRect(x, y, Math.random() * 2 + 1, Math.random() * 12 + 4);
        }
        const tex = new THREE.CanvasTexture(canvas);
        tex.wrapS = THREE.RepeatWrapping; tex.wrapT = THREE.RepeatWrapping; tex.repeat.set(2, 2);
        return tex;
      };

      const furBump = generateFurMap();
      const greyFur = new THREE.MeshStandardMaterial({ color: 0x5a5a5a, roughness: 0.8, bumpMap: furBump, bumpScale: 0.015 });
      const lightGreyFur = new THREE.MeshStandardMaterial({ color: 0x9a9a9a, roughness: 0.8, bumpMap: furBump, bumpScale: 0.015 });
      const whiteFur = new THREE.MeshStandardMaterial({ color: 0xdddddd, roughness: 0.9, bumpMap: furBump, bumpScale: 0.02 });
      const darkFur = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.9, bumpMap: furBump, bumpScale: 0.02 });
      const eyeMat = new THREE.MeshPhysicalMaterial({ color: 0x020202, metalness: 0.1, roughness: 0.0, clearcoat: 1.0, clearcoatRoughness: 0.05 });
      const noseMat = new THREE.MeshStandardMaterial({ color: 0x050505, roughness: 0.2, metalness: 0.2 });

      const head = new THREE.Mesh(new THREE.SphereGeometry(1, 64, 64), greyFur);
      head.scale.set(1.15, 0.95, 0.9); raccoonGroup.add(head);

      const leftCheek = new THREE.Mesh(new THREE.SphereGeometry(0.6, 32, 32), lightGreyFur);
      leftCheek.position.set(-0.7, -0.2, 0.3); raccoonGroup.add(leftCheek);
      const rightCheek = new THREE.Mesh(new THREE.SphereGeometry(0.6, 32, 32), lightGreyFur);
      rightCheek.position.set(0.7, -0.2, 0.3); raccoonGroup.add(rightCheek);

      const snout = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.5, 0.8, 32), whiteFur);
      snout.rotation.x = Math.PI / 2; snout.position.set(0, -0.25, 0.9); raccoonGroup.add(snout);

      const nose = new THREE.Mesh(new THREE.SphereGeometry(0.12, 32, 32), noseMat);
      nose.position.set(0, -0.2, 1.35); nose.scale.set(1.2, 0.8, 1); raccoonGroup.add(nose);

      const leftMask = new THREE.Mesh(new THREE.SphereGeometry(0.48, 32, 32), darkFur);
      leftMask.scale.set(1.2, 0.7, 0.5); leftMask.position.set(-0.4, 0.1, 0.75);
      leftMask.rotation.set(0, -Math.PI / 8, Math.PI / 7); raccoonGroup.add(leftMask);

      const rightMask = new THREE.Mesh(new THREE.SphereGeometry(0.48, 32, 32), darkFur);
      rightMask.scale.set(1.2, 0.7, 0.5); rightMask.position.set(0.4, 0.1, 0.75);
      rightMask.rotation.set(0, Math.PI / 8, -Math.PI / 7); raccoonGroup.add(rightMask);

      const leftEye = new THREE.Mesh(new THREE.SphereGeometry(0.1, 32, 32), eyeMat);
      leftEye.position.set(-0.4, 0.12, 0.98); raccoonGroup.add(leftEye);
      const rightEye = new THREE.Mesh(new THREE.SphereGeometry(0.1, 32, 32), eyeMat);
      rightEye.position.set(0.4, 0.12, 0.98); raccoonGroup.add(rightEye);

      const leftEar = new THREE.Mesh(new THREE.ConeGeometry(0.3, 0.7, 32), greyFur);
      leftEar.position.set(-0.7, 0.75, 0); leftEar.rotation.set(-Math.PI/12, 0, Math.PI/5); raccoonGroup.add(leftEar);
      const rightEar = new THREE.Mesh(new THREE.ConeGeometry(0.3, 0.7, 32), greyFur);
      rightEar.position.set(0.7, 0.75, 0); rightEar.rotation.set(-Math.PI/12, 0, -Math.PI/5); raccoonGroup.add(rightEar);

      scene.add(raccoonGroup);

      const ambientLight = new THREE.AmbientLight(0xffffff, 0.4); scene.add(ambientLight);
      const keyLight = new THREE.DirectionalLight(0xffffff, 0.8); keyLight.position.set(5, 5, 5); scene.add(keyLight);
      const rimLight = new THREE.DirectionalLight(0xabcdef, 1.0); rimLight.position.set(-5, 5, -5); scene.add(rimLight);
      const eyeLight = new THREE.PointLight(0xffffff, 0.4, 10); eyeLight.position.set(0, 1, 3); scene.add(eyeLight);

      let blinkTimer = 0; let isBlinking = false;
      const animate = () => {
        frameRef.current = requestAnimationFrame(animate);
        const time = Date.now() * 0.001;
        raccoonGroup.rotation.y = Math.sin(time * 1.5) * 0.15;
        raccoonGroup.rotation.x = Math.sin(time * 2) * 0.05;

        if (Math.random() < 0.008 && !isBlinking) { isBlinking = true; blinkTimer = 10; }
        if (isBlinking) {
           blinkTimer--;
           const scaleY = Math.max(0.1, Math.abs(blinkTimer - 5) / 5);
           leftEye.scale.y = scaleY; rightEye.scale.y = scaleY;
           if (blinkTimer <= 0) isBlinking = false;
        }
        renderer.render(scene, camera);
      };
      animate();
    };

    if (!window.THREE) {
      const script = document.createElement('script');
      script.src = "https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js";
      script.onload = initThree; document.head.appendChild(script);
    } else initThree();

    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
      if (rendererRef.current) rendererRef.current.dispose();
    };
  }, []);

  return (
    <div className="w-[72px] h-[72px] flex items-center justify-center rounded-full bg-gradient-to-br from-gray-100 to-gray-300 border-2 border-black overflow-hidden shadow-md shrink-0">
      <canvas ref={canvasRef} className="block w-full h-full" />
    </div>
  );
};


// --- Advanced 3D Win Mascot (Skeletal Articulation + Realistic Fur) ---
const ThreeRaccoonWin = () => {
  const canvasRef = useRef(null);
  const rendererRef = useRef(null);
  const frameRef = useRef(null);

  useEffect(() => {
    const initThree = () => {
      if (!canvasRef.current || rendererRef.current || !window.THREE) return;

      const THREE = window.THREE;
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
      camera.position.z = 6;
      camera.position.y = -0.5; // Frame the torso better

      const renderer = new THREE.WebGLRenderer({ canvas: canvasRef.current, alpha: true, antialias: true });
      renderer.setSize(240, 240);
      renderer.outputEncoding = THREE.sRGBEncoding;
      rendererRef.current = renderer;

      const raccoonGroup = new THREE.Group();

      // Procedural Fur Map
      const generateFurMap = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 512; canvas.height = 512;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#888888';
        ctx.fillRect(0, 0, 512, 512);
        for(let i=0; i<30000; i++) {
          ctx.fillStyle = Math.random() > 0.5 ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)';
          const x = Math.random() * 512;
          const y = Math.random() * 512;
          ctx.fillRect(x, y, Math.random() * 2 + 1, Math.random() * 12 + 4);
        }
        const tex = new THREE.CanvasTexture(canvas);
        tex.wrapS = THREE.RepeatWrapping; tex.wrapT = THREE.RepeatWrapping; tex.repeat.set(2, 2);
        return tex;
      };

      const furBump = generateFurMap();
      const greyFur = new THREE.MeshStandardMaterial({ color: 0x5a5a5a, roughness: 0.8, bumpMap: furBump, bumpScale: 0.015 });
      const lightGreyFur = new THREE.MeshStandardMaterial({ color: 0x9a9a9a, roughness: 0.8, bumpMap: furBump, bumpScale: 0.015 });
      const whiteFur = new THREE.MeshStandardMaterial({ color: 0xdddddd, roughness: 0.9, bumpMap: furBump, bumpScale: 0.02 });
      const darkFur = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.9, bumpMap: furBump, bumpScale: 0.02 });
      const eyeMat = new THREE.MeshPhysicalMaterial({ color: 0x020202, metalness: 0.1, roughness: 0.0, clearcoat: 1.0, clearcoatRoughness: 0.05 });
      const noseMat = new THREE.MeshStandardMaterial({ color: 0x050505, roughness: 0.2, metalness: 0.2 });

      // Head Base
      const head = new THREE.Mesh(new THREE.SphereGeometry(1, 64, 64), greyFur);
      head.scale.set(1.15, 0.95, 0.9);
      raccoonGroup.add(head);

      const leftCheek = new THREE.Mesh(new THREE.SphereGeometry(0.6, 32, 32), lightGreyFur);
      leftCheek.position.set(-0.7, -0.2, 0.3); raccoonGroup.add(leftCheek);
      const rightCheek = new THREE.Mesh(new THREE.SphereGeometry(0.6, 32, 32), lightGreyFur);
      rightCheek.position.set(0.7, -0.2, 0.3); raccoonGroup.add(rightCheek);

      const snout = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.5, 0.8, 32), whiteFur);
      snout.rotation.x = Math.PI / 2; snout.position.set(0, -0.25, 0.9); raccoonGroup.add(snout);

      const nose = new THREE.Mesh(new THREE.SphereGeometry(0.12, 32, 32), noseMat);
      nose.position.set(0, -0.2, 1.35); nose.scale.set(1.2, 0.8, 1); raccoonGroup.add(nose);

      // Smile
      const smile = new THREE.Mesh(new THREE.TorusGeometry(0.25, 0.03, 16, 32, Math.PI), darkFur);
      smile.position.set(0, -0.38, 1.15); smile.rotation.set(Math.PI / 1.5, 0, Math.PI); raccoonGroup.add(smile);

      const leftMask = new THREE.Mesh(new THREE.SphereGeometry(0.48, 32, 32), darkFur);
      leftMask.scale.set(1.2, 0.7, 0.5); leftMask.position.set(-0.4, 0.1, 0.75);
      leftMask.rotation.set(0, -Math.PI / 8, Math.PI / 7); raccoonGroup.add(leftMask);
      const rightMask = new THREE.Mesh(new THREE.SphereGeometry(0.48, 32, 32), darkFur);
      rightMask.scale.set(1.2, 0.7, 0.5); rightMask.position.set(0.4, 0.1, 0.75);
      rightMask.rotation.set(0, Math.PI / 8, -Math.PI / 7); raccoonGroup.add(rightMask);

      // Happy Squinting Eyes
      const leftEye = new THREE.Mesh(new THREE.SphereGeometry(0.1, 32, 32), eyeMat);
      leftEye.position.set(-0.4, 0.12, 0.98); leftEye.scale.y = 0.15; raccoonGroup.add(leftEye);
      const rightEye = new THREE.Mesh(new THREE.SphereGeometry(0.1, 32, 32), eyeMat);
      rightEye.position.set(0.4, 0.12, 0.98); rightEye.scale.y = 0.15; raccoonGroup.add(rightEye);

      const leftEar = new THREE.Mesh(new THREE.ConeGeometry(0.3, 0.7, 32), greyFur);
      leftEar.position.set(-0.7, 0.75, 0); leftEar.rotation.set(-Math.PI/12, 0, Math.PI/5); raccoonGroup.add(leftEar);
      const rightEar = new THREE.Mesh(new THREE.ConeGeometry(0.3, 0.7, 32), greyFur);
      rightEar.position.set(0.7, 0.75, 0); rightEar.rotation.set(-Math.PI/12, 0, -Math.PI/5); raccoonGroup.add(rightEar);

      // Torso
      const torso = new THREE.Mesh(new THREE.SphereGeometry(1.2, 32, 32), greyFur);
      torso.position.set(0, -1.8, 0); torso.scale.set(1, 1.2, 0.9);
      raccoonGroup.add(torso);

      // Relaxed Left Arm
      const leftArmGeo = new THREE.CylinderGeometry(0.18, 0.14, 0.9, 32);
      leftArmGeo.translate(0, -0.45, 0);
      const leftArm = new THREE.Mesh(leftArmGeo, greyFur);
      leftArm.position.set(-0.9, -0.8, 0); leftArm.rotation.z = -Math.PI / 8;
      raccoonGroup.add(leftArm);

      // --- Skeletal Right Arm (Thumbs Up) ---
      const shoulder = new THREE.Group();
      shoulder.position.set(0.9, -0.7, 0.2);
      raccoonGroup.add(shoulder);

      const upperArmGeo = new THREE.CylinderGeometry(0.18, 0.14, 0.8, 32);
      upperArmGeo.translate(0, -0.4, 0); 
      const upperArm = new THREE.Mesh(upperArmGeo, greyFur);
      upperArm.rotation.set(Math.PI / 4, 0, Math.PI / 5);  
      shoulder.add(upperArm);

      const elbow = new THREE.Group();
      elbow.position.set(0, -0.8, 0);
      upperArm.add(elbow);

      const elbowSphere = new THREE.Mesh(new THREE.SphereGeometry(0.15, 32, 32), greyFur);
      elbow.add(elbowSphere);

      const forearmGeo = new THREE.CylinderGeometry(0.14, 0.11, 0.7, 32);
      forearmGeo.translate(0, -0.35, 0);
      const forearm = new THREE.Mesh(forearmGeo, greyFur);
      forearm.rotation.x = -Math.PI / 1.5; 
      elbow.add(forearm);

      // Wrist & Paw
      const fist = new THREE.Group();
      fist.position.set(0, -0.75, 0);
      fist.rotation.x = Math.PI / 1.5; // Keeps fist pointing UP
      forearm.add(fist);

      const palm = new THREE.Mesh(new THREE.SphereGeometry(0.18, 32, 32), darkFur);
      palm.scale.set(1, 0.9, 1.1);
      fist.add(palm);

      // Fingers
      for(let i=0; i<3; i++) {
          const finger = new THREE.Mesh(new THREE.SphereGeometry(0.06, 16, 16), darkFur);
          finger.scale.set(2.2, 1, 1);
          finger.position.set(-0.05, -0.08 + i*0.08, 0.18);
          fist.add(finger);
      }

      // Proud Thick Thumb
      const thumb = new THREE.Mesh(new THREE.SphereGeometry(0.08, 16, 16), darkFur);
      thumb.scale.set(1, 2.5, 1);
      thumb.position.set(-0.15, 0.22, 0.05);
      thumb.rotation.z = Math.PI / 8; // Tilted slightly out
      fist.add(thumb);

      scene.add(raccoonGroup);

      // Lighting
      scene.add(new THREE.AmbientLight(0xffffff, 0.4));
      const keyLight = new THREE.DirectionalLight(0xffffff, 0.8); keyLight.position.set(5, 5, 5); scene.add(keyLight);
      const rimLight = new THREE.DirectionalLight(0xabcdef, 1.0); rimLight.position.set(-5, 5, -5); scene.add(rimLight);
      const eyeLight = new THREE.PointLight(0xffffff, 0.4, 10); eyeLight.position.set(0, 1, 3); scene.add(eyeLight);

      const animate = () => {
        frameRef.current = requestAnimationFrame(animate);
        const time = Date.now() * 0.005;
        
        // Happy bounces
        raccoonGroup.position.y = Math.sin(time * 0.5) * 0.05;
        raccoonGroup.rotation.y = Math.sin(time * 0.2) * 0.1;

        // Ear twitches
        leftEar.rotation.z = Math.PI / 5 + Math.sin(time * 2) * 0.05;
        rightEar.rotation.z = -Math.PI / 5 - Math.cos(time * 2) * 0.05;

        // Dynamic fluid thumbs up pumping
        shoulder.rotation.z = Math.PI / 5 + Math.sin(time * 1.5) * 0.1;
        shoulder.rotation.x = Math.PI / 4 + Math.sin(time * 1.5) * 0.1;
        elbow.rotation.x = -Math.PI / 1.5 + Math.cos(time * 1.5) * 0.1;

        renderer.render(scene, camera);
      };
      animate();
    };

    if (!window.THREE) {
      const script = document.createElement('script');
      script.src = "https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js";
      script.onload = initThree; document.head.appendChild(script);
    } else initThree();

    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
      if (rendererRef.current) rendererRef.current.dispose();
    };
  }, []);

  return (
    <div className="w-[240px] h-[240px] flex items-center justify-center relative z-10 drop-shadow-2xl">
      <div className="absolute inset-0 bg-yellow-400 rounded-full blur-3xl opacity-30 animate-pulse"></div>
      <canvas ref={canvasRef} className="block w-full h-full relative z-20" />
    </div>
  );
};


// --- Massive 1000+ Word Dictionary ---
const DICT_DATA = [
  "REACT|Web framework", "APP|Mobile software", "CODE|Program text", "WEB|Internet", "HTML|Web structure", "CSS|Web styles", "NODE|JS runtime", "API|Data bridge", "DATA|Information", "USER|App client", "BUG|Code error", "TEST|Quality check", "BYTE|Eight bits", "BIT|Binary digit", "DISK|Storage drive", "FILE|Saved document", "CHIP|Silicon processor", "WIFI|Wireless net", "NET|Internet", "URL|Web address", "LINK|Hypertext", "SPAM|Junk mail", "VIRUS|Malware", "HACK|Breach security", "HOST|Server provider", "CLOUD|Remote servers", "PIXEL|Screen dot", "SCREEN|Display monitor", "MOUSE|Clicking device", "KEY|Board button", "FONT|Typeface", "ICON|Small symbol", "MENU|List of options", "TAB|Browser section", "PAGE|Web document", "SITE|Web location", "BOT|Automated script", "PING|Network check", "PORT|Network dock", "PATH|Directory route", "ROOT|Base directory", "UNIX|Classic OS", "LINUX|Open OS", "JAVA|Coding language", "MAC|Apple computer", "PC|Windows machine", "TECH|Technology", "MATH|Numbers subject", "ATOM|Basic particle",
  "DOG|Barking pet", "CAT|Meowing pet", "COW|Mooing animal", "PIG|Oinking animal", "HEN|Clucking bird", "FOX|Sly animal", "BEAR|Hibernating mammal", "LION|Jungle king", "TIGER|Striped cat", "WOLF|Howling canine", "DEER|Antlered animal", "FROG|Hopping amphibian", "TOAD|Warty amphibian", "SNAKE|Slithering reptile", "LIZARD|Scaly reptile", "FISH|Aquatic animal", "SHARK|Ocean predator", "WHALE|Massive marine mammal", "BIRD|Feathered flyer", "DUCK|Quacking bird", "SWAN|Graceful white bird", "HAWK|Sharp-eyed raptor", "EAGLE|Bald bird of prey", "OWL|Hooting bird", "BAT|Flying mammal", "RAT|City rodent", "MOUSE|Cheese lover", "ANT|Tiny worker insect", "BEE|Honey maker", "WASP|Stinging insect", "FLY|Buzzing bug", "MOTH|Nighttime flier", "WORM|Earth crawler", "SNAIL|Slow shelled crawler", "CRAB|Pinching crustacean", "SEAL|Barking marine mammal", "HORSE|Riding animal", "ZEBRA|Striped animal", "CAMEL|Desert animal", "MOOSE|Large antlered animal", "ELK|Large deer", "GOAT|Horned farm animal", "SHEEP|Woolly animal", "LAMB|Young sheep", "BULL|Male cow", "CALF|Baby cow", "PONY|Small horse", "MULE|Donkey-horse cross", "APE|Tailless primate", "MONKEY|Swinging primate",
  "APPLE|Red fruit", "PEAR|Bell-shaped fruit", "PLUM|Purple fruit", "PEACH|Fuzzy fruit", "GRAPE|Vine fruit", "MELON|Large sweet fruit", "LEMON|Sour yellow fruit", "LIME|Sour green fruit", "KIWI|Fuzzy brown fruit", "FIG|Sweet seeded fruit", "DATE|Sweet desert fruit", "NUT|Hard-shelled seed", "SEED|Plant beginning", "BEAN|Legume", "PEA|Green pod seed", "CORN|Yellow cob veggie", "RICE|White grain", "OAT|Breakfast grain", "WHEAT|Flour grain", "BREAD|Baked dough", "CAKE|Birthday dessert", "PIE|Baked crust dessert", "TART|Small pie", "BUN|Round bread", "ROLL|Dinner bread", "MEAT|Protein source", "BEEF|Cow meat", "PORK|Pig meat", "HAM|Cured pork", "FISH|Seafood", "SOUP|Hot liquid meal", "STEW|Hearty hot meal", "MILK|Dairy drink", "CHEESE|Dairy block", "BUTTER|Dairy spread", "EGG|Breakfast oval", "OIL|Cooking liquid", "SALT|Savory seasoning", "PEPPER|Spicy seasoning", "SUGAR|Sweet crystals", "HONEY|Bee's syrup", "SYRUP|Pancake topping", "JAM|Fruit spread", "JELLY|Clear fruit spread", "WATER|H2O", "JUICE|Fruit drink", "SODA|Fizzy drink", "TEA|Brewed leaves", "BEER|Brewed beverage", "WINE|Fermented grapes",
  "SUN|Our star", "MOON|Earth's satellite", "STAR|Night sky twinkler", "SKY|Blue expanse", "CLOUD|Fluffy sky object", "RAIN|Falling water", "SNOW|Winter flakes", "ICE|Frozen water", "FOG|Thick mist", "MIST|Light fog", "WIND|Moving air", "BREEZE|Gentle wind", "STORM|Severe weather", "THUNDER|Storm sound", "LIGHT|Illumination", "DARK|Absence of light", "DAY|24 hours", "NIGHT|Dark hours", "DAWN|Sunrise time", "DUSK|Sunset time", "MORNING|Early hours", "EVENING|Late hours", "NOON|Midday", "YEAR|365 days", "MONTH|Roughly 30 days", "WEEK|Seven days", "HOUR|60 minutes", "MINUTE|60 seconds", "SECOND|Tick of a clock", "TIME|Clock measurement", "DATE|Calendar day", "ERA|Historical period", "AGE|Years old", "PAST|Yesterday", "FUTURE|Tomorrow", "NOW|Present moment", "EARTH|Our home planet", "WORLD|The whole globe", "GLOBE|Sphere map", "MAP|Navigation paper", "NORTH|Compass point", "SOUTH|Opposite of north", "EAST|Sunrise direction", "WEST|Sunset direction",
  "MOUNTAIN|Tall rocky peak", "HILL|Small elevation", "VALLEY|Low area between hills", "PLAIN|Flat grassy land", "FIELD|Open meadow", "FOREST|Wooded area", "WOOD|Tree material", "TREE|Tall woody plant", "BUSH|Shrub", "GRASS|Lawn cover", "LEAF|Tree foliage", "STEM|Plant stalk", "ROOT|Underground plant part", "FLOWER|Blooming plant", "ROSE|Thorny red flower", "WEED|Unwanted plant", "DIRT|Soil", "SOIL|Earth for planting", "ROCK|Hard stone", "STONE|Small rock", "SAND|Beach dirt", "DUST|Tiny dirt particles", "MUD|Wet dirt", "CLAY|Modeling earth", "OCEAN|Vast body of water", "SEA|Salty water", "LAKE|Body of fresh water", "POND|Small body of water", "RIVER|Flowing waterway", "STREAM|Small river", "CREEK|Tiny river", "BEACH|Sandy shore", "COAST|Ocean edge", "SHORE|Water's edge", "ISLAND|Land surrounded by water",
  "CITY|Large urban area", "TOWN|Small settlement", "VILLAGE|Tiny settlement", "STATE|Nation subdivision", "COUNTRY|Nation", "NATION|Sovereign state", "CAPITAL|Seat of government", "PORT|Shipping dock", "ROAD|Paved street", "STREET|City road", "AVENUE|Wide street", "LANE|Narrow road", "HIGHWAY|Fast road", "BRIDGE|Overpass structure", "TUNNEL|Underground passage", "PARK|Recreation area", "SQUARE|City plaza", "YARD|House lawn", "GARDEN|Planted area", "FARM|Agricultural land", "BARN|Farm building", "HOUSE|Home building", "HOME|Place of residence", "BUILDING|Constructed structure", "TOWER|Tall structure", "WALL|Room divider", "ROOF|House top", "DOOR|Room entrance", "WINDOW|Wall glass", "FLOOR|Ground surface", "CEILING|Overhead surface", "ROOM|Enclosed space", "HALL|Corridor", "STAIR|Step up", "STEP|Single stair",
  "CHAIR|Seat with a back", "SEAT|Place to sit", "SOFA|Living room seat", "COUCH|Living room seat", "BED|Sleeping furniture", "DESK|Office table", "TABLE|Dining surface", "SHELF|Book holder", "CABINET|Storage cupboard", "CLOSET|Wardrobe area", "RUG|Floor covering", "MAT|Small rug", "LAMP|Light source", "BULB|Light source inside a lamp", "CLOCK|Time teller", "WATCH|Wrist timepiece", "MIRROR|Reflective glass", "FRAME|Picture border", "PHOTO|Captured image", "PICTURE|Drawn or taken image", "ART|Creative expression", "PAINT|Wall color liquid", "BRUSH|Painting tool", "PEN|Ink writer", "PENCIL|Graphite writer", "PAPER|Writing surface", "BOOK|Reading material", "PAGE|Book leaf", "WORD|Text unit", "LETTER|Alphabet character", "NOTE|Short message", "MAIL|Postal delivery", "STAMP|Postage sticker", "CARD|Greeting paper", "BOX|Cardboard container", "BAG|Carrying sack", "PACK|Backpack", "CASE|Protective container",
  "SHIRT|Torso clothing", "PANTS|Leg clothing", "JEANS|Denim pants", "SHORT|Not long", "SKIRT|Lower body garment", "DRESS|One-piece garment", "SUIT|Formal menswear", "COAT|Winter jacket", "JACKET|Light coat", "SWEATER|Knit pullover", "SOCK|Foot warmer", "SHOE|Footwear", "BOOT|Heavy footwear", "HEEL|Shoe back", "SOLE|Shoe bottom", "HAT|Headwear", "CAP|Baseball headwear", "GLOVE|Hand warmer", "SCARF|Neck warmer", "BELT|Waist cincher", "TIE|Neckwear", "RING|Finger jewelry", "CHAIN|Metal links", "CLOTH|Fabric", "SILK|Smooth fabric", "WOOL|Sheep fabric", "COTTON|Soft plant fabric", "THREAD|Sewing string", "STRING|Thin cord", "ROPE|Thick cord", "KNOT|Tied rope", "WIRE|Metal string", "CABLE|Thick wire", "PIPE|Water tube", "TUBE|Hollow cylinder", "HOSE|Flexible water tube",
  "CAR|Automobile", "TRUCK|Cargo vehicle", "VAN|Large family vehicle", "BUS|Public transport", "TRAIN|Railway transport", "TRAM|Streetcar", "BIKE|Two-wheeled pedal vehicle", "CYCLE|Bicycle", "BOAT|Watercraft", "SHIP|Large ocean vessel", "PLANE|Flying vehicle", "JET|Fast airplane", "WING|Flying appendage", "TAIL|Rear appendage", "WHEEL|Round auto part", "TIRE|Rubber wheel cover", "BRAKE|Stopping pedal", "GEAR|Transmission part", "MOTOR|Machine power", "ENGINE|Car motor", "PUMP|Fluid mover", "FAN|Air mover", "TOOL|Hand implement", "HAMMER|Nail driver", "NAIL|Metal spike", "SCREW|Twisted nail", "DRILL|Hole maker", "SAW|Wood cutter", "AXE|Wood chopper", "BLADE|Sharp edge", "KNIFE|Cutting tool", "FORK|Pronged utensil", "SPOON|Soup utensil", "PAN|Frying vessel", "POT|Cooking vessel", "BOWL|Soup container", "PLATE|Dinner dish", "CUP|Coffee container", "GLASS|Drinking vessel", "MUG|Thick coffee cup", "BOTTLE|Liquid container", "JAR|Glass container", "CAN|Metal container",
  "FIRE|Burning flame", "SMOKE|Fire byproduct", "ASH|Fire remains", "COAL|Fossil fuel", "GAS|Car fuel", "FUEL|Energy source", "POWER|Energy", "FORCE|Push or pull", "ENERGY|Power", "HEAT|Warmth", "COLD|Absence of heat", "WARM|Comfortably hot", "COOL|Comfortably cold", "FAST|Quick", "SLOW|Leisurely pace", "QUICK|Fast", "RAPID|Very fast", "HARD|Not soft", "SOFT|Not hard", "FIRM|Solid", "HEAVY|Weighs a lot", "LIGHT|Not heavy", "STRONG|Powerful", "WEAK|Not strong", "BIG|Large", "LARGE|Big", "HUGE|Very big", "SMALL|Not big", "TINY|Very small", "LONG|Not short", "SHORT|Not long", "TALL|High in stature", "HIGH|Elevated", "LOW|Near the bottom", "WIDE|Broad", "BROAD|Wide", "NARROW|Not wide", "THICK|Not thin", "THIN|Not thick", "FAT|Overweight", "SLIM|Slender", "ROUND|Circular", "FLAT|Level", "SHARP|Pointy", "DULL|Not sharp", "SMOOTH|Not rough", "ROUGH|Not smooth",
  "RED|Stop sign color", "BLUE|Sky color", "GREEN|Grass color", "YELLOW|Sun color", "BLACK|Night color", "WHITE|Snow color", "GRAY|Cloud color", "BROWN|Dirt color", "PINK|Cotton candy color", "GOLD|Precious yellow metal", "SILVER|Precious grey metal", "IRON|Strong building metal", "STEEL|Refined iron", "COPPER|Penny metal", "LEAD|Heavy metal", "WOOD|Tree material", "GLASS|Transparent material", "PLASTIC|Synthetic material", "PAPER|Writing material", "BONE|Skeleton part", "SKIN|Body covering", "HAIR|Head covering", "HEAD|Top body part", "FACE|Front of head", "EYE|Seeing organ", "EAR|Hearing organ", "NOSE|Smelling organ", "MOUTH|Speaking organ", "LIP|Mouth edge", "TOOTH|Chewing bone", "TONGUE|Tasting muscle", "NECK|Head support", "SHOULDER|Arm joint", "ARM|Upper limb", "ELBOW|Arm joint", "WRIST|Hand joint", "HAND|Grasping appendage", "FINGER|Hand digit", "THUMB|Opposable digit", "CHEST|Torso front", "BACK|Torso rear", "STOMACH|Belly", "LEG|Lower limb", "KNEE|Leg joint", "ANKLE|Foot joint", "FOOT|Walking appendage", "TOE|Foot digit",
  "RUN|Move quickly", "WALK|Stroll", "JUMP|Leap in the air", "LEAP|Big jump", "HOP|Small jump", "SKIP|Light jump", "FALL|Drop down", "DROP|Let fall", "STAND|Be upright", "SIT|Rest on a chair", "LIE|Rest horizontally", "SLEEP|Rest in bed", "WAKE|Stop sleeping", "DREAM|Sleep vision", "THINK|Use your brain", "KNOW|Have knowledge", "LEARN|Acquire knowledge", "READ|View words", "WRITE|Create words", "SPEAK|Talk", "TALK|Speak", "TELL|Inform", "ASK|Question", "ANSWER|Reply", "LISTEN|Hear intently", "HEAR|Detect sound", "LOOK|Direct your eyes", "SEE|Detect light", "WATCH|Observe", "SHOW|Display", "HIDE|Conceal", "FIND|Locate", "LOSE|Misplace", "KEEP|Retain", "GIVE|Donate", "TAKE|Acquire", "GET|Obtain", "MAKE|Create", "BUILD|Construct", "BREAK|Shatter", "FIX|Repair", "CUT|Slice", "TEAR|Rip", "PULL|Draw towards", "PUSH|Shove away", "THROW|Toss", "CATCH|Grab in air", "HOLD|Grasp", "CARRY|Transport",
  "LOVE|Deep affection", "HATE|Deep dislike", "LIKE|Enjoy", "CARE|Look after", "WANT|Desire", "NEED|Require", "HOPE|Wish", "FEAR|Be afraid", "SCARE|Frighten", "SURPRISE|Startle", "LAUGH|Chuckle", "SMILE|Happy expression", "CRY|Shed tears", "WEEP|Cry heavily", "SHOUT|Yell", "YELL|Shout", "SING|Make musical sounds", "DANCE|Rhythmic movement", "PLAY|Engage in a game", "WORK|Do a job", "REST|Relax", "WAIT|Pause", "STOP|Halt", "GO|Proceed", "START|Begin", "END|Finish", "WIN|Be victorious", "LOSE|Be defeated", "BEAT|Defeat", "FIGHT|Brawl", "HELP|Assist", "SAVE|Rescue", "LEAD|Guide", "FOLLOW|Go after", "JOIN|Unite", "MEET|Encounter", "VISIT|Go to see", "LEAVE|Depart", "STAY|Remain", "LIVE|Be alive", "DIE|Cease living",
  "GOOD|Not bad", "BAD|Not good", "RIGHT|Correct or direction", "WRONG|Incorrect", "TRUE|Factual", "FALSE|Not true", "REAL|Actual", "FAKE|Not real", "SURE|Certain", "RICH|Wealthy", "POOR|Lacking wealth", "CHEAP|Inexpensive", "DEAR|Expensive or beloved", "FREE|Without cost", "OPEN|Not closed", "CLOSE|Shut", "FULL|Not empty", "EMPTY|Not full", "NEW|Fresh", "OLD|Aged", "YOUNG|Youthful", "FRESH|Recently made", "CLEAN|Not dirty", "DIRTY|Unclean", "SAFE|Secure", "WILD|Untamed", "CALM|Peaceful", "LOUD|Noisy", "QUIET|Silent", "BRAVE|Courageous", "SMART|Intelligent", "WISE|Knowing", "FOOL|Silly person", "CRAZY|Insane", "FUNNY|Humorous", "SAD|Unhappy", "HAPPY|Joyful", "MAD|Angry", "GLAD|Pleased", "BUSY|Occupied", "LAZY|Not busy",
  "BOY|Male child", "GIRL|Female child", "MAN|Adult male", "WOMAN|Adult female", "KID|Child", "BABY|Infant", "SON|Male child", "WIFE|Female spouse", "KING|Male monarch", "QUEEN|Female monarch", "LORD|Noble master", "LADY|Noble woman", "CHIEF|Leader", "BOSS|Manager", "CREW|Team", "TEAM|Group of players", "BAND|Musical group", "ARMY|Military force", "CLUB|Social group", "PARTY|Celebration", "GUEST|Invited person", "HOST|Party thrower", "FRIEND|Pal", "ENEMY|Foe", "HERO|Savior", "STAR|Famous person", "IDOL|Revered person", "FAN|Admirer", "SPORT|Athletic contest", "GAME|Interactive fun", "RACE|Speed contest", "TRACK|Racing path", "SCORE|Points total", "GOAL|Soccer objective", "POINT|Unit of score", "MARK|Grade or spot", "SIGN|Indicator", "RULE|Law", "LAW|Legal rule", "CRIME|Illegal act", "POLICE|Law enforcement", "JUDGE|Court official", "COURT|Legal arena", "PRISON|Jail", "CELL|Prison room", "GUARD|Protector",
  "MAGIC|Sorcery", "SPELL|Magic words", "GHOST|Spirit", "SOUL|Spirit", "GOD|Deity", "MYTH|Ancient story", "TALE|Story", "STORY|Narrative", "POEM|Rhyming verse", "SONG|Vocal track", "MUSIC|Organized sound", "NOTE|Musical tone", "CHORD|Harmonic notes", "RHYTHM|Beat", "BEAT|Musical pulse", "DRUM|Percussion instrument", "BELL|Chiming instrument", "HORN|Brass instrument", "FLUTE|Woodwind instrument", "PIANO|Keyboard instrument", "VOICE|Vocal sound", "SOUND|Audio", "NOISE|Unwanted sound", "WORD|Text unit", "NAME|Identifier", "TITLE|Designation", "IDEA|Thought", "MIND|Brain", "BRAIN|Thinking organ", "FACT|Truth", "PLAN|Strategy", "GOAL|Objective", "TEST|Exam", "QUIZ|Short test", "EXAM|Major test", "GRADE|Score", "CLASS|School group", "SCHOOL|Learning place", "STUDY|Review material"
];

const DICTIONARY = DICT_DATA.map(item => {
  const [word, clue] = item.split('|');
  return { word, clue };
});

// --- Crossword Algorithm ---
const GRID_SIZE = 10;
const generatePuzzleData = (availableDict) => {
  const shuffledDict = [...availableDict].sort(() => Math.random() - 0.5).slice(0, 150);
  let grid = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(null));
  let placedWords = [];

  const canPlace = (word, startX, startY, isAcross) => {
    if (isAcross && startX + word.length > GRID_SIZE) return false;
    if (!isAcross && startY + word.length > GRID_SIZE) return false;
    if (startX < 0 || startY < 0) return false;

    let intersections = 0;
    for (let i = 0; i < word.length; i++) {
      const x = isAcross ? startX + i : startX;
      const y = isAcross ? startY : startY + i;
      if (grid[y][x] === word[i]) { intersections++; } 
      else if (grid[y][x] !== null) { return false; } 
      else {
        if (isAcross) {
          if (y > 0 && grid[y-1][x] !== null) return false;
          if (y < GRID_SIZE - 1 && grid[y+1][x] !== null) return false;
        } else {
          if (x > 0 && grid[y][x-1] !== null) return false;
          if (x < GRID_SIZE - 1 && grid[y][x+1] !== null) return false;
        }
      }
    }
    if (isAcross) {
      if (startX > 0 && grid[startY][startX - 1] !== null) return false;
      if (startX + word.length < GRID_SIZE && grid[startY][startX + word.length] !== null) return false;
    } else {
      if (startY > 0 && grid[startY - 1][startX] !== null) return false;
      if (startY + word.length < GRID_SIZE && grid[startY + word.length][startX] !== null) return false;
    }
    return intersections > 0 || placedWords.length === 0;
  };

  const placeWord = (wordObj, startX, startY, isAcross) => {
    for (let i = 0; i < wordObj.word.length; i++) {
      const x = isAcross ? startX + i : startX;
      const y = isAcross ? startY : startY + i;
      grid[y][x] = wordObj.word[i];
    }
    placedWords.push({ ...wordObj, x: startX, y: startY, isAcross });
  };

  if(shuffledDict.length === 0) return { uiGrid: [], clues: {}, placedWords: [] };
  
  const firstWord = shuffledDict.shift();
  placeWord(firstWord, Math.max(0, Math.floor((GRID_SIZE - firstWord.word.length) / 2)), Math.floor(GRID_SIZE / 2), true);

  for (const wordObj of shuffledDict) {
    let bestPlacement = null; let maxIntersections = -1;
    for (const placed of placedWords) {
      for (let i = 0; i < placed.word.length; i++) {
        const px = placed.isAcross ? placed.x + i : placed.x;
        const py = placed.isAcross ? placed.y : placed.y + i;
        for (let j = 0; j < wordObj.word.length; j++) {
          if (placed.word[i] === wordObj.word[j]) {
            const tryAcross = !placed.isAcross;
            const tx = tryAcross ? px - j : px;
            const ty = tryAcross ? py : py - j;
            if (canPlace(wordObj.word, tx, ty, tryAcross)) {
              let intersections = 0;
              for(let k = 0; k < wordObj.word.length; k++) {
                if (grid[tryAcross ? ty : ty+k][tryAcross ? tx+k : tx] === wordObj.word[k]) intersections++;
              }
              if (intersections > maxIntersections) {
                maxIntersections = intersections;
                bestPlacement = { x: tx, y: ty, isAcross: tryAcross };
              }
            }
          }
        }
      }
    }
    if (bestPlacement) placeWord(wordObj, bestPlacement.x, bestPlacement.y, bestPlacement.isAcross);
  }

  let currentNumber = 1;
  const uiGrid = [];
  const clues = { across: {}, down: {} };

  for (let y = 0; y < GRID_SIZE; y++) {
    for (let x = 0; x < GRID_SIZE; x++) {
      if (grid[y][x] === null) { uiGrid.push({ id: `${x}-${y}`, x, y, isBlock: true }); continue; }
      const isAcrossStart = (x === 0 || grid[y][x - 1] === null) && (x < GRID_SIZE - 1 && grid[y][x + 1] !== null);
      const isDownStart = (y === 0 || grid[y - 1][x] === null) && (y < GRID_SIZE - 1 && grid[y + 1][x] !== null);
      let number = null;
      if (isAcrossStart || isDownStart) number = currentNumber++;
      uiGrid.push({ id: `${x}-${y}`, x, y, isBlock: false, answer: grid[y][x], value: '', number });
    }
  }

  placedWords.forEach(pw => {
    const num = uiGrid.find(c => c.x === pw.x && c.y === pw.y).number;
    const clueObj = {
      number: num, dir: pw.isAcross ? 'across' : 'down', text: pw.clue, answer: pw.word,
      cells: Array.from({ length: pw.word.length }).map((_, i) => ({ x: pw.isAcross ? pw.x + i : pw.x, y: pw.isAcross ? pw.y : pw.y + i }))
    };
    if (pw.isAcross) clues.across[num] = clueObj; else clues.down[num] = clueObj;
  });

  return { uiGrid, clues, placedWords };
};

const generateBestPuzzle = (availableDict) => {
  let bestGrid = null; let bestScore = 0;
  for (let i = 0; i < 5; i++) {
    const data = generatePuzzleData(availableDict);
    const score = data.placedWords ? data.placedWords.length : 0;
    if (score > bestScore) { bestScore = score; bestGrid = data; }
  }
  return bestGrid;
};

// --- Icons ---
const BackspaceIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z"></path>
    <line x1="18" y1="9" x2="12" y2="15"></line><line x1="12" y1="9" x2="18" y2="15"></line>
  </svg>
);

const KEYBOARD_ROWS = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['Z', 'X', 'C', 'V', 'B', 'N', 'M', 'BACKSPACE']
];

export default function App() {
  const [user, setUser] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);

  const [grid, setGrid] = useState([]);
  const [clues, setClues] = useState({ across: {}, down: {} });
  const [activeCell, setActiveCell] = useState({ x: 0, y: 0 });
  const [direction, setDirection] = useState('across');
  const [isSolved, setIsSolved] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [hintsRemaining, setHintsRemaining] = useState(2);
  const [isHintMode, setIsHintMode] = useState(false);
  
  const usedWordsRef = useRef(new Set());
  const stateRef = useRef();

  // --- Auth Setup ---
  useEffect(() => {
    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (e) {
        setIsLoaded(true); 
      }
    };
    if (auth) initAuth();
    else setIsLoaded(true);
    
    if (auth) {
      const unsubscribe = onAuthStateChanged(auth, setUser);
      return () => unsubscribe();
    }
  }, []);

  // --- Load Cloud State ---
  useEffect(() => {
    if (!user || !db) return;
    const loadState = async () => {
      try {
        const docRef = doc(db, 'artifacts', appId, 'users', user.uid, 'gameState', 'save');
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          const data = snap.data();
          setGrid(data.grid || []);
          setClues(data.clues || { across: {}, down: {} });
          setHintsRemaining(data.hintsRemaining ?? 2);
          setTimeElapsed(data.timeElapsed || 0);
          setIsSolved(data.isSolved || false);
          usedWordsRef.current = new Set(data.usedWords || []);
          setIsLoaded(true);
          
          if (data.grid && !data.isSolved) {
             const firstValid = data.grid.find(c => !c.isBlock);
             if (firstValid) setActiveCell({ x: firstValid.x, y: firstValid.y });
          }
        } else {
          setIsLoaded(true);
        }
      } catch (e) {
        setIsLoaded(true);
      }
    };
    loadState();
  }, [user]);

  // --- Keep Reference to Latest State for Interval Sync ---
  useEffect(() => {
    stateRef.current = {
      grid, clues, hintsRemaining, timeElapsed, isSolved, usedWords: Array.from(usedWordsRef.current)
    };
  }, [grid, clues, hintsRemaining, timeElapsed, isSolved]);

  // --- Periodic Cloud Sync (Every 5 Seconds) ---
  useEffect(() => {
    if (!user || !isLoaded || !db) return;
    const syncInterval = setInterval(() => {
      if (!stateRef.current || stateRef.current.grid.length === 0) return;
      const docRef = doc(db, 'artifacts', appId, 'users', user.uid, 'gameState', 'save');
      setDoc(docRef, stateRef.current).catch(e => console.warn("Background sync paused (Offline)."));
    }, 5000);
    return () => clearInterval(syncInterval);
  }, [user, isLoaded]);

  // --- Game Logic ---
  const startNewGame = useCallback(() => {
    let availableDict = DICTIONARY.filter(item => !usedWordsRef.current.has(item.word));
    if (availableDict.length < 50) {
      usedWordsRef.current.clear();
      availableDict = [...DICTIONARY];
    }
    const puzzleData = generateBestPuzzle(availableDict);
    if (!puzzleData || !puzzleData.uiGrid) return; 

    puzzleData.placedWords.forEach(pw => usedWordsRef.current.add(pw.word));

    setGrid(puzzleData.uiGrid);
    setClues(puzzleData.clues);
    setIsSolved(false);
    setTimeElapsed(0);
    setDirection('across');
    setHintsRemaining(2);
    setIsHintMode(false);

    const firstValid = puzzleData.uiGrid.find(c => !c.isBlock);
    if (firstValid) setActiveCell({ x: firstValid.x, y: firstValid.y });

    if (user && db) {
      const docRef = doc(db, 'artifacts', appId, 'users', user.uid, 'gameState', 'save');
      setDoc(docRef, {
        grid: puzzleData.uiGrid, clues: puzzleData.clues, hintsRemaining: 2, timeElapsed: 0, isSolved: false, usedWords: Array.from(usedWordsRef.current)
      }).catch(()=>{});
    }

  }, [user]);

  useEffect(() => {
    if (isLoaded && grid.length === 0) {
      startNewGame();
    }
  }, [isLoaded, grid, startNewGame]);

  useEffect(() => {
    let timer;
    if (isLoaded && !isSolved && grid.length > 0) {
      timer = setInterval(() => setTimeElapsed(prev => prev + 1), 1000);
    }
    return () => clearInterval(timer);
  }, [isSolved, grid, isLoaded]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  useEffect(() => {
    if (grid.length === 0) return;
    const isWin = grid.every(cell => cell.isBlock || cell.value === cell.answer);
    if (isWin && !isSolved) {
      setIsHintMode(false);
      setIsSolved(true);
      if (user && stateRef.current && db) {
        const docRef = doc(db, 'artifacts', appId, 'users', user.uid, 'gameState', 'save');
        setDoc(docRef, { ...stateRef.current, isSolved: true }).catch(()=>{});
      }
    }
  }, [grid, isSolved, user]);

  const getActiveClue = useCallback(() => {
    if (grid.length === 0) return null;
    const clueSet = direction === 'across' ? clues.across : clues.down;
    const clue = Object.values(clueSet).find(clue => 
      clue.cells.some(c => c.x === activeCell.x && c.y === activeCell.y)
    );
    if (!clue) {
      const altSet = direction === 'across' ? clues.down : clues.across;
      return Object.values(altSet).find(clue => 
        clue.cells.some(c => c.x === activeCell.x && c.y === activeCell.y)
      );
    }
    return clue;
  }, [activeCell, direction, clues, grid]);

  const handleCellClick = (x, y) => {
    if (isSolved) return;
    const cell = grid.find(c => c.x === x && c.y === y);
    if (cell.isBlock) return;

    if (isHintMode) {
      if (cell.value !== cell.answer) {
        setGrid(prev => {
          const newGrid = [...prev];
          const cellIndex = newGrid.findIndex(c => c.x === x && c.y === y);
          newGrid[cellIndex] = { ...newGrid[cellIndex], value: newGrid[cellIndex].answer };
          return newGrid;
        });
        setHintsRemaining(prev => prev - 1);
      }
      setIsHintMode(false);
      setActiveCell({ x, y });
      return;
    }

    if (activeCell.x === x && activeCell.y === y) {
      setDirection(prev => prev === 'across' ? 'down' : 'across');
    } else {
      setActiveCell({ x, y });
    }
  };

  const handleKeyPress = (key) => {
    if (isSolved) return;
    if (isHintMode) setIsHintMode(false);

    if (key === 'BACKSPACE') {
      setGrid(prev => {
        const newGrid = [...prev];
        const cellIndex = newGrid.findIndex(c => c.x === activeCell.x && c.y === activeCell.y);
        if (newGrid[cellIndex].value !== '') {
          newGrid[cellIndex] = { ...newGrid[cellIndex], value: '' };
        } else {
          const clue = getActiveClue();
          if (clue) {
            const idx = clue.cells.findIndex(c => c.x === activeCell.x && c.y === activeCell.y);
            if (idx > 0) {
              const prevCell = clue.cells[idx - 1];
              setActiveCell({ x: prevCell.x, y: prevCell.y });
              const prevIndex = newGrid.findIndex(c => c.x === prevCell.x && c.y === prevCell.y);
              newGrid[prevIndex] = { ...newGrid[prevIndex], value: '' };
            }
          }
        }
        return newGrid;
      });
    } else if (/^[A-Z]$/.test(key)) {
      setGrid(prev => {
        const newGrid = [...prev];
        const cellIndex = newGrid.findIndex(c => c.x === activeCell.x && c.y === activeCell.y);
        newGrid[cellIndex] = { ...newGrid[cellIndex], value: key };
        return newGrid;
      });

      const clue = getActiveClue();
      if (clue) {
        const idx = clue.cells.findIndex(c => c.x === activeCell.x && c.y === activeCell.y);
        if (idx < clue.cells.length - 1) {
          const nextCell = clue.cells[idx + 1];
          setActiveCell({ x: nextCell.x, y: nextCell.y });
        }
      }
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      const key = e.key.toUpperCase();
      if (key === 'BACKSPACE' || /^[A-Z]$/.test(key)) {
        handleKeyPress(key);
      } else if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
         e.preventDefault();
         if (isHintMode) setIsHintMode(false);
         let nx = activeCell.x; let ny = activeCell.y;
         const isBlock = (cx, cy) => grid.find(c => c.x === cx && c.y === cy)?.isBlock;
         if (e.key === 'ArrowRight') { while(nx < GRID_SIZE - 1) { nx++; if(!isBlock(nx, ny)) break; } }
         else if (e.key === 'ArrowLeft') { while(nx > 0) { nx--; if(!isBlock(nx, ny)) break; } }
         else if (e.key === 'ArrowDown') { while(ny < GRID_SIZE - 1) { ny++; if(!isBlock(nx, ny)) break; } }
         else if (e.key === 'ArrowUp') { while(ny > 0) { ny--; if(!isBlock(nx, ny)) break; } }
         if (!isBlock(nx, ny)) setActiveCell({x: nx, y: ny});
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeCell, direction, isSolved, grid, isHintMode]);

  const activeClue = getActiveClue();

  if (!isLoaded || grid.length === 0) {
    return (
      <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center font-bold text-xl text-black">
        <ThreeRaccoon />
        <span className="mt-4 animate-pulse">Syncing Crossword...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 text-black flex flex-col font-serif select-none touch-manipulation overflow-x-hidden">
      
      {/* Header */}
      <header className="flex items-center justify-between px-3 sm:px-4 py-3 sm:py-4 bg-white border-b-[3px] border-black">
        <div className="flex items-center gap-3 sm:gap-4">
          <ThreeRaccoon />
          <div>
            <h1 className="text-xl sm:text-3xl font-black tracking-tighter uppercase leading-none">
              Daily Bandit
            </h1>
            <p className="text-[10px] sm:text-xs font-sans font-bold text-gray-500 uppercase tracking-widest mt-1">Infinite 10x10</p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <div className="text-base sm:text-xl font-sans font-bold border-2 border-black px-2 sm:px-3 py-1 bg-white">
            {formatTime(timeElapsed)}
          </div>
          {hintsRemaining > 0 ? (
            <button 
              onClick={() => setIsHintMode(!isHintMode)}
              className={`text-[10px] sm:text-xs font-sans font-bold px-2 py-1 border-2 border-black uppercase tracking-wider transition-all
                ${isHintMode 
                  ? 'bg-yellow-400 translate-y-px shadow-none' 
                  : 'bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-px active:shadow-none'}`}
            >
              {isHintMode ? 'Cancel Hint' : `💡 Use Hint (${hintsRemaining})`}
            </button>
          ) : (
            <span className="text-[9px] sm:text-[10px] font-sans font-bold text-gray-400 uppercase tracking-widest px-1">
              No Hints Left
            </span>
          )}
        </div>
      </header>

      {/* Main Game Area */}
      <main className="flex-1 flex flex-col items-center justify-start pt-4 sm:pt-6 pb-2 w-full max-w-xl mx-auto px-2">
        
        {/* Dynamic Clue/Hint Banner */}
        <div className="w-full mb-4">
          {isHintMode ? (
            <div 
              className="bg-yellow-100 border-2 border-black py-2 sm:py-3 px-2 flex flex-col items-center justify-center cursor-pointer shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] animate-pulse"
              onClick={() => setIsHintMode(false)}
            >
              <span className="text-xs sm:text-sm font-sans font-bold uppercase tracking-widest mb-0.5 flex items-center gap-2 text-yellow-900">
                💡 Hint Mode Active
              </span>
              <p className="text-base sm:text-lg font-bold leading-tight text-center px-2 min-h-[36px] flex items-center">
                Tap any square to reveal its letter!
              </p>
            </div>
          ) : (
            <div 
              className="bg-[#e6f4ff] border-2 border-black py-2 sm:py-3 px-2 flex flex-col items-center justify-center cursor-pointer active:bg-blue-100 transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
              onClick={() => setDirection(prev => prev === 'across' ? 'down' : 'across')}
            >
              <span className="text-xs sm:text-sm font-sans font-bold uppercase tracking-widest mb-0.5 flex items-center gap-2 text-blue-900">
                {activeClue?.number || '-'} {activeClue?.dir || direction} 
                <span className="text-blue-500 text-[10px] font-normal normal-case tracking-normal">(Tap to swap)</span>
              </span>
              <p className="text-base sm:text-lg font-bold leading-tight text-center px-2 min-h-[36px] flex items-center">
                {activeClue?.text || 'No clue for this cell in this direction.'}
              </p>
            </div>
          )}
        </div>

        {/* 10x10 Fixed Grid */}
        <div 
          className={`grid bg-black border-[3px] border-black w-full max-w-[400px] mx-auto aspect-square shadow-lg transition-all ${isHintMode ? 'ring-4 ring-yellow-400 scale-[1.01]' : ''}`}
          style={{ 
            gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))`,
            gridTemplateRows: `repeat(${GRID_SIZE}, minmax(0, 1fr))`,
            gap: '1px'
          }}
        >
          {grid.map((cell) => {
            if (cell.isBlock) {
              return <div key={cell.id} className="bg-black w-full h-full" />;
            }

            const isFocused = activeCell.x === cell.x && activeCell.y === cell.y;
            const isHighlighted = activeClue?.cells.some(c => c.x === cell.x && c.y === cell.y);
            const isCorrect = isSolved && cell.value === cell.answer;

            let bgColor = "bg-white";
            if (isHintMode) bgColor = "bg-yellow-50 hover:bg-yellow-200"; 
            else if (isFocused) bgColor = "bg-[#ffda00]";
            else if (isHighlighted) bgColor = "bg-[#a7d8ff]";

            return (
              <div
                key={cell.id}
                onClick={() => handleCellClick(cell.x, cell.y)}
                className={`
                  relative w-full h-full overflow-hidden transition-colors cursor-pointer min-w-0 min-h-0
                  ${bgColor} ${isCorrect && !isFocused ? 'text-green-700' : 'text-black'}
                `}
              >
                {cell.number && (
                  <span className="absolute top-0.5 left-0.5 text-[8px] sm:text-[9px] font-sans font-bold text-black leading-none pointer-events-none select-none z-10">
                    {cell.number}
                  </span>
                )}
                <span className="absolute inset-0 flex items-center justify-center font-sans text-xl sm:text-2xl font-medium uppercase pt-2 pointer-events-none select-none">
                  {cell.value}
                </span>
              </div>
            );
          })}
        </div>
      </main>

      {/* Keyboard */}
      <div className={`w-full max-w-lg mx-auto p-1.5 sm:p-2 bg-gray-200 pb-6 sm:pb-8 border-t-[3px] border-black font-sans shadow-[0px_-4px_10px_rgba(0,0,0,0.1)] transition-opacity ${isHintMode ? 'opacity-50 pointer-events-none' : ''}`}>
        <div className="flex flex-col gap-1.5 sm:gap-2">
          {KEYBOARD_ROWS.map((row, i) => (
            <div key={i} className="flex justify-center gap-1 sm:gap-1.5 w-full">
              {row.map(key => (
                <button
                  key={key}
                  onClick={() => handleKeyPress(key)}
                  className={`
                    flex items-center justify-center h-10 sm:h-12 rounded bg-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]
                    font-bold text-lg sm:text-xl text-black active:translate-y-1 active:shadow-none transition-all
                    ${key === 'BACKSPACE' 
                      ? 'px-2 sm:px-4 w-12 sm:w-16 bg-gray-300' 
                      : 'flex-1 max-w-[36px] sm:max-w-[44px]'}
                  `}
                >
                  {key === 'BACKSPACE' ? <BackspaceIcon /> : key}
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Custom 3D Win Modal */}
      {isSolved && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300 font-sans">
          <div className="bg-white border-4 border-black p-6 sm:p-8 rounded-none shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col items-center max-w-sm w-full transform animate-in zoom-in-95 duration-500 relative">
            
            <div className="-mt-16 mb-2">
              <ThreeRaccoonWin />
            </div>

            <h2 className="text-3xl font-serif font-black mb-2 mt-2 text-center uppercase border-b-2 border-black pb-2 w-full tracking-wider">Masterful!</h2>
            <p className="text-gray-700 mb-6 text-center text-lg mt-2">
              Bandit approves.<br/>You crushed today's puzzle in<br/>
              <span className="text-black text-3xl font-black mt-2 block tracking-tight">{formatTime(timeElapsed)}</span>
            </p>
            
            <button 
              onClick={startNewGame}
              className="w-full py-4 bg-[#ffda00] border-2 border-black text-black font-black text-lg hover:bg-[#e6c400] active:translate-y-1 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none transition-all uppercase tracking-widest"
            >
              Play Another
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
