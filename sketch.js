var gameChar_x;
var gameChar_y;
var floorPos_y;
var scrollPos;
var gameChar_world_x;

var isLeft;
var isRight;
var isFalling;
var isJumping;

var clouds;
var mountains;
var mountains_x;

var canyons;
var canyons_x;
var collectables;

var trees_x;
var treePos_y;

var game_score;
var flagpole;

var platforms;
var lives;

var isContact;

var jumpSound;

var enemies;

function preload() {
	soundFormats('mp3', 'wav');

	//load your sounds here
	jumpSound = loadSound('assets/jump.wav');
	jumpSound.setVolume(0.1);
}


function setup() {
	createCanvas(1024, 576);

	lives = 9
	textSize(20);

	startGame();
}

function startGame() {
	floorPos_y = height * 3 / 4;
	gameChar_x = width / 2;
	gameChar_y = floorPos_y;

	// Variable to control the background scrolling.
	scrollPos = 0;

	// Variable to store the real position of the gameChar in the game
	// world. Needed for collision detection.
	gameChar_world_x = gameChar_x - scrollPos;

	// Boolean variables to control the movement of the game character.
	isLeft = false;
	isRight = false;
	isFalling = false;
	isJumping = false;
	isContact = false;

	clouds = {
		x: 90,
		y: 60,
		diameter: 70
	};

	mountains = {
		a_x: 0,
		a_y: 0,
		b_x: 0,
		b_y: 0,
		c_x: 0,
		c_y: 0
	};
	treePos_y = height / 2

	// Initialise arrays of scenery objects.
	trees_x = [-300, 30, 500, 950, 2000];

	clouds = []
	for (var i = 0; i < 20; i++) {
		clouds.push({ x: random(-400, 3800), y: random(100, 200), diameter: 70 })
	}

	mountains = [

		{
			a_x: 400,
			a_y: floorPos_y - 150,
			b_x: 250,
			b_y: floorPos_y,
			c_x: 550,
			c_y: floorPos_y
		},
		{
			a_x: 200,
			a_y: floorPos_y - 250,
			b_x: 105,
			b_y: floorPos_y,
			c_x: 400,
			c_y: floorPos_y
		},
		{
			a_x: 1100,
			a_y: floorPos_y - 200,
			b_x: 850,
			b_y: floorPos_y,
			c_x: 1300,
			c_y: floorPos_y
		},
		{
			a_x: 1200,
			a_y: floorPos_y - 150,
			b_x: 900,
			b_y: floorPos_y,
			c_x: 1400,
			c_y: floorPos_y
		},
		{
			a_x: 2000,
			a_y: floorPos_y - 250,
			b_x: 1800,
			b_y: floorPos_y,
			c_x: 2300,
			c_y: floorPos_y
		},
		{
			a_x: 2200,
			a_y: floorPos_y - 200,
			b_x: 1900,
			b_y: floorPos_y,
			c_x: 2400,
			c_y: floorPos_y
		},

	];

	canyons_x = [
		{ width: 200, x_pos: -200 },
		{ width: 300, x_pos: 550 },
		{ width: 350, x_pos: 2500 },
		{ width: 340, x_pos: 4000 },

	];

	collectables = [];

	for (var i = 0; i < 30; i++) {
		collectables.push({ x_pos: random(-1000, 3000), y_pos: random(110, 300), size: 25, isFound: false })
	}

	platforms = [];

	platforms.push(createPlatforms(100, floorPos_y - 100, 100));
	platforms.push(createPlatforms(700, floorPos_y - 200, 150));
	platforms.push(createPlatforms(2000, floorPos_y - 150, 120));


	game_score = 0;

	flagpole = {
		isReached: false,
		x_pos: 5000
	};

	enemies = [];
	enemies.push(new Enemy(100, floorPos_y - 10, 100));
	enemies.push(new Enemy(700, floorPos_y - 20, 100));
	enemies.push(new Enemy(1200, floorPos_y - 15, 100));

}

function draw() {
	background(100, 155, 255); // fill the sky blue

	noStroke();
	fill(20, 205, 120);
	rect(0, floorPos_y, width, height / 4); // draw some green ground


	push();
	translate(scrollPos, 0)
	drawClouds();
	drawMountains();
	drawTrees();
	drawPlatforms();

	
	// Draw canyons.
	for (var i = 0; i < canyons_x.length; i++) {
		drawCanyon(canyons_x[i]);
		checkCanyon(canyons_x[i])
	}


	// Draw collectable items.
	for (var i = 0; i < collectables.length; i++) {
		if (collectables[i].isFound == false) {
			drawCollectable(collectables[i]);
			checkCollectable(collectables[i]);
		}
	}

	//draw enemies
	for (var i = 0; i < enemies.length; i++) {
		enemies[i].draw()
	}

	renderFlagpole();

	checkPlayerDie();

	pop();

	// Draw game character.
	drawGameChar();

	fill(255);
	noStroke();
	textSize(20)
	text("score: " + game_score, 20, 20);
	text("lives:" + lives, 130, 20);

	var lifetoken_x = 20
	for (var i = 0; i < lives; i++) {
		fill(255, 0, 100);
		ellipse(lifetoken_x, 50, 20, 20);
		lifetoken_x += 25
	}

	if (lives < 1) {

		push();
		textSize(40);
		fill(255, 0, 0);
		text("Game over. Press space to continue.", width / 4, height / 2)
		// pop();
		return;
	}
	if (flagpole.isReached) {
		push();
		textSize(40);
		fill(0, 255, 0);
		text("Level complete. Press space to continue.", width / 5, height / 2)
		pop();
		return;
	}

	// Logic to make the game character move or the background scroll.
	if (isLeft) {
		if (gameChar_x > width * 0.2) {
			gameChar_x -= 5;
		} else {
			scrollPos += 5;
		}
	}

	if (isRight) {
		if (gameChar_x < width * 0.8) {
			gameChar_x += 5;
		} else {
			scrollPos -= 5; // negative for moving against the background
		}
	}

	if (isJumping) {

		if (gameChar_y <= height - floorPos_y) {
			isJumping = false;
		} {
			gameChar_y -= 15
		}

	}
	if (isFalling) {
		gameChar_y += 5;
	}

	if (gameChar_y < floorPos_y) {
		isContact = false;
		for (var i = 0; i < platforms.length; i++) {
			if (platforms[i].checkContact(gameChar_world_x, gameChar_y) == true) {
				isContact = true; console.log('touching platform')
				break;
			}
		}
		if (isContact == false) {
			gameChar_y += 1;
			isFalling = true;
		} else {
			isFalling = false;
		}
	} else {
		isFalling = false;
	}
	if (flagpole.isReached == false)
		checkFlagpole();

	for (var i = 0; i < enemies.lenght; i++) {
		enemies[i].draw()
	}
	// Update real position of gameChar for collision detection.
	gameChar_world_x = gameChar_x - scrollPos;
}


// ---------------------
// Key control functions
// ---------------------

function keyPressed() {
	// if statements to control the animation of the character when
	// keys are pressed.

	//open up the console to see how these work
	// console.log("keyPressed: " + key);
	// console.log("keyPressed: " + keyCode);


	if (keyCode == 37) {
		// console.log("left arrow");
		isLeft = true;
	}
	if (keyCode == 39) {
		// console.log("right arrow");
		isRight = true;
	}
	if (keyCode == 32 && !isFalling) {
		// console.log("space bar")
		isJumping = true;
		jumpSound.play();
	}
	if (keyCode == 40) {
		// console.log("down arrow");
		isFalling = true;
	}

}

function keyReleased() {
	// if statements to control the animation of the character when
	// keys are released.

	// console.log("keyReleased: " + key);
	// console.log("keyReleased: " + keyCode);
	if (keyCode == 37) {
		// console.log("left arrow");
		isLeft = false;
	}
	if (keyCode == 39) {
		// console.log("right arrow");
		isRight = false;
	}
	if (keyCode == 32) {
		// console.log("space bar");
		isJumping = false;
	}
	if (keyCode == 40) {
		// console.log("down arrow");
		isFalling = false;
	}

}


// ------------------------------
// Game character render function
// ------------------------------

pop();
// Function to draw the game character.

function drawGameChar() {
	//the game character
	stroke(0);

	if (isLeft && isFalling) {
		// add your jumping-left code

		//face
		fill(232, 218, 98);
		ellipse(gameChar_x + 2, gameChar_y - 56, 20);

		//body
		fill(204, 194, 255);
		rect(gameChar_x - 10, gameChar_y - 50, 20, 25);

		//legs
		fill(0)
		rect(gameChar_x - 4, gameChar_y - 15, -5, -20);
		rect(gameChar_x + 4, gameChar_y - 25, 5, 25);

		//arms 
		fill(125);
		ellipse(gameChar_x - 15, gameChar_y - 45, +15, +5);
		ellipse(gameChar_x + 7, gameChar_y - 40, +10, +5);

		//eyes
		fill(0)
		ellipse(gameChar_x - 5, gameChar_y - 59, 2, 2);

	} else if (isRight && isFalling) {
		// add your jumping-right code

		//face
		fill(232, 218, 98);
		ellipse(gameChar_x + 2, gameChar_y - 56, 20);

		//body
		fill(204, 194, 255);
		rect(gameChar_x - 10, gameChar_y - 50, 20, 25);

		//legs
		fill(0)
		rect(gameChar_x - 4, gameChar_y - 5, -5, -20);
		rect(gameChar_x + 4, gameChar_y - 35, 5, 15);

		//arms 
		fill(125);
		ellipse(gameChar_x - 7, gameChar_y - 45, +5, +5);
		ellipse(gameChar_x + 15, gameChar_y - 45, +10, +5);

		//eyes
		fill(0)
		ellipse(gameChar_x + 5, gameChar_y - 59, 2, 2);



	} else if (isLeft)
	// add your walking left code
	{
		//face
		fill(232, 218, 98);
		ellipse(gameChar_x - 1, gameChar_y - 59, 20);

		//body
		fill(204, 194, 255);
		rect(gameChar_x - 10, gameChar_y - 50, 20, 25);

		//legs
		fill(0)
		rect(gameChar_x - 4, gameChar_y - 10, -5, -15);
		rect(gameChar_x + 4, gameChar_y - 25, 5, 15);

		//arms 
		fill(125);
		ellipse(gameChar_x - 15, gameChar_y - 45, +10, 5);
		ellipse(gameChar_x + 7, gameChar_y - 45, +5, +5);
		//eyes
		ellipse(gameChar_x - 5, gameChar_y - 59, 2, 2);

	} else if (isRight) {
		// add your walking right code
		//face
		fill(232, 218, 98);
		ellipse(gameChar_x - 1, gameChar_y - 59, 20);

		//body
		fill(204, 194, 255);
		rect(gameChar_x - 10, gameChar_y - 50, 20, 25);

		//legs
		fill(0)
		rect(gameChar_x - 4, gameChar_y - 10, -5, -15);
		rect(gameChar_x + 4, gameChar_y - 25, 5, 15);

		//arms 
		fill(125);
		ellipse(gameChar_x - 7, gameChar_y - 45, +5, +10);
		ellipse(gameChar_x + 15, gameChar_y - 45, +10, +5);
		//eyes
		ellipse(gameChar_x + 5, gameChar_y - 59, 2, 2);

	} else if (isFalling || isJumping) {
		// add your jumping facing forwards code

		//face
		fill(232, 218, 98);
		ellipse(gameChar_x, gameChar_y - 55, 20);

		//body
		fill(204, 194, 255);
		rect(gameChar_x - 10, gameChar_y - 50, 20, 25);

		//legs
		fill(0)
		rect(gameChar_x - 4, gameChar_y - 15, -5, -15);
		rect(gameChar_x + 4, gameChar_y - 30, 5, 15);

		//arms 
		fill(125);
		ellipse(gameChar_x - 15, gameChar_y - 45, +10, +5);
		ellipse(gameChar_x + 15, gameChar_y - 45, +10, +5);

		//eyes
		fill(0)
		ellipse(gameChar_x - 5, gameChar_y - 59, 2, 2);
		ellipse(gameChar_x + 5, gameChar_y - 59, 2, 2);


	} else {

		// add your standing front facing code

		//face
		fill(232, 218, 98);
		ellipse(gameChar_x, gameChar_y - 59, 20);

		//body
		fill(204, 194, 255);
		rect(gameChar_x - 10, gameChar_y - 50, 20, 25);

		//legs
		fill(0)
		rect(gameChar_x - 4, gameChar_y - 10, -5, -15);
		rect(gameChar_x + 4, gameChar_y - 25, 5, 15);

		//arms 
		fill(125);
		ellipse(gameChar_x - 15, gameChar_y - 45, +10, +5);
		ellipse(gameChar_x + 15, gameChar_y - 45, +10, +5);

		//eyes
		fill(0)
		ellipse(gameChar_x - 5, gameChar_y - 59, 2, 2);
		ellipse(gameChar_x + 5, gameChar_y - 59, 2, 2);

	}

}

// ---------------------------
// Background render functions
// ---------------------------

// Function to draw cloud objects.
function drawClouds() {
	for (var i = 0; i < clouds.length; i++) {
		fill(225, 225, 225);
		ellipse(
			clouds[i].x,
			clouds[i].y,
			clouds[i].diameter);
		ellipse(
			clouds[i].x + 45,
			clouds[i].y,
			clouds[i].diameter - 10);
		ellipse(
			clouds[i].x + 90,
			clouds[i].y,
			clouds[i].diameter);
	}
}

// Function to draw mountains objects.
function drawMountains() {
	for (var i = 0; i < mountains.length; i++) {
		fill(90, 60, 70);
		triangle(
			mountains[i].a_x,
			mountains[i].a_y,
			mountains[i].b_x,
			mountains[i].b_y,
			mountains[i].c_x,
			mountains[i].c_y
		)
	};
}

// Function to draw trees objects.
function drawTrees() {
	for (var i = 0; i < trees_x.length; i++) {
		fill(120, 90, 100);
		rect(trees_x[i] + 15,
			treePos_y - 6,
			height / 20, width / 6.8);
		//draw branches
		fill(0, 105, 160);
		triangle(trees_x[i] - 60,
			treePos_y + 50,
			trees_x[i] + 30,
			treePos_y - 30,
			trees_x[i] + 110,
			treePos_y + 50);
		triangle(trees_x[i] - 50,
			treePos_y - 20,
			trees_x[i] + 30,
			treePos_y - 100,
			trees_x[i] + 110,
			treePos_y);
	}
}
function drawPlatforms() {
	for (var i = 0; i < platforms.length; i++) {
		platforms[i].draw();
	}
}


// ---------------------------------
// Canyon render and check functions
// ---------------------------------

// Function to draw canyon objects.

function drawCanyon(t_canyon) {

	fill(100, 155, 255);
	rect(t_canyon.x_pos,
		floorPos_y,
		t_canyon.width,
		150);
	//water
	fill(0, 90, 150);
	rect(t_canyon.x_pos,
		floorPos_y + 85,
		t_canyon.width, 60);

}
// ----------------------------------
// Collectable items render and check functions
// ----------------------------------

// Function to check character is over a canyon.
function checkCanyon(t_canyon) {
	//make character fall if walks trough canyon 
	if (gameChar_world_x > t_canyon.x_pos && gameChar_world_x < t_canyon.x_pos + t_canyon.width) {
		if (isContact == false) {

			isFalling = true;
		}
	}
}
// Function to draw collectable objects.
function drawCollectable(t_collectable) {

	//draw a collectable
	strokeWeight(2);
	fill(190, 190, 90);
	stroke(220, 195, 105);
	ellipse(t_collectable.x_pos,
		t_collectable.y_pos,
		t_collectable.size);
}

// Function to check character has collected an item.

function checkCollectable(t_collectable) {
	// make collectable disappear if character touches it
	if (dist(gameChar_world_x, gameChar_y,
		t_collectable.x_pos, t_collectable.y_pos) < t_collectable.size) {
		t_collectable.isFound = true;
		console.log("yay");
		game_score += 1;
	}
}

function renderFlagpole() {
	push();
	strokeWeight(5);
	stroke(180);
	line(flagpole.x_pos, floorPos_y, flagpole.x_pos, floorPos_y - 250);
	fill(255, 0, 255);
	noStroke();

	if (flagpole.isReached) {
		rect(flagpole.x_pos, floorPos_y - 250, 50, 50);
	} else {
		rect(flagpole.x_pos, floorPos_y - 50, 50, 50);
	}

	pop();
}

function checkFlagpole() {
	var d = abs(gameChar_world_x - flagpole.x_pos);

	if (d < 15) {
		flagpole.isReached = true;
	}
}

function checkPlayerDie() {
	var enemyhit = false;
	for (var i = 0; i < enemies.length; i++) {
		if (enemies[i].checkContact(gameChar_world_x)) {
			enemyhit = true
		}
	}
	if (gameChar_y > height || enemyhit == true) {
		lives -= 1;


		if (lives > 0) {
			startGame();
		}
	}
	console.log(lives)
}

function createPlatforms(x, y, length) {
	var p = {
		x: x,
		y: y,
		length: length,
		draw: function () {
			fill(125, 100, 210);
			rect(this.x, this.y, this.length, 20, 10);
		},
		checkContact: function (gc_x, gc_y) {
			if (gc_x > this.x && gc_x < this.x + this.length) {
				var d = this.y - gc_y;
				if (d >= 0 && d < 3) {
					return true;
				}
			}
			return false;
		}

	}
	return p;
}

function Enemy(x, y, range) {
	this.x = x;
	this.y = y;
	this.range = range;

	this.currentX = x;
	this.inc = 1;

	this.update = function () {
		this.currentX += this.inc;

		if (this.currentX >= this.x + this.range) {
			this.inc -= 1;
		} else if (this.currentX < this.x) {
			this.inc += 1;
		}
	}
	this.draw = function () {
		this.update();
		fill(255, 50, 90)
		ellipse(this.currentX, this.y, 20, 20);
	}
	this.checkContact = function () {
		if (gameChar_world_x > this.currentX && gameChar_world_x < this.currentX + 20 && (gameChar_y > floorPos_y - 10)) {

			return true;

		}
		return false;

	}
}