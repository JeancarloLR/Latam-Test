/* 
Implementar código el cual permita crear un proveedor, cabe recalcar que la subsidiaria 
sólo se debe llenar siempre y cuando esté activo el feature Subsidiaries de los 
'Enabled Features' de NetSuite'
*/

/**
 * @NApiVersion 2.0
 * @NScriptType MapReduceScript
 * @NModuleScope Public
 */
define([
  "N/log",
  "N/search",
  "N/runtime",
  "N/task",
  "N/url",
  "N/https",
  "N/record",
  "N/cache",
], function (log, search, runtime, task, url, https, record, cache) {
  var scriptObj = runtime.getCurrentScript();
  var logs_id = scriptObj.getParameter({ name: "custscript_idslog" });
  var subsidiary_id = scriptObj.getParameter({
    name: "custscript_idsubsidiary",
  });
  // var logs_id = "36,37";
  logs_id = logs_id.split(",");

  /**
   * Input Data for processing
   *
   * @return Array,Object,Search,File
   *
   * @since 2016.1
   */

  function getInputData() {
    try {
      log.debug("idlog", logs_id);
      var ruta = url.resolveScript({
        deploymentId: "customdeploy_lmry_afip_ws_api_stlt",
        scriptId: "customscript_lmry_afip_ws_api_stlt",
        returnExternalUrl: true,
      });
      var cacheinput = cache.getCache({
        name: "afipCache",
        scope: cache.Scope.PRIVATE,
      });
      cacheinput.remove({
        key: "afipStorage",
      });
      cacheinput.remove({
        key: "rutaText",
      });

      cacheinput.get({
        key: "rutaText",
        loader: function urlreturn() {
          return url.resolveScript({
            deploymentId: "customdeploy_lmry_afip_ws_api_stlt",
            scriptId: "customscript_lmry_afip_ws_api_stlt",
            returnExternalUrl: true,
          });
        },
        ttl: 3600,
      });

      var arreglo_entitys = [];
      var entitys = {};

      var contador = 1;

      record.submitFields({
        type: "customrecord_lmry_afip_importdata_log",
        id: logs_id[0],
        values: { custrecord_afip_status: "Procesando" },
        options: {
          enableSourcing: true,
          ignoreMandatoryFields: true,
          disableTriggers: true,
        },
      });

      var search_log = search.lookupFields({
        type: "customrecord_lmry_afip_importdata_log",
        id: logs_id[0],
        // filters: [],
        columns: ["custrecord_entitys_cuit"],
      });

      entitys = JSON.parse(search_log.custrecord_entitys_cuit);
      for (var index in entitys) {
        arreglo_entitys.push({
          key: contador,
          values: {
            id_log: logs_id[0],
            id_entity: index,
            cuit: entitys[index].cuit,
            type: entitys[index].type,
          },
        });
        contador++;
      }
      entitys = {};

      // log.error("arreglo_entitys", arreglo_entitys);
      return arreglo_entitys;
    } catch (err) {
      // record.delete({
      //   type: "customrecord_lmry_afip_importdata_log",
      //   id: logs_id[0],
      // });
      record.submitFields({
        type: "customrecord_lmry_afip_importdata_log",
        id: logs_id[0],
        values: { custrecord_afip_status: "Error" },
        options: {
          enableSourcing: true,
          ignoreMandatoryFields: true,
          disableTriggers: true,
        },
      });
      log.error("[getInputData]", err);
    }
  }

  /**
   * If this entry point is used, the map function is invoked one time for each key/value.
   *
   * @param {Object} context
   * @param {boolean} context.isRestarted - Indicates whether the current invocation represents a restart
   * @param {number} context.executionNo - Version of the bundle being installed
   * @param {Iterator} context.errors - This param contains a "iterator().each(parameters)" function
   * @param {string} context.key - The key to be processed during the current invocation
   * @param {string} context.value - The value to be processed during the current invocation
   * @param {function} context.write - This data is passed to the reduce stage
   *
   * @since 2016.1
   */
  function map(context) {
    try {
      var cacheinput = cache.getCache({
        name: "afipCache",
        scope: cache.Scope.PRIVATE,
      });

      var massive_entity = context.value;
      massive_entity = JSON.parse(massive_entity);
      log.debug("key", massive_entity.key);

      var id_entity = massive_entity.values.id_entity;
      var cuit = massive_entity.values.cuit;
      var idlog = massive_entity.values.id_log;
      var type = massive_entity.values.type;
      var error = null;
      var ruta = cacheinput.get({
        key: "rutaText",
        ttl: 3600,
      });

      var respuesta = https.get({
        url:
          ruta +
          "&cuit=" +
          cuit +
          "&identity=" +
          id_entity +
          "&id=" +
          subsidiary_id,
      });

      var json = JSON.parse(respuesta.body.split("<!--")[0]);
      log.debug("json ", json);
      if (json["soap:Body"].hasOwnProperty("ns2:getPersonaResponse")) {
        var returnpersona =
          json["soap:Body"]["ns2:getPersonaResponse"]["personaReturn"];
        if (returnpersona.hasOwnProperty("datosGenerales")) {
          var Domiciliofiscal =
            returnpersona["datosGenerales"]["domicilioFiscal"];
          var codpostal = Domiciliofiscal.hasOwnProperty("codPostal")
            ? Domiciliofiscal["codPostal"]["#text"]
            : "-";
          var direccion = Domiciliofiscal.hasOwnProperty("direccion")
            ? Domiciliofiscal["direccion"]["#text"]
            : "-";
          var localidad = Domiciliofiscal.hasOwnProperty("localidad")
            ? Domiciliofiscal["localidad"]["#text"]
            : "-";
          var descripcionProvincia = Domiciliofiscal.hasOwnProperty(
            "descripcionProvincia"
          )
            ? Domiciliofiscal["descripcionProvincia"]["#text"]
            : "-";
          var razonsocial = returnpersona["datosGenerales"].hasOwnProperty(
            "razonSocial"
          )
            ? returnpersona["datosGenerales"]["razonSocial"]["#text"]
            : "-";
          var tipoclave = returnpersona["datosGenerales"].hasOwnProperty(
            "tipoClave"
          )
            ? returnpersona["datosGenerales"]["tipoClave"]["#text"]
            : "-";
          var tipopersona = returnpersona["datosGenerales"].hasOwnProperty(
            "tipoPersona"
          )
            ? returnpersona["datosGenerales"]["tipoPersona"]["#text"]
            : "-";
          var apellido = returnpersona["datosGenerales"].hasOwnProperty(
            "apellido"
          )
            ? returnpersona["datosGenerales"]["apellido"]["#text"]
            : "-";
          var nombre = returnpersona["datosGenerales"].hasOwnProperty("nombre")
            ? returnpersona["datosGenerales"]["nombre"]["#text"]
            : "-";
          var impuestos = [];
          if (returnpersona.hasOwnProperty("datosRegimenGeneral")) {
            if (
              returnpersona["datosRegimenGeneral"].hasOwnProperty("impuesto")
            ) {
              impuestos = returnpersona["datosRegimenGeneral"]["impuesto"];
            }
          }
          var responsable = null;
          for (var index in impuestos) {
            var impuesto = impuestos[index];

            if (impuesto.hasOwnProperty("descripcionImpuesto")) {
              if (
                impuesto["descripcionImpuesto"]["#text"] == "IVA" ||
                impuesto["descripcionImpuesto"]["#text"] == "IVA"
              ) {
                responsable = 1;
              }
              if (impuesto["descripcionImpuesto"]["#text"] == "MONOTRIBUTO") {
                responsable = 6;
              }
            }
          }

          //********************************************************* */
          var datos = {};
          if (!isNaN(responsable) && responsable != null) {
            datos["custentity_lmry_ar_tiporespons"] =
              parseInt(responsable).toString();
            datos["custentity_lmry_ar_tiporespons_cod"] =
              parseInt(responsable).toString();
          } else {
            datos["custentity_lmry_ar_tiporespons"] = "";
            datos["custentity_lmry_ar_tiporespons_cod"] = "";
          }
          if (apellido != "-" && nombre != "-") {
            // datos["companyname"] = apellido + " " + nombre;
            datos["firstname"] = nombre;
            datos["lastname"] = apellido;
            datos["addressee"] = nombre + " " + apellido;
            datos["isperson"] = "T";
          } else if (razonsocial != "-") {
            datos["companyname"] = razonsocial;
            datos["addressee"] = razonsocial;
            datos["isperson"] = "F";
          }
          if (tipoclave != "-") {
            var customrecord_lmry_tipo_doc_idenSearchObj = search
              .create({
                type: "customrecord_lmry_tipo_doc_iden",
                filters: [
                  ["name", "contains", tipoclave],
                  "AND",
                  ["custrecord_lmry_tipo_doc_country", "anyof", "11"],
                ],
                columns: [
                  search.createColumn({
                    name: "name",
                    sort: search.Sort.ASC,
                    label: "Name",
                  }),
                  search.createColumn({
                    name: "custrecord_tipo_doc_id",
                    label: "Codigo Tipo Doc.Identidad",
                  }),
                  search.createColumn({
                    name: "custrecord_lmry_tipo_doc_country",
                    label: "Pais",
                  }),
                ],
              })
              .run()
              .getRange(0, 1);

            datos["custentity_lmry_sunat_tipo_doc_id"] =
              customrecord_lmry_tipo_doc_idenSearchObj[0].id; //agregar busqueda
            // datos["custentity_lmry_sunat_tipo_doc_id"] = tipoclave;//agregar busqueda
          }
          if (tipopersona != "-") {
            var customrecord_lmry_ar_cuitc_person_typeSearchObj = search
              .create({
                type: "customrecord_lmry_ar_cuitc_person_type",
                filters: [
                  [
                    "formulatext: \tREPLACE(REPLACE( /*vocales ÃÕ*/ REPLACE(REPLACE(REPLACE(REPLACE(REPLACE( /*vocales ÄËÏÖÜ*/ REPLACE(REPLACE(REPLACE(REPLACE(REPLACE( /*vocales ÂÊÎÔÛ*/ REPLACE(REPLACE(REPLACE(REPLACE(REPLACE( /*vocales ÀÈÌÒÙ*/ REPLACE(REPLACE(REPLACE(REPLACE(REPLACE( /*vocales ÁÉÍÓÚ*/ REPLACE(REPLACE(REPLACE(REPLACE(REPLACE( /*vocales ñÑçÇ incluido espacio en blanco*/ REPLACE(REPLACE(REPLACE(REPLACE(REPLACE( /*vocales äëïöü*/ REPLACE(REPLACE(REPLACE(REPLACE(REPLACE( /*vocales âêîôû*/ REPLACE(REPLACE(REPLACE(REPLACE(REPLACE( /*vocales àèìòù*/ REPLACE(REPLACE(REPLACE(REPLACE(REPLACE( /*vocales áéíóú*/ {name}, 'á', 'a'), 'é','e'), 'í', 'i'), 'ó', 'o'), 'ú','u') ,'à','a'),'è','e'),'ì','i'),'ò','o'),'ù','u') ,'â','a'),'ê','e'),'î','i'),'ô','o'),'û','u') ,'ä','a'),'ë','e'),'ï','i'),'ö','o'),'ü','u') ,'ñ','n'),'Ñ','N'),'ç','c'),'Ç','C'),' ','') ,'Á','A'),'É','E'),'Í','I'),'Ó','O'),'Ú','U') ,'À','A'),'È','E'),'Ì','I'),'Ò','O'),'Ù','U') ,'Â','A'),'Ê','E'),'Î','I'),'Ô','O'),'Û','U') ,'Ä','A'),'Ë','E'),'Ï','I'),'Ö','O'),'Ü','U') ,'Ã','A'),'Õ','O')",
                    "contains",
                    tipopersona,
                  ],
                ],
                columns: [
                  //    search.createColumn({name: "internalid", label: "Internal ID"}),
                  search.createColumn({
                    name: "name",
                    sort: search.Sort.ASC,
                    label: "Name",
                  }),
                ],
              })
              .run()
              .getRange(0, 1);

            datos["custentity_lmry_ar_cuitc_tsuj"] =
              customrecord_lmry_ar_cuitc_person_typeSearchObj[0].id; //agregar busqueda
            var aux = "";
            switch (datos["custentity_lmry_ar_cuitc_tsuj"].toString()) {
              case "1":
                aux = "0";
                break;
              case "2":
                aux = "1";
                break;
              case "3":
                aux = "2";
                break;
            }

            datos["custentity_lmry_ar_cuitc_tsuj_cod"] = aux;
          } else {
            datos["custentity_lmry_ar_cuitc_tsuj"] = "";
            datos["custentity_lmry_ar_cuitc_tsuj_cod"] = "";
          }

          try {
            // var idrecord = record.submitFields({
            //   type: type,
            //   id: id_entity,
            //   values: datos,
            //   options: {
            //     enableSourcing: true,
            //     ignoreMandatoryFields: true,
            //     disableTriggers: true
            // }
            var objRecord = record.load({
              type: type,
              id: id_entity,
              isDynamic: true,
            });
            //--------------------------------limpiado de datos--------------------------//
            objRecord.setValue({
              fieldId: "companyname",
              value: " ",
              ignoreFieldChange: true,
            });
            objRecord.setValue({
              fieldId: "firstname",
              value: " ",
              ignoreFieldChange: true,
            });
            objRecord.setValue({
              fieldId: "lastname",
              value: " ",
              ignoreFieldChange: true,
            });
            objRecord.setValue({
              fieldId: "custentity_lmry_ar_cuitc",
              value: "61",
            });
            objRecord.setValue({
              fieldId: "custentity_lmry_ar_countrydesc_cuitc",
              value: "ARGENTINA",
            });
            log.debug("datos", datos);
            for (var idfield in datos) {
              if (datos[idfield] == null) {
                continue;
              }
              log.debug(idfield, datos[idfield]);
              objRecord.setValue({
                fieldId: idfield,
                value: datos[idfield],
                ignoreFieldChange: true,
              });
            }
            //---------------------------------address---------------------//
            if (direccion != "-") {
              datos["addr1"] = direccion;
            }
            if (localidad != "-") {
              datos["city"] = localidad;
            }
            if (descripcionProvincia != "-") {
              datos["state"] = descripcionProvincia;
            }
            if (codpostal != "-") {
              datos["zip"] = codpostal;
            }
            log.debug("datos", datos);

            //-------------------------------------address eliminar lineas---------------------------//
            try {
              var numAdd = objRecord.getLineCount({ sublistId: "addressbook" });

              while (numAdd > 0) {
                objRecord.removeLine({
                  sublistId: "addressbook",
                  line: numAdd - 1,
                });
                numAdd = objRecord.getLineCount({ sublistId: "addressbook" });
              }
            } catch (e) {
              log.error("[eliminarlinea]", e);
            }

            //-------------------------------------Nuevos Datos--------------------------------//
            objRecord.selectNewLine({
              sublistId: "addressbook",
            });

            objRecord.setCurrentSublistValue({
              sublistId: "addressbook",
              fieldId: "label",
              value: "Address AFIP",
            });
            objRecord.setCurrentSublistValue({
              sublistId: "addressbook",
              fieldId: "defaultbilling",
              value: true,
            });
            objRecord.setCurrentSublistValue({
              sublistId: "addressbook",
              fieldId: "defaultshipping",
              value: true,
            });
            var subrec = objRecord.getCurrentSublistSubrecord({
              sublistId: "addressbook",
              fieldId: "addressbookaddress",
            });
            subrec.setValue({
              fieldId: "country",
              value: "AR",
            });
            if (datos.hasOwnProperty("addressee")) {
              subrec.setValue({
                fieldId: "addressee",
                value: datos["addressee"],
              });
            }
            if (datos.hasOwnProperty("addr1")) {
              subrec.setValue({
                fieldId: "addr1",
                value: direccion,
              });
            }
            if (datos.hasOwnProperty("city")) {
              subrec.setValue({
                fieldId: "city",
                value: localidad,
              });
            }
            if (datos.hasOwnProperty("state")) {
              subrec.setValue({
                fieldId: "state",
                value: descripcionProvincia,
              });
            }
            if (datos.hasOwnProperty("zip")) {
              subrec.setValue({
                fieldId: "zip",
                value: codpostal,
              });
            }
            // subrec.setValue({
            //   fieldId:"addressee",
            //   value:
            // })

            subrec.commit();
            objRecord.commitLine({
              sublistId: "addressbook",
            });

            // });
            var idrecord = objRecord.save({
              enableSourcing: true,
              ignoreMandatoryFields: true,
            });

            if (isNaN(idrecord)) {
              error = "No se pudieron actualizar los datos";
            }
          } catch (e) {
            log.error("error map1", e);

            error = "No se pudo guardar " + e;
          }
        } else {
          error = "No se encontraron datos";
        }

        //********************************************************* */
      } else if (json["soap:Body"].hasOwnProperty("soap:Fault")) {
        error = json["soap:Body"]["soap:Fault"]["faultstring"]["#text"];
      } else {
        error = "Sin acceso ";
      }
      var envio = {};
      if (error == null) {
        envio[id_entity] = cuit;
      } else {
        envio[id_entity] = { cuit: cuit, error: "" + error };
      }
      context.write({ key: massive_entity.key, value: envio });
    } catch (err) {
      log.error("error map2", err);
      error = err;
      var envio = {};
      envio[id_entity] = { cuit: cuit, error: "" + err };
      context.write({ key: massive_entity.key, value: envio });

      // record.submitFields({
      //   type: "customrecord_lmry_afip_importdata_log",
      //   id: idlog,
      //   values: {
      //         custrecord_afip_corrects: corrects[idlog],
      //         custrecord_afip_incorrects: incorrects[idlog],
      //       },
      // });
    }
    // if(massive_entity.key==)
  }

  /**
   * If this entry point is used, the reduce function is invoked one time for
   * each key and list of values provided..
   *
   * @param {Object} context
   * @param {boolean} context.isRestarted - Indicates whether the current invocation represents a restart
   * @param {number} context.executionNo - Version of the bundle being installed
   * @param {Iterator} context.errors - This param contains a "iterator().each(parameters)" function
   * @param {string} context.key - The key to be processed during the current invocation
   * @param {string} context.value - The value to be processed during the current invocation
   * @param {function} context.write - This data is passed to the reduce stage
   *
   * @since 2016.1
   */
  function reduce(context) {}

  /**
   * If this entry point is used, the reduce function is invoked one time for
   * each key and list of values provided..
   *
   * @param {Object} context
   * @param {boolean} context.isRestarted - Indicates whether the current invocation of the represents a restart.
   * @param {number} context.concurrency - The maximum concurrency number when running the map/reduce script.
   * @param {Date} context.datecreated - The time and day when the script began running.
   * @param {number} context.seconds - The total number of seconds that elapsed during the processing of the script.
   * @param {number} context.usage - TThe total number of usage units consumed during the processing of the script.
   * @param {number} context.yields - The total number of yields that occurred during the processing of the script.
   * @param {Object} context.inputSummary - Object that contains data about the input stage.
   * @param {Object} context.mapSummary - Object that contains data about the map stage.
   * @param {Object} context.reduceSummary - Object that contains data about the reduce stage.
   * @param {Iterator} context.ouput - This param contains a "iterator().each(parameters)" function
   *
   * @since 2016.1
   */
  function summarize(context) {
    var entityCorrects = {};
    var entityIncorrects = {};
    // log.error("[use]", context.usage);
    // log.error("[data]", context.mapSummary);
    context.output.iterator().each(function (key, value) {
      value = JSON.parse(value);
      if (typeof value[Object.keys(value)[0]] == "object") {
        entityIncorrects[Object.keys(value)[0]] = value[Object.keys(value)[0]];
      } else {
        entityCorrects[Object.keys(value)[0]] = value[Object.keys(value)[0]];
      }

      return true;
    });
    log.debug("data", [entityCorrects, entityIncorrects]);

    try {
      record.submitFields({
        type: "customrecord_lmry_afip_importdata_log",
        id: logs_id[0],
        values: {
          custrecord_afip_corrects: JSON.stringify(entityCorrects),
          custrecord_afip_incorrects: JSON.stringify(entityIncorrects),
          custrecord_afip_status: "Completado",
        },
        options: {
          enableSourcing: true,
          ignoreMandatoryFields: true,
          disableTriggers: true,
        },
      });

      logs_id.shift();

      if (logs_id.length > 0) {
        var params = {};
        params["custscript_idslog"] = logs_id.toString();
        params["custscript_idsubsidiary"] = subsidiary_id;
        var tarea = task.create({
          taskType: task.TaskType.MAP_REDUCE,
          deploymentId: "customdeploy_lmry_afip_import_data_mprd",
          params: params,
          scriptId: "customscript_lmry_afip_import_data_mprd",
        });
        tarea.submit();
      }
    } catch (err) {
      // record.delete({
      //   type: "customrecord_lmry_afip_importdata_log",
      //   id: logs_id[0],
      // });
      record.submitFields({
        type: "customrecord_lmry_afip_importdata_log",
        id: logs_id[0],
        values: { custrecord_afip_status: "Error" },
        options: {
          enableSourcing: true,
          ignoreMandatoryFields: true,
          disableTriggers: true,
        },
      });
      log.error("[error sumarize]", err);
    }
  }

  return {
    getInputData: getInputData,
    map: map,
    // reduce: reduce,
    summarize: summarize,
  };
});
