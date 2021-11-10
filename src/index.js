import Phaser from 'phaser';
import GesturesPlugin from 'phaser3-rex-plugins/plugins/gestures-plugin.js';

import map from './assets/tilemaps/map.json'

import background from './assets/images/space_background.gif';
import edge_corner from './assets/images/edge.png';
import edge_left from './assets/images/edge_left.png';
import edge_right from './assets/images/edge_right.png';

import ground from './assets/tilesets/ground.png'; 
import terrain_1 from './assets/tilesets/terrain_1.png';
import terrain_2 from './assets/tilesets/terrain_2.png';
import sg_1 from './assets/tilesets/sg_1.png';
import sg_2 from './assets/tilesets/sg_2.png';

import selector from './assets/images/selector.png';

class Moon extends Phaser.Scene
{
    constructor () {
        super();
    }

    preload () {
        this.load.image('background', background);
        this.load.image('ground', ground);
        this.load.image('edge_corner', edge_corner);
        this.load.image('edge_left', edge_left);
        this.load.image('edge_right', edge_right);
        this.load.image('terrain_1', terrain_1);
        this.load.image('terrain_2', terrain_2);
        this.load.image('sg_1', sg_1);
        this.load.image('sg_2', sg_2)
        this.load.tilemapTiledJSON('map', map);

        this.load.image('selector', selector);
    }
      
    create () {
    
        this.map = this.add.tilemap('map');


        
        // this is really misleading... the name is actually the first argument ... tiled won't let me rename it for some reason
        // and the second argument is the string name of the image we loaded above
        const tileset_ground = this.map.addTilesetImage('../tilesets/ground.png', 'ground');
        const tileset_terrain_1 = this.map.addTilesetImage('../tilesets/terrain_1.png', 'terrain_1');
        const tileset_terrain_2 = this.map.addTilesetImage('../tilesets/terrain_2.png', 'terrain_2');
        const tileset_sg_1 = this.map.addTilesetImage('../tilesets/sg_1.png', 'sg_1');
        const tileset_sg_2 = this.map.addTilesetImage('../tilesets/sg_2.png', 'sg_2');
        
        // note: the cullPadding values can be optimized a ton... I was just tired of the tiles unloading when they shouldn't

        const layer_ground = this.map
            .createLayer('ground', [ tileset_ground ])
            .setCullPadding(22, 22);

        const layer_terrain = this.map
            .createLayer('terrain', [ tileset_terrain_1, tileset_terrain_2 ])
            .setCullPadding(22, 22)

        // I have no friggin clue why the layer below needs the offset that I had to add.... help! if you know tell me
        const layer_sg = this.map
            .createLayer('sg', [ tileset_sg_1, tileset_sg_2 ], 1408 - 128, 704 - 128)
            .setCullPadding(22, 22)
            // .renderDebug(this.add.graphics());

        this.createImageLayers();

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
                this.cameras.main.scrollX -= drag1Vector.x / this.cameras.main.zoom;
                this.cameras.main.scrollY -= drag1Vector.y / this.cameras.main.zoom;
            }, this)
            .on('pinch', function (pinch) {
                const scaleFactor = pinch.scaleFactor;
                this.cameras.main.zoom *= scaleFactor;
            }, this);


        // this needs to be updated
        // this.marker = this.add.image().setTexture('selector');
        // this is from bhefore when marker was a Graphic instead of Image
        this.marker = this.add.graphics();
        this.marker.lineStyle(10, 0x000000, 1);
        this.marker.strokeRect(0, 0, this.map.tileWidth * layer_sg.scaleX, this.map.tileHeight * layer_sg.scaleY); 
        this.marker.strokeRect(0, 0, 256, 124);
   
        // maybe https://phaser.io/examples/v3/view/input/cursors/custom-cursor is thbe correct answer

        
        console.log(this.map);

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
        var worldPoint = this.input.activePointer.positionToCamera(this.cameras.main);

        const pointerTiles = Phaser.Tilemaps.Components.GetWorldToTileXYFunction(1)(worldPoint.x, worldPoint.y, true, null, this.cameras.main, this.map.layers[2]);

        // console.log('pointerTiles', pointerTiles);


        // console.log(this.map.worldToTileY(worldPoint.y, true, this.cameras.main, 'sg'));
        // console.log({ pointerTiles.x, pointerTiles.y });

        let tmpVec = Phaser.Tilemaps.Components.GetTileToWorldXYFunction(1)(pointerTiles.x, pointerTiles.y, null, this.cameras.main, this.map.layers[2]);
        // this.marker.y = Phaser.Tilemaps.Components.GetTileToWorldYFunction(1)(pointerTiles.y)
        // Snap to tile coordinates, but in world space
        // this.marker.x = (pointerTiles.x);
        // this.marker.y = this.map.tileToWorldY(pointerTiles.y);

        

    }

    createImageLayers() {
        const res = [];
        const names = this.map.getImageLayerNames();

        names.forEach(name => {
            const idx = this.map.getImageIndex(name);
            const layer = this.map.images[idx];
            // this part below is so random ... need to figure these out fu
            const img = this.add.image(layer.x - 1408, layer.y + (704 - 64), name);
            img.setOrigin(0, 0);
            console.log(img.originX, img.originY);
            res.push(img);
        });

        return res;
    }
}

const body = document.querySelector('body');
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
