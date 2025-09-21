const Entorno = require("./Entorno");
const {
  Declaracion,
  Asignacion,
  Imprimir
} = require("./Instrucciones");

const {
  Numero,
  Cadena,
  Identificador,
  Suma,
  Resta,
  Multiplicacion,
  Division
} = require("./Expresiones");

function convertirNodo(nodo) {
  if (!nodo || typeof nodo !== "object") return null;

  switch (nodo.tipo) {
    case "DECLARACION":
      return new Declaracion(nodo.id, nodo.tipoDato, convertirNodo(nodo.valor));
    case "ASIGNACION":
      return new Asignacion(nodo.id, convertirNodo(nodo.valor));
    case "IMPRIMIR":
      return new Imprimir(convertirNodo(nodo.valor));

    case "NUMERO":
      return new Numero(nodo.valor);
    case "CADENA":
      return new Cadena(nodo.valor);
    case "ID":
      return new Identificador(nodo.nombre);

    case "SUMA":
      return new Suma(convertirNodo(nodo.izquierda), convertirNodo(nodo.derecha));
    case "RESTA":
      return new Resta(convertirNodo(nodo.izquierda), convertirNodo(nodo.derecha));
    case "MULTIPLICACION":
      return new Multiplicacion(convertirNodo(nodo.izquierda), convertirNodo(nodo.derecha));
    case "DIVISION":
      return new Division(convertirNodo(nodo.izquierda), convertirNodo(nodo.derecha));

    default:
      return null;
  }
}

function interpretar(nodosAST) {
  const entorno = new Entorno();

  for (const nodo of nodosAST || []) {
    const instruccion = convertirNodo(nodo);
    if (instruccion) {
      instruccion.interpretar(entorno);
    } else {
      entorno.errores.push({ tipo: "Sintáctico", descripcion: "Nodo inválido" });
    }
  }

  return {
    consola: entorno.salida,
    errores: entorno.errores,
    simbolos: [...entorno.variables.entries()].map(([id, val]) => ({
      id,
      tipo: val.tipo,
      valor: val.valor
    }))
  };
}

module.exports = interpretar;
