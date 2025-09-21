# Guía completa: Lenguaje “SimpliCode”, parser con Jison, intérprete en Node y frontend en React

Esta guía explica, de principio a fin, cómo montar el proyecto: instalación, estructura, gramática, arquitectura, flujo de ejecución, archivos clave y su responsabilidad. Incluye comandos para backend y frontend, generación automática del parser y visualización del AST en el cliente.

---

## 1. Requisitos

* Node.js 18+ y npm
* Conocimientos básicos de JavaScript/TypeScript y React

---

## 2. Estructura del proyecto

```
simplicode/
├─ server/
│  ├─ parser/
│  │  ├─ simplicode.jison        # Gramática + lexer (%lex)
│  │  └─ parser.js               # Parser generado por Jison (no versionar)
│  ├─ src/
│  │  ├─ interpretador.js        # Intérprete simple sobre AST
│  │  ├─ ast-generator.js        # Genera DOT (Graphviz) a partir del AST
│  │  └─ interpreter/            # Intérprete OO (clases)
│  │     ├─ Entorno.js
│  │     ├─ Expresiones.js
│  │     ├─ Instrucciones.js
│  │     └─ interpreter.js
│  ├─ index.js                   # Servidor Express (API REST)
│  └─ package.json
└─ client/
   ├─ src/
   │  ├─ components/
   │  │  ├─ Editor.jsx
   │  │  ├─ Consola.jsx
   │  │  ├─ Simbolos.jsx
   │  │  ├─ Errores.jsx
   │  │  └─ AST.jsx
   │  ├─ App.jsx
   │  ├─ App.css
   │  ├─ main.jsx
   │  └─ index.css
   ├─ vite.config.js             # Proxy a backend
   └─ package.json
```

---

## 3. Instalación inicial

### 3.1 Backend

```bash
mkdir server && cd server
npm init -y
npm install express cors
npm install -D jison nodemon
```

Scripts en `package.json`:

```json
{
  "scripts": {
    "build:parser": "jison parser/simplicode.jison -o parser/parser.js",
    "start": "node index.js",
    "dev": "nodemon"
  }
}
```

### 3.2 Frontend

```bash
cd ..
npm create vite@latest client -- --template react
cd client
npm install
npm install axios @viz-js/viz
```

Scripts en `client/package.json` ya incluyen `dev`, `build` y `preview`.

---

## 4. Gramática y parser

Archivo `parser/simplicode.jison`:

* Compilación `npx jison parser/simplicode.jison -o parser/parser.js`
* Contiene `%lex` para el lexer.
* Tokens: `INGRESAR`, `COMO`, `CONVALOR`, `TIPO_ENTERO`, `TIPO_CADENA`, `ASIGNAR`, `IMPRIMIR`, `ID`, `NUMERO`, `CADENA`, `NEWLINE`.
* Precedencias: `%left '+' '-'` y `%left '*' '/'`.
* Reglas de producción: `programa`, `sentencias`, `sentencia`, `instruccion`, `expresion`.
* Con `%locations` y `%error-verbose` cada nodo del AST incluye coordenadas de línea/columna y los errores sintácticos son detallados.

Ejemplo de nodo AST:

```json
{
  "tipo": "DECLARACION",
  "id": "x",
  "tipoDato": "entero",
  "valor": { "tipo": "NUMERO", "valor": 10 },
  "loc": { "first_line": 1, "first_column": 0, ... }
}
```

---

## 5. Arquitectura del backend

* **parser.js**: generado por Jison, transforma código fuente en AST.
* **interpretador.js**: intérprete simple, evalúa directamente el AST con `switch`.
* **src/interpreter/**: intérprete OO con clases (`Declaracion`, `Asignacion`, `Imprimir`, `Numero`, `Cadena`, etc.) y un `Entorno` que guarda variables, errores y salida.
* **ast-generator.js**: convierte AST en formato DOT para visualizarlo con Graphviz.
* **index.js (server)**: servidor Express que expone `/interpretar`. Pasos:

  1. Recibe código fuente desde el frontend.
  2. Genera AST con `parser.parse`.
  3. Ejecuta el intérprete (simple u OO).
  4. Devuelve consola, tabla de símbolos, errores y AST en DOT.

---

## 6. Arquitectura del frontend

* **Editor.jsx**: textarea para escribir código y botón “Ejecutar”. Hace POST a `/api/interpretar` (proxy a backend).
* **Consola.jsx**: muestra salida estándar.
* **Simbolos.jsx**: tabla de variables en memoria (id, tipo, valor).
* **Errores.jsx**: tabla con errores (tipo, línea, columna, token, esperado, descripción) y vista previa de la línea con caret.
* **AST.jsx**: renderiza el AST en SVG usando `@viz-js/viz` (Graphviz en WASM). Incluye scroll y zoom.
* **App.css**: estilos oscuros y consistentes.
* **vite.config.js**: configura proxy para evitar problemas de CORS (`/api` → backend en `localhost:3001`).

---

## 7. Flujo de ejecución

1. El usuario escribe código en el frontend (React).
2. Al presionar “Ejecutar”, el frontend envía el código vía `axios.post` a `/api/interpretar`.
3. El backend:

   * Usa Jison para parsear el código → AST.
   * Pasa el AST al intérprete (evalúa expresiones, asignaciones, declaraciones e imprime resultados).
   * Genera tabla de símbolos, errores y salida.
   * Convierte AST a DOT para visualización.
4. El backend responde con JSON que contiene:

   * `consola`: salida de `imprimir`.
   * `errores`: lista estructurada de errores léxicos, sintácticos y semánticos.
   * `simbolos`: tabla de variables.
   * `ast`: cadena DOT.
5. El frontend recibe los datos y actualiza las secciones de la UI:

   * Consola: texto.
   * Tabla de símbolos.
   * Tabla de errores.
   * AST: renderizado en SVG.

---

## 8. Ejemplo completo

Código de entrada:

```
ingresar x como entero con valor 10;
x -> x + 10 / 2
imprimir x
```

Ejecución:

* `x` se declara como 10.
* Se asigna `x = 10 + (10/2)` → `15`.
* Se imprime `15`.

Salida esperada:

* Consola: `15`
* Tabla de símbolos: `x (entero, 15)`
* Errores: ninguno
* AST: árbol que muestra declaración, asignación e impresión.

---

## 9. Conclusiones

Este proyecto ejemplifica la construcción de un lenguaje sencillo con:

* **Jison**: definición de lexer y parser con precedencias y ubicaciones.
* **Node.js (Express)**: servidor que interpreta y devuelve resultados.
* **Arquitectura de intérprete doble**: simple y orientada a objetos.
* **React + Vite**: interfaz moderna para editar, ejecutar y visualizar resultados.

El flujo completo permite a un estudiante comprender desde la definición de la gramática hasta la visualización del AST y la ejecución de programas escritos en el lenguaje diseñado.
