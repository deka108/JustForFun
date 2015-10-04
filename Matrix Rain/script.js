/* thecodeplayer.com */
var c = document.getElementById("c");
var ctx = c.getContext("2d");

// making the canvas full screen
c.height = window.innerHeight;
c.width = window.innerWidth;

// any characters
//var characters = "01";
var characters = " MDP Group 23 ";

// convert string into an array of single characters
characters = characters.split("");

var font_size = 23;
var columns = c.width/font_size;

// an array of drops, one per column
var drops = [];

// i is the ith column from left. every drops have same y-coordinate of 1 at initial
for(var i=0; i<columns; i++){
	drops[i] = Math.floor(Math.random()*c.height/4);
}

j = 0;

// draw the characters
function draw(){
	// black background for canvas, and translucent bg to show the trail
	ctx.fillStyle = "rgba(0,0,0,0.05)"; // 0.05 is transparency
	ctx.fillRect(0, 0, c.width, c.height); // set the background color to black

	ctx.fillStyle = "#0F0"; // green text, RGB
	ctx.font = font_size + "px courier";

	
	//looping over drops
	for(var i=0; i<drops.length; i++){
		// pick random binary to print
		//var text = characters[Math.floor(Math.random()*characters.length)];
		if (j == characters.length)
			j=0;

		// x = i * font_size, y = value of drops[i] * font_size
		//ctx.fillText(text, i*font_size, drops[i]*font_size);
		ctx.fillText(characters[j], i*font_size, drops[i]*font_size);

		// sending drop back to top randomly after it has crossed the screen
		// adding randomness to the reset to make drops scattered on y axis
		if (drops[i]*font_size>c.height && Math.random() > 0.975)
			drops[i] = 0;

		// increment y coordinate
		drops[i]++;
	}
	j++;
}
setInterval(draw, 40);