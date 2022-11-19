/* 
Realizar una búsqueda de las transacciones creadas en los últimos 5 días 
(las transacciones a considerar son: Invoice, Vendor Bill, Credit memo, Vendor Credit). 
Las transacciones deben estar agrupadas por subsidiaria.
*/
define(["N/search", "N/format", "N/log"], function (search, format, log) {
  var LMRY_SCRIPT_NAME = "LMRY - Exercise 2";

  /**
   * @type {{date:string,day:string,month:string,year:string,time:number}}
   */
  var endDate = {};
  /**
   * @type {{date:string,day:string,month:string,year:string,time:number}}
   */
  var startDate = {};
  /**
   * @type {number}
   */
  var MILI_SECONDS_DAY = 24 * 60 * 60 * 1000;

  var rta = {};

  /** - Obtiene las transacciones en los ultimos 5 dias, agrupadas por subsidiaria
   * @description Obtiene las transacciones en los ultimos 5 dias, agrupadas por subsidiaria
   * @returns {void} - No retorna nada pero guarda datos en la variable rta
   */
  function _getLastFiveTran() {
    try {
      var DbolStop = false;
      var minInterval = 0;
      var maxInterval = 1000;

      var LT_Filters = [
        search.createFilter({
          name: "type",
          operator: search.Operator.ANYOF,
          values: ["CustInvc", "VendBill", "CustCred", "VendCred"],
        }),
      ];

      var LT_Columns = [
        search.createColumn({
          name: "subsidiary",
          summary: search.Summary.GROUP,
          label: "0. LatamReady - Subsidiary",
        }),
        search.createColumn({
          name: "internalid",
          summary: search.Summary.GROUP,
          label: "1. LatamReady - Internal ID",
        }),
        search.createColumn({
          name: "trandate",
          summary: search.Summary.GROUP,
          label: "2. LatamReady - Transaction Date",
        }),
        search.createColumn({
          name: "formulatext",
          summary: search.Summary.GROUP,
          formula: "{type.id}",
          label: "3. LatamReady - Tipo de Transacción",
        }),
      ];

      var currentDate = new Date();
      endDate = _sortFormatDates(currentDate);
      startDate = _sortFormatDates(
        new Date(currentDate.getTime() - 5 * MILI_SECONDS_DAY)
      );

      LT_Filters.push(
        search.createFilter({
          name: "trandate",
          operator: search.Operator.ONORAFTER,
          values: [startDate.date],
        }),
        search.createFilter({
          name: "trandate",
          operator: search.Operator.ONORBEFORE,
          values: [endDate.date],
        })
      );

      var LT_Search = search.create({
        type: search.Type.TRANSACTION,
        filters: LT_Filters,
        columns: LT_Columns,
      });

      var searchResult = LT_Search.run();

      var auxResult;
      while (!DbolStop) {
        auxResult = searchResult.getRange(minInterval, maxInterval);
        if (auxResult != null) {
          if (auxResult.length != 1000) DbolStop = true;
          for (var i = 0; i < auxResult.length; i++) {
            var columns = auxResult[i].columns;

            var subId = auxResult[i].getValue(columns[0]);
            var tranId = auxResult[i].getValue(columns[1]);
            var tranDate = auxResult[i].getValue(columns[2]);
            var tranType = auxResult[i].getValue(columns[3]);

            if (rta[subId] == null) rta[subId] = [];
            rta[subId].push({
              tranId: tranId,
              tranDate: tranDate,
              tranType: tranType,
            });
          }
          minInterval = maxInterval;
          maxInterval = maxInterval + 1000;
        } else {
          DbolStop = true;
        }
      }
    } catch (error) {
      log.error("Error in _getLastFiveTran", {
        title: "[ MPRD - _getLastFiveTran ]",
        message: error,
        relatedScript: LMRY_SCRIPT_NAME,
      });
    }
  }

  /** - Convertir formato de fecha a uno soportado por NetSuite, y devuelve información de fecha
   * @description - Convertir formato de fecha a uno soportado por NetSuite, y devuelve información de fecha
   * @param {string|undefined|null|"- None -"} date - Fecha con formato X
   * @returns {{date:string,day:string,month:string,year:string,time:number}} - Objeto con fecha en formato dd/mm/yyyy, mes, año y tiempo en milisegundos
   */
  function _sortFormatDates(date) {
    try {
      if (!date || date == "- None -") {
        throw new Error("No se ha ingresado una fecha válida");
      }

      var dateParsed = format.parse({
        value: date,
        type: format.Type.DATE,
      });

      var time = dateParsed.getTime();

      var dayReport = dateParsed.getDate();
      if (("" + dayReport).length == 1) {
        dayReport = "0" + dayReport;
      } else {
        dayReport = dayReport + "";
      }

      var monthReport = dateParsed.getMonth() + 1;
      if (("" + monthReport).length == 1) {
        monthReport = "0" + monthReport;
      } else {
        monthReport = monthReport + "";
      }

      var yearReport = dateParsed.getFullYear();
      date = dayReport + "/" + monthReport + "/" + yearReport;

      return {
        date: date,
        day: dayReport,
        month: monthReport,
        year: yearReport,
        time: time,
      };
    } catch (error) {
      log.error("Error in _sortFormatDates", {
        title: "[ SCHDL - _sortFormatDates ]",
        message: error,
        relatedScript: LMRY_SCRIPT_NAME,
      });
    }
  }
});
