/* 
Implementar una búsqueda por script del Catálogo de Cuenta de cualquier país. 
Columnas a considerar : Nro (Correlativo), Número de Cuenta, Nombre
*/

define(["N/search", "N/log"], function (search, log) {
  var LMRY_SCRIPT_NAME = "LMRY - Exercise 4";

  /**
   * @type {Array<string>}
   */
  var subsidiariesGroup = [];

  /**
   * @type {Array<{correlative:string,accountId:string,accountNumber:string|'- None -',accountName:string}>}
   */
  var accountsData = [];

  /** - Obtiene todas las subsidiarias de un país
   * @description Obtiene todas las subsidiarias de un país
   * @param {string} countryCode - Código del país
   * @returns {void} - No retorna nada pero guarda los datos en la variable subsidiariesGroup
   */
  function _getSubsidiariesByCountry(countryCode) {
    try {
      // countryCode = AR = Argentina => For LatamReady - QA MultiBook (old)
      if (!countryCode) {
        throw new Error("No se ha especificado el código del país");
      }

      var DbolStop = false;
      var minInterval = 0;
      var maxInterval = 1000;

      var SC_Filters = [
        search.createFilter({
          name: "country",
          operator: search.Operator.ANYOF,
          values: [countryCode],
        }),
      ];

      var SC_Columns = [
        search.createColumn({
          name: "internalid",
          summary: search.Summary.GROUP,
          label: "0. LatamReady - Internal ID",
        }),
      ];

      var SC_Search = search.create({
        type: search.Type.SUBSIDIARY,
        filters: SC_Filters,
        columns: SC_Columns,
      });

      var searchResult = SC_Search.run();

      var auxResult;
      while (!DbolStop) {
        auxResult = searchResult.getRange(minInterval, maxInterval);
        if (auxResult != null) {
          if (auxResult.length != 1000) DbolStop = true;
          for (var i = 0; i < auxResult.length; i++) {
            var columns = auxResult[i].columns;

            var subsidiaryId = auxResult[i].getValue(columns[0]);

            subsidiariesGroup.push(subsidiaryId);
          }
          minInterval = maxInterval;
          maxInterval = maxInterval + 1000;
        } else {
          DbolStop = true;
        }
      }
    } catch (error) {
      log.error("Error in _getSubsidiariesByCountry", {
        title: "[ MPRD - _getSubsidiariesByCountry ]",
        message: error,
        relatedScript: LMRY_SCRIPT_NAME,
      });
    }
  }

  /** - Obtiene todas las cuentas de subisidiarias de un determinado pais
   * @description Obtiene todas las cuentas de subisidiarias de un determinado pais
   * @param {string} countryCode - Código del país
   * @returns {void} - No retorna nada pero guarda datos en la variable accountsData
   */
  function _getAccountsByCountry(countryCode) {
    try {
      var DbolStop = false;
      var minInterval = 0;
      var maxInterval = 1000;

      _getSubsidiariesByCountry(countryCode);
      if (subsidiariesGroup.length == 0) accountsData = [];

      var AC_Filters = [
        search.createFilter({
          name: "subsidiary",
          operator: search.Operator.ANYOF,
          values: subsidiariesGroup,
        }),
      ];

      var AC_Columns = [
        search.createColumn({
          name: "internalid",
          summary: search.Summary.GROUP,
          label: "0. LatamReady - Internal ID",
        }),
        search.createColumn({
          name: "number",
          summary: search.Summary.GROUP,
          label: "1. LatamReady - Account Number",
        }),
        search.createColumn({
          name: "displayname",
          summary: search.Summary.GROUP,
          label: "2. LatamReady - Account Name",
        }),
      ];

      var IT_Search = search.create({
        type: search.Type.ACCOUNT,
        filters: AC_Filters,
        columns: AC_Columns,
      });

      var searchResult = IT_Search.run();

      var auxResult;
      var countCorrelative = 1;
      while (!DbolStop) {
        auxResult = searchResult.getRange(minInterval, maxInterval);
        if (auxResult != null) {
          if (auxResult.length != 1000) DbolStop = true;
          for (var i = 0; i < auxResult.length; i++) {
            var columns = auxResult[i].columns;

            var accountId = auxResult[i].getValue(columns[0]);
            var accountNumber = auxResult[i].getValue(columns[1]);
            var accountName = auxResult[i].getValue(columns[2]);

            accountsData.push({
              correlative: _completeCorrelative(6, countCorrelative),
              accountId: accountId,
              accountNumber: accountNumber,
              accountName: accountName,
            });

            countCorrelative++;
          }
          minInterval = maxInterval;
          maxInterval = maxInterval + 1000;
        } else {
          DbolStop = true;
        }
      }
    } catch (error) {
      log.error("Error in _getAccountsByCountry", {
        title: "[ MPRD - _getAccountsByCountry ]",
        message: error,
        relatedScript: LMRY_SCRIPT_NAME,
      });
    }
  }

  /** - Agrega ceros a la izquierda según el tamaño del string y el tamaño deseado
   * @description - Agrega ceros a la izquierda según el tamaño del string y el tamaño deseado
   * @param {number} size - Tamaño del string
   * @param {string} value - String a formatear
   * @returns {string} - String formateado con ceros a la izquierda
   */
  function _completeCorrelative(size, value) {
    try {
      var valueLength = ("" + value).length;
      if (("" + value).length <= size) {
        if (size != ("" + value).length) {
          for (var i = ("" + value).length; i < size; i++) {
            value = "0" + value;
          }
        } else {
          return value;
        }
        return value;
      } else {
        value = value.substring(valueLength - size, valueLength);
        return value;
      }
      return value;
    } catch (error) {
      log.error("Error in _completeCorrelative", {
        title: "[ SCHDL - _completeCorrelative ]",
        message: error,
        relatedScript: LMRY_SCRIPT_NAME,
      });
    }
  }
});
