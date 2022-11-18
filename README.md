# ¿Cuál es la diferencia entre define y require para la declaración de módulos? ¿Qué debo tener en consideración al momento de declarar una librería personalizada en ambos casos?

La diferencia principal que tienen es la manera en que cargan los módulos cada uno. Utilizar la función require para importar módulos nativos ayuda a aumentar el rendimiento del script. Esto se logra ya que los módulos son cargados bajo demanda, es decir cuando son utilizados por primera vez. Por otro lado, la función define carga todos los módulos definidos de manera lazy, es decir los módulos son cargados de manera automática cuando el script es ejecutado. Para usar uno u otro es necesario tener en cuenta el tipo de modulo que se va a utilizar. Si se va a utilizar un modulo nativo, se debe utilizar la función require, de lo contrario, si se va a utilizar un modulo personalizado, se debe utilizar la función define.

## ¿En qué se diferencia un Script y un Script Deployment?

El Script Record es básicamente la definición de una secuencia de código utilizado para algún tipo de desarrollo, mientras que el Script Deployment contempla no solo la referencia a un Script Record sino que se establece como debe ejecutarse, que usuarios pueden ejecutarlo, se pueden también configurar el nivel de logs, el rol necesario, el nivel de prioridad de ejecución, etc.

## El deployado de un script, que se aplica a una transacción, está configurado para la subsidiaria Honeycomb Inc. (Subsidiaria padre). Un usuario que pertenece a la subsidiaria Honeycomb BR (Subsidiaria hija), desea que se ejecute la lógica del script al momento de utilizar una transacción ¿Consideras que el usuario presentará algún problema al visualizar los resultados de la lógica del script?. Indicar el por qué

Si, el usuario presentará problemas al momento de visualizar los resultados de la lógica del script, ya que el script deployment esta configurado para la subsidiaria Honeycomb Inc. (Subsidiaria padre), por lo tanto, el usuario que pertenece a la subsidiaria Honeycomb BR (Subsidiaria hija) no podrá ejecutar la lógica del script.

## ¿Cuál es la finalidad de que un script esté configurado en modo 'Testing'?

El modo testing permite que el script se ejecute en modo de prueba, esto para probar la compatibilidad y que no genere errores no esperados, también podemos depurar el script para encontrar e investigar posibles errores, esto para evitar o corregir errores en ambientes de producción.

## Describe la finalidad de los siguientes scripts

## Client

## User Event

## Custom GL PLugin

El Client Script tiene como finalidad validar datos que se ingresan a nivel de usuario, tambien se puede usar este tipo de script para completar campos o sublistas, cambiar valores en base a otros, envio de aleartas. Usualmente se utilizan y van de la mano con un Suitelet.

El User Event Script tiene como finalidad realizar validaciones personalizadas de registros, asegurar la integridad de los datos definidos por el usuario, comprobar permisos y restricciones de registros, ademas de realizar sincronización de datos en tiempo real. Estos se ejecutan del lado del servidor y usualmente se utilizan y van de la mano con Suitelet, Scheduled Script y Portlet.

El Custom GL Plugin

## Si estás utilizando un Suitelet para consumo de web services ¿Qué campos del deployado del script debes configurar y por qué?

## Quieres utilizar el módulo N/file desde un script Cliente, para guardar un archivo, pero dicho módulo no se encuentra disponible para ese tipo de script. ¿Cuál sería la solución que tendrías para poder realizar dicho proceso desde el mismo Client Script?
