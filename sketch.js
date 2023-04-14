class Boid {
  constructor() {
    this.position = createVector(random(width), random(height));
    this.velocity = p5.Vector.random2D();
    this.velocity.setMag(random(2, 4)); // untuk membuat  kecepatan acak antara 2-4
    this.acceleration = createVector(); // membuat akselerasi percepatan awal nol
    this.maxForce = 0.2; // untuk mengatur maksimal stir atau keterbatasan stir dalam posisi membelok.
    this.maxSpeed = 5; // untuk membuat batas  kecepatan kendaraan.
  }

  // ======= edges hanya untuk mengatasi keterbatasan canvas p5
  edges() {
    if (this.position.x > width) {
      this.position.x = 0;
    } else if (this.position.x < 0) {
      this.position.x = width;
    }
    if (this.position.y > height) {
      this.position.y = 0;
    } else if (this.position.y < 0) {
      this.position.y = height;
    }
  }
  // ======= edges hanya untuk mengatasi keterbatasan canvas p5
  
  align(boids) { //argument boids (array)
    let perceptionRadius = 25;
    let steering = createVector();// gaya kemudi, dibuat nol
    let total = 0; //untuk menghitung banyak kendaraan di sekiar radius 25
    //loop untuk menghitung jarak semua boid di sekitar radius 25
    for (let other of boids) {
      let d = dist(this.position.x, this.position.y, other.position.x, other.position.y);
      if (other != this && d < perceptionRadius) {
        steering.add(other.velocity); // menjumlah semua velocity
        total++;
      }
    }
    if (total > 0) {
      steering.div(total); // membagi total velocity dengan  total (kecepatan rerata)
      steering.setMag(this.maxSpeed); // untuk mengatur kecepatan max
      //ciri khas aligment
      steering.sub(this.velocity); // gaya kemudi = kec rata2 - kec. kendaraan
      steering.limit(this.maxForce); // untuk mengatur kemudi/menikung maks
    }
    return steering;
  }
  
  //mirip dengan align
  separation(boids) {
    let perceptionRadius = 24;
    let steering = createVector();
    let total = 0;
    for (let other of boids) {
      let d = dist(this.position.x, this.position.y, other.position.x, other.position.y);
      if (other != this && d < perceptionRadius) {
        //ciri khas separation
        let diff = p5.Vector.sub(this.position, other.position); //vektor menjauh
        diff.div(d * d); // 1/r^2 (semakin dekat, semakin menjauh)
        steering.add(diff); // 
        total++;
      }
    }
    //mirip align
    if (total > 0) {
      steering.div(total);
      steering.setMag(this.maxSpeed);
      steering.sub(this.velocity);
      steering.limit(this.maxForce);
    }
    return steering;
  }

  cohesion(boids) {
    let perceptionRadius = 50;
    let steering = createVector();
    let total = 0;
    for (let other of boids) {
      let d = dist(this.position.x, this.position.y, other.position.x, other.position.y);
      if (other != this && d < perceptionRadius) {
        steering.add(other.position);
        total++;
      }
    }
    // cohesion dan aligment beda di sini
    // cohesion lebih pada posisi
    if (total > 0) {
      steering.div(total);
      steering.sub(this.position); //ciri khas cohesion
      steering.setMag(this.maxSpeed);
      steering.sub(this.velocity);
      steering.limit(this.maxForce);
    }
    return steering;
  }

  flock(boids) {
    let alignment = this.align(boids);
    let cohesion = this.cohesion(boids);
    let separation = this.separation(boids);

    alignment.mult(alignSlider.value());
    cohesion.mult(cohesionSlider.value());
    separation.mult(separationSlider.value());
    
    //akumulasi semua gaya akibat aligment, cohesion, dan separation
    this.acceleration.add(alignment);
    this.acceleration.add(cohesion);
    this.acceleration.add(separation);
  }

  update() {
    this.position.add(this.velocity);
    this.velocity.add(this.acceleration);
    this.velocity.limit(this.maxSpeed);
    this.acceleration.mult(0); //accelerasionya direset setiap update
  }

  show() {
    strokeWeight(6);
    stroke(255);
    point(this.position.x, this.position.y);
  }
}
const flock = []; //array yg akan diisikan banyak kendaraan
let alignSlider, cohesionSlider, separationSlider;
let population;
function setup() {
  createCanvas(400, 400);
  //createSlider(min, max, nilai_skrg, jarak antar nilai)
  alignSlider = createSlider(0,5,1,0.1);
  cohesionSlider = createSlider(0,5,1,0.1);
  separationSlider = createSlider(0,5,1,0.1);
  
  population = 200;
  for (let i=0; i<population;i++){
    flock.push(new Boid());
  }
}

function draw() {
  background(20);
  
  for (let boid of flock){
    boid.edges();
    boid.flock(flock)
    boid.update();
    boid.show();
  }
}