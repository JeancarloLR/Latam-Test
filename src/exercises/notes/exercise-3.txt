/* 
Una búsqueda de transacción (Invoice) puede traer hasta 1.000.000 de registros por mes, 
al momento de intentar realizar la búsqueda para recuperar la información, 
esta se cae por 'tiempo de ejecución excedido'. 
Cual seria su solución para corregir este problema (Implementar código).
*/

/* La solución esta en hacer un bucle que vaya de 1000 en 1000, y 
que vaya guardando los resultados en un array, esto para evitar
la iteración de 1.000.000 de lineas que provoca que caiga el search, y luego retornar ese array,
en casos donde se usen SCHDL o MPRC se pueden hacer rellamados al script
*/

define(["N/search", "N/log"], function (search, log) {
  var LMRY_SCRIPT_NAME = "LMRY - Exercise 3";

  /**
   * @type {Array<{tranId:string,tranDate:string}>}
   */
  var rta = [];

  /** - Obtiene todos los registros de Invoice
   * @description Obtiene todos los registros de Invoice
   * @returns {void} - No retorna nada pero guarda datos en la variable rta
   */
  function _getInvoices() {
    try {
      var DbolStop = false;
      var minInterval = 0;
      var maxInterval = 1000;

      var IT_Filters = [
        search.createFilter({
          name: "type",
          operator: search.Operator.ANYOF,
          values: ["CustInvc"],
        }),
      ];

      var IT_Columns = [
        search.createColumn({
          name: "internalid",
          summary: search.Summary.GROUP,
          label: "0. LatamReady - Internal ID",
        }),
        search.createColumn({
          name: "trandate",
          summary: search.Summary.GROUP,
          label: "1. LatamReady - Transaction Date",
        }),
      ];

      var IT_Search = search.create({
        type: search.Type.TRANSACTION,
        filters: IT_Filters,
        columns: IT_Columns,
      });

      var searchResult = IT_Search.run();

      var auxResult;
      while (!DbolStop) {
        auxResult = searchResult.getRange(minInterval, maxInterval);
        if (auxResult != null) {
          if (auxResult.length != 1000) DbolStop = true;
          for (var i = 0; i < auxResult.length; i++) {
            var columns = auxResult[i].columns;

            var tranId = auxResult[i].getValue(columns[0]);
            var tranDate = auxResult[i].getValue(columns[1]);

            rta.push({
              tranId: tranId,
              tranDate: tranDate,
            });
          }
          minInterval = maxInterval;
          maxInterval = maxInterval + 1000;
        } else {
          DbolStop = true;
        }
      }
    } catch (error) {
      log.error("Error in _getInvoices", {
        title: "[ MPRD - _getInvoices ]",
        message: error,
        relatedScript: LMRY_SCRIPT_NAME,
      });
    }
  }
});
