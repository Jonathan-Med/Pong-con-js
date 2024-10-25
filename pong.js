let anchoCanvas = 800;
let altoCanvas = 400;

let jugadorY;
let computadoraY;
let anchoRaqueta = 10;
let altoRaqueta = 100;

let pelotaX;
let pelotaY;
let diametroPelota = 20;
let velocidadPelotaX = 5;
let velocidadPelotaY = 3;
let velocidadPelota = 5;
let direccion = 1;

let puntajeJugador = 0;
let puntajeComputadora = 0;

let imagenFondo;
let imagenRaquetaJugador;
let imagenRaquetaComputadora;
let imagenPelota;

let rebotesConsecutivosPared = 0;  // Contador para rebotes consecutivos
let umbralRebotes = 3;  // Número máximo de rebotes consecutivos permitido
let tiempoUltimoRebote = 0;  // Tiempo del último rebote

let anguloPelota = 0;  // Ángulo de rotación de la pelota

let sonidoTouch;
let sonidoScore;
let sonidoGameOver;


function preload() {
    // Cargar las imágenes
    imagenFondo = loadImage('Sprites/fondo1.png');
    imagenRaquetaJugador = loadImage('Sprites/barra1.png');
    imagenRaquetaComputadora = loadImage('Sprites/barra2.png');
    imagenPelota = loadImage('Sprites/bola.png');
}

function setup() {
    createCanvas(anchoCanvas, altoCanvas);
    
    jugadorY = height / 2 - altoRaqueta / 2;
    computadoraY = height / 2 - altoRaqueta / 2;

    pelotaX = width / 2;
    pelotaY = height / 2;

    // Inicializar los sonidos usando Howler.js
    sonidoTouch = new Howl({
        src: ['sounds/toque.wav']
    });

    sonidoScore = new Howl({
        src: ['sounds/score.wav']
    });

    sonidoGameOver = new Howl({
        src: ['sounds/game_over.wav']
    });
}

function draw() {
    // Verificar si el juego ha terminado antes de continuar
    if (puntajeJugador >= 5 || puntajeComputadora >= 5) {
        pelotaX = width / 2;
        pelotaY = height / 2;
        noLoop();  // Detiene el juego
    }

    // Centrar la imagen de fondo
    imageMode(CENTER);
    background(0);  // Color de fondo para evitar problemas con la imagen de fondo
    image(imagenFondo, width / 2, height / 2, width, height);

    // Dibujar puntajes
    textSize(32);
    fill('#2B3FD6');  // Color del puntaje
    text(puntajeJugador, width / 4, 50);
    text(puntajeComputadora, (3 * width) / 4, 50);

    // Dibujar raquetas
    image(imagenRaquetaJugador, 10 + anchoRaqueta / 2, jugadorY + altoRaqueta / 2, anchoRaqueta, altoRaqueta); 
    image(imagenRaquetaComputadora, width - 10 - anchoRaqueta / 2, computadoraY + altoRaqueta / 2, anchoRaqueta, altoRaqueta); 
    
    // Dibujar pelota
    image(imagenPelota, pelotaX, pelotaY, diametroPelota, diametroPelota);

     // Calcular velocidad de la pelota
     let velocidadTotal = sqrt(velocidadPelotaX * velocidadPelotaX + velocidadPelotaY * velocidadPelotaY);

     // Actualizar el ángulo de rotación basado en la velocidad
     anguloPelota += velocidadTotal * 0.05;  // Ajusta la constante para modificar la sensibilidad del giro
 
     // Dibujar la pelota con rotación
     push();
     translate(pelotaX, pelotaY);  // Mueve el origen al centro de la pelota
     rotate(anguloPelota);  // Aplica la rotación
     image(imagenPelota, 0, 0, diametroPelota, diametroPelota);
     pop();
    
    // Movimiento de la pelota
    pelotaX += velocidadPelotaX;
    pelotaY += velocidadPelotaY;

    // Rebote en los bordes superior e inferior
    if (pelotaY - diametroPelota / 2 <= 0 || pelotaY + diametroPelota / 2 >= height) {
        velocidadPelotaY *= -1;
        manejarRebotesConsecutivos(); 
    }

    // Movimiento del jugador
    if (keyIsDown(UP_ARROW) && jugadorY > 0) {
        jugadorY -= 5;
    }
    if (keyIsDown(DOWN_ARROW) && jugadorY < height - altoRaqueta) {
        jugadorY += 5;
    }

    // Movimiento de la computadora (sigue a la pelota)
    if (pelotaY < computadoraY + altoRaqueta / 2 && computadoraY > 0) {
      computadoraY -= 4.30;
    } 
    else if (pelotaY > computadoraY + altoRaqueta / 2 && computadoraY < height - altoRaqueta) {
      computadoraY += 4.30;
    }

    // Colisiones con la raqueta del jugador
    if (pelotaX - diametroPelota / 2 <= 20 && 
        pelotaY >= jugadorY && 
        pelotaY <= jugadorY + altoRaqueta) {
        let angulo = calcularAnguloImpacto(pelotaY, jugadorY, altoRaqueta);
        if (abs(degrees(angulo)) > 15){
            velocidadPelotaX *= -1.015;
            if (velocidadPelotaX >= 1.40) {
                velocidadPelotaY = sin(angulo) * velocidadPelota * 2;
            }
            else {
                velocidadPelotaY = sin(angulo) * velocidadPelota * 1.7;
            }
        }
        else {
            velocidadPelotaX *= -1.015;
        }
        sonidoTouch.play();
    }

    // Colisiones con la raqueta de la computadora
    if (pelotaX + diametroPelota / 2 >= width - 20 && 
        pelotaY >= computadoraY && 
        pelotaY <= computadoraY + altoRaqueta) {
        let angulo = calcularAnguloImpacto(pelotaY, computadoraY, altoRaqueta);
        if (abs(degrees(angulo)) > 15){
            velocidadPelotaX *= -1.015;
            if (velocidadPelotaX >= 1.40) {
                velocidadPelotaY = sin(angulo) * velocidadPelota * 2;
            }
            else {
                velocidadPelotaY = sin(angulo) * velocidadPelota * 1.7;
            }
        }
        else {
            velocidadPelotaX *= -1.015;
        }
        sonidoTouch.play();
    }

    // Verificar si la pelota salió por el lado del jugador o la computadora
    if (pelotaX - diametroPelota / 2 <= 0) {
        puntajeComputadora++;
        sonidoScore.play();
        if (puntajeComputadora >= 5 && puntajeJugador < 5) {
            sonidoGameOver.play();
        }
        direccion = 1;
        reiniciarPelota(direccion);
    } else if (pelotaX + diametroPelota / 2 >= width) {
        puntajeJugador++;
        sonidoScore.play();
        direccion = -1;
        reiniciarPelota(direccion);
    }
}

// Calcula el ángulo de rebote basado en la posición de impacto
function calcularAnguloImpacto(pelotaY, raquetaY, altoRaqueta) {
    let distanciaCentro = (pelotaY - (raquetaY + altoRaqueta / 2)) / (altoRaqueta / 2);
    let angulo = distanciaCentro * radians(45); // Ajusta el ángulo máximo de rebote

    // Asegúrate de que el ángulo esté dentro de un rango razonable
    angulo = constrain(angulo, radians(-45), radians(45));
    
    return angulo;
}

function manejarRebotesConsecutivos() {
    let tiempoActual = millis();

    // Si el tiempo entre rebotes es muy corto, incrementa el contador
    if (tiempoActual - tiempoUltimoRebote < 500) { // Menos de medio segundo entre rebotes
        rebotesConsecutivosPared++;
    } else {
        rebotesConsecutivosPared = 0;  // Reinicia si pasó más tiempo
    }

    tiempoUltimoRebote = tiempoActual;

    // Si hay demasiados rebotes consecutivos, reinicia la velocidad en Y
    if (rebotesConsecutivosPared >= umbralRebotes) {
        velocidadPelotaY = random(-5, 5);  // Ajusta la velocidad de la pelota
        rebotesConsecutivosPared = 0;  // Reinicia el contador
    }
}

function anunciarMarcador() {
    // Verificar si alguien ganó
    if (puntajeJugador >= 5) {
        let mensaje = new SpeechSynthesisUtterance("El jugador ha ganado");
        mensaje.lang = 'es-MX';
        window.speechSynthesis.speak(mensaje);
    } else if (puntajeComputadora >= 5) {
        let mensaje = new SpeechSynthesisUtterance("La computadora ha ganado");
        mensaje.lang = 'es-MX';
        window.speechSynthesis.speak(mensaje);
    } else {
        // Si nadie ha ganado, anunciar el marcador
        let texto = `Jugador ${puntajeJugador}, Computadora ${puntajeComputadora}`;
        let mensaje = new SpeechSynthesisUtterance(texto);
        mensaje.lang = 'es-MX';
        window.speechSynthesis.speak(mensaje);
    }
}


function reiniciarPelota(direccion) {
    anunciarMarcador();
    pelotaX = width / 2;
    pelotaY = height / 2;
    velocidadPelotaX = 5; 
    velocidadPelotaX *= direccion; 
    velocidadPelotaY = -4.5;
}
