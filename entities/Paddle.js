function Paddle(myColor,ctx){
	// width and height propertys
	this.height = 20;
	this.width = 150;
	// position properties
	this.x = W/2 - this.width/2;
	this.y = H - this.height;
	// color property
	this.c = myColor;
	//draw method
	this.draw = function(){
		ctx.fillStyle = this.c;
		ctx.fillRect(this.x,this.y,this.width,this.height);
	}
}