# Hybrid Training Log — MVP v0.2.3

Aplicación web local para registrar fuerza/hipertrofia, sueño y peso corporal con reglas de progresión conservadoras.

## Cómo abrirla
1. Abre `index.html` en el navegador.
2. Para instalación como PWA/offline completa, sírvela con un servidor local sencillo (por ejemplo `python3 -m http.server 8080`) y abre `http://localhost:8080`.
3. En móvil, usa “Añadir a pantalla de inicio” desde el navegador cuando se sirva por HTTPS o localhost.

## Qué incluye
- Rutinas editables: ejercicios, variantes, series, rangos, RIR y orden.
- Rutinas iniciales: Torso Front, Torso Muscle-up, Brazos y Pierna.
- Front colocado al inicio de Torso Front y dominadas lastradas incluidas.
- Registro rápido de series, peso, repeticiones, RIR y descanso opcional.
- Registro de descanso por serie visible también en móvil; sin temporizador integrado.
- Botones `+ serie` y `− serie`.
- Sin temporizador de descanso integrado: se deja al reloj del usuario.
- Copia de series anteriores.
- Historial de sesiones y comparación con sesión anterior.
- Motor de progresión gimnasio v1.0 con recomendaciones explicables.
- Registro matinal de sueño en formato `HH:MM` (por ejemplo `07:35`) y peso corporal.
- Media de 7 días e historial gráfico básico de sueño/peso.
- Exportar/importar datos JSON.
- Persistencia local en el dispositivo.

## Pendiente en siguientes fases
- Resto de recuperación diaria (fatiga, agujetas, motivación, dolor, calidad de sueño).
- Running, ciclismo y natación.
- Calendario semanal híbrido.
- Revisión dominical automática.
- Integraciones Garmin / Apple Health / Calendar.
