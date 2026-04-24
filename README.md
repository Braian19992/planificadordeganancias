# planificadordeganancias

[![Open in Bolt](https://bolt.new/static/open-in-bolt.svg)](https://bolt.new/~/sb1-xvggnqkg)
📊 Planificador de Ganancias — Modelo Bagués
📌 Descripción

Este proyecto es un simulador de ingresos basado en el modelo comercial Bagués.

Permite proyectar cuánto debería vender, desarrollar y estructurar una persona para alcanzar un determinado nivel de ganancia dentro del negocio.

🎯 Objetivo

Transformar un objetivo de ingreso:

“Quiero ganar X”

en una estructura concreta:

nivel recomendado
venta personal necesaria
equipo directo
desarrollo de empresarios (N1)
profundidad de red (N2)
🧠 Concepto clave

El sistema no calcula la ganancia directamente.

Sigue este flujo:

estructura → monetización → selección → ajuste
Se construyen estructuras válidas según el nivel
Se calcula cuánto ingreso generan
Se evalúan múltiples escenarios
Se selecciona el más cercano al objetivo
Se aplica un ajuste fino sin romper reglas del negocio
🏗️ Arquitectura
📁 src/config/

Contiene las reglas del negocio:

levels.ts → niveles, promedios, máximos
percentages.ts → descuentos por nivel
categories.ts → orden y agrupación
⚙️ src/calculations/

Contiene la lógica principal:

motorV2.ts → motor de simulación
levelRecommendation.ts → selección de nivel
types.ts → tipado de estructuras
🧩 src/components/

Interfaz de usuario:

CenterPanel.tsx → resultado principal
LeftPanel.tsx → inputs del usuario
TopBar.tsx → navegación y reset
🧠 src/App.tsx

Orquestador principal:

conecta inputs
ejecuta el motor
maneja estado
renderiza resultados
🔑 Lógica principal
1. Construcción de estructura

Se generan estructuras posibles en función de:

puntos personales
puntos de equipo
cantidad de personas
N1
N2
2. Monetización

Se calcula el ingreso considerando:

venta directa
margen por descuentos
bonos por nivel
bonos por estructura (N1/N2)
3. Selección de escenario

Se evalúan múltiples combinaciones y se elige:

la más cercana al objetivo
dentro de rangos saludables
4. Microajuste

Se ajusta el resultado final para mejorar precisión sin romper:

mínimos
máximos
estructura real
📊 Fuente de datos

El modelo está basado en:

promedios reales del negocio
estructuras promedio por nivel
rangos mínimos, target y máximos
⚠️ Consideraciones importantes
Los resultados son estimaciones basadas en promedios
No existe una única forma de alcanzar un ingreso
El modelo permite distintos caminos:
venta personal
equipo directo
estructura (N1 / N2)
🚫 No modificar sin validación

No alterar sin validar con negocio:

descuentos por nivel
promedios del modelo
mínimos y máximos
reglas de N1/N2
Reset de simulación

La aplicación incluye un botón:

“Volver a empezar”

que resetea:

objetivo
nivel
precio
resultados
estado general
Testing sugerido

Casos base:

$150.000 → Emprendedor Oro
$400.000 → Empresario Bronce
$600.000 → Empresario Plata
$1.000.000 → Empresario Oro
$3.200.000 → Mentor Oro
$16.000.000 → Emblema Oro
 Stack
React
TypeScript
lógica custom (sin librerías externas de cálculo)
