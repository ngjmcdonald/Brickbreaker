function Brick(posX,posY,myColor,ctx,canvas){
	//size properties
	this.height=40;
	this.width = 150;
	//position properties
	this.x = posX;
	this.y = posY;
	//color propertie
	this.c = myColor;
	//difficulty and hits recieved property
	this.type ="normal";
	this.hitCount = 0;
	//check if levels above 2
	if(newLevel.myLevel > 2){
		//randomly choose if this brick will be a hard to destroy brick
		if(Math.floor(Math.random()*20) <= 5){
			this.type = 'hard';
		}
	}
	//method to draw 
	this.draw =function(){
		ctx.beginPath();
		ctx.rect(this.x,this.y,this.width,this.height);
		ctx.fillStyle = this.c;
		ctx.fill();
		ctx.lineWidth = 5;
		ctx.strokeStyle = 'black';
		ctx.stroke();
	}
}