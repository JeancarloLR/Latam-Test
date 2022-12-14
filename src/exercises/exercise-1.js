/* 
Implementar código el cual permita crear un proveedor, cabe recalcar que la subsidiaria 
sólo se debe llenar siempre y cuando esté activo el feature Subsidiaries de los 
'Enabled Features' de NetSuite'
*/

define(["N/record", "N/log", "N/runtime"], function (record, log, runtime) {
  var LMRY_SCRIPT_NAME = "LMRY - Exercise 1";

  /**
   * @type {{SUBSIDIARY:boolean}}
   */
  var FEATURES = { SUBSIDIARY: false };

  /** - Crea un proveedor con respecto a una subsidiaria
   * @description Crea un proveedor con respecto a una subsidiaria
   * @param {string} subsidiaryId - Subsidiaria a la cual se le creará el proveedor
   * @returns {number} - Retorna el id del proveedor creado
   */
  function _createVendor(subsidiaryId) {
    try {
      // subsidiaryId = 7 = Argentina => For LatamReady - QA MultiBook (old)

      // subsidiaryId = 7;
      if (!subsidiaryId) {
        throw new Error("No se ha especificado una subsidiaria");
      }
      // Set Features
      _setFeatures();

      var objRecord = record.create({
        type: record.Type.VENDOR,
        isDynamic: true,
      });

      var randomAux = Math.floor(Math.random() * 1000);

      objRecord.setValue({
        fieldId: "entityid",
        value: "LMRY - Vendor" + randomAux,
      });

      objRecord.setValue({
        fieldId: "companyname",
        value: "LMRY - Vendor" + randomAux,
      });

      if (FEATURES.SUBSIDIARY) {
        objRecord.setValue({
          fieldId: "subsidiary",
          value: subsidiaryId,
        });
      }

      var vendorId = objRecord.save({
        enableSourcing: true,
        ignoreMandatoryFields: true,
      });
    } catch (error) {
      log.error("Error in _createVendor", {
        title: "[ MPRD - _createVendor ]",
        message: error,
        relatedScript: LMRY_SCRIPT_NAME,
      });
    }
  }

  /** - Setea el valor de las features
   * @description Setea el valor de las features
   * @returns {void} No retorna nada pero guarda datos en la variable global FEATURES
   */
  function _setFeatures() {
    try {
      var containFeature = false;

      containFeature = runtime.isFeatureInEffect({
        feature: "SUBSIDIARIES",
      });
      if (containFeature == true || containFeature == "T") {
        FEATURES.SUBSIDIARY = true;
      }
    } catch (error) {
      log.error("Error in _setFeatures", {
        title: "[ MPRD - _setFeatures ]",
        message: error,
        relatedScript: LMRY_SCRIPT_NAME,
      });
    }
  }
});
