/* 
Implemente una función en el cual ingrese como parámetro el id de una Oportunidad, 
ahora a partir de esta transacción se deben crear los siguientes récords:

- Quote (Estimate)
- Sales Order 
- Invoice
- Customer Payment

La función debe retornar un objeto con todos los ids de las transacciones creadas. 
(No olvide que una transacción depende de la anterior, por ejemplo el Sales order se crea a partir del Quote, 
el invoice a partir del sales order y así sucesivamente).
*/
