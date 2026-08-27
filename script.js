const speedElement =
    document.getElementById("speed");

const needle =
    document.getElementById("needle");

const ticks =
    document.getElementById("ticks");

const numbers =
    document.getElementById("numbers");

const startBtn =
    document.getElementById("startBtn");

const resetBtn =
    document.getElementById("resetBtn");

const maxSpeedElement =
    document.getElementById("maxSpeed");

const distanceElement =
    document.getElementById("distance");

const durationElement =
    document.getElementById("duration");

const gpsStatus =
    document.getElementById("gpsStatus");

const gpsDot =
    document.getElementById("gpsDot");


// ==================================================
// SPEEDOMETER
// ==================================================

const MAX_SPEED = 199;

const START_ANGLE = -210;

const END_ANGLE = 60;

const SWEEP =
    END_ANGLE - START_ANGLE;


// Radius garis dan angka
const TICK_RADIUS = 150;

const NUMBER_RADIUS = 123;


// ==================================================
// BUAT TICK
// ==================================================

for (let speed = 0; speed <= MAX_SPEED; speed++) {

    const tick =
        document.createElement("div");

    if (
        speed % 10 === 0 ||
        speed === MAX_SPEED
    ) {
        tick.classList.add(
            "tick",
            "major"
        );
    } else {
        tick.classList.add("tick");
    }


    const angle =
        START_ANGLE +
        (speed / MAX_SPEED) *
        SWEEP;


    const rad =
        angle * Math.PI / 180;


    const x =
        Math.cos(rad) *
        TICK_RADIUS;


    const y =
        Math.sin(rad) *
        TICK_RADIUS;


    tick.style.left =
        `calc(50% + ${x}px)`;

    tick.style.top =
        `calc(50% + ${y}px)`;


    tick.style.transform =
        `translate(-50%, -50%) rotate(${angle + 90}deg)`;


    ticks.appendChild(tick);
}


// ==================================================
// BUAT ANGKA
// ==================================================

const numberValues = [
    0,
    20,
    40,
    60,
    80,
    100,
    120,
    140,
    160,
    180,
    199
];


numberValues.forEach(value => {

    const number =
        document.createElement("div");

    number.classList.add(
        "speed-number"
    );


    if (value === 199) {
        number.classList.add("max");
    }


    number.textContent =
        value;


    const angle =
        START_ANGLE +
        (value / MAX_SPEED) *
        SWEEP;


    const rad =
        angle * Math.PI / 180;


    const x =
        Math.cos(rad) *
        NUMBER_RADIUS;


    const y =
        Math.sin(rad) *
        NUMBER_RADIUS;


    number.style.left =
        `calc(50% + ${x}px)`;

    number.style.top =
        `calc(50% + ${y}px)`;


    numbers.appendChild(number);
});


// ==================================================
// DATA GPS
// ==================================================

let watchId = null;

let running = false;

let maxSpeed = 0;

let totalDistance = 0;

let previousPosition = null;

let startTime = null;

let durationTimer = null;


// ==================================================
// FORMAT DURASI
// ==================================================

function formatDuration(seconds) {

    const minutes =
        Math.floor(seconds / 60);

    const secs =
        Math.floor(seconds % 60);

    return (
        String(minutes).padStart(2, "0") +
        ":" +
        String(secs).padStart(2, "0")
    );
}


// ==================================================
// JARAK GPS
// ==================================================

function distanceBetween(
    lat1,
    lon1,
    lat2,
    lon2
) {

    const R = 6371;

    const dLat =
        (lat2 - lat1) *
        Math.PI / 180;

    const dLon =
        (lon2 - lon1) *
        Math.PI / 180;


    const a =
        Math.sin(dLat / 2) ** 2 +

        Math.cos(
            lat1 * Math.PI / 180
        ) *

        Math.cos(
            lat2 * Math.PI / 180
        ) *

        Math.sin(dLon / 2) ** 2;


    const c =
        2 *
        Math.atan2(
            Math.sqrt(a),
            Math.sqrt(1 - a)
        );


    return R * c;
}


// ==================================================
// UPDATE SPEED
// ==================================================

function updateSpeed(speed) {

    speed =
        Math.max(
            0,
            Math.min(
                MAX_SPEED,
                speed
            )
        );


    speedElement.textContent =
        speed.toFixed(1);


    // Jarum mengikuti GPS

    const angle =
        START_ANGLE +
        (speed / MAX_SPEED) *
        SWEEP;


    needle.style.transform =
        `translateY(-50%) rotate(${angle}deg)`;


    // Max speed

    if (speed > maxSpeed) {

        maxSpeed = speed;

        maxSpeedElement.textContent =
            maxSpeed.toFixed(1);
    }
}


// ==================================================
// GPS BERHASIL
// ==================================================

function gpsSuccess(position) {

    const coords =
        position.coords;


    let speed =
        coords.speed;


    /*
        GPS speed biasanya
        dalam meter per detik.

        Ubah ke km/h.
    */

    if (
        speed !== null &&
        Number.isFinite(speed)
    ) {

        speed =
            speed * 3.6;

    } else {

        speed = 0;
    }


    updateSpeed(speed);


    // ==============================
    // JARAK
    // ==============================

    if (previousPosition) {

        const distance =
            distanceBetween(
                previousPosition.latitude,
                previousPosition.longitude,
                coords.latitude,
                coords.longitude
            );


        /*
            Abaikan loncatan GPS
            yang tidak masuk akal.
        */

        if (distance < 0.1) {

            totalDistance += distance;

            distanceElement.textContent =
                totalDistance.toFixed(2);
        }
    }


    previousPosition = {
        latitude:
            coords.latitude,

        longitude:
            coords.longitude
    };


    // ==============================
    // STATUS
    // ==============================

    gpsStatus.textContent =
        "GPS AKTIF";

    gpsDot.classList.add(
        "active"
    );
}


// ==================================================
// GPS ERROR
// ==================================================

function gpsError(error) {

    gpsDot.classList.remove(
        "active"
    );


    if (
        error.code ===
        error.PERMISSION_DENIED
    ) {

        gpsStatus.textContent =
            "IZIN GPS DITOLAK";

    } else if (
        error.code ===
        error.POSITION_UNAVAILABLE
    ) {

        gpsStatus.textContent =
            "GPS TIDAK TERSEDIA";

    } else {

        gpsStatus.textContent =
            "GPS ERROR";
    }
}


// ==================================================
// DURASI
// ==================================================

function startDuration() {

    startTime =
        Date.now();


    durationTimer =
        setInterval(() => {

            const elapsed =
                (Date.now() - startTime) /
                1000;


            durationElement.textContent =
                formatDuration(elapsed);

        }, 1000);
}


function stopDuration() {

    clearInterval(
        durationTimer
    );

    durationTimer = null;
}


// ==================================================
// START GPS
// ==================================================

startBtn.addEventListener(
    "click",
    () => {

        if (
            !("geolocation" in navigator)
        ) {

            gpsStatus.textContent =
                "GPS TIDAK DIDUKUNG";

            return;
        }


        if (running) {

            stopGPS();

            return;
        }


        running = true;

        startBtn.textContent =
            "STOP GPS";


        gpsStatus.textContent =
            "MENCARI GPS...";


        startDuration();


        watchId =
            navigator.geolocation.watchPosition(
                gpsSuccess,
                gpsError,
                {
                    enableHighAccuracy: true,

                    maximumAge: 1000,

                    timeout: 10000
                }
            );
    }
);


// ==================================================
// STOP GPS
// ==================================================

function stopGPS() {

    if (watchId !== null) {

        navigator.geolocation.clearWatch(
            watchId
        );

        watchId = null;
    }


    running = false;

    startBtn.textContent =
        "START GPS";

    stopDuration();

    gpsStatus.textContent =
        "GPS BERHENTI";

    gpsDot.classList.remove(
        "active"
    );
}


// ==================================================
// RESET
// ==================================================

resetBtn.addEventListener(
    "click",
    () => {

        stopGPS();


        maxSpeed = 0;

        totalDistance = 0;

        previousPosition = null;

        startTime = null;


        speedElement.textContent =
            "0.0";

        maxSpeedElement.textContent =
            "0.0";

        distanceElement.textContent =
            "0.00";

        durationElement.textContent =
            "00:00";


        needle.style.transform =
            `translateY(-50%) rotate(${START_ANGLE}deg)`;


        gpsStatus.textContent =
            "GPS BELUM AKTIF";

        gpsDot.classList.remove(
            "active"
        );
    }
);


// ==================================================
// POSISI AWAL
// ==================================================

updateSpeed(0);