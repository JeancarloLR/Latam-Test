# EXAMEN LATAM

## SCRIPTS

### 1) ¿Cuál es la diferencia entre define y require para la declaración de módulos? ¿Qué debo tener en consideración al momento de declarar una librería personalizada en ambos casos?

La diferencia principal que tienen es la manera en que cargan los módulos cada uno. Utilizar la función require para importar módulos nativos ayuda a aumentar el rendimiento del script. Esto se logra ya que los módulos son cargados bajo demanda, es decir cuando son utilizados por primera vez. Por otro lado, la función define carga todos los módulos definidos de manera **lazy**, es decir los módulos son cargados de manera automática cuando el script es ejecutado. Para usar uno u otro es necesario tener en cuenta el tipo de modulo que se va a utilizar. Si se va a utilizar un modulo nativo, se debe utilizar la función require, de lo contrario, si se va a utilizar un modulo personalizado, se debe utilizar la función define.

### 2) ¿En qué se diferencia un Script y un Script Deployment?

El **Script Record** es básicamente la definición de una secuencia de código utilizado para algún tipo de desarrollo, mientras que el **Script Deployment** contempla no solo la referencia a un **Script Record** sino que se establece como debe ejecutarse, que usuarios pueden ejecutarlo, se pueden también configurar el nivel de logs, el rol necesario, el nivel de prioridad de ejecución, etc.

### 3) El deployado de un script, que se aplica a una transacción, está configurado para la subsidiaria Honeycomb Inc. (Subsidiaria padre). Un usuario que pertenece a la subsidiaria Honeycomb BR (Subsidiaria hija), desea que se ejecute la lógica del script al momento de utilizar una transacción ¿Consideras que el usuario presentará algún problema al visualizar los resultados de la lógica del script?. Indicar el por qué

Si, el usuario presentará problemas al momento de visualizar los resultados de la lógica del script, ya que el script deployment esta configurado para la subsidiaria Honeycomb Inc. (Subsidiaria padre), por lo tanto, el usuario que pertenece a la subsidiaria Honeycomb BR (Subsidiaria hija) no podrá ejecutar la lógica del script.

### 4) ¿Cuál es la finalidad de que un script esté configurado en modo 'Testing'?

El modo **Testing** permite que el script se ejecute en modo de prueba, esto para probar la compatibilidad y que no genere errores no esperados, también podemos depurar el script para encontrar e investigar posibles errores, esto para evitar o corregir errores en ambientes de producción.

### 5) Describe la finalidad de los siguientes scripts Client, User Event, Custom GL PLugin

- **Client Script :** Tiene como finalidad validar datos que se ingresan a nivel de usuario, tambien se puede usar este tipo de script para completar campos o sublistas, cambiar valores en base a otros, envio de aleartas. Usualmente se utilizan y van de la mano con un **Suitelet**.

- **User Event Script :** Tiene como finalidad realizar validaciones personalizadas de registros, asegurar la integridad de los datos definidos por el usuario, comprobar permisos y restricciones de registros, ademas de realizar sincronización de datos en tiempo real. Estos se ejecutan del lado del servidor y usualmente se utilizan y van de la mano con **Suitelet, Scheduled Script y Portlet**.

- **Custom GL Plugin :** DSD

### 6) Si estás utilizando un Suitelet para consumo de web services ¿Qué campos del deployado del script debes configurar y por qué?

### 7) Quieres utilizar el módulo N/file desde un script Cliente, para guardar un archivo, pero dicho módulo no se encuentra disponible para ese tipo de script. ¿Cuál sería la solución que tendrías para poder realizar dicho proceso desde el mismo Client Script?

### 8) Implementar código el cual permita crear un proveedor, cabe recalcar que la subsidiaria sólo se debe llenar siempre y cuando esté activo el feature Subsidiaries de los 'Enabled Features' de NetSuite'

### 9) Implemente una función en el cual ingrese como parámetro el id de una Oportunidad, ahora a partir de esta transacción se deben crear los siguientes récords: Quote (Estimate), Sales Order, Invoice, Customer Payment. La función debe retornar un objeto con todos los ids de las transacciones creadas. (No olvide que una transacción depende de la anterior, por ejemplo el Sales order se crea a partir del Quote, el invoice a partir del sales order y así sucesivamente)

### 10) Realizar una búsqueda de las transacciones creadas en los últimos 5 días (las transacciones a considerar son: Invoice, Vendor Bill, Credit memo, Vendor Credit). Las transacciones deben estar agrupadas por subsidiaria

```javascript
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
```

## REPORTES

### 1) Cuales son los Récords que usa todo Report Generator de cualquier reporte de cualquier país; y cuál es el uso de cada uno de ellos?

#### Records From Integration SuiteTax - Legacy

- **LatamReady - Legal Ledger :** Este recordar contiene la información del nombre del reporte, a que pais pertenece, adicionalmente contiene el id del script y el deployment que se va a ejecutar para generar el reporte, este script es de tipo MPRD o SCHDL.
- **LatamReady - Legal Template :** Este record se utiliza para definir el formato de los reportes, caracteristicas como el tipo de extensión del reporte, el tipo codificación, el tipo de formato, el uso o no de un template, etc. Este esta relacionado al **LatamReady - Legal Ledger**.
- **LatamReady - SuiteTax Rpt Filter :** Este record se utiliza para definir los campos que se mostraran en el Suitelet y que son necesarios para generar el reporte, este record contiene campos como el tipo de campo, el nombre del campo, el label del campo, el tipo de filtro, etc. Además esta relacionado al **LatamReady - Legal Ledger**.

#### Common Records

- **Accounting Period :** Este record contiene la información de los periodos contables, contiene información como el nombre del periodo, la fecha de inicio y fin del periodo, el estado del periodo, etc.
- **Subsidiary :** Este record contiene la información de las subsidiarias, contiene información como el nombre de la subsidiaria, el pais, el estado, etc.
- **Multi-Book :** Este record contiene la información de los libros contables, contiene información como el nombre del libro, el estado, etc.

### 2) De la anterior pregunta, implementar el proceso Accounting Context (Redireccionamiento de Cuentas) de reportes

Para considerar el proceso de 'Redireccionamiento de Cuentas' dentro de un reporte se deben considerar algunos aspectos, el primero es el que si afecta a las cuentas de tipo **Bank, Accounts Receivable, Accounts Payable y Credit Card** donde se debe especificar el libro contable, numero y nombre de la cuenta; el segundo es que puede afectar a todo tipo de cuentas, pero solo para cambiar el numero y nombre de la cuenta en base al Set Preferences. Para ambas se deben tener configurado el SubTab de **Localization** dentro de la cuenta.

### 3) Qué tipos de reportes usan los asientos por 'Period End Journal'. Cual es la diferencia con los asientos con periodos de ajuste que se configuran en el 'Manage Account Periods'

Para considerar **'Period End Journal'** dentro de un reporte se deben considerar algunos Features como los son el **PERIODENDJOURNALENTRIES**, el cual es un Feature que se utiliza para que los reportes consideren transacciones de tipo **Period End Journal**. Adicionalmente a esto se debe considerar que las transacciones deben pertenecer a un **Period Adjust**. Por otro lado, el **Manage Account Periods** es un proceso que se utiliza para configurar los periodos contables relacionados a un calendario fiscal y agruparlos dentro de un año fiscal, además dentro de estos se pueden adicionar los periodos de ajuste.

### 4) Para el proceso 'Special Period' dentro de los reportes legales, cual es la lógica a tomar tanto para los reportes mensuales como anuales y los feature a considerar para validar la realización de dicho proceso

Para considerar el proceso de **'Special Period'** dentro de un reporte se deben considerar algunos Features como los son el **SPECIAL ACCOUNTING PERIOD**, el cual es un Feature que se utiliza para indicar que el periodo de cierre es diferente al periodo de reporte, también el Feature **MULTIPLECALENDARS** este pasa como un filtro adicional, en caso este activo se buscara que coincida con el respectivo calendario, adicionalmente se debe configurar el record **LatamReady - Special Accounting Period**, donde se especifican el periodo, inicio y fin del periodo, año y calendario fiscal.

### 5) Implementar una búsqueda por script del Catálogo de Cuenta de cualquier país. Columnas a considerar : Nro (Correlativo), Número de Cuenta, Nombre

### 6) Una búsqueda de transacción (Invoice) puede traer hasta 1.000.000 de registros por mes, al momento de intentar realizar la búsqueda para recuperar la información, esta se cae por 'tiempo de ejecución excedido'. Cual seria su solución para corregir este problema (Implementar código)

```javascript
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
```
