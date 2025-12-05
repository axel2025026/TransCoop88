// script.js - TransCoope v2.0 (Sistema Completo con Rutas)

// ===== CONFIGURACIÓN INICIAL =====
const APP_STATE = {
    currentUser: null,
    userGenres: [],
    isLoggedIn: false,
    currentRoute: '/login',
    audioPlayers: {},
    metronome: null,
    courses: {
        'guitarra-basico': {
            title: 'Guitarra Eléctrica - Nivel Inicial',
            description: 'Aprende acordes, escalas y técnicas básicas',
            lessons: [
                {
                    title: 'Lección 1: Acordes básicos',
                    description: 'Aprende los acordes Em y D',
                    exercises: [
                        'Practicar acorde Em 10 veces',
                        'Cambiar entre Em y D 5 veces',
                        'Tocar riff a 60 BPM'
                    ]
                },
                {
                    title: 'Lección 2: Riff principal',
                    description: 'Aprende el riff de Come As You Are',
                    exercises: [
                        'Tocar riff a 80 BPM',
                        'Practicar con metrónomo',
                        'Aumentar velocidad gradualmente'
                    ]
                }
            ]
        },
        'teoria-musical': {
            title: 'Teoría Musical Esencial',
            description: 'Domina escalas, acordes y progresiones',
            lessons: [
                {
                    title: 'Lección 1: Escalas mayores',
                    description: 'Aprende la escala de Do mayor',
                    exercises: [
                        'Identificar notas de la escala',
                        'Tocar escala ascendente y descendente',
                        'Practicar con diferentes ritmos'
                    ]
                }
            ]
        },
        'bateria-rock': {
            title: 'Batería: Ritmos de Rock',
            description: 'Patrones esenciales y técnicas',
            lessons: [
                {
                    title: 'Lección 1: Ritmo básico 4/4',
                    description: 'Aprende el patrón básico de rock',
                    exercises: [
                        'Practicar con click',
                        'Mantener tempo constante',
                        'Añadir variaciones'
                    ]
                }
            ]
        }
    },
    songs: {
        'come-as-you-are': {
            title: 'Come As You Are',
            artist: 'Nirvana',
            bpm: 120,
            key: 'Em',
            duration: 219,
            chords: ['Em', 'D', 'C', 'G'],
            sections: [
                { name: 'Intro', start: 0, end: 8 },
                { name: 'Verso', start: 8, end: 24 },
                { name: 'Estribillo', start: 24, end: 40 },
                { name: 'Solo', start: 40, end: 56 }
            ]
        }
    }
};

// ===== ROUTER PRINCIPAL =====
class Router {
    constructor() {
        this.routes = {};
        this.currentRoute = null;
        this.init();
    }

    init() {
        // Definir rutas
        this.routes = {
            '/login': this.renderLogin,
            '/register': this.renderRegister,
            '/app': this.renderApp,
            '/transcripcion': this.renderTranscription,
            '/practica': this.renderPractice,
            '/cursos': this.renderCourses,
            '/curso/:id': this.renderCourseDetail,
            '/biblioteca': this.renderLibrary,
            '/comunidad': this.renderCommunity,
            '/proyectos': this.renderProjects,
            '/ranking': this.renderRanking,
            '/recomendaciones': this.renderRecommendations
        };

        // Manejar navegación
        window.addEventListener('hashchange', () => this.handleRoute());
        window.addEventListener('load', () => this.handleRoute());
    }

    handleRoute() {
        const hash = window.location.hash.substring(1) || '/login';
        const route = this.parseRoute(hash);
        
        if (this.routes[route.path]) {
            this.currentRoute = route;
            this.routes[route.path].call(this, route.params);
        } else {
            this.render404();
        }
    }

    parseRoute(hash) {
        const segments = hash.split('/');
        const path = segments.map(seg => seg.startsWith(':') ? ':param' : seg).join('/');
        const params = {};
        
        segments.forEach((seg, index) => {
            if (seg.startsWith(':')) {
                const paramName = seg.substring(1);
                params[paramName] = segments[index + 1];
            }
        });
        
        return { path, params, original: hash };
    }

    navigate(path) {
        window.location.hash = path;
    }

    // ===== RENDERIZADORES DE RUTAS =====
    renderLogin() {
        const template = document.getElementById('login-template');
        const content = template.content.cloneNode(true);
        document.getElementById('router-view').innerHTML = '';
        document.getElementById('router-view').appendChild(content);
        
        // Configurar eventos
        const form = document.getElementById('login-form');
        form.addEventListener('submit', this.handleLogin.bind(this));
        
        document.querySelector('a[href="#/register"]').addEventListener('click', (e) => {
            e.preventDefault();
            this.navigate('/register');
        });
    }

    renderRegister() {
        const template = document.getElementById('register-template');
        const content = template.content.cloneNode(true);
        document.getElementById('router-view').innerHTML = '';
        document.getElementById('router-view').appendChild(content);
        
        const form = document.getElementById('register-form');
        form.addEventListener('submit', this.handleRegister.bind(this));
        
        document.querySelector('a[href="#/login"]').addEventListener('click', (e) => {
            e.preventDefault();
            this.navigate('/login');
        });
    }

    renderApp() {
        if (!APP_STATE.isLoggedIn) {
            this.navigate('/login');
            return;
        }

        const template = document.getElementById('app-template');
        const content = template.content.cloneNode(true);
        document.getElementById('router-view').innerHTML = '';
        document.getElementById('router-view').appendChild(content);

        // Actualizar UI del usuario
        this.updateUserUI();
        
        // Configurar eventos de navegación
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const href = link.getAttribute('href');
                this.navigate(href.substring(1));
            });
        });

        // Configurar botones
        document.getElementById('logout-btn').addEventListener('click', this.handleLogout.bind(this));
        document.getElementById('profile-btn').addEventListener('click', this.showProfileModal.bind(this));

        // Navegar a la ruta por defecto
        this.navigate('/transcripcion');
    }

    renderTranscription() {
        if (!this.checkAuth()) return;

        const template = document.getElementById('transcription-template');
        const content = template.content.cloneNode(true);
        document.getElementById('main-content').innerHTML = '';
        document.getElementById('main-content').appendChild(content);

        // Inicializar componentes
        this.initTranscription();
    }

    renderPractice() {
        if (!this.checkAuth()) return;

        const template = document.getElementById('practice-template');
        const content = template.content.cloneNode(true);
        document.getElementById('main-content').innerHTML = '';
        document.getElementById('main-content').appendChild(content);

        // Inicializar práctica
        this.initPractice();
    }

    renderCourses() {
        if (!this.checkAuth()) return;

        const template = document.getElementById('courses-template');
        const content = template.content.cloneNode(true);
        document.getElementById('main-content').innerHTML = '';
        document.getElementById('main-content').appendChild(content);

        // Configurar eventos de cursos
        document.querySelectorAll('.course-card a').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const href = link.getAttribute('href');
                this.navigate(href.substring(1));
            });
        });
    }

    renderCourseDetail(params) {
        if (!this.checkAuth()) return;

        const courseId = params.id;
        const course = APP_STATE.courses[courseId];
        
        if (!course) {
            this.navigate('/cursos');
            return;
        }

        const template = document.getElementById('course-detail-template');
        const content = template.content.cloneNode(true);
        document.getElementById('main-content').innerHTML = '';
        document.getElementById('main-content').appendChild(content);

        // Actualizar título del curso
        document.getElementById('course-title').textContent = course.title;

        // Configurar lecciones
        const lessonItems = document.querySelectorAll('.lesson-item');
        lessonItems.forEach((item, index) => {
            if (index < course.lessons.length) {
                item.querySelector('span').textContent = course.lessons[index].title;
                
                // Desbloquear lección si está activa
                if (index === 0) {
                    item.classList.add('active');
                    item.querySelector('i').className = 'fas fa-play-circle';
                    this.showNotification(`Bienvenido a ${course.lessons[0].title}`, 'info');
                }
            }
        });

        // Configurar eventos de lecciones
        lessonItems.forEach(item => {
            item.addEventListener('click', () => {
                lessonItems.forEach(i => i.classList.remove('active'));
                item.classList.add('active');
            });
        });

        // Renderizar partitura de práctica
        this.renderPracticeSheet('course-practice-sheet');
    }

    renderLibrary() {
        if (!this.checkAuth()) return;
        // Implementar biblioteca
        this.showNotification('Biblioteca en desarrollo', 'info');
    }

    renderCommunity() {
        if (!this.checkAuth()) return;
        this.showNotification('Comunidad en desarrollo', 'info');
    }

    renderProjects() {
        if (!this.checkAuth()) return;
        this.showNotification('Proyectos en desarrollo', 'info');
    }

    renderRanking() {
        if (!this.checkAuth()) return;
        this.showNotification('Ranking en desarrollo', 'info');
    }

    renderRecommendations() {
        if (!this.checkAuth()) return;
        this.showNotification('Recomendaciones en desarrollo', 'info');
    }

    render404() {
        document.getElementById('main-content').innerHTML = `
            <div class="error-404">
                <h1>404</h1>
                <p>Página no encontrada</p>
                <button onclick="router.navigate('/transcripcion')" class="btn-primary">
                    Volver al inicio
                </button>
            </div>
        `;
    }

    // ===== MANEJO DE AUTENTICACIÓN =====
    handleLogin(e) {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        if (username && password) {
            APP_STATE.currentUser = {
                username: username,
                email: `${username}@ejemplo.com`,
                genres: ['rock', 'grunge'],
                stats: { sheets: 3, posts: 5, projects: 2 }
            };
            APP_STATE.isLoggedIn = true;
            APP_STATE.userGenres = ['rock', 'grunge'];
            
            this.showNotification(`¡Bienvenido de nuevo, ${username}!`, 'success');
            this.navigate('/app');
        } else {
            this.showNotification('Por favor completa todos los campos', 'error');
        }
    }

    handleRegister(e) {
        e.preventDefault();
        const username = document.getElementById('reg-username').value;
        const email = document.getElementById('reg-email').value;
        const password = document.getElementById('reg-password').value;
        const genres = Array.from(document.querySelectorAll('input[name="genre"]:checked')).map(cb => cb.value);

        if (username && email && password && genres.length > 0) {
            APP_STATE.currentUser = {
                username: username,
                email: email,
                genres: genres,
                stats: { sheets: 0, posts: 0, projects: 0 }
            };
            APP_STATE.isLoggedIn = true;
            APP_STATE.userGenres = genres;
            
            this.showNotification('¡Cuenta creada exitosamente!', 'success');
            this.navigate('/app');
        } else {
            this.showNotification('Completa todos los campos y selecciona géneros', 'error');
        }
    }

    handleLogout() {
        APP_STATE.currentUser = null;
        APP_STATE.isLoggedIn = false;
        APP_STATE.userGenres = [];
        
        // Detener todos los audios
        Object.values(APP_STATE.audioPlayers).forEach(player => {
            if (player && player.pause) player.pause();
        });
        
        // Detener metrónomo
        if (APP_STATE.metronome) {
            APP_STATE.metronome.stop();
        }
        
        this.showNotification('Sesión cerrada correctamente', 'info');
        this.navigate('/login');
    }

    checkAuth() {
        if (!APP_STATE.isLoggedIn) {
            this.navigate('/login');
            return false;
        }
        return true;
    }

    updateUserUI() {
        if (APP_STATE.currentUser) {
            const userNameElement = document.getElementById('user-name');
            if (userNameElement) {
                userNameElement.textContent = APP_STATE.currentUser.username;
            }
        }
    }

    // ===== SISTEMA DE TRANSCRIPCIÓN =====
    initTranscription() {
        // Ocultar secciones inicialmente
        document.getElementById('processing-section').style.display = 'none';
        document.getElementById('results-section').style.display = 'none';

        // Configurar eventos
        document.getElementById('process-url').addEventListener('click', () => this.processSongUrl());
        document.getElementById('audio-file').addEventListener('change', (e) => this.handleFileUpload(e));
        document.getElementById('download-pdf').addEventListener('click', () => this.downloadPDF());
        document.getElementById('save-to-library').addEventListener('click', () => this.saveToLibrary());

        // Inicializar reproductor de audio
        this.initAudioPlayer();
    }

    processSongUrl() {
        const url = document.getElementById('song-url').value.trim();
        if (!url) {
            this.showNotification('Ingresa un enlace válido', 'error');
            return;
        }

        // Mostrar animación de procesamiento
        const processingSection = document.getElementById('processing-section');
        const resultsSection = document.getElementById('results-section');
        
        processingSection.style.display = 'block';
        resultsSection.style.display = 'none';

        // Simular procesamiento
        const steps = document.querySelectorAll('.processing-steps .step');
        let currentStep = 0;

        const interval = setInterval(() => {
            if (currentStep > 0) {
                steps[currentStep - 1].classList.remove('active');
            }
            steps[currentStep].classList.add('active');
            currentStep++;

            if (currentStep >= steps.length) {
                clearInterval(interval);
                setTimeout(() => {
                    processingSection.style.display = 'none';
                    resultsSection.style.display = 'block';
                    
                    // Generar partitura
                    this.renderSheetMusic();
                    
                    // Inicializar pestañas de instrumentos
                    this.initInstrumentTabs();
                    
                    this.showNotification('¡Transcripción completada! Se detectaron 4 instrumentos', 'success');
                    
                    // Actualizar estadísticas
                    if (APP_STATE.currentUser) {
                        APP_STATE.currentUser.stats.sheets++;
                    }
                }, 1000);
            }
        }, 1000);
    }

    handleFileUpload(e) {
        const file = e.target.files[0];
        if (file) {
            const fileName = document.getElementById('file-name');
            fileName.textContent = `Archivo: ${file.name}`;
            
            // Simular procesamiento después de 1 segundo
            setTimeout(() => {
                this.processSongUrl();
            }, 1000);
        }
    }

    renderSheetMusic() {
        const container = document.getElementById('vexflow-container');
        container.innerHTML = '';
        
        const renderer = new Vex.Flow.Renderer(container, Vex.Flow.Renderer.Backends.SVG);
        const context = renderer.getContext();
        
        // Crear pentagrama
        const staveWidth = 500;
        const stave = new Vex.Flow.Stave(10, 40, staveWidth);
        stave.addClef("treble").addKeySignature("Em");
        stave.setContext(context).draw();
        
        // Notas del riff principal
        const notes = [
            new Vex.Flow.StaveNote({ keys: ["e/4"], duration: "q" }),
            new Vex.Flow.StaveNote({ keys: ["e/4"], duration: "q" }),
            new Vex.Flow.StaveNote({ keys: ["d/4"], duration: "q" }),
            new Vex.Flow.StaveNote({ keys: ["d/4"], duration: "q" })
        ];
        
        // Crear voz y formatear
        const voice = new Vex.Flow.Voice({ num_beats: 4, beat_value: 4 });
        voice.addTickables(notes);
        
        // Formatear y dibujar
        const formatter = new Vex.Flow.Formatter();
        formatter.joinVoices([voice]).format([voice], staveWidth - 50);
        voice.draw(context, stave);
        
        // Añadir letra
        const lyrics = ["Come", "as", "you", "are"];
        for (let i = 0; i < notes.length; i++) {
            const lyric = new Vex.Flow.TextNote({ text: lyrics[i], line: 13 })
                .setFont("Arial", 10)
                .setJustification(Vex.Flow.TextNote.Justification.LEFT);
            const tie = new Vex.Flow.StaveTie({
                first_note: notes[i],
                last_note: notes[i],
                first_indices: [0],
                last_indices: [0]
            });
            new Vex.Flow.StaveTie({
                first_note: notes[i],
                last_note: notes[i],
                first_indices: [0],
                last_indices: [0]
            }).setContext(context).draw();
        }
    }

    initInstrumentTabs() {
        const tabsContainer = document.querySelector('.instruments-tabs');
        const instruments = [
            { name: 'Guitarra', icon: 'fas fa-guitar', key: 'guitar' },
            { name: 'Bajo', icon: 'fas fa-guitar', key: 'bass' },
            { name: 'Batería', icon: 'fas fa-drum', key: 'drums' },
            { name: 'Voz', icon: 'fas fa-microphone', key: 'vocals' }
        ];

        tabsContainer.innerHTML = '';
        instruments.forEach((instrument, index) => {
            const tab = document.createElement('button');
            tab.className = `instrument-tab ${index === 0 ? 'active' : ''}`;
            tab.innerHTML = `<i class="${instrument.icon}"></i> ${instrument.name}`;
            tab.dataset.instrument = instrument.key;
            tab.addEventListener('click', (e) => this.switchInstrument(e));
            tabsContainer.appendChild(tab);
        });
    }

    switchInstrument(e) {
        const tabs = document.querySelectorAll('.instrument-tab');
        tabs.forEach(tab => tab.classList.remove('active'));
        e.target.closest('.instrument-tab').classList.add('active');
        
        // Aquí se cambiaría la partitura según el instrumento
        this.showNotification(`Mostrando partitura para ${e.target.closest('.instrument-tab').textContent.trim()}`, 'info');
    }

    // ===== REPRODUCTOR DE AUDIO =====
    initAudioPlayer() {
        try {
            // Crear wavesurfer para visualización de audio
            APP_STATE.audioPlayers.transcription = WaveSurfer.create({
                container: '#waveform',
                waveColor: '#4361ee',
                progressColor: '#4cc9f0',
                height: 100,
                barWidth: 2
            });

            // Cargar audio de ejemplo (necesitas tener un archivo MP3)
            // APP_STATE.audioPlayers.transcription.load('assets/audio/come-as-you-are.mp3');
            
            // Configurar controles
            document.getElementById('play-btn').addEventListener('click', () => {
                APP_STATE.audioPlayers.transcription.play();
            });
            
            document.getElementById('pause-btn').addEventListener('click', () => {
                APP_STATE.audioPlayers.transcription.pause();
            });
            
            document.getElementById('stop-btn').addEventListener('click', () => {
                APP_STATE.audioPlayers.transcription.stop();
            });
            
            document.getElementById('volume-slider').addEventListener('input', (e) => {
                APP_STATE.audioPlayers.transcription.setVolume(e.target.value / 100);
            });
            
        } catch (error) {
            console.warn('Wavesurfer no pudo inicializarse:', error);
        }
    }

    // ===== SISTEMA DE PRÁCTICA =====
    initPractice() {
        // Renderizar partitura
        this.renderPracticeSheet('practice-sheet');
        
        // Configurar metrónomo
        this.initMetronome();
        
        // Configurar controles de secciones
        document.querySelectorAll('.section-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const start = parseFloat(e.target.dataset.start);
                const end = parseFloat(e.target.dataset.end);
                this.practiceSection(start, end);
            });
        });
        
        // Configurar controles de velocidad
        document.querySelectorAll('.speed-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.speed-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                const speed = parseFloat(e.target.dataset.speed);
                this.changePlaybackSpeed(speed);
            });
        });
        
        // Configurar loop
        document.getElementById('loop-toggle').addEventListener('change', (e) => {
            APP_STATE.practiceLoop = e.target.checked;
        });
    }

    renderPracticeSheet(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        container.innerHTML = '';
        const renderer = new Vex.Flow.Renderer(container, Vex.Flow.Renderer.Backends.SVG);
        const context = renderer.getContext();
        
        // Pentagrama más pequeño para práctica
        const stave = new Vex.Flow.Stave(10, 10, 300);
        stave.addClef("treble").addKeySignature("Em");
        stave.setContext(context).draw();
        
        // Notas simplificadas para práctica
        const notes = [
            new Vex.Flow.StaveNote({ keys: ["e/4"], duration: "q" }),
            new Vex.Flow.StaveNote({ keys: ["e/4"], duration: "q" }),
            new Vex.Flow.StaveNote({ keys: ["d/4"], duration: "q" }),
            new Vex.Flow.StaveNote({ keys: ["d/4"], duration: "q" })
        ];
        
        const voice = new Vex.Flow.Voice({ num_beats: 4, beat_value: 4 });
        voice.addTickables(notes);
        
        new Vex.Flow.Formatter().joinVoices([voice]).format([voice], 250);
        voice.draw(context, stave);
        
        // Añadir números de dedos (simulado)
        notes.forEach((note, index) => {
            note.addModifier(new Vex.Flow.Annotation(`${index + 1}`).setFont("Arial", 10), 0);
        });
    }

    initMetronome() {
        // Configurar controles de metrónomo
        const bpmSlider = document.getElementById('bpm-slider');
        const bpmValue = document.getElementById('bpm-value');
        const toggleBtn = document.getElementById('metronome-toggle');
        
        let isPlaying = false;
        let audioContext;
        let timer;
        
        bpmSlider.addEventListener('input', (e) => {
            bpmValue.textContent = e.target.value;
            if (isPlaying) {
                // Reiniciar con nuevo BPM
                clearInterval(timer);
                startMetronome();
            }
        });
        
        function createMetronomeSound(freq = 800) {
            if (!audioContext) audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.value = freq;
            oscillator.type = 'sine';
            
            gainNode.gain.setValueAtTime(0, audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.001);
            gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.1);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.1);
        }
        
        function startMetronome() {
            const bpm = parseInt(bpmSlider.value);
            const interval = 60000 / bpm;
            
            let beat = 0;
            const beats = document.querySelectorAll('.beat');
            
            timer = setInterval(() => {
                beats.forEach(b => b.classList.remove('active'));
                beats[beat].classList.add('active');
                
                // Primer tiempo más agudo
                createMetronomeSound(beat === 0 ? 1000 : 800);
                
                beat = (beat + 1) % beats.length;
            }, interval);
        }
        
        toggleBtn.addEventListener('click', () => {
            isPlaying = !isPlaying;
            
            if (isPlaying) {
                toggleBtn.innerHTML = '<i class="fas fa-stop"></i> Detener';
                toggleBtn.classList.add('active');
                startMetronome();
                this.showNotification(`Metrónomo iniciado a ${bpmSlider.value} BPM`, 'info');
            } else {
                toggleBtn.innerHTML = '<i class="fas fa-play"></i> Iniciar';
                toggleBtn.classList.remove('active');
                clearInterval(timer);
                document.querySelectorAll('.beat').forEach(b => b.classList.remove('active'));
                this.showNotification('Metrónomo detenido', 'info');
            }
        });
        
        APP_STATE.metronome = {
            start: startMetronome,
            stop: () => {
                clearInterval(timer);
                isPlaying = false;
                toggleBtn.innerHTML = '<i class="fas fa-play"></i> Iniciar';
                toggleBtn.classList.remove('active');
            }
        };
    }

    practiceSection(start, end) {
        this.showNotification(`Practicando sección ${start}s - ${end}s`, 'info');
        
        // En una implementación real, aquí se configuraría el audio para loop
        if (APP_STATE.audioPlayers.practice) {
            APP_STATE.audioPlayers.practice.currentTime = start;
            
            if (APP_STATE.practiceLoop) {
                APP_STATE.audioPlayers.practice.loop = true;
                APP_STATE.audioPlayers.practice.loopStart = start;
                APP_STATE.audioPlayers.practice.loopEnd = end;
            }
        }
    }

    changePlaybackSpeed(speed) {
        this.showNotification(`Velocidad cambiada a ${speed}x`, 'info');
        
        if (APP_STATE.audioPlayers.practice) {
            APP_STATE.audioPlayers.practice.playbackRate = speed;
        }
        
        // Actualizar metrónomo también
        const bpmSlider = document.getElementById('bpm-slider');
        const originalBPM = parseInt(bpmSlider.value);
        const newBPM = Math.round(originalBPM * speed);
        bpmSlider.value = newBPM;
        document.getElementById('bpm-value').textContent = newBPM;
    }

    // ===== UTILIDADES =====
    downloadPDF() {
        this.showNotification('Generando PDF de partitura...', 'info');
        setTimeout(() => {
            this.showNotification('¡PDF descargado correctamente!', 'success');
        }, 2000);
    }

    saveToLibrary() {
        if (!APP_STATE.currentUser) {
            this.showNotification('Inicia sesión para guardar', 'error');
            return;
        }
        
        APP_STATE.currentUser.stats.sheets++;
        this.showNotification('¡Partitura guardada en tu biblioteca!', 'success');
    }

    showProfileModal() {
        const template = document.getElementById('profile-modal-template');
        const content = template.content.cloneNode(true);
        
        const modalContainer = document.createElement('div');
        modalContainer.appendChild(content);
        document.body.appendChild(modalContainer);
        
        const modal = modalContainer.querySelector('.modal');
        modal.style.display = 'block';
        
        // Actualizar información del perfil
        if (APP_STATE.currentUser) {
            document.getElementById('profile-username').textContent = APP_STATE.currentUser.username;
            document.getElementById('profile-email').textContent = APP_STATE.currentUser.email;
            document.getElementById('profile-avatar-text').textContent = APP_STATE.currentUser.username.charAt(0).toUpperCase();
            
            document.getElementById('profile-sheets').textContent = APP_STATE.currentUser.stats.sheets;
            document.getElementById('profile-posts').textContent = APP_STATE.currentUser.stats.posts;
            document.getElementById('profile-projects').textContent = APP_STATE.currentUser.stats.projects;
            
            const genresList = document.getElementById('profile-genres-list');
            genresList.innerHTML = APP_STATE.userGenres.map(genre => 
                `<span class="genre-tag">${genre}</span>`
            ).join('');
        }
        
        // Configurar eventos del modal
        modal.querySelector('.close-modal').addEventListener('click', () => {
            modal.style.display = 'none';
            setTimeout(() => modalContainer.remove(), 300);
        });
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
                setTimeout(() => modalContainer.remove(), 300);
            }
        });
        
        document.getElementById('edit-profile-btn').addEventListener('click', () => {
            this.showNotification('Editar perfil en desarrollo', 'info');
        });
    }

    showNotification(message, type = 'info') {
        const container = document.getElementById('notifications-container');
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        
        const icons = {
            success: 'fa-check-circle',
            error: 'fa-exclamation-circle',
            warning: 'fa-exclamation-triangle',
            info: 'fa-info-circle'
        };
        
        notification.innerHTML = `
            <i class="fas ${icons[type] || 'fa-info-circle'}"></i>
            <div class="notification-content">${message}</div>
            <button class="notification-close">&times;</button>
        `;
        
        container.appendChild(notification);
        
        // Configurar cierre
        notification.querySelector('.notification-close').addEventListener('click', () => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        });
        
        // Auto-remover después de 5 segundos
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.animation = 'slideOutRight 0.3s ease';
                setTimeout(() => notification.remove(), 300);
            }
        }, 5000);
    }
}

// ===== INICIALIZACIÓN =====
let router;

document.addEventListener('DOMContentLoaded', () => {
    router = new Router();
    window.router = router; // Hacerlo global para acceso desde HTML
});
