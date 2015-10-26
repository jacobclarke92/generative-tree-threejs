import THREE, { WebGLRenderer, PerspectiveCamera, Scene, Vector3 } from 'three'
import { Component } from 'react'
import { GUI } from 'dat-gui'
import 'seedrandom'
import { stringToColor } from './utils'
import Branch from './Branch'
import Leaf from './Leaf'

Math.seedrandom('hello');
console.log(Math.random());
console.log(Math.random());

let orbit = 0;

class params {
	constructor() {
		this.rotateSpeed = 20;
		this.bgcolor = '#DCC3D2';
		this.lineColor = '#BB1D7C';
		this.leafColor = '#af86e0';
		this.seed = 0;
		this.lineWidth = 8;
		this.lineThinning = 0.07;
		this.trimChance = 0.06;
		this.splitChance = 0.06;
		this.iterations = 100;
		this.branchLength = 18;
		this.leafSize = 6;
		this.param3 = 1;
	}
}

export default class App extends Component {

	constructor(props) {
		super(props);

		// make param overlay
		this.params = new params();
		this.gui = new GUI();
		this.gui.add(this.params, 'rotateSpeed', 0, 150);
		this.gui.addColor(this.params, 'bgcolor').onChange(() => {
			this.renderer.setClearColor(stringToColor(this.params.bgcolor), 1);
		});
		this.gui.addColor(this.params, 'lineColor');
		this.gui.addColor(this.params, 'leafColor');
		this.gui.add(this.params, 'seed', 0, 5000).listen().onChange(() => this.reseed());
		this.gui.add(this.params, 'iterations', 1, 150);
		this.gui.add(this.params, 'splitChance', 0, 0.2).onChange(() => this.reseed());
		this.gui.add(this.params, 'trimChance', 0, 0.5).onChange(() => this.reseed());
		this.gui.add(this.params, 'branchLength', 1, 50).onChange(() => this.reseed());
		this.gui.add(this.params, 'lineWidth', 0.5, 8).onChange(() => this.reseed());;
		this.gui.add(this.params, 'lineThinning', 0.01, 0.2).onChange(() => this.reseed());
		this.gui.add(this.params, 'leafSize', 1, 15);
		this.gui.add(this.params, 'param3', {Stopped: 0, Slow: 1, Fast: 2});
		
		// bind param changes to rerender
		const ignoreUpdate = ['bgcolor','seed', 'branchLength', 'splitChance', 'lineWidth', 'lineThinning'];
		for(let controller of this.gui.__controllers) {
			if(ignoreUpdate.indexOf(controller.property) < 0) {
				controller.onChange(() => this.paramsUpdated());
			}
		}

		// set init state
		this.state = {
			width: window.innerWidth,
			height: window.innerHeight,
		}

		props.stage.addEventListener('click', () => {
			this.params.seed = Math.round(Math.random()*5000);
			this.reseed();
		})

		// init objects
		this.branches = [];
	}

	componentWillMount() {
		this.reseed();
		this.initScene();
	}

	componentDidMount() {
		this.doAnimation();
	}

	reseed() {
		console.log('reseeding');
		this.iterationCount = 0;
		for(let branch of this.branches) this.scene.remove(branch.get());
		this.branches = [];
		this.paramsUpdated();
	}

	paramsUpdated() {
		Math.seedrandom(this.params.seed);
		for(let branch of this.branches) {
			branch.update({
				leafColor: stringToColor(this.params.leafColor),
				lineColor: stringToColor(this.params.lineColor),
				lineWidth: this.params.lineWidth,
				leafSize: this.params.leafSize,
			});
		}
	}

	initScene() {
		this.renderer = new WebGLRenderer({
			antialias: true,
		});
		this.renderer.setClearColor(stringToColor(this.params.bgcolor), 1);
		this.camera = new PerspectiveCamera(
			80,		// FOV
			this.state.width / this.state.height, // aspect ratio
			1, 		// near
			50000	// far
		);
		this.scene = new Scene();
		this.scene.add(this.camera);
		this.camera.position.z = 250;
		this.camera.position.y = 200;
		this.renderer.setSize(this.state.width, this.state.height);
		this.props.stage.appendChild(this.renderer.domElement);
	}

	doAnimation() {

		orbit += this.params.rotateSpeed / 1000;

		const { lineWidth, lineThinning, lineColor, leafColor, leafSize, branchLength } = this.params;

		if(this.iterationCount < this.params.iterations) {
			this.iterationCount ++;
			let lastBranches = this.branches.filter(branch => branch.props.iteration == this.iterationCount-1);
			if(!lastBranches.length) lastBranches.push({
				props: {
					end: new Vector3(0,30,0),
					lineWidth: lineWidth,
				}
			})
			for(let lastBranch of lastBranches) {
				const splits = Math.random() < this.params.splitChance ? 2 : 1;
				for(let i=0; i<splits; i++) {
					const trim = Math.random() < this.params.trimChance;
					if(trim || this.iterationCount == this.params.iterations) {
						const leaf = new Leaf({
							begin: lastBranch.props.end,
							leafColor: stringToColor(leafColor),
						});
						this.branches.push(leaf);
						this.scene.add(leaf.get());
					} else {
						const branch = new Branch({
							lineWidth: lastBranch.props.lineWidth - lineThinning,
							leafSize,
							branchLength,
							lineColor: stringToColor(lineColor),
							iteration: this.iterationCount,
							begin: lastBranch.props.end,
							parent: lastBranch,
						});
						this.branches.push(branch);
						this.scene.add(branch.get());
					}
				}
			}
		}

		if(this.branches.length < 5) {
			const branch = new Branch({
				lineColor: stringToColor(this.params.lineColor),
				lineWidth: this.params.lineWidth,
				iteration: this.iterationCount,
			});
			this.branches.push(branch);
			this.scene.add(branch.get());
		}

		this.camera.position.x = Math.cos(orbit) * 200;
		this.camera.position.z = Math.sin(orbit) * 200;
		this.camera.lookAt(new Vector3(0,150,0));

		this.renderer.render(this.scene, this.camera);

		requestAnimationFrame(::this.doAnimation);
	}
	
	render() {
    	return null;
	}

}