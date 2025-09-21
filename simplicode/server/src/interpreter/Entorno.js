class Entorno {
  constructor() {
    this.variables = new Map();
    this.errores = [];
    this.salida = "";
  }

  declarar(id, tipo, valor) {
    if (this.variables.has(id)) {
      this.errores.push({ tipo: "Semántico", descripcion: `Variable ${id} ya declarada` });
      return;
    }
    this.variables.set(id, { tipo, valor });
  }

  asignar(id, valor) {
    if (!this.variables.has(id)) {
      this.errores.push({ tipo: "Semántico", descripcion: `Variable ${id} no declarada` });
      return;
    }
    this.variables.get(id).valor = valor;
  }

  obtener(id) {
    if (!this.variables.has(id)) {
      this.errores.push({ tipo: "Semántico", descripcion: `Variable ${id} no declarada` });
      return null;
    }
    return this.variables.get(id).valor;
  }
}

module.exports = Entorno;
