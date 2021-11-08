import Phaser from 'phaser';
import GesturesPlugin from 'phaser3-rex-plugins/plugins/gestures-plugin.js';

import map from './assets/tilemaps/map.json'

import background from './assets/images/space_background.gif';
import ground from './assets/tilesets/ground.png'; 
import terrain_1 from './assets/tilesets/terrain_1.png';
import terrain_2 from './assets/tilesets/terrain_2.png';
import sg_1 from './assets/tilesets/sg_1.png';
import sg_2 from './assets/tilesets/sg_2.png';

class Moon extends Phaser.Scene
{
    constructor () {
        super();
    }

    preload () {
        this.load.image('background', background);
        this.load.image('ground', ground);
        this.load.image('terrain_1', terrain_1);
        this.load.image('terrain_2', terrain_2);
        this.load.image('sg_1', sg_1);
        this.load.image('sg_2', sg_2)
        this.load.tilemapTiledJSON('map', map);
    }
      
    create () {
    
        const map = this.add.tilemap('map');

        console.log(map);
        
        // this is really misleading... the name is actually the first argument ... tiled won't let me rename it for some reason
        // and the second argument is the string name of the image we loaded above
        const tileset_ground = map.addTilesetImage('../tilesets/ground.png', 'ground');
        const tileset_terrain_1 = map.addTilesetImage('../tilesets/terrain_1.png', 'terrain_1');
        const tileset_terrain_2 = map.addTilesetImage('../tilesets/terrain_2.png', 'terrain_2');
        const tileset_sg_1 = map.addTilesetImage('../tilesets/sg_1.png', 'sg_1');
        const tileset_sg_2 = map.addTilesetImage('../tilesets/sg_2.png', 'sg_2');
        
        // note: the cullPadding values can be optimized a ton... I was just tired of the tiles unloading when they shouldn't

        const layer_ground = map
            .createLayer('ground', [ tileset_ground ])
            .setCullPadding(22, 22);

        const layer_terrain = map
            .createLayer('terrain', [ tileset_terrain_1, tileset_terrain_2 ])
            .setCullPadding(22, 22);

        // I have no friggin clue why the layer below needs the offset that I had to add.... help! if you know tell me
        const layer_sg = map
            .createLayer('sg', [ tileset_sg_1, tileset_sg_2 ], 1408 - 128, 704 - 128)
            .setCullPadding(22, 22)
            // .renderDebug(this.add.graphics());


        const cursors = this.input.keyboard.createCursorKeys();

        this.cameras.main.centerOn(1419, 2838);
        this.cameras.main.setZoom(0.5);

        // clean-up remaining stuff
        const controlConfig = {
            camera: this.cameras.main,
            left: cursors.left,
            right: cursors.right,
            up: cursors.up,
            down: cursors.down,
            acceleration: 0.04,
            drag: 0.0005,
            maxSpeed: 0.7
        };

        this.controls = new Phaser.Cameras.Controls.SmoothedKeyControl(controlConfig);
    
        this.zoomVelocity = 0.05;
            this.zoomMax = 1.1;
            this.zoomMin = 0.2;

        this.input.mouse.target.addEventListener("wheel", function(event) {
            if(event.wheelDeltaY > 0) {
            if(this.cameras.main.zoom < this.zoomMax)
                this.cameras.main.zoom += this.zoomVelocity;
            }
            else {
            if(this.cameras.main.zoom > this.zoomMin)
                this.cameras.main.zoom -= this.zoomVelocity;
            }
        }.bind(this));

        const pinch = this.rexGestures.add.pinch({ enable: true });

        pinch   
            .on('drag1', function (pinch) {
                const drag1Vector = pinch.drag1Vector;
                console.log(this.cameras)
                this.cameras.main.scrollX -= drag1Vector.x / this.cameras.main.zoom;
                this.cameras.main.scrollY -= drag1Vector.y / this.cameras.main.zoom;
            }, this)
            .on('pinch', function (pinch) {
                const scaleFactor = pinch.scaleFactor;
                this.cameras.main.zoom *= scaleFactor;
            }, this);

    }

    update (time, delta) {
        this.controls.update(delta);

        // if(this.input.activePointer.isDown) {
		// 	if(this.origDragPoint) {
		// 		this.cameras.main.scrollX += (this.origDragPoint.x - this.input.activePointer.position.x) / this.cameras.main.zoom;
		// 	  this.cameras.main.scrollY += (this.origDragPoint.y - this.input.activePointer.position.y) / this.cameras.main.zoom;
		// 	}
			
		// 	this.origDragPoint = this.input.activePointer.position.clone();
		// }
		// else {
		// 	this.origDragPoint = null;
		// }
    }
}

const body = document.querySelector('body');
console.log(body);
console.log(background);
body.style.backgroundColor = '#000000';

body.style.backgroundImage = `url(${background})`;
body.style.backgroundRepeat = 'no-repeat';
body.style.backgroundSize = 'cover';


const config = {
    type: Phaser.WEBGL,
    parent: 'phaser-example',
    width: window.innerWidth,
    height: window.innerHeight,
    transparent: true,
    scene: Moon,
    plugins: {
        scene: [{
            key: 'rexGestures',
            plugin: GesturesPlugin,
            mapping: 'rexGestures',
        }],
    },
};

const game = new Phaser.Game(config);
