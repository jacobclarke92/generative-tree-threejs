import THREE, { Vector3, Line, Color, LineBasicMaterial, Geometry, Object3D, CylinderGeometry, MeshBasicMaterial, Mesh, Matrix4, Quaternion } from 'three'

const defaultProps = {
	lineColor: new Color(0xFFFFFF),
	lineWidth: 2,
	branchLength: 10,
	begin: new Vector3(0,0,0),
	end: new Vector3(0,30,0),
}

export default class Branch {
	
	constructor(props = {}) {
		this.props = Object.assign({}, defaultProps, props);
		if(this.props.parent) {
			this.props.end = new Vector3(
				this.props.begin.x + Math.random()*this.props.branchLength - this.props.branchLength/2, 
				this.props.begin.y + Math.random()*5, 
				this.props.begin.z + Math.random()*this.props.branchLength - this.props.branchLength/2
			);
		}
		/*
		this.material = new LineBasicMaterial({
			color: this.props.lineColor,
			linewidth: this.props.lineWidth,
		});
		this.geometry = new Geometry();
		this.geometry.vertices.push(
			this.props.begin,
			this.props.end,
		);
		this.line = new Line(this.geometry, this.material);
		this.obj = new Object3D();
		this.obj.add(this.line);
		*/
		this.material = new MeshBasicMaterial({
			color: this.props.lineColor,
		});
		this.geometry = new CylinderGeometry(
			this.props.lineWidth, 	// radius top
			this.props.lineWidth,	// radius bottom
			this.props.branchLength,// height
			10, // radius segments
			1,  // height segments
		);
		const quaternion = new Quaternion().setFromUnitVectors( this.props.begin, this.props.end );
		// this.geometry.applyMatrix( new Matrix4().makeTranslation(0, this.props.branchLength/2, 0) );
		this.geometry.applyMatrix( new Matrix4().makeRotationFromQuaternion( quaternion ) );
		this.obj = new Mesh(this.geometry, this.material);
		this.obj.position.set(
			this.props.begin.x,
			this.props.begin.y,
			this.props.begin.z
		);
		this.get = () => this.obj;
	}

	update(props) {
		const nextProps = Object.assign({}, this.props, props);
		if(nextProps.lineColor != this.props.lineColor) {
			this.material.color = new Color(nextProps.lineColor);
		}
		// if(nextProps.lineWidth != this.props.lineWidth) {
		// 	this.material.linewidth = nextProps.lineWidth;
		// }
		// this.obj.position.x = Math.random()*100 - 50;
		this.props = nextProps;
	}

}