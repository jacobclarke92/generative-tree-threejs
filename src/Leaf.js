import THREE, { Vector3, Line, Color, MeshBasicMaterial, SphereGeometry, Mesh, Object3D } from 'three'

const defaultProps = {
	begin: new Vector3(0,0,0),
	color: 0xaf86e0,
	leafSize: 6,
}

export default class Leaf {
	
	constructor(props = {}) {
		this.props = Object.assign({}, defaultProps, props);
		this.material = new MeshBasicMaterial({
			color: this.props.leafColor,
		});
		this.geometry = new SphereGeometry( this.props.leafSize, 8, 8 );
		this.mesh = new Mesh(this.geometry, this.material);
		this.obj = new Object3D();
		this.obj.add(this.mesh);
		this.obj.position.set(
			this.props.begin.x,
			this.props.begin.y,
			this.props.begin.z,
		);
		this.get = () => this.obj;
	}

	update(props) {
		const nextProps = Object.assign({}, this.props, props);
		if(nextProps.leafColor != this.props.leafColor) {
			this.material.color = new Color(nextProps.leafColor);
		}
		if(nextProps.leafSize != this.props.leafSize) {
			this.mesh.geometry = new SphereGeometry( nextProps.leafSize, 8, 8 );
		}
		this.props = nextProps;
	}

}