function Ball(myX,myY,myVx,myVy,mySize,myColor,ctx,canvas){
	//x and y properties
	this.x = myX;
	this.y = myY;
	//radius property
	this.r = mySize;
	//color property
	this.c = myColor;
	//speed properties
	this.vx = myVx;
	this.vy = myVy;
	//method to draw ball
	this.draw = function(){
		ctx.beginPath();
		ctx.fillStyle = this.c;
		ctx.arc(this.x,this.y,this.r,0,Math.PI*2,false);
		ctx.fill();
	};
}